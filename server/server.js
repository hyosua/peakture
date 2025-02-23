import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import albums from './routes/album.js'
import photos from './routes/photos.js'
import { errorHandler } from './errorHandler.js';

dotenv.config()
const PORT = process.env.PORT || 5000
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/albums", albums)
app.use("/photos", photos)

app.use(errorHandler)


app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`))       
