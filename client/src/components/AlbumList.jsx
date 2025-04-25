import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, X, Check, Edit, Trash, Vote} from 'lucide-react'
import EditDropdown from './EditDropdown.jsx'
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../context/AuthContext.jsx';
import ConfirmMessage from './ConfirmMessage.jsx'
import WinnerBanner from './WinnerBanner.jsx';
import ConfettiElement from './ConfettiElement.jsx';
import { useToast } from "../context/ToastContext.jsx"
import { getMonthName, monthsList } from '../../utils/dateConvert.js';

const AlbumList = () => {
    const [albums, setAlbums] = useState([])
    const [newTheme, setNewTheme] = useState('')
    const [editingAlbum, setEditingAlbum] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [isCloseVotesConfirm, setIsCloseVotesConfirm] = useState(false);
    const [albumLoading, setAlbumLoading] = useState(false)

    const { familyId } = useParams() 
    const [newAlbumForm, setNewAlbumForm ] = useState({
        month: 0,
        theme: '',
        familyId: familyId
    })
    const [errorMessage, setErrorMessage] = useState('')
    
    const {isAdmin} = useAuth()
    const {showToast} = useToast()
    const navigate = useNavigate()

    // Fetch albums from the server
    useEffect(() => {
        async function getAlbums() {
            try {
                setAlbumLoading(true)
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/family/albums/${familyId}`)
                if(!response.ok) {
                    throw new Error(`An error has occured: ${response.statusText}`)
                }
                const albumsData = await response.json()
                setAlbums(albumsData)
                setAlbumLoading(false)
            } catch (error){
                console.error('Error fetching albums:', error)
                setAlbumLoading(false)

            } 
        }
        getAlbums()
    }, [familyId])

    // Delete an album
    const deleteAlbum = async (id) => {

       const response =  await fetch(`${import.meta.env.VITE_API_URL}/api/albums/${id}/cloudinary/delete`, {
            method: "DELETE"
        })

        if(response.ok){
            try{
                await fetch(`${import.meta.env.VITE_API_URL}/api/albums/${id}`, {
                    method: 'DELETE',
                })  
            }catch(error){
                console.error("Impossible de supprimer l'album de la database:", error)
            }
        }
        setAlbums(albums.filter((album) => album._id !== id))   
    }

    const handleEdit = (album) => {
        setEditingAlbum(album._id)
        setNewTheme(album.theme)
    }

    // Handle Vote Ending
    const handleAlbumClose = async (albumId) =>{

        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/close/${albumId}/close-votes`,{
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            })
            console.log("Response from server:", response)
            if (!response.ok) {
                const errorData = await response.json();
                console.log("Error response:", errorData);
                
                // Si le serveur renvoie une égalité on appelle handleTie
                if (errorData.error === "égalité") {
                    console.log("Il y'a une égalité");
                    handleTie(albumId); 
                    return;
                } else {
                    throw new Error(errorData.error || "Unknown error occurred");
                }
            }
            const updatedAlbum = await response.json()
            console.log("Updated album:", updatedAlbum)
    
            setAlbums(prevAlbums =>
                prevAlbums.map(album =>
                    album._id === albumId ? { ...album, status: "closed" } : album
                )
            )
            handleWinner(albumId)

        }catch (error) {
            console.error('Error Closing album:', error);
            if (error.response) {
                console.error('Error details:', error.response.data);
                console.error('Status:', error.response.status);
            }
        }
    }

    // Save edited album
    const handleSaveTheme = async (id, e) => {
        e.stopPropagation()

        if(!newTheme){
            return;
        }

        try {            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    theme: newTheme
                })
            })

            if (!response.ok) {
                console.error(`Erreur du serveur : ${response.status}`);
                return;
            }
            
            const serverResponse = await response.json();
            if(serverResponse.success){
                showToast({ message: serverResponse.message, type: "success"})
                const updatedAlbums = albums.map(album => 
                    album._id === id ? { ...album, theme: newTheme } : album
                );

                setAlbums(updatedAlbums);
            }
           
            setEditingAlbum(null);
            setNewTheme('');

        } catch (error) {
            console.error('Error updating album:', error);
            if (error.response) {
                console.error('Error details:', error.response.data);
                console.error('Status:', error.response.status);
            }
        }
    }

    // Cancel Album editing
    const handleCancel = (e) => {
        e.stopPropagation()
        setEditingAlbum(null)
        setNewTheme('')
    }



    // Handle form change for new album
    function handleFormChange(e) {
        const { name, value } = e.target
        setNewAlbumForm({
            ...newAlbumForm,
            [name]: value
        })
    }

    // Submit new album
    const handleSubmitNewAlbum = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newAlbumForm)
            })

            if (!response.ok) {
                const errorData = await response.json()
                setErrorMessage(errorData.message || "Erreur lors de la création d'album")
                return
            }

            const newAlbumFromServer = await response.json()
            const newAlbum = {
                _id: newAlbumFromServer._id,
                month: newAlbumFromServer.month,
                theme: newAlbumFromServer.theme,
                familyId: newAlbumFromServer.familyId
            }
            setAlbums(prev => [...prev, newAlbum])
            setNewAlbumForm({ month: 0, theme: "", familyId: familyId })
            setShowAddForm(false)
        } catch (error) {
            console.error('Error creating a new album: ', error)
        }
    }

    // Album Winner
    const handleWinner = async (albumId) => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/close/${albumId}/winner`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                if(response.message === "égalité"){
                    handleTie(albumId)
                    return
                }
            }

            const {updatedAlbum} = await response.json()

            setAlbums(prevAlbums =>
                prevAlbums.map(album =>
                    album._id === albumId ? { ...album, winner: updatedAlbum.winner } : album
                )
            )
        }catch(error){
            console.error('Impossible de récupérer le gagnant:', error)
        }
    }

    // Gérer une égalité
    const handleTie = async (albumId) => {
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/close/${albumId}/tie`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ familyId})
            })
            const tieResult = await response.json()
            console.log("Updated album after tieHandling:", tieResult) 
            if(!response.ok){
                console.error("Erreur lors de la gestion de l'égalité:", tieResult)
                return
            }
            // Maj de l'état de l'album 
            if(tieResult.pendingAlbum){
                setAlbums(prevAlbums =>
                    prevAlbums.map(album =>
                        album._id === albumId ? { ...album, status: "tie-break" } : album
                    )
                )
            }else{
                setAlbums(prevAlbums =>
                    prevAlbums.map(album =>
                        album._id === albumId ? { ...album, status: "closed", winner: tieResult.winner, cover: tieResult.updatedAlbum.cover } : album
                    )
                )
            }
        }catch(error){
            console.error('Error handling tie:', error)
        }
        
    }

    // Navigate to album page
    const handleAlbumClick = (id) => {
        navigate(`/album/${id}`)
    }
  
    
    return (
        <div className='flex flex-col justify-center items-center mx-auto p-4 mb-24'> 
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl text-white font-bold'>Albums</h1>
            </div>

            {/* Add album form */}
            <AnimatePresence>
                {showAddForm && (
                    <div className='fixed backdrop-blur-sm inset-0 flex items-center justify-center z-50'>
                        <div className="bg-neutral p-6 rounded-lg w-96">
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-xl font-semibold'>Ajouter Un Album</h2>
                                <button 
                                    className='p-1 rounded-full hover:bg-gray-200 hover:text-neutral cursor-pointer'
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setErrorMessage('')
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitNewAlbum}>
                                <div className='mb-4'>
                                    <label className="font-semibold block  mb-2">Mois
                                        <motion.select
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            value={newAlbumForm.month}
                                            onChange={handleFormChange}
                                            name='month'
                                            className="block w-full p-2 mb-4 border-2 rounded"
                                            required
                                        >
                                            <option className="font-semibold bg-base-100" value="">Sélectionner un mois</option>
                                            {monthsList.map((month, index) => (
                                                <option className="bg-base-100 font-bold" key={`month-${index}-${familyId}`} value={`${index+1}`}>{month}</option>
                                            ))}   
                                        </motion.select>
                                    </label>
                                </div>
                                
                                <div className='mb-4'>
                                    
                                    <label className='font-semibold block mb-2'>Thème
                                        <input
                                            
                                            type='text'
                                            name='theme'
                                            value={newAlbumForm.theme}
                                            onChange={handleFormChange}
                                            className='w-full px-3 py-2 border-2 rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-primary'
                                            required
                                        />
                                    </label>
                                    
                                </div>
                                {errorMessage && (
                                    <div role="alert" className="alert alert-error alert-soft m-2">
                                        <span>{errorMessage}</span>
                                    </div>
                                )}
                                
                                <div className='flex gap-4 justify-end'>
                                    <button
                                        type='button'
                                        className='btn btn-ghost hover:bg-red-400 hover:text-base-100'
                                        onClick={() => {
                                            setShowAddForm(false)
                                            setErrorMessage('')
                                        }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type='submit'
                                        className=' btn btn-primary hover:text-neutral rounded-lg'
                                    >
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>
            
            {/*Albums Display*/}           
                
            {albumLoading ? ( 
                <div className="flex justify-center items-center my-12">
                    <span className="loading loading-dots loading-lg text-primary"></span>
                </div>
              
                ) : albums?.length === 0 ? ( 
                        <div className='flex flex-col items-center justify-center'>
                            <img src='https://img.icons8.com/?size=100&id=nfFc9F8TR8At&format=png&color=000000' alt='Aucun album trouvé' className='w-1/2 h-1/2 mb-4'/>
                            <h2 className='text-xl text-white font-semibold'>Aucun album</h2>
                            <p className={`${isAdmin ? "text-gray-200" : "hidden"}`}>Crée un nouvel album pour commencer !</p>
                        </div>
                ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 place-items-center'>
                    {albums.map((album) => (
                        <div
                            key={album._id}
                            className='relative'
                            onClick={() => handleAlbumClick(album._id)}
                        >
                            
                            {/* Album Card */}
                            <div className={`relative flex flex-col p-4 cursor-pointer border-2 bg-base-200 ${album.status === "closed" ? "border-secondary" : album.status === "tie-break" ? "border-accent" : "border-primary"} rounded-lg indicator group`}>
                                    <span className={`indicator-item badge " + ${(album.status === "closed" ? "badge-secondary" : album.status === "tie-break" ? "badge-accent" :"badge-primary")}`}>
                                        {album.status === "closed" ? "Closed" : album.status === "tie-break" ? "Départage": "Open"}
                                    </span>
                                <h3 className='mb-2 font-semibold'>{getMonthName(album.month)}</h3>
                                <img src={album.cover ? album.cover : "https://img.icons8.com/?size=100&id=nfFc9F8TR8At&format=png&color=000000 "} 
                                    alt={getMonthName(album.month)} 
                                    className='w-full h-36  max-w-60 max-h-60 rounded-md object-cover mb-2' 
                                />
                                <h5 className='text-white mb-1'><i>{editingAlbum === album._id ?'' : album.theme}</i></h5>

                                {/* Winner Banner */}
                                {album?.winner && (
                                    <ConfettiElement 
                                        id={album._id}
                                        options={{
                                            particleCount: 15,
                                            gravity: 0.9,
                                            scalar: 0.7,
                                            spread: 70,
                                            origin: { y: 0.6 },
                                            colors: ['#ff7d5d', '#9fe88d']
                                        }}
                                    >
                                        <WinnerBanner winner={album?.winner} />
                                    </ConfettiElement>
                                )}

                                {/* Edit Dropdown */}
                                { isAdmin && (
                                    <div className='absolute top-2 right-2'>
                                        <EditDropdown
                                            actions={[
                                                {
                                                label: "Modifier le thème",
                                                icon: <Edit className="h-4 w-4" />,
                                                disabled: false,
                                                onClick: () => handleEdit(album),
                                                },
                                                {
                                                    label: "Cloturer les votes",
                                                    icon: <Vote className="h-4 w-4" />,
                                                    disabled: album.status === "closed" || album.status === "tie-break",
                                                    onClick: () => setIsCloseVotesConfirm(true),
                                                    
                                                },
                                                {
                                                label: "Supprimer",
                                                icon: <Trash className="h-4 w-4 text-red-500" />,
                                                disabled: false,
                                                onClick: () => setIsDeleteConfirm(true),
                                                },
                                                
                                            ]}
                                        />
                                    </div>
                                )}
                                
                            </div>

                            {/* Edit Album */}
                            {editingAlbum === album._id && (
                                <div className='absolute inset-0 backdrop-blur-sm bg-neutral/80 flex flex-col items-center justify-center cursor-pointer'
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3>Editer le Thème</h3>
                                    <input
                                        type='text'
                                        value={newTheme}
                                        placeholder='Entrer le nouveau thème'
                                        onChange={(e) => setNewTheme(e.target.value)}
                                        className='w-full px-3 py-2 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2'
                                    />
                                    <div className='flex space-x-2'>
                                        <button
                                            onClick={handleCancel}
                                            className='p-2 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-error flex items-center cursor-pointer'
                                        >
                                            <X size={26} className='mr-1' /> 
                                        </button>
                                        <button 
                                            onClick={(e) => handleSaveTheme(album._id,e)}
                                            className='p-2 py-2 btn btn-primary flex justify-center'
                                        >
                                            <Check size={26} className='mr-1' /> 
                                        </button>
                                        
                                    </div>
                                </div>

                            )}

                        <ConfirmMessage
                            title="Supprimer cet album ?"
                            message="Cette action est irréversible et tout son contenu sera perdu."
                            onConfirm={(e) => {
                                deleteAlbum(album._id)
                                setIsDeleteConfirm(false)
                                e.stopPropagation()
                            }}
                            onCancel={(e) => {
                                setIsDeleteConfirm(false)
                                e.stopPropagation()
                            }}
                            isOpen={isDeleteConfirm}
                        />     
                        <ConfirmMessage
                            title="Clotûrer l'album ?"
                            message="Cette action est irréversible, tu es sur le point de clotûrer l'album."
                            onConfirm={(e) => {
                                handleAlbumClose(album._id)
                                setIsCloseVotesConfirm(false)
                                e.stopPropagation()
                            }}
                            onCancel={(e) => {
                                setIsCloseVotesConfirm(false)
                                e.stopPropagation()
                            }}
                            isOpen={isCloseVotesConfirm}
                        />     

                        </div>
                        
                    ))}
    
                </div>
            )}
                                
            
                { isAdmin && (
                        <button
                            className='p-6 btn btn-primary mt-6 rounded-full hover:text-neutral flex items-center cursor-pointer'
                            onClick={() => setShowAddForm(true)}
                        >
                            <Plus size={24} />
                        </button>
                    )}
           
        </div>
    )
}

export default AlbumList