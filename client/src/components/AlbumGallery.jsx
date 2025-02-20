import { useEffect, useState } from "react"
import { useNavigate, useParams} from "react-router-dom"


const AlbumGallery = () => {
    const { month } = useParams()
    const [album, setAlbum] = useState(null)
    const navigate = useNavigate()
        
    // Fetch Album data
    useEffect(() => {
        async function getAlbumData() {
            try {
                const response = await fetch(`http://localhost:5000/albums/${month}`)
                console.log("Fetch response: ", response)
                if(!response.ok){
                    throw new Error(`Erreur: ${response.statusText}`)
                }
                
                const albumData = await response.json()
                setAlbum(albumData)

                // Fetch photos from this album
            } catch(error){
                console.error("Error while fetching album data:", error)
                navigate("/")
            }
        }
        getAlbumData()
        
    }, [month, navigate])

    




    return (
        <div className="wrapper">
            <h2 className="text-white">Album</h2>
            <h2></h2>
        </div>

    )
}

export default AlbumGallery