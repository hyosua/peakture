import { useAuth } from '@/context/AuthContext.jsx';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Expand  } from "lucide-react";



const TieBreakView = ({ album, tiedPhotos, otherPhotos, onTieBreakVote, disabled }) => {
    const { currentUser } = useAuth();
    const isTieBreakJudge = currentUser?._id === album?.tieBreakJudge;
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [showFullscreen, setShowFullscreen] = useState(null);

    return( 
        <div className="flex flex-col items-center h-screen">
            {/*Finalistes*/}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-accent ">Finalistes</h1>
                {isTieBreakJudge ? (
                    <>
                        <h2 className="text-primary font-bold mb-2 text-center">
                            {currentUser.username}, à toi de départager.
                        </h2>
                        <p className="text-gray-500 m-4 mb-6">Choisis la photo qui mérite selon toi d&apos;atteindre le sommet</p>
                    </>
                    
                ) : (
                    <h2 className="text-agray-500 mb-4 text-center">
                        En attente de la décision du jury 
                    </h2>
                )}
                <div className={`p-2 m-2 grid grid-cols-2  md:grid-cols-${tiedPhotos.length > 2 ? "3" : "2"} gap-4 place-items-center mx-auto`}>
                    {tiedPhotos.map((photo) => (
                        <div key={photo._id} className={`indicator relative inline-block w-full transition-transform duration-300 ${photo._id === selectedPhoto ? "scale-105" : ""}  rounded-xl mb-2 lg:mb-10`}>
                            
                            
                            <span className={`indicator-item indicator-bottom indicator-center font-bold badge ${photo._id === selectedPhoto ? "badge-primary" : "badge-accent"} `}>
                            {photo.votes}
                            </span>
                            <button onClick={() => {
                                if (isTieBreakJudge) {
                                    setSelectedPhoto(photo._id);
                                }
                            }}>
                                <img
                                    src={photo.src}
                                    alt="Photo finaliste"
                                    className={`lg:max-w-sm h-auto object-cover  border-4 ${photo._id === selectedPhoto ? "border-primary" : "border-accent"}   rounded-2xl shadow-lg`}
                                />
                            </button>

                            {/* Bouton Plein écran */}
                            <span role="button"
                                    tabIndex={0} 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        setShowFullscreen(photo._id);
                                    }}
                                    className="absolute lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-4 right-2 cursor-pointer bg-black/50 text-white p-1 rounded-full hover:bg-black/80 z-20"
                                    title="Voir en plein écran"
                                >
                                    <Expand className="h-4 w-4" />
                            </span>

                            {/* Full Screen*/}
                            <AnimatePresence>
                            {showFullscreen === photo._id && (
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
                        
                            {currentUser?._id !== album?.tieBreakJudge && (
                                <div className="absolute -bottom-6 text-primary font-bold text-center">
                                    {photo.username}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {isTieBreakJudge && (
                    <button className={`lg:mt-4 mb-20 btn btn-primary ${
                        disabled || !selectedPhoto ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => {
                        if(selectedPhoto){
                        onTieBreakVote(selectedPhoto)
                    }}}
                    disabled={disabled || !selectedPhoto}
                    >Voter</button>
                )}
            </div>
            {/*Autres photos*/}
            {otherPhotos.length > 0 && (
                <div className='w-full max-w-6xl'>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 opacity-50 grayscale'>
                        {otherPhotos.map((photo) => (
                            <div key={photo._id} className="w-full group overflow-hidden rounded-xl shadow-lg relative mb-20 group inline-block">
                                <img
                                    key={photo._id}
                                    src={photo.src}
                                    alt="photo non finaliste"
                                    className="rounded-md w-full h-auto object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

TieBreakView.propTypes = {
    album: PropTypes.shape({
        tieBreakJudge: PropTypes.string,
    }).isRequired,
    tiedPhotos: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        })
    ).isRequired,
    otherPhotos: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        })
    ).isRequired,
    onTieBreakVote: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

export default TieBreakView;
