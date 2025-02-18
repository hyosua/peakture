import { useEffect, useState } from 'react'
import { navigate } from 'react-router-dom'
import { EllipsisVertical, Plus } from 'lucide-react'
import axios from 'axios'
// if database not set up yet, import albums from data
// import albums from '../data/albumsData'
const AlbumList = () => {
    const [isHovered, setIsHovered] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [newTheme, setNewTheme] = useState('')
    const [editingAlbum, setEditingAlbum] = useState(null)

    const [albums, setAlbums] = useState([])
    // fetch albums from the server
    useEffect(() => {
        async function getAlbums() {
            const response = await fetch('http://localhost:5000/album')
            if(!response.ok) {
                const message = `An error has occured: ${response.statusText}`
                console.log("Error: ", message)
                return
            }
            const albums = await response.json()
            setAlbums(albums)
        }
        getAlbums()
        return
    }, [albums.length])

    // delete an album
    async function deleteAlbum(id){
        await fetch(`http://localhost:5000/album/${id}`, {
            method: "DELETE",
        })  
        const newAlbums = albums.filter((element) => element._id !== id )
        setAlbums(newAlbums)
    }

    const handleEdit = (album) => {
        setEditingAlbum(album)
        setNewTheme(album.theme)
    }

    const handleSave = async () => {
        try {
            const response = await axios.patch(`http://localhost:5000/album/${id}`,{
                theme: newTheme
            })
            setAlbums(albums.map(album =>
                album._id === response.data._id ? response.data : album       
            ))
            setEditingAlbum(null)
        } catch (error) {
            console.error('Error updating album:', error)
        }
    }

    const handleCancel = () => {
        setEditingAlbum(null)
        setNewTheme('')
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        setIsMenuOpen(false)
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <> 
            { albums.map((album) => (
                <div key={album._id}
                    className="album-preview"
                    onClick={() => navigate(`/album/${album.month}`)}
                >
                    <div className="relative p-4 border border-white rounded-lg"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <h3>{album.month}</h3>
                        <img src={album.cover} alt={album.month} className="w-full h-48 object-cover" />
                        <h3>Thème:"<i>{album.theme}</i>"</h3>
                        <h4>Winner:<i>{album.winner}</i></h4>
                        {isHovered && (
                            <div className="absolute top-2 right-2">
                                <button onClick={ toggleMenu }
                                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                                >
                                    <EllipsisVertical />
                                </button>
                                {isMenuOpen && (
                                    <div className="abolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl">
                                        <button onClick={ handleEdit(album) }
                                                className="block px-4 text-gray-800 hover:bg-gray-200 w-full text-left">
                                            Renommer le thème
                                        </button>
                                        <button onClick={deleteAlbum(album._id)}
                                                className="block px-4 text-gray-800 hover:bg-gray-200 w-full text-left">
                                            Supprimer l'album
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="hidden absolute top-4 right-4 bg-white border border-emerald-400 p-2 rounded-lg">
                            {editingAlbum && editingAlbum._id === album._id && (
                                <div>
                                    <input
                                        type="text"
                                        value={newTheme}
                                        onChange={(e) => setNewTheme(e.target.value)}
                                        placeholder={album._id.theme}
                                    />
                                    <button onClick={handleSave}>Save</button>
                                    <button onClick={handleCancel}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>   
                </div>  
            ))}
        </>   
    )
}

export default AlbumList