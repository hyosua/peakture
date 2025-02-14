import {useParams, useNavigate }   from 'react-router-dom';
import albums from '../data/albumsData';
import PictureOfTheMonth from './PictureOfTheMonth';
import '../App.css';

const Home = () => {
    const navigate = useNavigate();
    const { month } = useParams();
    const albumFevrier = albums.find(a => a.month === 'Février');

    return (
        <div>
            <main>
                <div className='pattern' />

                <div className='wrapper'>
                    <header>
                        <PictureOfTheMonth winner='Alaina' 
                                            photo={albumFevrier.photos[0]} 
                                            id='0' 
                                            voteCount='35' 
                                            avatar='avatar'
                                            month='Février' //album.month
                        />
                    </header>
                    

                    <div className="album-preview">
                        {albums.map((album, index) => (
                            <div key={index} 
                                className=""
                                onClick={() => navigate(`/album/${album.month}`)}
                            >
                                <h3>{album.month}</h3>
                                <img src={album.photos[0]} alt={album.theme} className=""/>
                                <h3>Thème:"<i>{album.theme}</i>"</h3>
                                <h4>Winner:<i>{album.winner}</i></h4>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            
        </div>
    )
}

export default Home