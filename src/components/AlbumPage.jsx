import { useParams, useNavigate } from "react-router-dom";
import albums from "../data/albumsData";
import { useState } from "react";

const AlbumPage = () => {
    const { month } = useParams();
    const navigate = useNavigate();
    const album = albums.find(a => a.month === month);
    const [vote, setVote] = useState(0);


    if (!album) {
        navigate("/");
        return null;
    }

    return(
        <div>
            <button onClick={() => navigate("/")}>Retour</button>
            <h2>{month}</h2>
            <h4>Thème: {album.theme}</h4>
            <div className="gallery">
                {album.photos.map((photo, index) => (
                    <img key={index} src={photo} alt={`Photo ${index +1}`} className="gallery-photo" />
                    
                ))}
                <button onClick={() => setVote(vote + 1)}>{vote}</button>
            </div>
        </div>
    )
}

export default AlbumPage;