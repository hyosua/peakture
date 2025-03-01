import localAlbums from '../data/albumsData';
import PictureOfTheMonth from './PictureOfTheMonth';
import '../App.css';
import AlbumList from './AlbumList';

const FamilyHome = () => {

    const albumFevrier = localAlbums.find(a => a.month === 'Février');

    return (
        <div>
            <main>
                <div className='pattern' />
                <div role="alert" className="alert alert-info">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
  <span>New software update available.</span>
</div>

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

export default FamilyHome