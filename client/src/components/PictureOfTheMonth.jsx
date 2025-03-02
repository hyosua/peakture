import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import PropTypes from 'prop-types';
import avatarPic from "../assets/img/avatars/avatar.jpg";
const Picture = ({winner,photo, id, voteCount, avatar, month}) => {
    const navigate = useNavigate();

    return (
        
        <div className='w-[300px] md:w-[500px] lg:w-[700px] bg-primary rounded-xl overflow-hidden shadow-lg'>
            <h1 className='mb-10'>Peakture of the Month</h1>
            <img key={id} 
                src={photo} 
                alt={`Photo of the Month`} 
                className="w-full h-auto border-accent rounded-3xl"
                onClick={() => navigate(`/album/${month}`)} 
            />
            <div className='w-80 m-7 flex justify-center items-center'>
                <img className='w-16 h-16 border-2 border-white rounded-full object-cover' src={avatarPic} alt={winner} /><h2>{winner}</h2>
                <span className='m-4'><h4 className='text-amber-500'>{voteCount}</h4></span>
            </div>
        </div>
    );
}
Picture.propTypes = {
    winner: PropTypes.string.isRequired,
    photo: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    voteCount: PropTypes.number.isRequired,
    avatar: PropTypes.string,
    month: PropTypes.string.isRequired,
};

export default Picture;