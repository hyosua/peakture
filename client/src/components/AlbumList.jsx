import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, X, Check, Edit, Trash } from 'lucide-react'
import EditDropdown from './EditDropdown.jsx'
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../context/AuthContext.jsx';


const AlbumList = () => {
    const [albums, setAlbums] = useState([])
    const [newTheme, setNewTheme] = useState('')
    const [editingAlbum, setEditingAlbum] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const { familyId } = useParams() 
    const [newAlbumForm, setNewAlbumForm ] = useState({
        month: '',
        theme: '',
        familyId: familyId
    })
    const [errorMessage, setErrorMessage] = useState('')
    
    const {isAdmin} = useAuth()
    const navigate = useNavigate()

    const monthsList = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]

    // Fetch albums from the server
    useEffect(() => {
        async function getAlbums() {
            try {
                const response = await fetch(`http://localhost:5000/api/family/albums/${familyId}`)
                if(!response.ok) {
                    throw new Error(`An error has occured: ${response.statusText}`)
                }
                const albumsData = await response.json()
                setAlbums(albumsData)
            } catch (error){
                console.error('Error fetching albums:', error)
            }
        }
        getAlbums()
    }, [familyId])

    // Delete an album
    const deleteAlbum = async (id) => {

        await fetch(`http://localhost:5000/albums/${id}`, {
            method: 'DELETE',
        })  
        setAlbums(albums.filter((album) => album._id !== id))   
    }

    const handleEdit = (album) => {
        setEditingAlbum(album._id)
        setNewTheme(album.theme)
    }

    // Save edited album
    const handleSave = async (id, e) => {
        e.stopPropagation()

        if(!newTheme){
            return alert("Vous devez entrer un thème")
        }

        try {
            console.log(`Sending PATCH request to update album ${id} with theme: ${newTheme}`);
            
            const response = await fetch(`http://localhost:5000/albums/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    theme: newTheme
                })
            })
            
            const updatedAlbum = await response.json();
            console.log("Updated response: ", updatedAlbum)

        
            const updatedAlbums = albums.map(album => {
                if(album._id === id || album._id === parseInt(id)){
                    return { ...album, theme: newTheme };
                }
                return album
            });
    
            setAlbums(updatedAlbums);

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
            const response = await fetch('http://localhost:5000/albums',{
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
            setNewAlbumForm({ month: "", theme: "", familyId: familyId })
            setShowAddForm(false)
        } catch (error) {
            console.error('Error creating a new album: ', error)
        }
    }

    // Navigate to album page
    const handleAlbumClick = (id) => {
        navigate(`/album/${id}`)
    }
  
    
    return (
        <div className=' mx-auto p-4 mb-24'> 
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
                                                <option className="bg-base-100 font-bold" key={`month-${index}-${familyId}`} value={month}>{month}</option>
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
            
            
            
            {/* Albums Grid */}
            <div className='flex'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {albums.map((album) => (
                        <div
                            key={album._id}
                            className='relative'
                            onClick={() => handleAlbumClick(album._id)}
                        >
                            {/* Album Card */}
                            <div className='p-4 cursor-pointer border-2 bg-base-200 border-primary rounded-lg group'>
                                <h3 className='mb-2 font-semibold'>{album.month}</h3>
                                <img src={album.cover ? album.cover : "https://res.cloudinary.com/djsj0pfm3/image/upload/c_thumb,w_200,g_face/v1740580694/logo_white_ocjjvc.png"} 
                                    alt={album.month} 
                                    className='w-full h-48 object-cover mb-2' 
                                />
                                <h5 className='text-white mb-1'><i>{editingAlbum === album._id ?'' : album.theme}</i></h5>
                                {album.winner && <h4>Winner: <i>{album.winner}</i></h4>}
                                <div className='absolute top-2 right-2'>
                                    <EditDropdown
                                        actions={[
                                            {
                                            label: "Modifier le thème",
                                            icon: <Edit className="h-4 w-4" />,
                                            onClick: () => handleEdit(album),
                                            },
                                            {
                                            label: "Supprimer",
                                            icon: <Trash className="h-4 w-4 text-red-500" />,
                                            onClick: () => deleteAlbum(album._id),
                                            },
                                        ]}
                                    />
                                </div>
                                
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
                                            onClick={(e) => handleSave(album._id,e)}
                                            className='p-2 py-2 btn btn-primary flex justify-center'
                                        >
                                            <Check size={26} className='mr-1' /> 
                                        </button>
                                        
                                    </div>
                                </div>

                            )}

                        </div>
                    ))}

                    { isAdmin && (
                        <div className='flex items-center justify-center'>
                            <button
                                className='p-6 btn btn-primary rounded-full hover:text-neutral flex items-center cursor-pointer'
                                onClick={() => setShowAddForm(true)}
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    )}
                    
                     
                </div>
            </div>
            
           
        </div>
    )
}

export default AlbumList