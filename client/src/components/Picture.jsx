import { Heart, Mountain } from "lucide-react"
import PropTypes from 'prop-types';
import { animate, motion } from "framer-motion";

const Picture = ({photo, id, isLiked, onLike, votes}) => {
    
    return (
        <div className="relative inline-block">
            <motion.img 
                key={id} 
                src={photo} 
                alt={`Photo ${id}`} 
                className={`gallery-photo ${
                    isLiked ? "border-emerald-400 border-4" : "border-0"
                }`} 
                initial={{ scale: 1 }}
                animate={{ scale: isLiked ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
            />
            <motion.button 
                onClick={() => onLike(id)} 
                className='like-button'
                whileHover={{ scale: 1.2 }}
            >
                <Heart
                    className={`w-6 h-6 ${
                        isLiked ? "fill-emerald-400 stroke-none" : "stroke-white"
                    }`}
                />
                <span className="text-emerald-400 font-bold text-sm">{votes}</span>
            </motion.button>
        </div>
    );
}

Picture.propTypes = {
    photo: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    isLiked: PropTypes.bool,
    onLike: PropTypes.func.isRequired,
    votes: PropTypes.number
};

export default Picture;
