import { useParams, useNavigate } from "react-router-dom";
import { Expand } from "lucide-react";
import { motion } from "framer-motion";
import Avatar from "@/components/user/Avatar";
import { useState, useEffect } from "react";

const Peakture = () => {
  const navigate = useNavigate();
  const { familyId } = useParams();
  const [peakture, setPeakture] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (peakture) {
      const img = new Image();
      img.onload = () => {
        setIsPortrait(img.height > img.width);
      };
      img.src = peakture.src;
    }
  }, [peakture]);

  useEffect(() => {
    const getPeakture = async () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/family/${familyId}/peakture`)
        .then((res) => {
          if (!res.ok) {
            if (res.status === 404) {
              console.log("Aucun album trouvé");
              return null;
            }
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setPeakture(data);
        })
        .catch((err) => console.error(err));
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

  // Handler to prevent event propagation for Safari fullscreen issue
  const handleFullscreenClick = (event) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    setShowFullscreen(true);
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
    >
      <motion.img
        key={peakture._id}
        src="https://res.cloudinary.com/djsj0pfm3/image/upload/v1746286772/batgone-transp_ff1qk7.png"
        alt="Photo of the Month"
        className={`rounded-xl cursor-pointer ${
          isPortrait
            ? "h-full w-auto max-h-full mx-auto object-contain"
            : "w-full h-full object-cover"
        }`}
        onClick={() => navigate(`/album/${peakture.albumId}`)}
        variants={imageVariants}
      />

      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setShowFullscreen(true);
        }}
        className="absolute top-3 right-3 cursor-pointer bg-black/20 text-gray-300 p-2 rounded-full hover:bg-black/80 z-20"
        title="Voir en plein écran"
      >
        <Expand className="h-5 w-5" />
      </span>
    </motion.div>

    <div className="w-full mt-4 md:mt-6 flex gap-3 md:gap-4 justify-center items-center">
      <Avatar avatarSrc={peakture.userId?.avatar} />
      <h2 className="text-lg md:text-xl font-semibold">{peakture.username}</h2>
      <span className="mx-2 md:mx-4 text-primary text-lg md:text-xl font-semibold">
        {peakture.votes}
      </span>
    </div>

    {showFullscreen && (
      <div
        className="fixed inset-0 bg-black/90 flex justify-center items-center z-50"
        onClick={() => setShowFullscreen(false)}
      >
        <img
          src={peakture.src}
          alt="Fullscreen"
          className={`p-4 rounded-xl shadow-lg ${
            isPortrait ? "max-h-screen w-auto" : "max-w-full max-h-screen"
          }`}
          onError={(e) => {
            console.error("Fullscreen image failed to load");
            e.target.src = 'https://res.cloudinary.com/djsj0pfm3/image/upload/v1746356352/not-found_ganlxz.png';
          }}
        />
      </div>
    )}
  </div>
)}


      <motion.div
        initial={false}
        animate={{ opacity: showFullscreen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: showFullscreen ? "flex" : "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.9)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
        }}
        onClick={() => setShowFullscreen(false)}
      >
        <motion.img
          src={peakture?.src}
          alt="Fullscreen"
          className={`p-4 rounded-xl shadow-lg ${
            isPortrait ? "max-h-screen w-auto" : "max-w-full max-h-screen"
          }`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: showFullscreen ? 1 : 0.8, opacity: showFullscreen ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
};

export default Peakture;