const $ = s => document.querySelector(s); 
 
const DELIVERY_PRICES = { 
  "Adrar": { office: 850, home: 1300 }, 
  "Chlef": { office: 450, home: 800 }, 
  "Laghouat": { office: 450, home: 900 }, 
  "Oum El Bouaghi": { office: 450, home: 900 }, 
  "Batna": { office: 450, home: 800 }, 
  "Bejaia": { office: 450, home: 800 }, 
  "Biskra": { office: 650, home: 900 }, 
  "Bechar": { office: 650, home: 1300 }, 
  "Blida": { office: 400, home: 600 }, 
  "Bouira": { office: 450, home: 800 }, 
  "Tamanrasset": { office: 1000, home: 1700 }, 
  "Tebessa": { office: 600, home: 900 }, 
  "Tlemcen": { office: 450, home: 800 }, 
  "Tiaret": { office: 450, home: 800 }, 
  "Tizi Ouzou": { office: 450, home: 800 }, 
  "Alger": { office: 300, home: 500 }, 
  "Djelfa": { office: 450, home: 900 }, 
  "Jijel": { office: 450, home: 800 }, 
  "Setif": { office: 450, home: 800 }, 
  "Saida": { office: 450, home: 800 }, 
  "Skikda": { office: 450, home: 800 }, 
  "Sidi Bel Abbas": { office: 450, home: 800 }, 
  "Annaba": { office: 450, home: 800 }, 
  "Guelma": { office: 450, home: 800 }, 
  "Constantine": { office: 450, home: 800 }, 
  "Medea": { office: 450, home: 800 }, 
  "Mostghanem": { office: 450, home: 800 }, 
  "MSila": { office: 450, home: 800 }, 
  "Mascara": { office: 450, home: 800 }, 
  "Ouargla": { office: 500, home: 900 }, 
  "Oran": { office: 450, home: 800 }, 
  "El Bayadh": { office: 450, home: 1300 }, 
  "Illizi": { office: 700, home: 1700 }, 
  "Bourdj Bou Arreridj": { office: 450, home: 800 }, 
  "Boumerdes": { office: 400, home: 700 }, 
  "El Tarf": { office: 550, home: 800 }, 
  "Tindouf": { office: 950, home: 1700 }, 
  "Tissemsilt": { office: 450, home: 800 }, 
  "El Oued": { office: 600, home: 900 }, 
  "Khenchela": { office: 450, home: 800 }, 
  "Souk Ahras": { office: 450, home: 800 }, 
  "Tipaza": { office: 450, home: 700 }, 
  "Mila": { office: 450, home: 800 }, 
  "Ain Defla": { office: 450, home: 800 }, 
  "Naama": { office: 500, home: 1300 }, 
  "Ain Temouchent": { office: 450, home: 800 }, 
  "Gherdaia": { office: 650, home: 900 }, 
  "Relizane": { office: 450, home: 680 }, 
  "Timimoun": { office: 950, home: 1300 }, 
  "Bordj Baji MOkhta": { office: 450, home: 1300 }, 
  "Ouled Djelal": { office: 750, home: 900 }, 
  "Beni Abbes": { office: 850, home: 1300 }, 
  "In Salah": { office: 600, home: 1700 }, 
  "In Ghezzam": { office: 500, home: 1700 }, 
  "Touggourt": { office: 600, home: 900 }, 
  "Djanet": { office: 500, home: 1700 }, 
  "El Mghaier": { office: 650, home: 900 }, 
  "El Meniaa": { office: 700, home: 900 } 
}; 
 
