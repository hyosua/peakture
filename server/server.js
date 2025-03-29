import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import albums from './routes/album.routes.js'
import photos from './routes/photos.routes.js'
import authRoutes from './routes/auth.routes.js'
import family from './routes/family.routes.js'
import user from './routes/user.routes.js'
import { errorHandler } from './errorHandler.js';
import connectMongoDB from './db/connexion.js'
import cookieParser from   'cookie-parser'

dotenv.config({ path: "./config.env" })
const PORT = process.env.PORT || 5000
const app = express()

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, // Autorise les cookies et sessions
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/family", family)
app.use("/api/albums", albums)
app.use("/api/photos", photos)
app.use("/api/user", user)

app.use(errorHandler)


connectMongoDB()
  .then(() => {
    console.log('Connecté à MongoDB')
    
    // Importer et initialiser les tâches planifiées
    import('./jobs/cron/index.js')
      .then(() => console.log('Tâches planifiées initialisées'))
      .catch(err => console.error('Erreur lors de l\'initialisation des tâches planifiées:', err))
    
    // Démarrer le serveur après la connexion à la base de données
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur: http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err)
  })      
    