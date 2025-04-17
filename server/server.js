// server.js
import dotenv from 'dotenv'
import connectMongoDB from './db/connexion.js'
import app from './app.js' // 👈 l’app express pure
dotenv.config()

const PORT = process.env.PORT || 5000

connectMongoDB()
  .then(() => {
    console.log('Connecté à MongoDB')

    import('./jobs/cron/index.js')
      .then(() => console.log('Tâches planifiées initialisées'))
      .catch(err => console.error('Erreur d\'initialisation des tâches planifiées:', err))

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur: http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err)
  })
