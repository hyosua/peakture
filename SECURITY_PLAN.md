# Plan de sécurisation OWASP Top 10 – Peakture

## Contexte

Audit de sécurité complet du backend Node.js/Express. Les vulnérabilités critiques identifiées sont :
- Quasi-totalité des routes d'écriture sans authentification (Broken Access Control)
- Clé API SendGrid loguée en clair
- Aucun rate limiting (brute force possible)
- Aucun header de sécurité HTTP
- Inputs non validés (risque NoSQL injection, XSS, SSRF)
- Failles dans le flow password reset

---

## Tâches

### ✅ T1 – Installer les dépendances de sécurité
```bash
cd server && npm install helmet express-rate-limit zod
```
- `helmet` → headers HTTP de sécurité (CSP, X-Frame-Options, HSTS…)
- `express-rate-limit` → protection brute force
- `zod` → validation et sanitisation des inputs

---

### T2 – A02/A09 – Supprimer les logs de données sensibles

Fichiers concernés :
- `server/lib/utils/sendEmail.js:8` → supprimer `console.log('SENDGRID_API_KEY:', ...)`
- `server/controllers/auth.controller.js:34` → supprimer log inviteCode
- `server/controllers/auth.controller.js:41` → supprimer log résultat DB
- `server/controllers/auth.controller.js:115-120` → supprimer logs cookies/env du logout

Corriger `server/errorHandler.js` : en production, retourner `"Internal Server Error"` générique pour les 500.

---

### T3 – A05 – Ajouter Helmet.js et corriger la config CORS

Dans `server/app.js` :
1. `app.use(helmet())` en premier middleware
2. Fix CORS : refuser les requêtes sans header `Origin` en production
3. Supprimer le bloc `app.options('*', cors({...}))` redondant (lignes 42-45)
4. Limiter la taille JSON : `express.json({ limit: '1mb' })`

---

### T4 – A07 – Rate limiting sur les endpoints auth

Créer `server/middleware/rateLimiter.js` :
- `authLimiter` : 10 req / 15 min par IP
- Appliquer sur `POST /signup`, `POST /login`, `POST /request-password-reset`

---

### T5 – A03 – Middleware de validation Zod

Créer `server/middleware/validate.js` avec schémas Zod :

| Schéma | Champs |
|---|---|
| `signupSchema` | username (3-30 chars alphanum), email, password (8+ chars), inviteCode (optionnel, `[A-F0-9]{6}`) |
| `loginSchema` | identifier (non vide), password (non vide) |
| `resetPasswordSchema` | resetToken (non vide), password (8+ chars) |
| `createAlbumSchema` | theme (max 100), familyId (ObjectId) |
| `editAlbumSchema` | description (max 500) / theme (max 100) |
| `addPhotoSchema` | albumId (ObjectId), src (URL `res.cloudinary.com`), username (max 50) |
| `editFamilyNameSchema` | name (2-50 chars) |
| `inviteCodeSchema` | inviteCode (`[A-F0-9]{6}`) |

---

### T6 – A01 – Ajouter `identifyUserOrGuest` aux routes non protégées

**`server/routes/album.routes.js`** :
- `POST /`, `PATCH /:id`, `PATCH /:id/edit-description`, `DELETE /:id`, `DELETE /:id/cloudinary/delete`

**`server/routes/photos.routes.js`** :
- `POST /`, `DELETE /:id`, `POST /cloudinary/delete`, `PATCH /:id`

**`server/routes/close.routes.js`** :
- `PATCH /:id/close-album`, `PUT /:id/set-countdown`

**`server/routes/family.routes.js`** :
- `PATCH /:id/edit-name`

---

### T7 – A01 – Vérifications d'autorisation dans les controllers

- `closeAlbum`, `setCountdown` → vérifier que l'utilisateur est admin de la famille
- `editFamilyName` → vérifier que l'utilisateur est admin
- `deletePhoto`, `replacePhoto` → vérifier que l'utilisateur est auteur ou admin
- `deleteAlbum` → vérifier que l'utilisateur est admin de la famille

---

### T8 – A07 – Corriger les failles auth (password reset, NoSQL)

Dans `server/controllers/auth.controller.js` :

1. **`requestPasswordReset`** : si `!user`, retourner `200` générique sans révéler l'inexistence de l'email
2. **`resetPassword`** : ajouter `resetTokenExpires: { $gt: Date.now() }` dans la requête findOne
3. **`signup`** : valider que `inviteCode` correspond à `/^[A-F0-9]{6}$/i` avant la requête MongoDB

---

## Vérification finale

1. Sans cookie JWT → `POST /api/albums`, `POST /api/photos`, `PATCH /api/albums/:id/close-album` retournent **401**
2. Utilisateur non-admin → `PATCH /:id/edit-name`, `PATCH /close/:id/close-album` retournent **403**
3. inviteCode `{"$ne":null}` → rejeté par validation Zod
4. Headers HTTP de réponse : `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` présents
5. Logs serveur : plus de clé API visible
6. Rate limiting : >10 requêtes login en 15 min → **429**
