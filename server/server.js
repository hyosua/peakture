import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import albums from './routes/album.js';
import photos from './routes/photos.js'

const PORT = process.env.PORT || 5000
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/album", albums);
app.use("/photos", photos)


app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));        
