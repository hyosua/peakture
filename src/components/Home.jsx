import { useNavigate }   from 'react-router-dom';
import albums from '../data/albumsData';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className="album-container">
                {albums.map((album, index) => (
                    <div key={index} 
                        className="album"
                        onClick={() => navigate(`/album/${album.month}`)}
                    >
                        <h3>{album.month}</h3>
                        <img src={album.photos[0]} alt={album.theme} className="photo-preview"/>
                        <h3>Thème:"<i>{album.theme}</i>"</h3>
                        <h4>Winner:<i>{album.winner}</i></h4>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home