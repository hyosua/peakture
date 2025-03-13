import localAlbums from '../data/albumsData'
import PictureOfTheMonth from './PictureOfTheMonth'
import '../App.css'
import AlbumList from './AlbumList'
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { Share2, Copy, ArrowBigLeft } from 'lucide-react'

const FamilyHome = () => {
    const [family,setFamily] = useState(null)
    const { familyId } = useParams()
    const albumFevrier = localAlbums.find(a => a.month === 'Février')
    const [deviceNavigator, setDeviceNavigator] = useState('mobile')
    const [errorMessage, setErrorMessage] = useState('')

    const navigate = useNavigate()
    const {currentUser,logout} = useAuth()

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

    const handleLogout = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        try {
          await logout()
          navigate('/')
          console.log("Logout: ", currentUser)
        } catch (error) {
          console.error("Erreur lors du logout: ", error);
          setErrorMessage("Une erreur lors de la déconnexion s'est produite.");
        }
      }

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
            { currentUser && (
          <button className='btn btn-sm btn-outline   btn-accent absolute top-4 right-4'
                onClick={handleLogout}
        >
                  Se Déconnecter
        </button>
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
                <div className='min-h-screen flex items-center justify-center '>
                    <button 
                        className="absolute left-4 top-4 btn btn-soft"
                        onClick={() => navigate(`/`)}
                    >
                        <ArrowBigLeft size={26}/>
                    </button>
                  <span className="loading loading-ring loading-xl "></span>
                </div>
            )}
            
        </div>
    )
}

export default FamilyHome