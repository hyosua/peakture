import { useParams, useNavigate } from "react-router-dom";
import { Expand  } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect } from "react";
import avatarPic from "../assets/img/avatars/avatar.jpg";

const Peakture = () => {
    const navigate = useNavigate();
    const {familyId} = useParams()
    const [peakture, setPeakture] = useState(null)
    const [showFullscreen, setShowFullscreen] = useState(false);


    useEffect(() => {
        const getPeakture = async () => {
            fetch(`${import.meta.env.VITE_API_URL}/api/family/${familyId}/peakture`)
            .then((res) => {
                if (!res.ok) {
                    if(res.status === 404) {
                        console.log("Aucun album trouvé")
                        return null
                    }
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }

                return res.json();
            })
            .then((data) => {
                setPeakture(data)
            })
            .catch((err) => console.error(err));
        }
        getPeakture();
    }, [familyId]);

    

    return (
        <>
        {peakture && (
            <div className='relative m-8 p-8 w-80 md:w-[500px] lg:w-96 flex flex-col group items-center bg-base-200 rounded-xl overflow-hidden shadow-lg'>
            <h1 className='font-bold text-4xl text-center mb-10'>Peakture</h1>
            <img key={peakture._id} 
                src={peakture.src} 
                alt={`Photo of the Month`} 
                className="w-full h-auto border-4 border-primary rounded-3xl"
                onClick={() => navigate(`/album/${peakture.albumId}`)} 
            />
                {/* Bouton Plein écran */}
                <span role="button"
                    tabIndex={0} 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        setShowFullscreen(true);
                    }}
                    className="absolute lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-8 right-6 cursor-pointer bg-black/20 text-grey-300 p-2 rounded-full hover:bg-black/80 z-20"
                    title="Voir en plein écran"
                >
                    <Expand className="h-6 w-6" />
                </span>
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
                                        src={peakture.src} 
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

            <div className='w-80 m-7 flex gap-4 justify-center items-center'>
                <img className='w-16 h-16 border-2 border-primary rounded-full object-cover' src={avatarPic} alt={"peakture winner"} /><h2 className="text-xl font-semibold">{peakture.username}</h2>
                <span className='m-4'><h4 className='text-primary text-xl font-semibold'>{peakture.votes}</h4></span>
            </div>
        </div>
        )}
        </>

    );
}

export default Peakture;