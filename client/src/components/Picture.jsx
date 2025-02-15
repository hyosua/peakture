import { Heart, Mountain } from "lucide-react"
import { animate, motion } from "framer-motion";

const Picture = ({photo, id, isLiked, onLike}) => {

    return (
        <div className="relative inline-block">
            <motion.img 
                key={id} 
                src={photo} 
                alt={`Photo ${id}`} 
                className={`gallery-photo ${
                    isLiked ? "border-amber-700 border-4" : "border-0"
                }`} 
                initial={{ scale: 1 }}
                animate={{ scale: isLiked ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
            />
            <motion.button 
                onClick={() => onLike(id)} 
                className='like-button'
                whileHover={{ scale: 1.2, rotate: 9 }}
            >
                <Heart
                    className={`w-6 h-6 ${
                        isLiked ? "fill-amber-700 stroke-none" : "stroke-white"
                    }`}
                />
            </motion.button>
        </div>
    );
}

export default Picture;