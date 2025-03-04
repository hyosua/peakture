import { useEffect, useState } from "react"
import { useNavigate, useParams} from "react-router-dom"
import Masonry from "react-masonry-css"
import { Upload, Plus, X, ArrowBigLeft } from "lucide-react"
import Picture  from "./Picture.jsx"
import { motion } from "framer-motion";


const breakpointColumns = {
    default: 3,
    1024: 3,
    768: 2,
    500: 1
};

const AlbumGallery = () => {
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
    const [likedPhotoId, setLikedPhotoId] = useState(null)
    const [cloudinaryURL, setCloudinaryUrl] = useState(null)
    
        
    // Fetch Album data
    useEffect(() => {
        async function getAlbumData() {
            try {
                const response = await fetch(`${API_BASE_URL}/albums/${id}`)
                if(!response.ok){
                    throw new Error(`Erreur: ${response.statusText}`)
                }
                
                const albumData = await response.json()
                setAlbum(albumData)

                // Fetch photos from this album
                const photosResponse = await fetch(`${API_BASE_URL}/photos/${albumData._id}`)
                if(!photosResponse.ok){
                    throw new Error(`Erreur: ${photosResponse.statusText}`)
                }
                const photosData = await photosResponse.json()
                setPhotos(photosData.photos || [])
                

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
            const response = await fetch(`${API_BASE_URL}/photos${endRoute}`, {
                method : fetchMethod,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    albumId: album._id,
                    src: imageUrl
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

    const handleLike = async (photo_id) => {
        const cleanId = encodeURIComponent(photo_id) // assure les caractères spéciaux sont encodés
        
        // MAJ optimiste de l'UI
        setLikedPhotoId(cleanId)

        try {
            const response = await fetch(`${API_BASE_URL}/photos/${cleanId}/like`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json"
                }
            })

            if(!response.ok){
                throw new Error(`Erreur: ${response.statusText}`)
            }

            // Mettre à jour l'état des photos pour refléter le nouveau nombre de likes
            const updatedPhoto = await response.json()
            setPhotos(prevPhotos => 
                prevPhotos.map(photo => 
                    photo._id === cleanId ? updatedPhoto : photo
                )
            )
        } catch (error) {
            console.error("Erreur lors du like:", error)
            console.log("ID problématique:", photo_id)
            // Annuler le like en cas d'erreur
            setLikedPhotoId(null)
        }
    }

    const handleCloudinaryDelete = async (cloudinaryUrl) => {
        try {
            const response = await fetch(`${API_BASE_URL}/photos/cloudinary/delete`, {
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
            
            const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
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

    if (!album) {
        return <div className="text-white text-center p-8">Chargement...</div>;
    }    


    return (
        <div className="lg:p-10">
            <button 
                className="absolute left-4 top-4 btn btn-soft"
                onClick={() => navigate(`/family/${album.familyId}`)}
            >
                <ArrowBigLeft size={26}/>
            </button>
                
            <div className="flex pt-4 items-center flex-col ">
                <h2 className="text-white text-7xl">{ album.month }</h2>
                <h3 className="font-semibold text-white mb-6">{album.theme}</h3>
            </div>
            

            {/* Photo Gallery */}
            <div className=" flex flex-col items-center justify-center">
                {photos.length > 0 ? (
                    <Masonry 
                            breakpointCols={breakpointColumns}
                            className="flex"
                            columnClassName="bg-clip-paddin"
                        >
                        {photos.map((photo) => (
                            
                            <div key={photo._id} className="mb-4 break-inside-avoid">
                                <Picture 
                                    photoUrl={photo.src} 
                                    id={photo._id} 
                                    onLike={handleLike}
                                    changePhoto={handleImageChange}
                                    deletePhoto={deletePhoto}
                                    showUploadForm={setShowUploadForm}
                                    replacingPhoto={setReplacingPhoto}
                                    cloudinaryURL={setCloudinaryUrl}
                                    isLikedId={likedPhotoId === photo._id}
                                    votes={photo.votes || 0}
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
                        <p>Soyez le premier!</p>                        
                    </div>
                )} 
                {/* Add Photo Button */}
                <div className='mb-6'>
                    <button
                        className='p-6 btn btn-primary rounded-full hover:text-neutral flex items-center cursor-pointer'
                        onClick={() => setShowUploadForm(true)}
                    >
                        <Plus size={24} />
                    </button>
                </div>
                
            </div>

            

                {showUploadForm && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
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

export default AlbumGallery