import { useParams, useNavigate } from "react-router-dom";
import albums from "../data/albumsData";
import { useState } from "react";
import Picture from "./Picture";

const AlbumPage = () => {
    const { month } = useParams();
    const navigate = useNavigate();
    const albumSelected = albums.find(a => a.month === month);
    const [vote, setVote] = useState(0);


    if (!albumSelected) {
        navigate("/");
        return null;
    }

    return(
        <div>
            <button onClick={() => navigate("/")}>Retour</button>
            <h2>{month}</h2>
            <h4>Thème: {albumSelected.theme}</h4>
            <div className="gallery">
                {albumSelected.photos.map((photo, index) => (
                    <Picture photo={photo} index={index} key={photo.id || index} />
                    
                ))}
            </div>
        </div>
    )
}

export default AlbumPage;