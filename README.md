# Peakture (Work in Progress)

## Description
Peakture est une application permettant de rejoindre une "Family" : une communauté où les utilisateurs peuvent participer à des concours photo mensuels pour garder le contact avec leurs proches de manière ludique.

### Fonctionnalités principales
En fonction du type d'utilisateur, voici les fonctionnalités disponibles :
- **Admin** :
  - Création d'une "Family"
  - Création d'un album avec un thème
  - Clôturer les votes
- **Utilisateur** :
  - Rejoindre une "Family"
  - Créer une "Family" et en devenir admin
  - Participer à un album en uploadant une photo
  - Voter pour la photo d'un autre utilisateur
- **Invité** :
  - Possibilité de tester l'application en créant une "Family"
  - Rejoindre une "Family"
  - Impossible de participer sans inscription

## Technologies utilisées
- **Backend** : Node.js, Express, MongoDB avec Mongoose
- **Frontend** : React avec Vite
- **Style** : TailwindCSS, DaisyUI
- **Authentification** : JWT
- **Stockage d'images** : Cloudinary
- **Envoi d'e-mails** : SendGrid
- **Autres** : React Router DOM, React Masonry CSS, Motion

## Installation et Configuration

### Prérequis
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Installation
1. **Cloner le projet**
   ```
   git clone https://github.com/ton-utilisateur/peakture.git
   cd peakture
   ```

2. **Installer les dépendances**
   - Pour le serveur :
     ```
     cd server
     npm install
     ```
   - Pour le client :
     ```
     cd client
     npm install
     ```

3. **Configuration des variables d'environnement**
   Créer un fichier `config.env` dans le dossier `server` et ajouter les variables suivantes :
   ```env
   ATLAS_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

## Utilisation

### Lancer l'application
- **Démarrer le serveur** :
  ```
  cd server
  npm run dev
  ```
- **Démarrer le client** :
  ```
  cd client
  npm run dev
  ```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173).
Serveur configuré sur http://localhost:5000



