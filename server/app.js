// app.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import albums from './routes/album.routes.js'
import photos from './routes/photos.routes.js'
import authRoutes from './routes/auth.routes.js'
import family from './routes/family.routes.js'
import user from './routes/user.routes.js'
import close from './routes/close.routes.js'
import poll from './routes/poll.routes.js'
import classement from './routes/classement.routes.js'
import { errorHandler } from './errorHandler.js'

const app = express()

const allowedOrigins = [
  'https://peakture-gpumivoj7-drykissfffos-projects.vercel.app',
  'https://api.peakture.fr',
  'https://www.peakture.fr',
  'http://localhost:5173',
  'http://localhost:5174',
];

// Regex for Vercel preview URLs
const vercelPreviewRegex = /^https:\/\/peakture-[\w-]+-drykissfffos-projects\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (comme curl ou mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) ||
      vercelPreviewRegex.test(origin)
  ) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/family", family)
app.use("/api/albums", albums)
app.use("/api/albums/close", close)
app.use("/api/photos", photos)
app.use("/api/user", user)
app.use("/api/classement", classement)
app.use("/api/poll", poll)

app.use(errorHandler)

export default app
