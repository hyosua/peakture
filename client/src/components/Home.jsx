import localAlbums from '../data/albumsData';
import PictureOfTheMonth from './PictureOfTheMonth';
import '../App.css';
import AlbumList from './AlbumList';

const Home = () => {

    const albumFevrier = localAlbums.find(a => a.month === 'Février');

    return (
        <div>
            <main>
                <div className='pattern' />

                <div className='wrapper'>
                    <header>
                        <PictureOfTheMonth winner='Alaina' 
                                            photo={albumFevrier.photos[0].src} 
                                            id='0' 
                                            voteCount='35' 
                                            avatar='avatar'
                                            month='Février' //album.month
                        />
                    </header>
                    

                    <AlbumList />
                </div>
            </main>
            
        </div>
    )
}

export default Home