function normalizeWilaya(name) { 
  return String(name || "") 
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/['’\s-]/g, "") 
    .toLowerCase(); 
} 
 
const WILAYA_ALIASES = { 
  sidibelabbes: "sidibelabbas", 
  mostaganem: "mostghanem", 
  bordjbouarreridj: "bourdjbouarreridj", 
  ghardaia: "gherdaia", 
  bordjbadjimokhtar: "bordjbajimokhta", 
  inguezzam: "inghezzam", 
  elmghair: "elmghaier" 
}; 
 
function getDeliveryPrice(wilaya, deliveryType) { 
  const normalized = normalizeWilaya(wilaya); 
  const key = WILAYA_ALIASES[normalized] || normalized; 
 
  const entry = Object.entries(DELIVERY_PRICES).find( 
    ([name]) => normalizeWilaya(name) === key 
  ); 
 
  if (!entry) return null; 
 
  const price = entry[1][deliveryType]; 
 
  if (typeof price !== "number" || price <= 0) { 
    return null; 
  } 
 
  return price; 
} 
 
const money = n => 
  `${Number(n).toLocaleString("fr-FR")} DA`; 
 
const WILAYAS = [ 
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", 
  "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", 
  "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", 
  "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", 
  "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", 
  "Annaba", "Guelma", "Constantine", "Médéa", 
  "Mostaganem", "M'Sila", "Mascara", "Ouargla", 
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", 
  "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", 
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", 
  "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", 
  "Ghardaïa", "Relizane", "Timimoun", 
  "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", 
  "In Salah", "In Guezzam", "Touggourt", "Djanet", 
  "El M'Ghair", "El Meniaa" 
]; 
 
const products = [ 
  { 
    id: "mushroom", 
    name: "Petit champignon", 
    category: "peluches", 
    price: 1800, 
    description: "Une petite peluche toute douce.", 
    emoji: "", 
    tag: "Best-seller", 
    bg: "#f7e0e8", 
    image: "muchi.jpg" 
  }, 
  { 
    id: "cat", 
    name: "Chat tout mignon", 
    category: "peluches", 
    price: 2200, 
    description: "Un compagnon fait avec amour.", 
    emoji: "", 
    tag: "Fait main", 
    bg: "#f5e7df", 
    image: "cat.png" 
  }, 
  { 
    id: "bag", 
    name: "Sac fleur de Lily", 
    category: "sacs", 
    price: 3000, 
    description: "Un sac crocheté pour le quotidien.", 
    emoji: "", 
    tag: "Nouveau", 
    bg: "#e8e5f3", 
    image: "bag.jpg" 
  }, 
  { 
    id: "bouquet", 
    name: "Bouquet éternel", 
    category: "fleurs", 
    price: 1600, 
    description: "Des fleurs qui ne fanent jamais.", 
    emoji: "", 
    tag: "Cadeau", 
    bg: "#f7e5e6", 
    image: "flowers.png" 
  }, 
  { 
    id: "strawberry", 
    name: "Porte-clés fraise", 
    category: "accessoires", 
    price: 650, 
    description: "Un petit détail plein de charme.", 
    emoji: "", 
    tag: "Petit prix", 
    bg: "#f9e4dc", 
    image: "skeychain.png" 
  }, 
  { 
    id: "bear", 
    name: "Ourson câlin", 
    category: "peluches", 
    price: 2900, 
    description: "Un cadeau pour les grands et petits.", 
    emoji: "", 
    tag: "Fait main", 
    bg: "#f2e8d9", 
    image: "bear.png" 
  }, 
  { 
    id: "flowerpot", 
    name: "Fleur en pot", 
    category: "fleurs", 
    price: 1200, 
    description: "Une touche fleurie pour ta chambre.", 
    emoji: "", 
    tag: "Déco", 
    bg: "#e6eee2", 
    image: "flowerenpot.png" 
  }, 
  { 
    id: "minibag", 
    name: "Mini sac rose", 
    category: "sacs", 
    price: 800, 
    description: "Une petite pièce légère et pratique.", 
    emoji: "", 
    tag: "Fait main", 
    bg: "#f4dce6", 
    image: "minibag.jpg" 
  } 
]; 
 
let activeCategory = "all"; 
let cart = {}; 
let toastTimer; 
 
try { 
  cart = JSON.parse(localStorage.getItem("lilyCart") || "{}") || {}; 
} catch { 
  cart = {}; 
} 
 
const categoryNames = { 
  peluches: "Peluche", 
  sacs: "Sac", 
  fleurs: "Fleurs & cadeaux", 
  accessoires: "Accessoire" 
}; 
 
function renderProducts() { 
  const term = $("#searchInput").value.trim().toLocaleLowerCase("fr"); 
 
  const shown = products.filter(p => 
    (activeCategory === "all" || p.category === activeCategory) && 
    `${p.name} ${p.description} ${categoryNames[p.category]}` 
      .toLocaleLowerCase("fr") 
      .includes(term) 
  );
   $("#productGrid").innerHTML = shown.length 
    ? shown.map(p => ` 
      <article class="product-card"> 
        <div class="product-art" style="--art-bg:${p.bg}"> 
          <span class="product-tag">${p.tag}</span> 
          ${p.image 
            ? `<img class="product-photo" src="${p.image}" alt="${p.name}">` 
            : `<span class="product-emoji" role="img" aria-label="${p.name}">${p.emoji}</span>` 
          } 
          <button class="quick-add" data-add="${p.id}" aria-label="Ajouter ${p.name} au 
panier">+</button> 
        </div> 
        <div class="product-info"> 
          <h3>${p.name}</h3> 
          <p>${p.description}</p> 
          <div class="product-bottom"> 
            <span class="product-price">${money(p.price)}</span> 
            <span class="stock-label">♡ Fait main</span> 
          </div> 
        </div> 
      </article> 
    `).join("") 
    : `<div class="no-results">Aucune création trouvée ♡</div>`; 
} 
 
function saveCart() { 
  try { 
    localStorage.setItem("lilyCart", JSON.stringify(cart)); 
  } catch {} 
  renderCart(); 
} 
 
function add(id) { 
  cart[id] = (cart[id] || 0) + 1; 
  saveCart(); 
  showToast("Ajouté à ton panier ♡"); 
} 
 
function qty(id, n) { 
  cart[id] = (cart[id] || 0) + n; 
  if (cart[id] <= 0) delete cart[id]; 
  saveCart(); 
} 
 
function cartEntries() { 
  return Object.entries(cart).filter( 
    ([id, q]) => 
      products.some(p => p.id === id) && 
      Number.isInteger(q) && 
      q > 0 
  ); 
} 
 
function total() { 
  return cartEntries().reduce( 
    (sum, [id, q]) => 
      sum + products.find(p => p.id === id).price * q, 
    0 
  ); 
} 
 
function updateCheckoutTotals() { 
  const subtotal = total(); 
  const wilaya = $("#wilayaSelect").value; 
  const deliveryType = document.querySelector( 
    '[name="delivery_type"]' 
  ).value; 
 
  $("#checkoutSubtotal").textContent = money(subtotal); 
 
  if (!wilaya) { 
    $("#checkoutDelivery").textContent = "Choisir une wilaya"; 
    $("#checkoutTotal").textContent = "Choisir une wilaya"; 
    return; 
  } 
 
  const deliveryPrice = getDeliveryPrice(wilaya, deliveryType); 
 
  if (deliveryPrice === null) { 
    $("#checkoutDelivery").textContent = "À confirmer par Lily"; 
    $("#checkoutTotal").textContent = "À confirmer"; 
    return; 
  } 
 
  $("#checkoutDelivery").textContent = money(deliveryPrice); 
  $("#checkoutTotal").textContent = money(subtotal + deliveryPrice); 
} 
 
function renderCart() { 
  const entries = cartEntries(); 
 
  $("#cartCount").textContent = entries.reduce( 
    (s, [, q]) => s + q, 
    0 
  ); 
 
  $("#cartItems").innerHTML = entries.map(([id, q]) => { 
    const p = products.find(x => x.id === id); 
 
    return ` 
      <div class="cart-line"> 
        <div class="cart-thumb" style="--art-bg:${p.bg}">${p.emoji}</div> 
        <div> 
          <h3>${p.name}</h3> 
          <span class="line-price">${money(p.price)}</span> 
          <div class="quantity"> 
            <button data-qty="${id}" data-change="-1" aria-label="Diminuer">−</button> 
            <span>${q}</span> 
            <button data-qty="${id}" data-change="1" aria-label="Augmenter">+</button> 
          </div> 
        </div> 
        <button class="remove-item" data-remove="${id}" aria-label="Retirer">×</button> 
      </div> 
    `; 
  }).join(""); 
 
  $("#cartEmpty").hidden = entries.length > 0; 
  $("#cartFooter").hidden = !entries.length; 
  $("#cartTotal").textContent = money(total()); 
 
  updateCheckoutTotals(); 
} 
 
function openCart() { 
  $("#cartDrawer").classList.add("open"); 
  $("#cartDrawer").setAttribute("aria-hidden", "false"); 
  $("#overlay").hidden = false; 
  document.body.style.overflow = "hidden"; 
} 
 
function closeCart() { 
  $("#cartDrawer").classList.remove("open"); 
  $("#cartDrawer").setAttribute("aria-hidden", "true"); 
  $("#overlay").hidden = true; 
 
  if ($("#checkoutModal").hidden) { 
    document.body.style.overflow = ""; 
  } 
} 
 
function showToast(msg) { 
  const t = $("#toast"); 
  t.textContent = msg; 
  t.classList.add("show"); 
  clearTimeout(toastTimer); 
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400); 
} 
 
