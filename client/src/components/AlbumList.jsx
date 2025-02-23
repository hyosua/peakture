import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Check, Edit, Trash } from 'lucide-react'
import EditDropdown from './EditDropdown.jsx'

const AlbumList = () => {
    const [albums, setAlbums] = useState([])
    const [newTheme, setNewTheme] = useState('')
    const [editingAlbum, setEditingAlbum] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newAlbumForm, setNewAlbumForm ] = useState({
        month: '',
        theme: '',
    })

    const navigate = useNavigate()

    // Fetch albums from the server
    useEffect(() => {
        async function getAlbums() {
            try {
                const response = await fetch('http://localhost:5000/albums')
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
    }, [])

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
            console.log("Updated resonse: ", updatedAlbum)

        
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
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            const newAlbum = {
                _id: result.insertedId,
                ...newAlbumForm
            }
            setAlbums(prev => [...prev, newAlbum])
            setNewAlbumForm({ month: "", theme: "" })
            setShowAddForm(false)
        } catch (error) {
            console.error('Error creating a new album: ', error)
        }
    }

    // Navigate to album page
    const handleAlbumClick = (month) => {
        navigate(`/album/${month}`)
    }
  
    
    return (
        <div className='container mx-auto p-4'> 
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl text-white font-bold'>Albums</h1>
            </div>

            {/* Add album form */}
            {showAddForm && (
                <div className='fixed bg-emerald-950/50 backdrop-blur-sm inset-0 flex items-center justify-center z-50'>
                    <div className="bg-white p-6 rounded-lg w-96">
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Ajouter Un Album</h2>
                            <button 
                                className='p-1 rounded-full hover:bg-gray-200 cursor-pointer'
                                onClick={() => setShowAddForm(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitNewAlbum}>
                            <div className='mb-4'>
                                <label className="block text-gray-700 mb-2">Month
                                    <select
                                        value={newAlbumForm.month}
                                        onChange={handleFormChange}
                                        name='month'
                                        className="block w-full p-2 mb-4 border-2 border-emerald-950 rounded"
                                        required
                                    >
                                        <option value="">Sélectionner un mois</option>
                                        {["Janvier", "Février", "Mars", "Avril", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"].map((month) => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}    
                                    </select>
                                </label>
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-700 mb-2'>Thème
                                    <input
                                        type='text'
                                        name='theme'
                                        value={newAlbumForm.theme}
                                        onChange={handleFormChange}
                                        className='w-full px-3 py-2 border-2 border-emerald-950 rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                        required
                                    />
                                </label>
                                
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    type='button'
                                    className='px-4 py-2 text-ray-700 hover:bg-gray-100 rounded-lg mr-2 cursor-pointer'
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type='submit'
                                    className='px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-900 cursor-pointer'
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Albums Grid */}
            <div className='flex'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {albums.map((album) => (
                        <div
                            key={album._id}
                            className='album-preview'
                            onClick={() => handleAlbumClick(album.month)}
                        >
                            {/* Album Card */}
                            <div className='p-4 border-2 bg-black/70 border-emerald-500 rounded-lg group'>
                                <h3 className='mb-2'>{album.month}</h3>
                                {album.cover && <img src={album.cover} alt={album.month} className='w-full h-48 object-cover mb-2' />}
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
                                <div className='absolute inset-0 backdrop-blur-sm bg-black/60 flex flex-col items-center justify-center cursor-pointer'
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
                                            className='p-2 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-red-400 flex items-center cursor-pointer'
                                        >
                                            <X size={26} className='mr-1' /> 
                                        </button>
                                        <button 
                                            onClick={(e) => handleSave(album._id,e)}
                                            className='p-2 py-2 border-2 border-white text-white rounded-lg bg-emerald-900 cursor-pointer hover:bg-emerald-600 flex justify-center'
                                        >
                                            <Check size={26} className='mr-1' /> 
                                        </button>
                                        
                                    </div>
                                </div>

                            )}

                        </div>
                    ))}
                    <div className='flex items-center justify-center'>
                        <button
                            className='p-6 text-white rounded-full border-2 border-white hover:bg-emerald-600 focus:outline-none flex items-center cursor-pointer'
                            onClick={() => setShowAddForm(true)}
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                     
                </div>
            </div>
            
           
        </div>
    )
}

export default AlbumList