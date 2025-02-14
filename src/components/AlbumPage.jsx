import { useParams, useNavigate } from "react-router-dom";
import albums from "../data/albumsData";
import { useState } from "react";
import Picture from "./Picture";

const AlbumPage = () => {
    const { month } = useParams();
    const navigate = useNavigate();
    const albumSelected = albums.find(a => a.month === month);
    const [likedPhotoId, setLikedPhotoId] = useState(null);

    const handleLike = (photoId) => {
        setLikedPhotoId((prevId) => (prevId === photoId ? null : photoId));
    }


    if (!albumSelected) {
        navigate("/");
        return null;
    }

    return(
        <div className="wrapper text-white">
            <button className="cursor-pointer border border-white p-2 w-20 mb-4 rounded-lg" onClick={() => navigate("/")}>Retour</button>
            <h2>{month}</h2>
            <h4 className="text-2xl font-fold mb-6">Thème: {albumSelected.theme}</h4>
            <div className="gallery">
                {albumSelected.photos.map((photo) => (
                    <div key={photo.id} className="mb-4 break-inside-avoid">
                        <Picture photo={photo.src} 
                            id={photo.id} 
                            onLike={handleLike}
                            isLiked={likedPhotoId === photo.id}
                        />
                    </div>

                ))}
            </div>
        </div>
    )
}

export default AlbumPage;