function showCheckout() { 
  if (!cartEntries().length) { 
    showToast("Ton panier est vide ♡"); 
    return; 
  } 
 
  closeCart(); 
  $("#checkoutModal").hidden = false; 
  document.body.style.overflow = "hidden"; 
  renderCart(); 
} 
 
function closeCheckout() { 
  $("#checkoutModal").hidden = true; 
  document.body.style.overflow = ""; 
} 
 
$("#filters").addEventListener("click", e => { 
  const b = e.target.closest("[data-category]"); 
  if (!b) return; 
 
  activeCategory = b.dataset.category; 
 
  document.querySelectorAll(".filter").forEach(x => 
    x.classList.toggle("active", x === b) 
  ); 
 
  renderProducts(); 
}); 
 
$("#searchInput").addEventListener("input", renderProducts); 
 
$("#productGrid").addEventListener("click", e => { 
  const b = e.target.closest("[data-add]"); 
  if (b) add(b.dataset.add); 
}); 
 
$("#cartItems").addEventListener("click", e => { 
  const q = e.target.closest("[data-qty]"); 
  const r = e.target.closest("[data-remove]"); 
 
  if (q) qty(q.dataset.qty, Number(q.dataset.change)); 
 
  if (r) {
     delete cart[r.dataset.remove]; 
    saveCart(); 
  } 
}); 
 
