import { useParams, useNavigate } from "react-router-dom";
import albums from "../data/albumsData";
import { useState } from "react";

const Picture = ({photo, index}) => {
    const [vote, setVote] = useState(0);

    return (
        <div className="picture-container">
            <img key={index} src={photo} alt={`Photo ${index +1}`} className="gallery-photo" />
            <button onClick={() => setVote(vote + 1)}>{vote}</button>
        </div>
    );
}

export default Picture;