    import { Heart, Edit, Trash  } from "lucide-react";
    import PropTypes from 'prop-types';
    import { motion, AnimatePresence } from "framer-motion";
    import EditDropdown from "./EditDropdown.jsx"

    const Picture = ({ photo, id, deletePhoto, isLikedId, onLike, showUploadForm, replacingPhoto, votes }) => {
        return (
            <div className="relative group inline-block">
                <motion.img 
                    key={id} 
                    src={photo} 
                    alt={`Photo ${id}`} 
                    className={`gallery-photo ${isLikedId ? "border-emerald-400 border-4" : "border-0"}`} 
                    initial={{ scale: 1 }}
                    animate={{ scale: isLikedId ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 30, damping: 10 }}
                />
                    <div className='absolute top-2 right-2'>
                                    <EditDropdown
                                        actions={[
                                            {
                                            label: "Modifier l'image",
                                            icon: <Edit className="h-4 w-4" />,
                                            onClick: () => {
                                                showUploadForm(true)
                                                replacingPhoto(id)
                                            }},
                                            {
                                            label: "Supprimer",
                                            icon: <Trash className="h-4 w-4 text-red-500" />,
                                            onClick: () => deletePhoto(id, photo),
                                            },
                                        ]}
                                    />
                                </div>
                <motion.button 
                    onClick={() => onLike(id)} 
                    className="like-button flex items-center space-x-1 absolute bottom-2 right-2 bg-black/50 p-1 rounded"
                    whileHover={{ scale: 1.2 }}
                >
                    <Heart
                        className={`w-6 h-6 ${isLikedId ? "fill-emerald-400 stroke-none" : "stroke-white"}`}
                    />
                    {/* Conteneur pour le compteur */}
                    <div className="relative h-6 w-4 overflow-hidden">
                        <AnimatePresence exitBeforeEnter>
                            <motion.span
                                key={votes} // La clé change à chaque mise à jour pour déclencher l'animation
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.5  }}
                                className="absolute inset-0 flex justify-center items-center text-emerald-400 font-bold text-sm"
                            >
                                {votes}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </motion.button>
            </div>
        );
    };

    Picture.propTypes = {
        photo: PropTypes.string.isRequired,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        isLikedId: PropTypes.bool,
        onLike: PropTypes.func.isRequired,
        deletePhoto: PropTypes.func,
        showUploadForm: PropTypes.func,
        replacingPhoto: PropTypes.func,
        votes: PropTypes.number
    };

    export default Picture;
