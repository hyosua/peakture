import localAlbums from '../data/albumsData'
import PictureOfTheMonth from './PictureOfTheMonth'
import '../App.css'
import AlbumList from './AlbumList'
import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import { Share2, Copy } from 'lucide-react'

const FamilyHome = () => {
    const [family,setFamily] = useState(null)
    const familyId = useParams()
    const albumFevrier = localAlbums.find(a => a.month === 'Février')
    const [deviceNavigator, setDeviceNavigator] = useState('mobile')

    useEffect(() => {
        console.log("Params id:", familyId)
        const device = navigator.share ? "mobile" : "pc"
        setDeviceNavigator(device)
        fetch(`http://localhost:5000/api/family/${familyId.id}`)
        .then((res) => res.json())
        .then((data) => setFamily(data.family))
        .catch((err) => console.error(err));
    }, [familyId])

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Rejoins ma famille sur Peakture !",
                text: `Utilise ce code pour nous rejoindre : ${family?.code}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(family?.code);
            alert("Code copié !");
        }
    }

    return (
        <div>
            { family ? (
                <div className='bg-base-100 flex flex-col items-center'>
                    <h1 className='font-bold mt-4 text-4xl'>{family.name}&apos;s Family</h1>
                    <p className='mt-2 font-semibold'>Family Code: <span className='text-accent text-lg font-mono'>{family.inviteCode}</span>
                    <button
                        onClick={handleShare} 
                        className='mt-4 ml-2 p-2 bg-accent text-white cursor-pointer rounded-lg'>
                        {deviceNavigator === "mobile"  ? (<Share2 size={17}/>) : (<Copy size={17} />)}
                    </button>
                    </p>
                    
                    <PictureOfTheMonth winner='Alaina' 
                                        photo={albumFevrier.photos[0].src} 
                                        id='0' 
                                        voteCount='35' 
                                        avatar='avatar'
                                        month='Février' //album.month
                    />
                    <AlbumList />
                </div>
            ) : (
                <p>Chargement...</p>
            )}
            
        </div>
    )
}

export default FamilyHome