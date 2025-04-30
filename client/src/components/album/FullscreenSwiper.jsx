import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState, useRef } from "react";
import { X, Play, Pause } from "lucide-react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import 'swiper/css/effect-fade';
import PropTypes from "prop-types";

const FullscreenSwiper = ({ photos, initialIndex, onClose }) => {

    const [isAutoplay, setIsAutoplay] = useState(false);
    const swiperRef = useRef(null);

    
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose(); // Close fullscreen
        } else if (e.key === "ArrowRight") {
          swiperRef.current?.slideNext();
        } else if (e.key === "ArrowLeft") {
          swiperRef.current?.slidePrev();
        } else if (e.key === " ") {
          // Space bar toggles autoplay
          setIsAutoplay(prev => !prev);
          e.preventDefault(); // Prevent page scrolling
        }
      };
    
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }, [onClose]);

      const toggleAutoplay = () => {
        setIsAutoplay(prev => !prev);
      };

      const autoplayConfig = {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
        enabled: isAutoplay
      };

      if (initialIndex === null) {
        return null;  // Ne pas afficher le composant si l'index est null
      }

      useEffect(() => {
        if (swiperRef.current) {
          // Cette méthode met à jour l'autoplay lorsque l'état change
          swiperRef.current.autoplay.stop();
          if (isAutoplay) {
            swiperRef.current.autoplay.start();
          }
        }
      }, [isAutoplay]);

    return (
      <div  className="fixed inset-0 bg-black z-50 flex items-center justify-center">

        {/* Close button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors duration-300"
          aria-label="Close fullscreen view"
        >
          <X size={24} />
        </button>
        
        {/* Play/Pause button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAutoplay();
          }}
          className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors duration-300"
          aria-label={isAutoplay ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoplay ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <Swiper
          initialSlide={initialIndex}
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          effect="fade" 
          fadeEffect={{ crossFade: true }}
          pagination={{ clickable: true,el: ".swiper-pagination" }}
          autoplay={autoplayConfig}
          navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}
          className="w-full h-full"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onClick={(e) => e.stopPropagation()} 
        >
          {photos.map((photo) => (
            <SwiperSlide key={photo._id}>
              <img
                src={photo.src}
                alt=""
                onClick={(e) => e.stopPropagation()} 
                className="w-full h-full object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
      </div>
    );
  };
FullscreenSwiper.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      src: PropTypes.string.isRequired,
    })
  ).isRequired,
  initialIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FullscreenSwiper;

