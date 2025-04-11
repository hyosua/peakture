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

🚀 Lancer le projet avec Docker
Ce projet utilise Docker pour lancer l'application MERN (MongoDB, Express, React, Node.js) en local.

Pré-requis
Docker et Docker Compose doivent être installés sur votre machine.

Une instance MongoDB locale doit être en cours d'exécution (ou utilisez MongoDB Atlas).

Configuration des variables d’environnement
Certaines fonctionnalités (comme la connexion à Cloudinary ou MongoDB) nécessitent des variables d’environnement.

Créer un fichier de configuration :

Copiez le fichier d’exemple :

bash
Copy
Edit
cp server/config.env.example server/config.env
Remplissez-le avec vos informations personnelles (Cloudinary, MongoDB, etc.).

⚠️ Ne partagez jamais ce fichier config.env publiquement. Il est ignoré par Git (.gitignore).

Démarrage de l'application
Depuis la racine du projet, lancez la commande :

bash
Copy
Edit
docker-compose up --build
Les services suivants seront disponibles :

Frontend (Vite + React) : http://localhost:5173

Backend (Express API) : http://localhost:5000



