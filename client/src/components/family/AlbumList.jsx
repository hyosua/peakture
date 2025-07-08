import { useEffect, useState, useCallback } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import { Plus, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/context/AuthContext.jsx';
import ConfirmMessage from '@/components/ui/ConfirmMessage.jsx'
import { useToast } from "@/context/ToastContext.jsx"
import {  monthsList } from '@/utils/dateConvert.js';
import AlbumCard from './AlbumCard';
import AlbumCloseModal from '../album/AlbumCloseModal';

const AlbumList = () => {
    const [albums, setAlbums] = useState([])
    const [newTheme, setNewTheme] = useState('')
    const [editingAlbum, setEditingAlbum] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [isDeleteAlbumId, setIsDeleteAlbumId] = useState(null);
    const [albumToCloseId, setAlbumToCloseId] = useState(null); // New state for closing votes
    const [albumLoading, setAlbumLoading] = useState(false)

    const { familyId } = useParams() 
    const [errorMessage, setErrorMessage] = useState('')
    
    const {isAdmin, currentUser} = useAuth()
    const currentFamily = currentUser?.familyId
    const [newAlbumForm, setNewAlbumForm ] = useState({
        month: 0,
        theme: '',
        description: '',
        familyId: familyId,
        admin: currentUser._id
    })
    const {showToast} = useToast()
    const navigate = useNavigate()
    
    const getAlbums = useCallback(async () => { // useCallback permet de mémoriser la fonction et de ne pas la recréer à chaque rendu
        try {
            setAlbumLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/family/albums/${familyId}`);
            if (!response.ok) throw new Error(`An error occurred: ${response.statusText}`);
            const albumsData = await response.json();
            setAlbums(albumsData);
        } catch (error) {
            console.error('Error fetching albums:', error);
        } finally {
            setAlbumLoading(false);
        }
    }, [familyId]);


    // Fetch albums from the server
    useEffect(() => {
        getAlbums();
    }, [getAlbums]);

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

    // Handle Album Close Confirmation
    const handleAlbumCloseConfirm = (albumId, mode, days) => {
        if(mode === 'now') {
            handleAlbumClose(albumId)
        }else if(mode === 'timer') {
            handleCloseTimer(albumId, days)
        }
    }

    // Handle Close Timer
    const handleCloseTimer = async (albumId, days) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/close/${albumId}/set-countdown`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ days })
            })

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Error response:", errorData);
                showToast({ message: errorData.message || "Erreur lors de la config du countdown", type: "error" })
                return;
            }

            setAlbums(prevAlbums =>
                prevAlbums.map(album =>
                    album._id === albumId ? { ...album, status: "countdown", expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000) } : album
                )
            )

            const { message } = await response.json()
            showToast({ message, type: "success" })
        }catch (error) {
            console.error("Error setting close timer:", error)
            showToast({ message: "Erreur lors de la configuration du countdown", type: "error" })
        }
        finally {
            setAlbumToCloseId(null);
        }
    }

    // Handle Vote Ending
    const handleAlbumClose = async (albumId) =>{
        console.log("Closing album with ID:", albumId)
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/close/${albumId}/close-album`,{
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ familyId })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast({ message: data.error || "Erreur lors de la fermeture de l'album", type: "error" })
                console.log("Error response:", data.error);
                return;
            }

            const { updatedAlbum, message } = data;
    
            setAlbums(prevAlbums =>
                prevAlbums.map(album =>
                    album._id === albumId ? { ...album, status: updatedAlbum.status, cover: updatedAlbum.cover, winnerId: updatedAlbum.winnerId } : album
                )
            )
            showToast({ message, type: "success" })
        }catch (error) {
            console.error("Error closing album:", error)
            showToast({ message: "Erreur lors de la fermeture de l'album", type: "error" })
        }finally {
            setAlbumToCloseId(null);
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
                admin: newAlbumFromServer.admin,
                month: newAlbumFromServer.month,
                theme: newAlbumFromServer.theme,
                description: newAlbumFromServer.description,
                familyId: newAlbumFromServer.familyId
            }
            setAlbums(prev => [...prev, newAlbum])
            setNewAlbumForm({ month: 0, theme: "", familyId: familyId, admin: currentUser._id })
            setShowAddForm(false)
        } catch (error) {
            console.error('Error creating a new album: ', error)
        }
    }

    // Navigate to album page
    const handleAlbumClick = (id) => {
        navigate(`/family/${currentFamily}/album/${id}`)
    }

    // Show confirmation for closing votes
    const showCloseVotesConfirm = (albumId) => {
        setAlbumToCloseId(albumId);
    }
  
    
    return (
        <div className='flex flex-col justify-center items-center mx-auto p-4 mb-24'> 
            <div className='flex justify-between items-center mb-6'>
                <motion.h1 
                    className='text-2xl text-white font-bold'
                    initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 20,
                                    delay: 0.5,
                                }}
                    >
                        Albums
                </motion.h1>
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

                                <div className='mb-4'>
                                    
                                    <label className='font-semibold block mb-2'>Description (facultatif)
                                        <textarea
                                            name='description' 
                                            rows={2}
                                            value={newAlbumForm.description}
                                            onChange={handleFormChange}
                                            className='w-full px-3 py-2 border-2 rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-primary'
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
                            <motion.img 
                                src='https://res.cloudinary.com/djsj0pfm3/image/upload/v1746722965/3_ytkgo9.png' 
                                alt='Aucun album trouvé' 
                                className='w-1/2 h-1/2 lg:w-80 mb-4 border-2 border-neutral rounded-full'
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 20,
                                    delay: 0.4,
                                }}
                            />
                            <motion.h2 
                                className='text-xl text-white font-semibold'
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 20,
                                    delay: 0.2,
                                }}
                                >
                                    Aucun album
                            </motion.h2>
                            <motion.p 
                                className={`${isAdmin ? "text-gray-200" : "hidden"}`}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 20,
                                    delay: 0.6,
                                }}
                                >
                                    Crée un nouvel album pour commencer !
                            </motion.p>
                        </div>
                ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 place-items-center'>
                    {albums.map((album, index) => (
                        <div
                            key={album._id}
                        >
                            {/* Album Card */}
                            <AlbumCard 
                                album={album}
                                index={index}
                                handleEdit={handleEdit}
                                isAdmin={isAdmin}
                                setIsDeleteAlbumId={setIsDeleteAlbumId}
                                showCloseVotesConfirm={showCloseVotesConfirm}
                                handleAlbumClick={handleAlbumClick}
                                onAlbumRefresh={getAlbums}
                            />
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
                        </div>
                    ))}
                </div>
            )}
            
            {/* Delete Album Confirmation */}
            <ConfirmMessage
                title="Supprimer cet album ?"
                message="Cette action est irréversible et tout son contenu sera perdu."
                onConfirm={(e) => {
                    deleteAlbum(isDeleteAlbumId)
                    setIsDeleteAlbumId(null)
                    e.stopPropagation()
                }}
                onCancel={(e) => {
                    setIsDeleteAlbumId(null)
                    e.stopPropagation()
                }}
                isOpen={isDeleteAlbumId}
            />     
            
            {/* Album Close Confirmation */} 

            <AlbumCloseModal 
                isOpen={albumToCloseId}
                onConfirm={({albumId, mode, days }) => {
                    handleAlbumCloseConfirm(albumId, mode, days)
                }}
                albumId={albumToCloseId}
                onCancel={() => setAlbumToCloseId(null)}
            />  
                                
            
            {isAdmin && (
                <motion.button
                    className='p-6 btn btn-primary mt-6 rounded-full hover:text-neutral flex items-center cursor-pointer'
                    onClick={() => setShowAddForm(true)}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                        delay: 0.7,
                    }}
                >
                    <Plus size={24} />
                </motion.button>
            )}
           
        </div>
    )
}

export default AlbumList