import localAlbums from '../data/albumsData'
import Peakture from './Peakture.jsx'
import '../App.css'
import AlbumList from './AlbumList.jsx'
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import { Share2, Copy } from 'lucide-react'
import LogoutOptions from './auth/LogoutOptions.jsx';

const FamilyHome = () => {
    const [family,setFamily] = useState(null)
    const { familyId } = useParams()
    const albumFevrier = localAlbums.find(a => a.month === 'Février')
    const [deviceNavigator, setDeviceNavigator] = useState('mobile')
    const [errorMessage, setErrorMessage] = useState('')

    const {currentUser} = useAuth()

    useEffect(() => {
        const device = navigator.share ? "mobile" : "pc"
        setDeviceNavigator(device)
        fetch(`http://localhost:5000/api/family/${familyId}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            setFamily(data.family)
        })
        .catch((err) => console.error(err));
    }, [familyId])

    

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Rejoins ma famille sur Peakture !",
                text: `Utilise ce code pour nous rejoindre : ${family?.inviteCode}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(family?.inviteCode);
            alert("Code copié !");
        }
    }

    return (
        <div>
            { currentUser &&(
                <LogoutOptions setErrorMessage={setErrorMessage}/>
            )}

        { errorMessage && (
            <div className='fixed top-4 inset-x-0 flex justify-center items-center z-50'>
                <div role="alert" className="alert alert-error alert-soft shadow-lg maw-w-md">
                    <span>{errorMessage}</span>
                 </div>
            </div>
        )}
            { family ? (
                <div className='bg-base-100 flex flex-col items-center'>
                    <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold">
                        <span className="text-primary">{family.name}</span>    
                    </h1>
                    <p className='font-semibold'>Family Code: <span className='text-accent text-lg font-mono'>{family.inviteCode}</span>
                    <button
                        onClick={handleShare} 
                        className='mt-4 ml-2 p-1 bg-accent text-white cursor-pointer rounded-lg'>
                        {deviceNavigator === "mobile"  ? (<Share2 size={14}/>) : (<Copy size={14} />)}
                    </button>
                    </p>
                    
                    <Peakture winner='Alaina' 
                                        photo={albumFevrier.photos[0].src} 
                                        id='0' 
                                        voteCount='35' 
                                        avatar='avatar'
                                        month='Février' //album.month
                    />
                    <AlbumList />
                </div>
            ) : (
                <div className="fixed inset-0 flex items-center justify-center scale-200 z-50">
                    <span className="loading loading-infinity text-secondary loading-xl"></span>
                 </div>
            )}
            
        </div>
    )
}

export default FamilyHome