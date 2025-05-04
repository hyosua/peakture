import { useParams, useNavigate } from "react-router-dom";
import { Expand } from "lucide-react";
import { motion } from "framer-motion";
import Avatar from "@/components/user/Avatar";
import { useState, useEffect, useRef } from "react";

const Peakture = () => {
  const navigate = useNavigate();
  const { familyId } = useParams();
  const [peakture, setPeakture] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const imgRef = useRef(null);

  // Use a proven working image as fallback
  const fallbackImage = 'https://res.cloudinary.com/djsj0pfm3/image/upload/v1746356352/not-found_ganlxz.png';

  // Pre-load the fallback image to ensure it's in cache
  useEffect(() => {
    const preloadFallback = new Image();
    preloadFallback.src = fallbackImage;
  }, []);

  useEffect(() => {
    if (peakture && peakture.src) {
      // Create an image object to test loading
      const img = new Image();
      
      img.onload = () => {
        setIsPortrait(img.height > img.width);
        setImageLoaded(true);
        setImageFailed(false);
      };
      
      img.onerror = () => {
        console.error("Image failed to load:", peakture.src);
        setImageFailed(true);
        // Immediately set fallback
        if (imgRef.current) {
          imgRef.current.src = fallbackImage;
        }
      };
      
      // Set crossOrigin attribute to handle potential CORS issues
      img.crossOrigin = "anonymous";
      img.src = peakture.src;
    }
  }, [peakture]);

  useEffect(() => {
    const getPeakture = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/family/${familyId}/peakture`);
        
        if (!res.ok) {
          if (res.status === 404) {
            console.log("Aucun album trouvé");
            return;
          }
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();
        setPeakture(data);
      } catch (err) {
        console.error("Error fetching peakture:", err);
      }
    };
    
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
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Handler for fullscreen view that's iOS-safe
  const handleFullscreenClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowFullscreen(true);
  };

  // Handler for closing fullscreen that's iOS-safe
  const handleCloseFullscreen = (e) => {
    if (e) {
      e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    setShowFullscreen(false);
  };

  const getImageSource = () => {
    if (!peakture || !peakture.src || imageFailed) {
      return fallbackImage;
    }
    return peakture.src;
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      {peakture && (
        <div className="relative w-80 md:w-96 lg:w-[450px] mx-auto my-8 p-6 flex flex-col items-center bg-base-200 rounded-xl overflow-hidden shadow-lg">
          <h1 className="font-bold text-3xl md:text-4xl text-center text-white mb-4 md:mb-6">
            Peakture
          </h1>

          <motion.div
            className={`w-full overflow-hidden rounded-xl relative ${
              isPortrait ? "h-auto max-h-[70vh]" : "aspect-[4/3]"
            }`}
            variants={itemVariants}
            initial="visible"
            animate="visible"
          >
            <motion.img
              ref={imgRef}
              key={peakture._id}
              src={getImageSource()}
              alt="Photo of the Month"
              className={`rounded-xl cursor-pointer ${
                isPortrait
                  ? "h-full w-auto max-h-full mx-auto object-contain"
                  : "w-full h-full object-cover"
              }`}
              onClick={() => navigate(`/album/${peakture.albumId}`)}
              variants={imageVariants}
              onLoad={(e) => {
                console.log("Image loaded successfully");
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error("Main image failed to load");
                setImageFailed(true);
                e.target.src = fallbackImage;
                e.target.onerror = null; // Prevent infinite error loop
              }}
              crossOrigin="anonymous"
              loading="eager"
              decoding="async"
            />

            <button
              onClick={handleFullscreenClick}
              className="absolute top-3 right-3 cursor-pointer bg-black/20 text-gray-300 p-2 rounded-full hover:bg-black/80 z-20"
              title="Voir en plein écran"
            >
              <Expand className="h-5 w-5" />
            </button>
          </motion.div>

          <div className="w-full mt-4 md:mt-6 flex gap-3 md:gap-4 justify-center items-center">
            <Avatar avatarSrc={peakture.userId?.avatar} />
            <h2 className="text-lg md:text-xl font-semibold">{peakture.username}</h2>
            <span className="mx-2 md:mx-4 text-primary text-lg md:text-xl font-semibold">
              {peakture.votes}
            </span>
          </div>
        </div>
      )}

      {/* Single fullscreen implementation using motion.div */}
      {showFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/90 flex justify-center items-center z-50"
          onClick={handleCloseFullscreen}
        >
          <motion.img
            src={getImageSource()}
            alt="Fullscreen"
            className={`p-4 rounded-xl shadow-lg ${
              isPortrait ? "max-h-screen w-auto" : "max-w-full max-h-screen"
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onLoad={(e) => console.log("Fullscreen image loaded")}
            onError={(e) => {
              console.error("Fullscreen image failed to load");
              e.target.src = fallbackImage;
              e.target.onerror = null; // Prevent infinite error loop
            }}
            crossOrigin="anonymous"
            loading="eager"
            decoding="async"
          />
        </motion.div>
      )}
    </div>
  );
};

export default Peakture;