$("#openCart").addEventListener("click", openCart); 
$("#closeCart").addEventListener("click", closeCart); 
$("#overlay").addEventListener("click", closeCart); 
 
$("#continueShopping").addEventListener("click", () => { 
  closeCart(); 
  $("#shop").scrollIntoView({ behavior: "smooth" }); 
}); 
 
$("#checkoutButton").addEventListener("click", showCheckout); 
$("#closeCheckout").addEventListener("click", closeCheckout); 
 
$("#orderType").addEventListener("change", () => {
  $("#depositInfo").textContent =
    $("#orderType").value === "custom"
      ? "Commande personnalisée : Lily confirmera la faisabilité et le montant de l’acompte avant de commencer. Le solde sera à régler à la réception."
      : "Produit disponible : paiement à la réception. Le total et les frais de livraison seront confirmés par Lily.";
});

$("#menuToggle").addEventListener("click", () => {
  const n = $("#mainNav");
  const open = n.classList.toggle("open");

  $("#menuToggle").setAttribute("aria-expanded", String(open));
  $("#menuToggle").textContent = open ? "×" : "☰";
});

$("#mainNav").addEventListener("click", e => {
  if (e.target.closest("a")) {
    $("#mainNav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
    $("#menuToggle").textContent = "☰";
  }
});

$("#wilayaSelect").innerHTML =
  '<option value="">Choisir une wilaya</option>' +
  WILAYAS.map(w => `<option value="${w}">${w}</option>`).join("");

$("#wilayaSelect").addEventListener("change", updateCheckoutTotals);

document.querySelector('[name="delivery_type"]')
  .addEventListener("change", updateCheckoutTotals);

$("#orderForm").addEventListener("submit", async e => {
  e.preventDefault();

  const form = e.currentTarget;
  const status = $("#formStatus");
  const btn = $("#submitOrder");

  if (!cartEntries().length) {
    status.textContent = "Ton panier est vide.";
    return;
  }

  const cfg = window.LILY_CONFIG || {};

  if (
    !cfg.SUPABASE_URL ||cfg.SUPABASE_URL.includes("YOUR-PROJECT") ||
    !cfg.SUPABASE_ANON_KEY ||
    cfg.SUPABASE_ANON_KEY.includes("YOUR_")
  ) {
    status.textContent =
      "Le site n'est pas encore relié à Supabase. Suis le guide README pour configurer le backend.";
    return;
  }

  const f = new FormData(form);
  const wilaya = f.get("wilaya");
  const deliveryType = f.get("delivery_type");
  const deliveryPrice = getDeliveryPrice(wilaya, deliveryType);

  if (deliveryPrice === null) {
    status.textContent =
      "Le prix de livraison de cette wilaya ou de ce mode est à confirmer. Contacte Lily avant de commander.";
    return;
  }

  const payload = {
    customer_name: f.get("customer_name").trim(),
    phone: f.get("phone").trim(),
    wilaya: wilaya,
    commune: f.get("commune").trim(),
    address: f.get("address").trim(),
    order_type: f.get("order_type"),
    delivery_type: deliveryType,
    delivery_price: deliveryPrice,
    subtotal: total(),
    estimated_total: total() + deliveryPrice,
    notes: f.get("notes").trim(),
    items: cartEntries().map(([product_id, quantity]) => ({
      product_id,
      quantity
    }))
  };

  btn.disabled = true;
  btn.textContent = "Envoi en cours…";
  status.textContent = "Envoi sécurisé de ta commande…";

  try {
    const response = await fetch(
      `${cfg.SUPABASE_URL}/functions/v1/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": cfg.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${cfg.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Impossible d'envoyer la commande."
      );
    }

    status.textContent =
      `Commande enregistrée ! Référence : ${data.order_number}. Lily te contactera pour confirmer le total, la livraison et, si nécessaire, l’acompte.`;

    cart = {};
    saveCart();
    form.reset();

    $("#depositInfo").textContent =
      "Pour une commande personnalisée, un acompte sera demandé après confirmation. Le montant sera communiqué par Lily.";

    updateCheckoutTotals();
    showToast("Commande enregistrée ♡");

  } catch (err) {
    status.textContent =
      err.message || "Erreur réseau. Réessaie plus tard.";

  } finally {
    btn.disabled = false;
    btn.textContent = "Envoyer ma commande ♡";
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeCart();
    closeCheckout();
  }
});

$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
