import { useEffect, useState } from "react"
import { useNavigate, useParams} from "react-router-dom"
import Masonry from "react-masonry-css"
import { Upload, Plus, X, ArrowBigLeft } from "lucide-react"
import Picture  from "./Picture.jsx"
import { motion } from "framer-motion";
import { useAuth } from '../context/AuthContext.jsx';
import  Auth  from './auth/Auth.jsx'
import ContestResults from "./ContestResults.jsx"

const breakpointColumns = {
    default: 3,
    1024: 3,
    768: 2,
    500: 1
};

const AlbumPage = () => {
    const API_BASE_URL = 'http://localhost:5000'
    const { id } = useParams()
    const navigate = useNavigate()
    const [album, setAlbum] = useState(null)
    const [photos, setPhotos] = useState([])
    const [showUploadForm, setShowUploadForm] = useState(false)
    const [replacingPhoto, setReplacingPhoto] = useState(null)
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [votedPhotoId, setVotedPhotoId] = useState(null)
    const [cloudinaryURL, setCloudinaryUrl] = useState(null)
    const [showError, setShowError] = useState(false)
    const [showVoteError, setShowVoteError] = useState(false)
    const [showSignupForm, setShowSignupForm] = useState(false)
    const [successSignup, setSuccessSignup] = useState(false)
    const [error, setError] = useState('')
    const [voteResultsData, setVoteResultsData] = useState([])


    const {currentUser} = useAuth()
    
        
    // Fetch Album data
    useEffect(() => {
        async function getAlbumData() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/albums/${id}`)
                if(!response.ok){
                    throw new Error(`Erreur: ${response.statusText}`)
                }
                
                const albumData = await response.json()
                setAlbum(albumData)

                // Fetch photos from this album
                const photosResponse = await fetch(`${API_BASE_URL}/api/photos/${albumData._id}`)
                if(!photosResponse.ok){
                    throw new Error(`Erreur: ${photosResponse.statusText}`)
                }
                const photosData = await photosResponse.json()
                setPhotos(photosData.photos || [])
                
                // Set the vote results data
                if(albumData.closed){
                    const results = photosData.photos.map(photo => ({
                        name: photo.username,
                        votes: photo.votes || 0
                    }))
                    results.sort((a, b) => b.votes - a.votes)
                    setVoteResultsData(results)
                }

            } catch(error){
                console.error("Error while fetching album data:", error)
                navigate("/")
            }
        }
        getAlbumData()
        
    }, [id, navigate])


    const uploadToCloudinary = async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'peakture-preset')

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/djsj0pfm3/image/upload", {
                method: "POST",
                body: formData
            })

            const data = await response.json()
            return data.secure_url
        } catch (error){
            console.error("Error uploading to Cloudinary: ",error)
            throw error
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.match('image.*')) {
            alert('Veuillez sélectionner une image');
            return;
        }

        // Limite d'un upload sur Cloudinary: 10MB
        if (file.size > 10 * 1024 * 1024) {
            alert('La taille de l\'image ne doit pas dépasser 10MB');
            return;
        }

        setImage(file);
        
        // Création du preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Soumettre une Photo
    const handleSubmit = async (e) => {
        e.preventDefault()

        if(!image){
            alert("Tu dois sélectionner une image")
            return
        }

        setUploading(true)
        setUploadProgress(10)
        try {
            setUploadProgress(30)
            const imageUrl = await uploadToCloudinary(image)
            let endRoute = ""
            let fetchMethod = "POST"
            if(replacingPhoto){
                console.log("Photo à remplacer ID:", replacingPhoto);
                endRoute = `/${replacingPhoto}`
                fetchMethod = "PATCH"

                if(cloudinaryURL){
                    console.log(cloudinaryURL)
                    await handleCloudinaryDelete(cloudinaryURL)
                }
            }
            setUploadProgress(70)

            // save to database
            const response = await fetch(`${API_BASE_URL}/api/photos${endRoute}`, {
                method : fetchMethod,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    albumId: album._id,
                    src: imageUrl,
                    userId: currentUser._id,
                    username: currentUser.username
                })
            })

            setUploadProgress(90)

            if(!response.ok){
                throw new Error(`Error saving photo: ${response.statusText}`)
            }

            const responseData = await response.json()

            const newPhoto = responseData.photo || responseData 

            // Mettre à jour l'UI
            setPhotos(prevPhotos => {
                if(replacingPhoto){
                    return prevPhotos.map(photo =>
                        photo._id === replacingPhoto ? newPhoto : photo
                    )
                } else {
                    return [...prevPhotos, newPhoto]
                }
            })

            setUploadProgress(100)
            setReplacingPhoto(null)
            setCloudinaryUrl(null)
            // Reset le form
            setImage(null)
            setPreview(null)
            setShowUploadForm(false)

        } catch(error){
            console.error("Erreur lors de l'upload: ", error)
            alert("Oops... Erreur lors de l'upload")
        } finally {
            setUploading(false)
        }
    }

    const handleVote = async (photo_id) => {
        if(!currentUser.email){
            setShowVoteError(true)
            setTimeout(() => {
                setShowVoteError(false)
            }, 6000)
            return
        }
        const photoId = encodeURIComponent(photo_id) // assure les caractères spéciaux sont encodés
        
        if(votedPhotoId === photoId) return // On empêche de voter plusieurs fois la même photo

        // MAJ optimiste de l'UI
        setVotedPhotoId(photoId)

        try {
            const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}/vote`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    albumId: id
                })
            })

            if(!response.ok){
                throw new Error(`Erreur: ${response.statusText}`)
            }

            // MAJ des photos
            const updatedPhotos = await response.json()
            setPhotos(updatedPhotos)
        } catch (error) {
            console.error("Erreur lors du like:", error)
            console.log("ID problématique:", photo_id)
            // Annuler le like en cas d'erreur
            setVotedPhotoId(null)
        }
    }

    const handleCloudinaryDelete = async (cloudinaryUrl) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/photos/cloudinary/delete`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    src: cloudinaryUrl
                })
            })

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur de suppression photo sur Cloudinary")
            }

            return true
        } catch(error){
            console.log("Erreur Cloudinary: ", error)
            return false
        }
    }

    const deletePhoto = async (photoId, src) => {
        try {
            const cloudinaryDeleteSuccess =  await handleCloudinaryDelete(src)
            if(!cloudinaryDeleteSuccess) {
                console.warn('Suppression de cloudinary échouée')
            }
            
            const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}`, {
                method: "DELETE" 
            })
            if(!response.ok) {
                throw new Error("Une erreur est survenue lors de la suppression de la Bdd")
            }         

            setPhotos(photos.filter(photo => photo._id !== photoId))
        } catch(error){
            console.log(`Error deleting photo: ${error}`)
        }
    }

    // Vérifie si l'user à déjà participé à l'album
    const checkHasSubmitted = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/photos/${id}/has-submitted`, {
                method: "GET",
                credentials: "include" 
            });
    

            if(response.status === 403){
                const result = await response.json()
                setError(result.message)
                return false
            }

            return true

        }catch(error){
            console.log(`Error checking if user has submitted already: ${error}`)
            return false
        }
    }

    const handleError = () => {
        setShowError(true)

        setTimeout(() => {
            setShowError(false)
        }, 3000)
    }

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Simule un chargement minimum de 3 secondes
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
  
      return () => clearTimeout(timer);
    }, []);

    if (loading || !album) {
        return <div className="fixed inset-0 flex items-center justify-center scale-200 z-50">
                    <span className="loading loading-infinity text-secondary loading-xl"></span>
                 </div>
    }    


    return (
        <div className="lg:p-10">
            {/* Header */}
            <div className="flex items-center relative justify-center">
                <button 
                    className="fixed z-30 left-4 top-4 text-accent btn btn-sm btn-soft"
                    onClick={() => navigate(`/family/${album.familyId}`)}
                >
                    <ArrowBigLeft size={22}/>
                </button>
                    
                <div className="relative flex pt-4 items-center flex-col ">
                    <h2 className="text-primary text-5xl">{ album.month }</h2>
                    <h3 className="font-semibold text-secondary mb-6">{album.theme}</h3>
                    
                </div>

                {album?.status === "closed" && (
                        <div className="absolute top-4 right-4 bg-error text-neutral text-xs px-3 py-1 rounded-full">
                            Votes clos
                        </div>
                     )}
            </div>
            
            
            {/* Vote Error */}
            { showVoteError && (
                <div className="fixed z-50 top-4 left-1/2 transform -translate-x-1/2 font-semibold p-4 lg:max-w-md w-10/12">
                    <div className=" p-2 bg-warning text-neutral rounded shadow-md flex items-center flex-col ">
                        <span>
                            Tu dois t&apos;inscrire avant de voter! 
                        </span>
                        <button
                            type="button"
                            className="btn btn-sm mt-2 btn-soft w-full font-semibold btn-warning text-sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowSignupForm(true)
                            }}
                            >
                            S&apos;inscrire
                        </button>
                    </div>
                </div>
            )}
            
            {/* Signup Success */}
            { successSignup && (
                <div role="alert" className="fixed z-50 alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Inscription réussie!</span>
                </div>
            )}
            
            {/* Signup Form */}
            { showSignupForm && (
             <Auth 
                signUp={true} 
                onClose={() => {
                    setShowSignupForm(false)
                }}
                onSignupSuccess={() => {
                    setSuccessSignup(true)
                    setTimeout(() => {setSuccessSignup(false)}, 3000)
                    setShowSignupForm(false)
                }}

            />

            )}
            
            {/* Photo Gallery */}
            <div className=" flex flex-col items-center justify-center">
                 {/* Contest Results */}
                 {album?.status === "closed" && (
                    <ContestResults results={voteResultsData} />
                )}
                {photos.length > 0 ? (
                    <Masonry 
                            breakpointCols={breakpointColumns}
                            className="flex"
                            columnClassName="bg-clip-paddin"
                        >
                        {photos.map((photo) => (
                            
                            <div key={photo._id} className="m-4 break-inside-avoid">
                                <Picture 
                                    photo={photo}
                                    album={album}
                                    photoUrl={photo.src} 
                                    id={photo._id} 
                                    onVote={handleVote}
                                    changePhoto={handleImageChange}
                                    deletePhoto={deletePhoto}
                                    showUploadForm={setShowUploadForm}
                                    replacingPhoto={setReplacingPhoto}
                                    cloudinaryURL={setCloudinaryUrl}
                                    isVotedId={photo.votedBy.includes(currentUser?._id)}
                                    votes={photo.votes || 0}
                                    albumStatus={album?.status}
                                />
    
                            </div>
                        ))}
                    </Masonry>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-white">
                        <motion.button 
                                    className="cursor-pointer flex flex-col items-center   hover:text-primary"
                                    onClick={() => setShowUploadForm(true)}
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ type: "spring", stiffness: 30, damping: 10 }}
                    >
                            <Upload size={64} className="mb-4" />
                        </motion.button>
                        <p className="text-xl mb-2">Aucune Photo pour le moment.</p> 
                        <p>Sois le premier !</p>                        
                    </div>
                )} 

                {/* Add Photo Button */}
                {album?.status === "open" && (
                    <div className={showError ? "tooltip tooltip-open tooltip-error font-semibold" : ""} data-tip={error}>
                    <div className='pb-20'>
                        <button
                            className='p-6 btn btn-primary rounded-full hover:text-neutral flex items-center cursor-pointer'
                            onClick={async () => {
                                const canSubmit = await checkHasSubmitted()
                                if(canSubmit){
                                    setShowUploadForm(true)
                                }else{
                                    handleError()
                                }
                            }}
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
                )}
                
               
                

            </div>
            
            
            {/* Upload Form */}
            {showUploadForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center p-2 justify-center z-50">
                    <div className="bg-base-100 p-6 w-full max-w-sm lg:max-w-lg rounded-lg">
                            <form className="space-y-4"
                                    onSubmit={handleSubmit} 
                                >
                                <div className='border-2 border-dashed border-secondary rounded-lg p-4 text-center'>
                                    {preview ? (
                                        <div className="relative">
                                            <img 
                                                src={preview}
                                                alt="Preview"
                                                className="max-h-64 mx-auto rounded"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setPreview(null)
                                                    setImage(null)
                                                }}
                                                className="absolute top-2 right-2 cursor-pointer bg-error hover:text-base-100  text-white rounded-full p-1"
                                                >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <Upload size={48} className="mx-auto text-white mb-2" />
                                            <p className="text-gray-300 mb-6">Déposez votre image ici ou</p>
                                            <label className="bg-white hover:bg-neutral text-black hover:text-white px-4 py-2 rounded cursor-pointer">
                                                Parcourir
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {uploading && (
                                    <div className="w-full bg-base-200 rounded-full h-2.5">
                                        <div
                                            className="bg-primary h-2.5 rounded-full"
                                            style={{ width: `${uploadProgress}%`}}
                                        ></div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadForm(false);
                                            setPreview(null);
                                            setImage(null);
                                        }}
                                        className="px-4 py-2 btn btn-ghost hover:text-base-100 hover:bg-error"
                                        disabled={uploading}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 btn btn-primary disabled:opacity-50 hover:text-neutral hover:font-bold"
                                        disabled={!image || uploading}
                                    >
                                        {uploading ? 'Chargement...' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>                            
                    </div>
                </div>
                
            )}
            

        </div>

    )
}

export default AlbumPage