import { useParams, useNavigate } from "react-router-dom";
import { Expand  } from "lucide-react";
import { motion } from "framer-motion";

import { useState, useEffect } from "react";



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

    
    // Variants pour les animations
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: 0.8,
            staggerChildren: 0.2,
            when: "beforeChildren"
        }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const imageVariants = {
        hidden: { 
        opacity: 0, 
        scale: 0.9,
        filter: "brightness(0.4) contrast(1.1)" 
        },
        visible: { 
        opacity: 1, 
        scale: 1,
        filter: "brightness(1) contrast(1)",
        transition: { 
            duration: 1.2,
            ease: "easeOut"
        }
        }
    };

return (
    <div className="flex justify-center items-center min-h-screenp-4">
      {peakture && (
  <motion.div 
    className="relative w-80 md:w-96 lg:w-[450px] mx-auto my-8 p-6 flex flex-col group items-center bg-base-200 rounded-xl overflow-hidden shadow-lg"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {/* Contenu de la carte */}
    <motion.h1 
      className="font-bold text-3xl md:text-4xl text-center mb-4 md:mb-6"
      variants={itemVariants}
    >
      Peakture
    </motion.h1>
    
    <motion.div 
      className="w-full aspect-[4/3] overflow-hidden rounded-xl relative"
      variants={itemVariants}
    >
      <motion.img
        key={peakture._id} 
        src={peakture.src} 
        alt="Photo of the Month" 
        className="w-full h-full object-cover rounded-xl cursor-pointer"
        onClick={() => navigate(`/album/${peakture.albumId}`)}
        variants={imageVariants}
      />
      
      <motion.span 
        role="button"
        tabIndex={0} 
        onClick={(e) => {
          e.stopPropagation(); 
          setShowFullscreen(true);
        }}
        className="absolute top-3 right-3 cursor-pointer bg-black/20 text-gray-300 p-2 rounded-full hover:bg-black/80 z-20 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        title="Voir en plein écran"
        variants={itemVariants}
      >
        <Expand className="h-5 w-5" />
      </motion.span>
    </motion.div>
    
    <motion.div 
      className="w-full mt-4 md:mt-6 flex gap-3 md:gap-4 justify-center items-center"
      variants={itemVariants}
    >
      <motion.img 
        className="w-12 h-12 md:w-16 md:h-16 border-3 border-warning rounded-full object-cover"
        src={peakture.userId?.avatar} 
        alt="peakture winner"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          delay: 1,
          duration: 0.5,
          type: "spring",
          stiffness: 200
        }}
      />
      <motion.h2 
        className="text-lg md:text-xl font-semibold"
        variants={itemVariants}
      >
        {peakture.username}
      </motion.h2>
      <motion.span 
        className="mx-2 md:mx-4"
        variants={itemVariants}
      >
        <motion.h4 
          className="text-warning text-lg md:text-xl font-semibold"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { delay: 1.2, duration: 0.5 }
          }}
        >
          {peakture.votes}
        </motion.h4>
      </motion.span>
    </motion.div>
  </motion.div>
)}

      <motion.div
        initial={false}
        animate={{ opacity: showFullscreen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ 
          display: showFullscreen ? 'flex' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}
        onClick={() => setShowFullscreen(false)}
      >
        <motion.img 
          src={peakture?.src} 
          alt="Fullscreen"
          className="max-w-full max-h-screen p-4 rounded-xl shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: showFullscreen ? 1 : 0.8, opacity: showFullscreen ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
}

export default Peakture;