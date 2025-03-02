import localAlbums from '../data/albumsData';
import PictureOfTheMonth from './PictureOfTheMonth';
import '../App.css';
import AlbumList from './AlbumList';

const FamilyHome = () => {

    const albumFevrier = localAlbums.find(a => a.month === 'Février');

    return (
        <div>
            <main className='bg-base-100'>
                <div />

                <div className='bg-base-200 flex flex-col items-center'>
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

export default FamilyHome