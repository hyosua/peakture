import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EllipsisVertical, Plus, X, Check } from 'lucide-react'
import axios from 'axios'

// if database not set up yet, import albums from data
// import albums from '../data/albumsData'

const AlbumList = () => {
    const [albums, setAlbums] = useState([])
    const [hoveredAlbumId, sethoveredAlbumId] = useState(null)
    const [menuOpenId, setmenuOpenId] = useState(null)
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
                const response = await fetch('http://localhost:5000/album')
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
    const deleteAlbum = async (id, e) => {
        e.stopPropagation(); // Prevent navigation when deleting
        await fetch(`http://localhost:5000/album/${id}`, {
            method: 'DELETE',
        })  
        setAlbums(albums.filter((album) => album._id !== id))   
    }

    const handleEdit = (album, e) => {
        e.stopPropagation() // Prevent navigation when editing
        setEditingAlbum(album._id)
        setNewTheme(album.theme)
        setmenuOpenId(null) // Close menu after selecting edit
    }

    // Save edited album
    const handleSave = async (id, e) => {
        e.stopPropagation()
        try {
            await axios.patch(`http://localhost:5000/album/${id}`,{
                theme: newTheme
            })

            // Update the albums state with updated album
            setAlbums(albums.map(album =>
                album._id === id ? { ...album, theme: newTheme } : album       
            ))
            setEditingAlbum(null)
            setNewTheme('')
        } catch (error) {
            console.error('Error updating album:', error)
        }
    }

    // Cancel Album editing
    const handleCancel = (e) => {
        e.stopPropagation()
        setEditingAlbum(null)
        setNewTheme('')
    }

    // Handle album hover
    const handleMouseEnter = (id) => {
        sethoveredAlbumId(id)
    }

    // Handle mouse leave on album
    const handleMouseLeave = () => {
        sethoveredAlbumId(null)
        setmenuOpenId(null)
    }

    // Dropdown Menu for editing an album
    const toggleMenu = (id, e) => {
        e.stopPropagation()
        setmenuOpenId(menuOpenId === id ? null : id)
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
            const response = await fetch('http://localhost:5000/album',{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newAlbumForm)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const newAlbum = await response.json()
            setAlbums([...albums, newAlbum])
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
                <button
                    className='p-2 text-white rounded-full border-2 border-white hover:bg-emerald-600 focus:outline-none flex items-center cursor-pointer'
                    onClick={() => setShowAddForm(true)}
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Add album form */}
            {showAddForm && (
                <div className='fixed bg-emerald-950 bg-opacity-50 inset-0 flex items-center justify-center z-50'>
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
                                <label className="block text-gray-700 mb-2">Month</label>
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
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-700 mb-2'>Thème</label>
                                <input
                                    type='text'
                                    name='theme'
                                    value={newAlbumForm.theme}
                                    onChange={handleFormChange}
                                    className='w-full px-3 py-2 border-2 border-emerald-950 rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    required
                                />
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
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {albums.map((album) => (
                    <div
                        key={album._id}
                        className='album-preview'
                        onMouseEnter={() => handleMouseEnter(album._id)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleAlbumClick(album.month)}
                    >
                        {/* Album Card */}
                        <div className='p-4'>
                            <h3 className='mb-2'>{album.month}</h3>
                            {album.cover && <img src={album.cover} alt={album.month} className='w-full h-48 object-cover mb-2' />}
                            <h3 className='mb-1'>Thème: <i>{editingAlbum === album._id ?'' : album.theme}</i></h3>
                            {album.winner && <h4>Winner: <i>{album.winner}</i></h4>}
                        </div>

                        {/* Edit Album */}
                        {editingAlbum === album._id && (
                            <div className='absolute inset-0 bg-white bg-opacity-95 p-4 flex flex-col items-center justify-center cursor-pointer'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3>Editer le Thème</h3>
                                <input
                                    type='text'
                                    value={newTheme}
                                    placeholder='Entrer le nouveau thème'
                                    onChange={(e) => setNewTheme(e.target.value)}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4'
                                />
                                <div className='flex space-x-2'>
                                    <button 
                                        onClick={(e) => handleSave(album._id,e)}
                                        className='px-4 pey-2 border-2 border-white text-white rounded-lg bg-emerald-900 cursor-pointer hover:bg-emerald-600 flex items-center'
                                    >
                                        <Check size={16} className='mr-1' /> Enregistrer
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center cursor-pointer'
                                    >
                                        <X size={16} className='mr-1' /> Annuler
                                    </button>
                                </div>
                            </div>

                        )}

                        {/* Album Menu (shown on hover) */}
                        {(hoveredAlbumId === album._id && !editingAlbum) && (
                            <div className='absolute top-2 right-2'>
                                <button
                                    onClick={(e) => toggleMenu(album._id, e)}
                                    className='p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none cursor-pointer'
                                >
                                    <EllipsisVertical size={20} />
                                </button>

                                {/* Dropdown menu */}
                                {menuOpenId === album._id && (
                                    <div className='abosule right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
                                        <button
                                            onClick={(e) => handleEdit(album,e)}
                                            className='block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 rounded-t-lg cursor-pointer'
                                        >
                                            Changer le thème
                                        </button>
                                        <button 
                                            onClick={(e) => deleteAlbum(album._id,e)}
                                            className='block w-full px-4 py-2 text-left text-red-600 hover:bg-hray-100 rounded-b-lg cursor-pointer'
                                        >
                                            Supprimer l&apos;album
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AlbumList