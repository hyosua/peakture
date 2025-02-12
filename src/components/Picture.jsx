import { useParams, useNavigate } from "react-router-dom";
import albums from "../data/albumsData";
import { useState } from "react";

const Picture = ({src, index}) => {
    const [vote, setVote] = useState(0);

    return (
        <div class="picture-container">
            <img key={index} src={photo} alt={`Photo ${index +1}`} className="gallery-photo" />
            <button onClick={() => setVote(count + 1)}>{count}</button>
        </div>
    );
}

export default Picture;