# Peakture

**Peakture** est une application web de concours photo en famille. Chaque mois, les membres d'une *Family* participent à un concours sur un thème choisi par l'admin, votent pour leur photo préférée, et découvrent le classement final — une façon ludique de garder le contact avec ses proches.

Site déployé : [peakture.fr](https://peakture.fr)

---

## Fonctionnalités

### Rôles utilisateurs

| Rôle | Capacités |
|---|---|
| **Admin** | Créer une Family, créer des albums avec thème et date, lancer/clôturer les votes |
| **Membre** | Rejoindre une Family, uploader une photo par album, voter pour les autres |
| **Invité** | Créer ou rejoindre une Family pour tester l'app — inscription requise pour participer |

### Cycle d'un concours

1. L'admin crée un album avec un thème (ex. *"Nature — Juin 2025"*)
2. Les membres uploadent leur photo pendant la période de participation
3. L'admin lance le vote — chacun vote pour sa photo préférée (pas la sienne)
4. L'admin clôture le vote et le classement est révélé

---

## Stack technique

- **Backend** : Node.js / Express / MongoDB (Mongoose)
- **Frontend** : React / Vite / TailwindCSS / DaisyUI
- **Auth** : JWT (httpOnly cookies)
- **Stockage** : Cloudinary
- **Emails** : SendGrid
- **Autres** : React Router, Framer Motion, Redux

---

## Sécurité

L'application a fait l'objet d'un audit selon l'OWASP Top 10 et des mesures ont été mises en place pour couvrir les principales catégories de risques :

- **Contrôle d'accès** : toutes les routes d'écriture sont protégées par authentification ; les opérations sensibles vérifient le rôle de l'utilisateur côté serveur
- **Validation des entrées** : les données entrantes sont validées et filtrées côté serveur avant tout traitement ou persistance
- **Protection contre l'injection** : les paramètres utilisateur sont assainis pour prévenir les injections NoSQL et autres
- **Headers de sécurité** : les réponses HTTP incluent les headers de sécurité recommandés
- **Gestion des sessions** : cookies sécurisés (httpOnly, SameSite), nettoyage des sessions à la déconnexion
- **Limitation du trafic** : rate limiting appliqué sur les endpoints d'authentification
- **Journalisation** : aucune donnée sensible n'est loguée en production
