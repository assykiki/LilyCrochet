# Lily Crochet — boutique avec commandes enregistrées

Ce projet contient le site mobile-first et un backend Supabase Edge Function. **Il n'est pas encore déployé ni relié à un compte Supabase.** Les identifiants et secrets doivent être configurés par toi dans tes comptes.

## Fonctionnalités
- Design rose/féerique et responsive.
- Recherche, filtres, panier persistant localement.
- Formulaire de commande : nom, téléphone, wilaya, commune, adresse, type de livraison et notes.
- Commandes enregistrées dans Supabase via une Edge Function.
- Le serveur recalcule les prix depuis la base de données (les prix du navigateur ne sont jamais fiables).
- Notification e-mail à la propriétaire via Resend, si les secrets e-mail sont configurés.
- Les commandes personnalisées passent à `deposit_pending`. Le site ne prélève pas d'argent : tu confirmes l'acompte et son moyen de paiement manuellement, puis le solde est à régler à la réception.
- Pas de compte client ni de tableau de bord administrateur dans cette première version. Consulte les commandes dans Supabase Dashboard, avec ton compte propriétaire.

## Étape 1 — Tester le site
1. Décompresse le ZIP.
2. Ouvre le dossier dans Visual Studio Code.
3. Ouvre `index.html` dans un navigateur pour voir le design. La soumission réelle ne fonctionnera qu'après les étapes Supabase ci-dessous.
4. Les images et prix du catalogue sont des exemples. Change le tableau `products` dans `script.js` et les mêmes entrées dans la base de données. Les prix doivent correspondre.

## Étape 2 — Créer la base de données Supabase
1. Crée un projet sur https://supabase.com/.
2. Dans le projet, ouvre **SQL Editor**.
3. Colle le contenu de `supabase/migrations/001_store.sql` et exécute-le.
4. Ce script crée `products`, `orders`, `order_items`, active RLS, autorise uniquement la lecture publique des produits actifs et interdit les écritures publiques sur les commandes. Les commandes sont écrites seulement par la fonction serveur.

## Étape 3 — Déployer la fonction backend
1. Installe Supabase CLI et connecte-toi selon la documentation officielle : https://supabase.com/docs/guides/cli
2. Depuis le dossier du projet, connecte le projet puis déploie la fonction :
   - `supabase login`
   - `supabase link --project-ref TON_PROJECT_REF`
   - `supabase functions deploy create-order`
3. Configure les secrets serveur. **Ne les mets jamais dans `config.js` ni dans le code frontend**:
   - `supabase secrets set RESEND_API_KEY=re_... ORDER_NOTIFICATION_EMAIL=ton-email@example.com ORDER_FROM_EMAIL="Lily Crochet <orders@ton-domaine.com>"`
   - La fonction a besoin de `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`; Supabase les fournit généralement automatiquement aux Edge Functions. Si le déploiement indique qu'ils sont absents, configure-les depuis les secrets du projet avec les valeurs du dashboard. La service role key doit rester strictement côté serveur.
4. Pour la production, ouvre `supabase/functions/create-order/index.ts` et remplace `Access-Control-Allow-Origin: "*"` par le domaine exact de ton site, par exemple `https://ton-site.example`.

## Étape 4 — Configurer l'e-mail
1. Crée un compte Resend : https://resend.com/.
2. Vérifie un domaine d'envoi dans Resend pour utiliser une adresse d'expéditeur de ce domaine.
3. Configure les secrets indiqués ci-dessus. Le destinataire est l'adresse où tu veux recevoir les commandes.
4. Si Resend n'est pas configuré, la commande peut quand même être enregistrée mais la réponse indiquera `email_notification_sent: false` dans la réponse technique. Configure et teste la notification avant d'annoncer le site.

## Étape 5 — Connecter le site à Supabase
1. Dans Supabase, récupère Project URL et la clé publishable (ou anon legacy) depuis **Project Settings → API**.
2. Colle-les dans `config.js`. Seule la clé publishable/anon est autorisée dans le navigateur. Ne copie jamais `service_role`.
3. La liste de produits affichée est actuellement codée dans `script.js`. Les prix et identifiants doivent correspondre aux lignes `products` de Supabase; le backend vérifie à nouveau les prix dans la base avant d'enregistrer une commande.

## Étape 6 — Mettre tes produits réels
- Remplace les noms, prix, catégories, descriptions et illustrations d'exemple dans `script.js` et les entrées correspondantes de `products` dans Supabase.
- Ajoute tes vraies photos. Dans `script.js`, chaque objet produit accepte `image:"URL_DE_L_IMAGE"`; l'interface bascule alors vers la photo. Utilise une URL publique d'image HTTPS.
- Mets à jour les liens Facebook/TikTok dans `index.html`.
- Livraison : les frais ne sont pas calculés automatiquement car ils dépendent du transporteur et de la wilaya. Le site annonce qu'ils seront confirmés par Lily avant confirmation définitive.

## Dépôt et acompte
Cette version **ne collecte aucun paiement**. Pour les commandes personnalisées, elle enregistre la commande avec le statut `deposit_pending`; contacte la cliente pour convenir de l'acompte et de son moyen de paiement. Après réception/confirmation, mets à jour le statut depuis le dashboard Supabase. Le montant d'acompte et les frais de livraison restent null tant qu'ils ne sont pas confirmés. N'annonce pas une commande comme payée avant vérification.

## Sécurité et limites à traiter avant un lancement public
- Le backend vérifie les champs, la wilaya, les quantités, l'état des produits et recalcule les prix.
- Les commandes et leurs lignes ne sont pas lisibles publiquement via les clés frontend (RLS + permissions).
- Pour réduire les abus, configure un CAPTCHA/rate limiting avant le lancement public. L'Edge Function a actuellement un CORS permissif de développement; restreins-le au domaine final.
- Ajoute une vraie politique de confidentialité, une durée de conservation des données et une méthode de suppression des données clients.
- Le catalogue d'exemple et les prix doivent être remplacés.
- Une interface admin personnalisée avec connexion sécurisée, gestion de stock et changement de statut n'est pas incluse dans cette version; utilise le dashboard Supabase au départ.

## Schéma de commande
Le client envoie les IDs de produits et quantités uniquement. Le serveur lit les prix depuis la base, calcule le sous-total, crée la commande et les lignes, puis envoie un e-mail de notification. Les frais de livraison et acompte sont à confirmer manuellement.
