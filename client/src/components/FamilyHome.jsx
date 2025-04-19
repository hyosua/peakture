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
    const [deviceNavigator, setDeviceNavigator] = useState('mobile')
    const [errorMessage, setErrorMessage] = useState('')
    const [showTooltip, setShowTooltip] = useState(false)

    const {currentUser} = useAuth()

    useEffect(() => {
        const device = navigator.share ? "mobile" : "pc"
        setDeviceNavigator(device)
        fetch(`${import.meta.env.VITE_API_URL}/api/family/${familyId}`)
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
                    title: "Rejoins ma Family sur Peakture !",
                    text: `Utilise ce code pour nous rejoindre : ${family?.inviteCode}`,
                    url: `peakture.fr/inviteCode=${family?.inviteCode}`,
                })
                .catch(error => {
                    console.error('Error sharing:', error);
                    setErrorMessage("Erreur lors du partage du code d'invitation.")
                });
            } else {
            navigator.clipboard.writeText(family?.inviteCode);
            setShowTooltip(true);
            setTimeout(() => {
                setShowTooltip(false);
            }, 3000);
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
                    <div className='font-semibold'>Family Code: 
                    <div className={`tooltip pointer-events-none tooltip-accent ${showTooltip ? 'tooltip-open' : ''}`} 
                        data-tip="Code copié !"
                         onMouseEnter={(e) => e.stopPropagation()}
                    >
                        <span className='text-accent  text-lg font-mono'>{family.inviteCode}</span>
                    </div>
                    <button
                        onClick={handleShare} 
                        className='mt-4 ml-2 p-1 bg-accent text-white cursor-pointer rounded-lg'>
                        {deviceNavigator === "mobile"  ? (<Share2 size={14}/>) : (<Copy size={14} />)}
                    </button>
                    </div>
                    
                    <Peakture />
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