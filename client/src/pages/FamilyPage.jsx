import Peakture from '@/components/family/Peakture.jsx'
import '@/App.css'
import AlbumList from '@/components/family/AlbumList.jsx'
import { useAuth } from '@/context/AuthContext.jsx';
import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import { Share2, Copy } from 'lucide-react'
import NameEditor from '@/components/ui/NameEditor.jsx';
import { useToast } from "@/context/ToastContext.jsx"
import { motion } from "framer-motion";



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
    

        { errorMessage && (
            <div className='fixed top-4 inset-x-0 flex justify-center items-center z-50'>
                <div role="alert" className="alert alert-error alert-soft shadow-lg maw-w-md">
                    <span>{errorMessage}</span>
                 </div>
            </div>
        )}
            { family ? (
                <div className='bg-base-100 flex flex-col items-center'>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 20,
                            delay: 0.3,
                        }}
                    >
                        <NameEditor 
                            isAdmin={isAdmin}
                            as="h1"
                            text={family?.name}
                            onSave={handleSaveFamilyName}
                    />
                    </motion.div>
                    
                    <motion.div 
                            className='font-semibold mb-4'
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 20,
                                delay: 0.3,
                            }}
                    >
                        Family Code: 
                        <div className={`tooltip pointer-events-none tooltip-accent ${showTooltip ? 'tooltip-open' : ''}`} 
                            data-tip="Code copié !"
                            onMouseEnter={(e) => e.stopPropagation()}
                        >
                            <span className='text-accent ml-2  text-lg font-mono'>{family.inviteCode}</span>
                        </div>
                        <button
                            onClick={handleShare} 
                            className='mt-2 ml-2 p-1 bg-accent text-white cursor-pointer rounded-lg'>
                            {deviceNavigator === "mobile"  ? (<Share2 size={14}/>) : (<Copy size={14} />)}
                        </button>
                    </motion.div>
                    
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