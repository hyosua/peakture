import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useToast } from "../../context/ToastContext.jsx"
import { User, Camera, Upload, Pencil } from "lucide-react";
import { useAuth } from '../../context/AuthContext.jsx';
import uploadToCloudinary from "../../../utils/uploadToCloudinary.js";

const Profile = () => {
  const [user, setUser] = useState({username: '', avatar: null, coverImage: null});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const {showToast} = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef(null)

  const {currentUser, fetchCurrentUser} = useAuth();

  useEffect(() => {
    setUser({
      username: currentUser.username, 
      avatar: currentUser.avatar || null,
      coverImage: currentUser.coverImage || null
    });
    
    setAvatarPreview(currentUser.avatar);
    setCoverPreview(currentUser.coverImage);
    
  }, [currentUser]);

  const handleUsernameChange = (e) => {
    setIsEditing(true);
    setUser({ ...user, username: e.target.value});
  };

  const handleAvatarChange = async (e) => {
    setIsEditing(true);
    const file = e.target.files[0];
    try{
      const avatarUrl = await uploadToCloudinary(file);
      setUser({...user, avatar: avatarUrl});
      setAvatarPreview(avatarUrl);
    } catch (error){
      console.error("Error uploading avatar to Cloudinary: ", error);
      throw error;
    }
  };
  
  const handleCoverChange = async (e) => {
    setIsEditing(true);
    const file = e.target.files[0];
    try{
      const coverUrl = await uploadToCloudinary(file);
      setUser({...user, coverImage: coverUrl});
      setCoverPreview(coverUrl);
    } catch (error){
      console.error("Error uploading cover image to Cloudinary: ", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/user/update`, 
        { username: user.username, avatar: user.avatar, coverImage: user.coverImage },
        {withCredentials: true}
      );
      
      if(response.data.success){
        showToast({ message: "Profil mis à jour!", type: "success"});
      }
      fetchCurrentUser()
      console.log("Current user maj:", currentUser)
      setIsEditing(false);
    } catch(error){
      console.log("Erreur lors de la mise à jour du profil:", error);
      showToast({ message: "Erreur lors de la mise à jour du profil", type: "error" });
    }
  };


  return(
    <div className="overflow-hidden mx-auto bg-base-300 shadow-md rounded-lg">
       <div className="fixed bottom-24 right-4 z-50">
          <button
            disabled={!isEditing}
            onClick={handleSubmit}
            className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-neutral ${isEditing ? 'bg-primary cursor-pointer hover:bg-accent' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            Enregistrer
          </button>
        </div>
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-200">
          <img
            src={coverPreview}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        <label className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-primary" title="Changer l'image de couverture">
          <Camera size={20} className="text-gray-600" />
          <input
            type="file"
            onChange={handleCoverChange}
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>
      
      <div className="p-6">
        <div className="flex gap-6 h-screen">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg -mt-16 overflow-hidden bg-gray-200">
              <img 
                src={avatarPreview} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
              <label className="absolute top-0 left-1 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-primary" title="Changer la photo">
                <Camera size={16} className="text-gray-600" />
                <input 
                  type="file" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          {/* Profile Form */}
          {isEditing ? (
            <div>
              <form onSubmit={handleSubmit} className="max-w-md flex-grow space-y-4 md:mt-0">
              <div className="space-y-4">
                <div>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="username"
                      value={user.username}
                      onChange={handleUsernameChange}
                      className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Votre nom d'utilisateur"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
          ) : (
            <div className="relative space-y-4 text-primary text-xl lg:text-2xl font-bold">
              {currentUser.username}
              <button 
                  className="absolute top-0 -right-6"
                  onClick={() => setIsEditing(true)}
                  >
                <Pencil size={14} className="cursor-pointer"/>
              </button>
            </div>
          )}
          
        </div>
       
      </div>
      
    </div>
  );
};

export default Profile;