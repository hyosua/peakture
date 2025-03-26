    import { ChevronUp, Edit, Trash  } from "lucide-react";
    import PropTypes from 'prop-types';
    import { motion, AnimatePresence } from "framer-motion";
    import EditDropdown from "./EditDropdown.jsx"
    import { useAuth } from '../context/AuthContext.jsx';
    import { useEffect, useState } from "react";

    const Picture = ({ photo, deletePhoto, isVotedId, onVote, showUploadForm, replacingPhoto, cloudinaryURL }) => {
        const {currentUser} = useAuth()
        const [userData, setUserData] = useState(null)

        useEffect(() => {
            const getUserData = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/user/${photo.user}`);
                    if (!response.ok) {
                        throw new Error(`Erreur: ${response.statusText}`);
                    }
                    const data = await response.json();
                    setUserData(data); 
                } catch (error) {
                    console.error("Erreur lors de la récupération des données utilisateur:", error);
                }
            };
    
            if (photo.user) {
                getUserData();
            }
        }, [photo.user]);
        
        return (
            <div className="relative m-4 p-2 group inline-block">
                <motion.img 
                    key={photo._id} 
                    src={photo.src} 
                    alt={`Photo ${photo._id}`} 
                    className={`rounded-xl ${isVotedId ? "border-primary  border-4" : "border-0"}`} 
                    initial={{ scale: 1 }}
                    animate={{ scale: isVotedId ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 30, damping: 10, duration: 1.5 }}
                />

                    { currentUser?._id === photo.user && (
                        <div className='absolute top-2 right-2'>
                            <EditDropdown
                                actions={[
                                    {
                                    label: "Modifier l'image",
                                    icon: <Edit className="h-4 w-4" />,
                                    onClick: () => {
                                        showUploadForm(true)
                                        replacingPhoto(photo._id)
                                        cloudinaryURL(photo.src)
                                    }},
                                    {
                                    label: "Supprimer",
                                    icon: <Trash className="h-4 w-4 text-red-500" />,
                                    onClick: () => deletePhoto(photo._id, photo.src),
                                    },
                                ]}
                            />
                        </div>
                    )}                

                { currentUser?._id !== photo.user && (   
                    
                    <motion.button 
                        onClick={() => onVote(photo._id)}
                        className="cursor-pointer flex items-center space-x-1 absolute bottom-4 right-4 bg-black/50 p-1 rounded"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.4 }}
                    >
                        <ChevronUp
                            className={`w-6 h-6 ${isVotedId ? "fill-primary stroke-none" : "stroke-white"}`}
                        />
                        {/* Conteneur pour le compteur */}
                        <div className="relative h-6 w-4 overflow-hidden">
                            <AnimatePresence exitBeforeEnter>
                                <motion.span
                                    key={photo.votes} // La clé change à chaque mise à jour pour déclencher l'animation
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5  }}
                                    className="absolute inset-0 flex justify-center items-center text-primary font-bold text-sm"
                                >
                                    {photo.votes}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </motion.button>
                )}

                {/*Username*/}
                {userData && (
                    <div className="text-primary font-bold">
                    {   userData.username}
                    </div>
                )}

                </div>
                
        );
    };

    Picture.propTypes = {
        isVotedId: PropTypes.bool,
        onVote: PropTypes.func.isRequired,
        deletePhoto: PropTypes.func,
        cloudinaryURL: PropTypes.func,
        showUploadForm: PropTypes.func,
        replacingPhoto: PropTypes.func,
        photo: PropTypes.shape({
            src: PropTypes.string.isRequired,
            _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            user: PropTypes.string,
            votes: PropTypes.number
        }).isRequired,
    };

    export default Picture;
