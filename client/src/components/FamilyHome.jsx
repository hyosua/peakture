import Peakture from './Peakture.jsx'
import '../App.css'
import AlbumList from './AlbumList.jsx'
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import { Share2, Copy } from 'lucide-react'
import LogoutOptions from './auth/LogoutOptions.jsx';
import NameEditor from './NameEditor.jsx';
import { useToast } from "../context/ToastContext.jsx"


const FamilyHome = () => {
    const [family,setFamily] = useState(null)
    const { familyId } = useParams()
    const [deviceNavigator, setDeviceNavigator] = useState('mobile')
    const [errorMessage, setErrorMessage] = useState('')
    const [showTooltip, setShowTooltip] = useState(false)

    const {currentUser} = useAuth()
    const {showToast} = useToast()

    const isAdmin = currentUser?._id === family?.admin

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

    const handleSaveFamilyName = async (familyName) => {
        if(!familyName){
            return;
        }
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/family/${familyId}/edit-name`,{
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: familyName
                })
            })

            const serverResponse = await response.json()
            if(serverResponse.success){
                showToast({ message: serverResponse.message, type: "success"})
                const updatedFamily = {...family, name: familyName };

                setFamily(updatedFamily);
            }
        }catch(error){
            console.error('Error updating family name:', error);
            if (error.response) {
                console.error('Error details:', error.response.data);
                console.error('Status:', error.response.status);
            }
        }
    }

    const handleShare = () => {
        if (navigator.share) {
                navigator.share({
                    title: "Rejoins ma Family sur Peakture !",
                    text: `Rejoins nous sur Peakture : `,
                    url: `https://www.peakture.fr/?inviteCode=${family?.inviteCode}`,
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
                    <NameEditor 
                        isAdmin={isAdmin}
                        familyName={family?.name}
                        onSave={handleSaveFamilyName}
                    />
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