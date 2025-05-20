import { motion, useInView } from "framer-motion";
import { useRef } from 'react'
import { getMonthName } from '@/utils/dateConvert.js';
import ConfettiElement from '@/components/ui/ConfettiElement.jsx';
import WinnerBanner from '@/components/contest/WinnerBanner.jsx';
import EditDropdown from '@/components/ui/EditDropdown.jsx'
import {Edit, Trash, Vote} from 'lucide-react'
import PropTypes from 'prop-types';




const AlbumCard = ({ album, index, handleEdit, handleAlbumClick, isAdmin, setIsDeleteAlbumId, showCloseVotesConfirm }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.9 });

    return(
        <div
            ref={ref}
            className='relative'
            onClick={() => handleAlbumClick(album._id)}
        >
            <motion.div 
                className={`relative flex flex-col p-4 cursor-pointer border-2 bg-base-200 ${album.status === "closed" ? "border-secondary" : album.status === "tie-break" ? "border-accent" : "border-primary"} rounded-lg indicator group`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.6, y: 20 }}
                    transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass:1.2,
                    delay: index * 0.2,
                    duration: 0.9
                    }}
                >
                    <span className={`indicator-item badge " + ${(album.status === "closed" ? "badge-secondary" : album.status === "tie-break" ? "badge-accent" :"badge-primary")}`}>
                        {album.status === "closed" ? "Closed" : album.status === "tie-break" ? "Départage": "Open"}
                    </span>
                <h3 className='mb-2 font-semibold'>{getMonthName(album.month)}</h3>
                <img src={album.cover ? album.cover : "https://res.cloudinary.com/djsj0pfm3/image/upload/v1746696335/bat-empty-cover_jqwv0x.png"} 
                    alt={getMonthName(album.month)} 
                    className='w-full h-36  max-w-60 max-h-60 rounded-md object-cover mb-2' 
                />
                <h5 className='text-white mb-1'><i>{album.theme}</i></h5>

                {/* Winner Banner */}
                {album?.winner && (
                    <ConfettiElement 
                        id={album._id}
                        options={{
                            particleCount: 15,
                            gravity: 0.9,
                            scalar: 0.7,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#ff7d5d', '#9fe88d']
                        }}
                    >
                        <WinnerBanner winner={album?.winner} />
                    </ConfettiElement>
                )}

                {/* Edit Dropdown */}
                { isAdmin && (
                    <div className='absolute top-2 right-2'>
                        <EditDropdown
                            actions={[
                                {
                                label: "Modifier le thème",
                                icon: <Edit className="h-4 w-4" />,
                                disabled: false,
                                onClick: () => handleEdit(album),
                                },
                                {
                                    label: "Cloturer les votes",
                                    icon: <Vote className="h-4 w-4" />,
                                    disabled: album.status === "closed" || album.status === "tie-break",
                                    onClick: () => showCloseVotesConfirm(album._id),
                                    
                                },
                                {
                                label: "Supprimer",
                                icon: <Trash className="h-4 w-4 text-red-500" />,
                                disabled: false,
                                onClick: () => setIsDeleteAlbumId(album._id),
                                },
                                
                            ]}
                        />
                    </div>
                )}
                
            </motion.div>
        </div>
        
    )
}



export default AlbumCard

AlbumCard.propTypes = {
    album: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        month: PropTypes.number.isRequired,
        theme: PropTypes.string,
        cover: PropTypes.string,
        status: PropTypes.string.isRequired,
        winner: PropTypes.string,
    }).isRequired,
    index: PropTypes.number,
    handleEdit: PropTypes.func.isRequired,
    handleAlbumClick: PropTypes.func,
    isAdmin: PropTypes.bool.isRequired,
    setIsDeleteAlbumId: PropTypes.func.isRequired,
    showCloseVotesConfirm: PropTypes.func.isRequired,
};