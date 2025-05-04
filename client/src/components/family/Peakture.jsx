import { useParams, useNavigate } from "react-router-dom";
import { Expand } from "lucide-react";
import Avatar from "@/components/user/Avatar";
import { useState, useEffect } from "react";

const Peakture = () => {
  const navigate = useNavigate();
  const { familyId } = useParams();
  const [peakture, setPeakture] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  // Working image you mentioned for fallback
  const fallbackImage = 'https://res.cloudinary.com/djsj0pfm3/image/upload/v1746286772/batgone-transp_ff1qk7.png';

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
        
        // Check orientation after data is loaded
        if (data && data.src) {
          const img = new Image();
          img.onload = () => {
            setIsPortrait(img.height > img.width);
          };
          img.src = data.src;
        }
      } catch (err) {
        console.error("Error fetching peakture:", err);
      }
    };
    
    getPeakture();
  }, [familyId]);

  // Safe handler for opening fullscreen
  const handleOpenFullscreen = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowFullscreen(true);
  };
  
  // Safe handler for closing fullscreen
  const handleCloseFullscreen = () => {
    setShowFullscreen(false);
  };

  // Get safe image source
  const getImageSrc = () => {
    return (peakture && peakture.src) ? peakture.src : fallbackImage;
  };

  if (!peakture) {
    return <div className="flex justify-center items-center min-h-screen p-4">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="relative w-80 md:w-96 lg:w-[450px] mx-auto my-8 p-6 flex flex-col items-center bg-base-200 rounded-xl overflow-hidden shadow-lg">
        <h1 className="font-bold text-3xl md:text-4xl text-center text-white mb-4 md:mb-6">
          Peakture
        </h1>

        <div className={`w-full overflow-hidden rounded-xl relative ${
          isPortrait ? "h-auto max-h-[70vh]" : "aspect-[4/3]"
        }`}>
          {/* Plain HTML img element without animations */}
          <img
            key={peakture._id}
            src={getImageSrc()}
            alt="Photo of the Month"
            className={`rounded-xl cursor-pointer ${
              isPortrait
                ? "h-full w-auto max-h-full mx-auto object-contain"
                : "w-full h-full object-cover"
            }`}
            onClick={() => navigate(`/album/${peakture.albumId}`)}
            onError={(e) => {
              console.error("Image failed to load, using fallback");
              e.target.src = fallbackImage;
              e.target.onerror = null; // Prevent infinite loops
            }}
            style={{ display: 'block' }}
          />

          <button
            onClick={handleOpenFullscreen}
            className="absolute top-3 right-3 cursor-pointer bg-black/20 text-gray-300 p-2 rounded-full hover:bg-black/80 z-20"
            title="Voir en plein écran"
          >
            <Expand className="h-5 w-5" />
          </button>
        </div>

        <div className="w-full mt-4 md:mt-6 flex gap-3 md:gap-4 justify-center items-center">
          <Avatar avatarSrc={peakture.userId?.avatar} />
          <h2 className="text-lg md:text-xl font-semibold">{peakture.username}</h2>
          <span className="mx-2 md:mx-4 text-primary text-lg md:text-xl font-semibold">
            {peakture.votes}
          </span>
        </div>
      </div>

      {/* Fullscreen modal */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 flex justify-center items-center z-50"
          onClick={handleCloseFullscreen}
        >
          <img
            src={getImageSrc()}
            alt="Fullscreen"
            className={`p-4 rounded-xl shadow-lg ${
              isPortrait ? "max-h-screen w-auto" : "max-w-full max-h-screen"
            }`}
            onError={(e) => {
              console.error("Fullscreen image failed to load");
              e.target.src = fallbackImage;
              e.target.onerror = null;
            }}
            style={{ display: 'block' }}
          />
        </div>
      )}
    </div>
  );
};

export default Peakture;