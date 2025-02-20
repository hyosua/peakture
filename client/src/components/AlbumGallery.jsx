import { useEffect, useState } from "react"
import { useNavigate, useParams} from "react-router-dom"
import Masonry from "react-masonry-css"
import { Upload } from "lucide-react"

const AlbumGallery = () => {
    const { month } = useParams()
    const [album, setAlbum] = useState(null)
    const [photos, setPhotos] = useState([])
    const navigate = useNavigate()
        
    // Fetch Album data
    useEffect(() => {
        async function getAlbumData() {
            try {
                const response = await fetch(`http://localhost:5000/albums/${month}`)
                if(!response.ok){
                    throw new Error(`Erreur: ${response.statusText}`)
                }
                
                const albumData = await response.json()
                setAlbum(albumData)

                // Fetch photos from this album
                const photosResponse = await fetch(`http://localhost:5000/photos/${albumData._id}`)
                if(!photosResponse.ok){
                    throw new Error(`Erreur: ${photosResponse.statusText}`)
                }
                const photosData = await photosResponse.json()
                console.log(photosData.photos)
                setPhotos(photosData)

            } catch(error){
                console.error("Error while fetching album data:", error)
                navigate("/")
            }
        }
        getAlbumData()
        
    }, [month, navigate])

    




    return (
        <div className="wrapper">
            <button 
                    className="cursor-pointer border text-white border-white p-2 w-20 mb-4 rounded-lg"
                    onClick={() => navigate("/")}
                >
                    Retour
            </button>
            <h2 className="text-white">{ month }</h2>
            {/* <h3 className="text-white">{album.theme}</h3> */}

            {/* Photo Gallery */}
            <div className="gallery">
                {photos.length > 0 ? (
                    <Masonry 
                            breakpointCols={breakpointColumns}
                            className="gallery"
                            columnClassName="bg-clip-paddin"
                        ></Masonry>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-white">
                        <Upload size={64} className="mb-4" />
                        <p className="text-xl mb-2">Aucune Photo pour le moment.</p> 
                        <p>Soyez le premier!</p>
                    </div>
                )}
            </div>

        </div>

    )
}

export default AlbumGallery