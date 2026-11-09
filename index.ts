import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace * with your deployed shop origin for production.
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const WILAYAS = new Set([
"Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Badji Mokhtar","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Server configuration error" }, 500);

  try {
    const body = await req.json();
    const clean = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";
    const customer_name = clean(body.customer_name, 100);
    const phone = clean(body.phone, 30);
    const wilaya = clean(body.wilaya, 80);
    const commune = clean(body.commune, 100);
    const address = clean(body.address, 250);
    const notes = clean(body.notes, 1000);
    const order_type = body.order_type === "custom" ? "custom" : body.order_type === "standard" ? "standard" : "";
    const delivery_type = body.delivery_type === "home" ? "home" : body.delivery_type === "office" ? "office" : "";
    if (!customer_name || !phone || !wilaya || !commune || !address || !order_type || !delivery_type)
      return json({ error: "Remplis tous les champs obligatoires." }, 400);
    if (!WILAYAS.has(wilaya)) return json({ error: "Choisis une wilaya valide." }, 400);
    if (!/^[0-9+().\-\s]{8,30}$/.test(phone)) return json({ error: "Numéro de téléphone invalide." }, 400);
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30)
      return json({ error: "Le panier est vide ou contient trop d'articles." }, 400);

    const requested = new Map<string, number>();
    for (const item of body.items) {
      const id = typeof item?.product_id === "string" ? item.product_id : "";
      const quantity = Number(item?.quantity);
      if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 50)
        return json({ error: "Un article du panier est invalide." }, 400);
      requested.set(id, (requested.get(id) || 0) + quantity);
    }

    // Service role is used only on the server. Prices are fetched from the database;
    // never trust product names or prices sent by the browser.
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const ids = [...requested.keys()];
    const { data: dbProducts, error: productsError } = await admin.from("products")
      .select("id,name,price_dzd,is_active,stock_quantity").in("id", ids);
    if (productsError) return json({ error: "Impossible de vérifier les produits." }, 500);
    if (!dbProducts || dbProducts.length !== ids.length || dbProducts.some(p => !p.is_active))
      return json({ error: "Un produit n'est plus disponible. Actualise le panier." }, 409);

    let subtotal = 0;
    const itemRows = [];
    for (const [id, quantity] of requested) {
      const product = dbProducts.find(p => p.id === id);
      if (!product) return json({ error: "Produit introuvable." }, 400);
      if (product.stock_quantity !== null && product.stock_quantity < quantity)
        return json({ error: `Stock insuffisant pour ${product.name}.` }, 409);
      const line = product.price_dzd * quantity;
      subtotal += line;
      itemRows.push({ product_id: product.id, product_name: product.name, unit_price_dzd: product.price_dzd, quantity, line_total_dzd: line });
    }
    if (!Number.isSafeInteger(subtotal) || subtotal < 1 || subtotal > 100000000)
      return json({ error: "Total de commande invalide." }, 400);

    // Deposit is NOT automatically charged online. Lily confirms the amount and payment
    // method with the customer before production. Remaining balance is due on delivery.
    const orderNumber = `LC-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { data: order, error: orderError } = await admin.from("orders").insert({
      order_number: orderNumber, customer_name, phone, wilaya, commune, address,
      delivery_type, order_type, notes, subtotal_dzd: subtotal,
      delivery_fee_dzd: null, deposit_dzd: null, remaining_cod_dzd: null, status: order_type === "custom" ? "deposit_pending" : "new"
    }).select("id,order_number").single();
    if (orderError || !order) return json({ error: "La commande n'a pas pu être enregistrée. Réessaie." }, 500);

    const { error: itemsError } = await admin.from("order_items").insert(itemRows.map(row => ({ ...row, order_id: order.id })));
    if (itemsError) {
      await admin.from("orders").delete().eq("id", order.id);
      return json({ error: "Impossible d'enregistrer les articles de la commande." }, 500);
    }

    // Email alert via Resend. Secrets are configured in Supabase Edge Function settings.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("ORDER_NOTIFICATION_EMAIL");
    const fromEmail = Deno.env.get("ORDER_FROM_EMAIL");
    let emailSent = false;
    if (resendKey && notifyEmail && fromEmail) {
      const itemText = itemRows.map(i => `${i.product_name} x ${i.quantity} = ${i.line_total_dzd} DA`).join("\n");
      const textBody = `Nouvelle commande Lily Crochet\nRéférence: ${orderNumber}\nNom: ${customer_name}\nTéléphone: ${phone}\nWilaya: ${wilaya}\nCommune: ${commune}\nAdresse: ${address}\nLivraison: ${delivery_type}\nType: ${order_type}\nArticles:\n${itemText}\nSous-total: ${subtotal} DA\nNotes: ${notes || "(aucune)"}\n\nConfirmer le montant de livraison et l'acompte avec la cliente.`;
      try {
        const mailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: fromEmail, to: [notifyEmail], subject: `Nouvelle commande ${orderNumber} — Lily Crochet`, text: textBody })
        });
        emailSent = mailResponse.ok;
        if (emailSent) await admin.from("orders").update({ email_notified_at: new Date().toISOString() }).eq("id", order.id);
        else console.error("Resend failed", await mailResponse.text());
      } catch (err) { console.error("Email notification error", err); }
    }
    return json({ success: true, order_number: orderNumber, email_notification_sent: emailSent });
  } catch (_err) {
    return json({ error: "Requête invalide. Vérifie les informations puis réessaie." }, 400);
  }
});