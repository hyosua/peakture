import { useParams, useNavigate } from "react-router-dom";
import albums from "../data/albumsData";

const AlbumPage = () => {
    const { month } = useParams();
    const navigate = useNavigate();
    const album = albums.find(a => a.month === month);

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
            </div>
        </div>
    )
}

export default AlbumPage;