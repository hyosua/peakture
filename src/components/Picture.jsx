import { useParams, useNavigate } from "react-router-dom";
import albums from "../data/albumsData";
import { useState } from "react";

const Picture = ({photo, id, isLiked, onLike}) => {

    return (
        <div className="gallery">
            <img key={id} src={photo} alt={`Photo ${id +1}`} className="gallery-photo" />
            <button onClick={() => onLike(id)}>{isLiked ? "❤️" : "🤍"}</button>
        </div>
    );
}

export default Picture;