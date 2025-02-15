import express from 'express';
import cors from 'cors';
import albums from "./routes/album.js";

const PORT = process.env.PORT || 5000
const app = express();

app.use(cors());
app.use(express.json());
app.use("/album", albums);

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));        
