    import { Edit, Trash  } from "lucide-react";
    import PropTypes from 'prop-types';
    import { motion, AnimatePresence } from "framer-motion";
    import EditDropdown from "./EditDropdown.jsx"
    import { useAuth } from '../context/AuthContext.jsx';
    import { useEffect, useState } from "react";

    const Picture = ({ photo, deletePhoto, isVotedId, onVote, showUploadForm, replacingPhoto, cloudinaryURL, albumClosed }) => {
        const {currentUser} = useAuth()
        const [userData, setUserData] = useState(null)
        const [photoClickId, setPhotoClickId] = useState(null)
        const [showToolTip, setShowToolTip] = useState(null)
        const [shake, setShake] = useState(false);
        const [lastTap, setLastTap] = useState(0)

        useEffect(() => {
            const getUserData = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/user/${photo.userId}`);
                    if (!response.ok) {
                        throw new Error(`Erreur: ${response.statusText}`);
                    }
                    const data = await response.json();
                    setUserData(data); 
                } catch (error) {
                    console.error("Erreur lors de la récupération des données utilisateur:", error);
                }
            };
    
            if (photo.userId) {
                getUserData();
            }
        }, [photo.userId]);

        const handleVote = () => {
            const now = Date.now();
            if (now - lastTap < 300) { // Si deuxième tap rapide
                if(!albumClosed){
                    if(currentUser?._id !== photo.userId ){
                         onVote(photo._id);
                    }else{
                        setPhotoClickId(photo._id)
                        setShowToolTip("Interdit de voter pour soi!")
                        setShake(true);

                        setTimeout(() => {
                            setShake(false)
                            setPhotoClickId(null)
                            setShowToolTip(null)
                        }, 3000)
                   }
                }else {
                    setPhotoClickId(photo._id)
                    setShowToolTip("Les votes sont clos")
                    setShake(true);

                    setTimeout(() => {
                        setShake(false)
                        setPhotoClickId(null)
                        setShowToolTip(null)
                    }, 3000)
                }
            }
            setLastTap(now);
        };
        
        return (
            
                <div className="w-full relative mb-20 p-2 group inline-block">

                    {/*Username*/}
                    {userData && (
                        <div className="text-primary font-bold mb-2 text-center">
                            {userData.username}
                        </div>
                    )}

                    
                    
                    {/* Modifier L'image */}
                    {currentUser?._id === photo.userId && (
                        <div className='absolute top-2 right-2 z-20'>
                            <EditDropdown
                                actions={[
                                    {
                                        label: "Modifier l'image",
                                        icon: <Edit className="h-4 w-4" />,
                                        onClick: () => {
                                            showUploadForm(true)
                                            replacingPhoto(photo._id)
                                            cloudinaryURL(photo.src)
                                        }
                                    },
                                    {
                                        label: "Supprimer",
                                        icon: <Trash className="h-4 w-4 text-red-500" />,
                                        onClick: () => deletePhoto(photo._id, photo.src),
                                    },
                                ]}
                            />
                        </div>
                    )}  

                    <div className={showToolTip && photo._id === photoClickId ? "tooltip tooltip-open p-2 tooltip-bottom tooltip-error font-semibold relative" : ""} data-tip={showToolTip}>
                        {/*Bouton Voter*/}
                            <motion.button 
                                onDoubleClick={() => {
                                    if(!albumClosed){
                                        if(currentUser?._id !== photo.userId ){
                                            onVote(photo._id)
                                        }else{
                                            setPhotoClickId(photo._id)
                                            setShowToolTip("Interdit de voter pour soi!")
                                            setShake(true);

                                            setTimeout(() => {
                                                setShake(false)
                                                setPhotoClickId(null)
                                                setShowToolTip(null)
                                            }, 3000)
                                            
                                        }
                                        
                                    } else {
                                        setPhotoClickId(photo._id)
                                        setShowToolTip("Les votes sont clos")
                                        setShake(true);

                                        setTimeout(() => {
                                            setShake(false)
                                            setPhotoClickId(null)
                                            setShowToolTip(null)
                                        }, 3000)
                                    }
                                }}
                                onTouchEnd={handleVote}
                                title="Double-Clique pour voter"
                                className=""
                                animate={shake ? { rotate: [0, -10, 10, -5, 5, 0] } : isVotedId ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                {/*Nombre de Votes avec Image*/}
                                <div className="indicator inline-block w-full">
                                    
                                <AnimatePresence exitBeforeEnter>
                                    <motion.span
                                        key={photo.votes} // La clé change à chaque mise à jour pour déclencher l'animation
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ duration: 0.3  }}
                                        className="indicator-item indicator-bottom indicator-center badge badge-primary text-neutral font-bold text-sm"
                                    >
                                        {photo.votes}
                                    </motion.span>
                                </AnimatePresence>
                                            
                                    <motion.img 
                                        key={photo._id} 
                                        src={photo.src} 
                                        alt={`Photo ${photo._id}`} 
                                        className={`rounded-xl w-full h-auto max-w-96 ${isVotedId ? "border-primary border-4" : "border-0"}`} 
                                        initial={{ scale: 1 }}
                                        animate={{ scale: isVotedId ? 1.05 : 1 }}
                                        transition={{ type: "spring", stiffness: 20, damping: 10, duration: 1.5 }}
                                    />
                                </div>
                            </motion.button>
                    </div>
                </div>
                
        );
    };

    Picture.propTypes = {
        isVotedId: PropTypes.bool,
        albumClosed: PropTypes.bool,
        onVote: PropTypes.func.isRequired,
        deletePhoto: PropTypes.func,
        cloudinaryURL: PropTypes.func,
        showUploadForm: PropTypes.func,
        replacingPhoto: PropTypes.func,
        photo: PropTypes.shape({
            src: PropTypes.string.isRequired,
            _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            userId: PropTypes.string,
            votes: PropTypes.number
        }).isRequired,
    };

    export default Picture;
