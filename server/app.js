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
import classement from './routes/classement.routes.js'
import { errorHandler } from './errorHandler.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
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

app.use(errorHandler)

export default app
