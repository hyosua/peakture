    import { Edit, Trash, Expand  } from "lucide-react";
    import PropTypes from 'prop-types';
    import { motion, AnimatePresence } from "framer-motion";
    import EditDropdown from "./EditDropdown.jsx"
    import { useAuth } from '../context/AuthContext.jsx';
    import { useEffect, useState, useRef } from "react";

    const Picture = ({ photo, deletePhoto, album, isVotedId, onVote, showUploadForm, replacingPhoto, cloudinaryURL, albumStatus }) => {
        const {currentUser} = useAuth()
        const [userData, setUserData] = useState(null)
        const [tooltip, setTooltip] = useState(null)
        const [shake, setShake] = useState(false);
        const [lastTap, setLastTap] = useState(0)
        const imageRef = useRef(null);
        const [showFullscreen, setShowFullscreen] = useState(false);
        const [isVoting, setIsVoting] = useState(false)


        useEffect(() => {
            const fetchUserData = async () => {
                if(!photo.userId) return;
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${photo.userId}`);
                    if (!response.ok) {
                        throw new Error(`Erreur: ${response.statusText}`);
                    }
                    setUserData(await response.json());
                } catch (error) {
                    console.error("Erreur lors de la récupération des données utilisateur:", error);
                }
            };
    
            fetchUserData();
            
        }, [photo.userId]);

        const handleVote = () => {
            const now = Date.now();
            const isDoubleTap = now - lastTap < 300; // 300ms pour considérer comme double-tap
            setLastTap(now);
            if(!isDoubleTap) return;
            processVote();
        };

        const processVote = async () => {
            if(isVoting) return;
            setIsVoting(true)
            try{
                const isSelfVote = currentUser?._id === photo.userId;

                if (!isSelfVote && albumStatus === "open") {
                    await onVote(photo._id);
                    return
                }
    
                let errorMessage;
                if(isSelfVote) {
                    errorMessage = "Interdit de voter pour soi!";
                }else if(albumStatus === "closed") {
                    errorMessage = "Les votes sont clos";
                }
    
                if(errorMessage) {
                    showError(errorMessage);
                }
            } finally {
                setTimeout(() =>  setIsVoting(false), 1000)
            }
           
        }

        const showError = (message) => {
            setTooltip(message);
            setShake(true);

            setTimeout(() => {
                setShake(false)
                setTooltip(null)
            }, 3000)
        }

        const isPeakture = photo._id === album?.peakture
        // const isTieBreakJudge = currentUser?._id === album?.tieBreakJudge
        const isPhotoOwner = currentUser?._id === photo.userId
        
        return (
            
                <div className="w-full relative mb-20 p-1 group inline-block">
                    
                    {/* Modifier L'image */}
                    { isPhotoOwner && (
                        <div className='absolute top-2 right-2 z-20'>
                            <EditDropdown
                                actions={[
                                    {
                                        label: "Changer d'image",
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

                    {/*Image*/}
                    <div className={tooltip ? "tooltip tooltip-open p-2 tooltip-bottom tooltip-error font-semibold relative" : ""} data-tip={tooltip}>
                        {/*Bouton Voter*/}
                            <motion.button 
                                onDoubleClick={ processVote }
                                onTouchEnd={handleVote}
                                title="Double-Clique pour voter"
                                className=""
                                animate={shake ? { rotate: [0, -10, 10, -5, 5, 0] } : isVotedId ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                {/*Nombre de Votes*/}
                                <div className="indicator inline-block w-full">
                                    
                                <AnimatePresence exitBeforeEnter>
                                    <motion.span
                                        key={photo.votes} // La clé change à chaque mise à jour pour déclencher l'animation
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ duration: 0.3  }}
                                        className={`indicator-item indicator-bottom indicator-center badge ${isPeakture ? "badge-warning" : "badge-primary"} text-neutral font-bold text-sm`}
                                    >
                                        {photo.votes}
                                    </motion.span>
                                </AnimatePresence>

                                {/*Image*/}

                                <motion.img 
                                    ref={imageRef}
                                    key={photo._id} 
                                    src={photo.src} 
                                    alt={`Photo ${photo._id}`} 
                                    className={`rounded-xl relative w-full h-auto max-w-96 ${
                                        isVotedId ? "border-primary border-4" : 
                                        isPeakture ? "border-warning border-6" : "border-0"
                                    }`} 
                                    initial={{ scale: 1 }}
                                    animate={{ scale: isVotedId ? 1.05 : 1 }}
                                    transition={{ type: "spring", stiffness: 20, damping: 10, duration: 1.5 }}
                                />

                                {/* Bouton Plein écran */}
                                <span role="button"
                                    tabIndex={0} 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        setShowFullscreen(true);
                                    }}
                                    className="absolute lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-2 right-2 cursor-pointer bg-black/50 text-white p-1 rounded-full hover:bg-black/80 z-20"
                                    title="Voir en plein écran"
                                >
                                    <Expand className="h-4 w-4" />
                                </span>

                                { isPeakture && (
                                    <div>
                                        <img 
                                            src="https://img.icons8.com/?size=100&id=Gb6fHoXK4exM&format=png&color=000000" 
                                            alt="Crown" 
                                            className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 animate-bounce"
                                        />
                                    </div>)}
                                </div>

                                
                            </motion.button>

                            {/* Full Screen*/}
                            <AnimatePresence>
                            {showFullscreen && (
                                <motion.div 
                                    className="fixed top-0 left-0 w-full h-full bg-black/90 flex justify-center items-center z-50"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setShowFullscreen(false)} // Ferme la modal en cliquant en dehors
                                >
                                    <motion.img 
                                        src={photo.src} 
                                        alt="Fullscreen"
                                        className="max-w-11/12 max-h-11/12 rounded-xl shadow-lg"
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.div>
                            )}
                            </AnimatePresence>

                            {/*Username*/}
                            {userData && (
                                <div className="text-primary font-bold mt-2 text-center">
                                    {userData.username}
                                </div>
                            )}
                    </div>
                </div>
                
        );
    };

    Picture.propTypes = {
        isVotedId: PropTypes.bool,
        albumStatus: PropTypes.string,
        onVote: PropTypes.func.isRequired,
        deletePhoto: PropTypes.func,
        cloudinaryURL: PropTypes.func,
        showUploadForm: PropTypes.func,
        replacingPhoto: PropTypes.func,
        photo: PropTypes.shape({
            src: PropTypes.string.isRequired,
            _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            userId: PropTypes.string,
            votes: PropTypes.number,
            isTied: PropTypes.bool
        }).isRequired,
        album: PropTypes.shape({
            peakture: PropTypes.bool,
            tieBreakJudge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }).isRequired,
        index: PropTypes.number.isRequired,
    };

    export default Picture;
