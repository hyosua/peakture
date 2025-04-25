import { useEffect, useState } from "react";
import axios from 'axios';
import { useToast } from "../../context/ToastContext.jsx"
import { useAuth } from '../../context/AuthContext.jsx';



const Profile = () => {
const [user, setUser] = useState({username: '', avatar: null});
const [preview, setPreview] = useState(null);
const {showToast} = useToast();
const [modifying, setModifying] = useState(false)

const {currentUser} = useAuth()

useEffect(() => {
    setUser({username: currentUser.username, avatar: currentUser.avatar.imageLink})
    if(currentUser.avatar){
        setPreview(currentUser.avatar)
    }
},[currentUser])


const handleUsernameChange = (e) => {
    setModifying(true)
    setUser({ ...user, [e.target.name]: e.target.value})
}

const handleFileChange = async (e) => {
    setModifying(true)
    const file = e.target.files[0];
    const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'peakture-preset')

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/djsj0pfm3/image/upload", {
            method: "POST",
            body: formData
        })

        const data = await response.json()
        setUser({...user, avatar: data.secure_url})
        setPreview(data.secure_url)
        console.log("secure url:",data.secure_url)
        return data.secure_url
    } catch (error){
        console.error("Error uploading to Cloudinary: ",error)
        throw error
    }
}

const handleSubmit = async (e) => {
    e.preventDefault();
    try{
        const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/user/update`, 
            { username: user.username, avatar: user.avatar },
            {withCredentials: true}
        )
        if(response.data.success){
            showToast({ message: "Profil mis à jour!", type: "success"})
        }
        setModifying(false)
    }catch(error){
        console.log("Erreur lors de la mise à jour du profil:", error)
    }

}

return(
    <div className="max-w-md mx-auto p-4">
    <h1 className="text-2xl text-primary font-bold mb-4">Mon profil</h1>
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        Pseudo :
        <input
          name="username"
          value={user.username}
          onChange={handleUsernameChange}
          className="w-full border p-2 rounded mt-1"
        />
      </label>

      <label className="block">
        Avatar :
        <input type="file" onChange={handleFileChange} className="mt-1" />
      </label>
    
    
       <img src={preview ? preview : "https://img.icons8.com/?size=100&id=65342&format=png"} alt="Avatar" className="w-24 h-24 object-cover rounded-full mt-2" />

      <button type="submit" className="btn btn-success" disabled={!modifying}>
        Enregistrer
      </button>
    </form>
  </div>
)

}

export default Profile