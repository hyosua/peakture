import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import albums from './routes/album.js'
import photos from './routes/photos.js'
import authRoutes from './routes/auth.js'
import { errorHandler } from './errorHandler.js';
import connectMongoDB from './db/connexion.js'

dotenv.config({ path: "./config.env" })
const PORT = process.env.PORT || 5000
const app = express()

console.log(process.env.CLOUDINARY_CLOUD_NAME)
// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/albums", albums)
app.use("/photos", photos)

app.use(errorHandler)


app.listen(PORT, () => {
    console.log(`Server running on port: http://localhost:${PORT}`)
connectMongoDB()    
})       
    