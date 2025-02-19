import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Picture from "./Picture";
import Masonry from "react-masonry-css";
import { Upload, X } from "lucide-react";

const breakpointColumns = {
    default: 3,
    1024: 3,
    768: 2,
    500: 1
};

const AlbumPage = () => {
    const { month } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [likedPhotoId, setLikedPhotoId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch album data
    useEffect(() => {
        console.log(month)
        async function getAlbumData() {
            try {
                const response = await fetch(`http://localhost:5000/album/${month}`);
                if (!response.ok) {
                    throw new Error(`An error has occured: ${response.statusText}`);
                }
                const albumData = await response.json();
                setAlbum(albumData);
                
                // Fetch photos for this album
                const photosResponse = await fetch(`http://localhost:5000/photos/${albumData._id}`);
                if (!photosResponse.ok) {
                    throw new Error(`Error fetching photos: ${photosResponse.statusText}`);
                }
                const photosData = await photosResponse.json();
                setPhotos(photosData);
            } catch (error) {
                console.error('Error fetching album data:', error);
                navigate("/");
            }
        }
        getAlbumData();
    }, [month, navigate]);

    const handleLike = (photoId) => {
        setLikedPhotoId((prevId) => (prevId === photoId ? null : photoId));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.match('image.*')) {
            alert('Veuillez sélectionner une image');
            return;
        }

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('La taille de l\'image ne doit pas dépasser 10MB');
            return;
        }

        setImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'photo_club'); // Set your Cloudinary upload preset
        
        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            alert('Veuillez sélectionner une image');
            return;
        }

        setUploading(true);
        setUploadProgress(10);
        
        try {
            // Upload to Cloudinary
            setUploadProgress(30);
            const imageUrl = await uploadToCloudinary(image);
            setUploadProgress(70);
            
            // Save to database
            const response = await fetch('http://localhost:5000/photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    albumId: album._id,
                    src: imageUrl,
                    uploadDate: new Date().toISOString()
                })
            });

            setUploadProgress(90);
            
            if (!response.ok) {
                throw new Error(`Error saving photo: ${response.statusText}`);
            }
            
            const newPhoto = await response.json();
            
            // Update the UI
            setPhotos([...photos, newPhoto]);
            
            // Reset form
            setImage(null);
            setPreview(null);
            setShowUploadForm(false);
            setUploadProgress(100);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Une erreur est survenue lors de l\'upload de l\'image');
        } finally {
            setUploading(false);
        }
    };

    if (!album) {
        return <div className="text-white text-center p-8">Chargement...</div>;
    }

    return(
        <div className="wrapper text-white p-4">
            <div className="flex justify-between items-center mb-6">
                <button 
                    className="cursor-pointer border border-white p-2 w-20 rounded-lg"
                    onClick={() => navigate("/")}
                >
                    Retour
                </button>
                <button
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                    onClick={() => setShowUploadForm(true)}
                >
                    <Upload size={18} />
                    Ajouter une photo
                </button>
            </div>
            
            <h2 className="text-3xl font-bold">{month}</h2>
            <h4 className="text-2xl font-bold mb-6">Thème: <span className="font-normal text-amber-700">"{album.theme}"</span></h4>
            
            {/* Upload Modal */}
            {showUploadForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-emerald-950 border-2 border-emerald-500 p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Ajouter une photo</h3>
                            <button 
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setPreview(null);
                                    setImage(null);
                                }}
                                className="text-white hover:text-gray-300"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 text-center">
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
                                                setPreview(null);
                                                setImage(null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-300 mb-2">Déposez votre image ici ou</p>
                                        <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded cursor-pointer">
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
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div 
                                        className="bg-emerald-500 h-2.5 rounded-full" 
                                        style={{ width: `${uploadProgress}%` }}
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
                                    className="px-4 py-2 border border-gray-400 text-white rounded hover:bg-gray-700"
                                    disabled={uploading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50"
                                    disabled={!image || uploading}
                                >
                                    {uploading ? 'Chargement...' : 'Télécharger'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Photo Gallery */}
            {photos.length > 0 ? (
                <Masonry
                    breakpointCols={breakpointColumns}
                    className="gallery"
                    columnClassName="bg-clip-padding"
                >
                    {photos.map((photo) => (
                        <div key={photo._id} className="mb-4 break-inside-avoid">
                            <Picture 
                                photo={photo.src} 
                                id={photo._id} 
                                onLike={handleLike}
                                isLiked={likedPhotoId === photo._id}
                            />
                        </div>
                    ))}
                </Masonry>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Upload size={64} className="mb-4" />
                    <p className="text-xl mb-2">Aucune photo dans cet album</p>
                    <p>Soyez le premier à ajouter une photo !</p>
                </div>
            )}
        </div>
    );
};

export default AlbumPage;