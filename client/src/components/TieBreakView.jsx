import { useAuth } from '../context/AuthContext.jsx';
import PropTypes from 'prop-types';
import { useState } from 'react';

const TieBreakView = ({ album, tiedPhotos, otherPhotos, onTieBreakVote, disabled }) => {
    const { currentUser } = useAuth();
    const isTieBreakJudge = currentUser?._id === album?.tieBreakJudge;
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    return( 
        <div className="flex flex-col items-center h-screen">
            {/*Finalistes*/}
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Finalistes</h1>
                {isTieBreakJudge && (
                    <>
                        <h2 className="text-accent font-bold mb-2 text-center">
                            {currentUser.username}, à toi de départager.
                        </h2>
                        <p className="text-gray-500 m-4 mb-6">Choisis la photo qui mérite selon toi d&apos;atteindre le sommet</p>
                    </>
                    
                )}
                <div className='m-2 grid grid-cols-2  md:grid-cols-3 gap-4'>
                    {tiedPhotos.map((photo) => (
                        <div key={photo._id} 
                            className="w-full group overflow-hidden rounded-xl  relative mb-4 group inline-block">
                            <img
                                src={photo.src}
                                alt="Photo finaliste"
                                className={`w-full h-auto object-cover transition-transform border-4 border-accent duration-300 group-hover:scale-105 rounded-lg shadow-lg`}
                            />
                            {isTieBreakJudge && (
                                <div className="indicator-item indicator-bottom ">
                                    <input type="radio" 
                                        name="selectedPhoto" 
                                        className="mt-2 radio radio-accent" 
                                        value={photo._id}
                                        checked={selectedPhoto === photo._id}
                                        onChange={() => setSelectedPhoto(photo._id)}
                                    />

                                
                              </div>
                            )}
                        </div>
                        
                    ))}
                </div>
                {isTieBreakJudge && (
                    <button className={`btn btn-accent ${
                        disabled || !selectedPhoto ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => {
                        if(selectedPhoto){
                        onTieBreakVote(selectedPhoto)
                    }}}
                    disabled={disabled || !selectedPhoto}
                    >Voter</button>
                )}
            </div>
            {/*Autres photos*/}
            {otherPhotos.length > 0 && (
                <div className='w-full max-w-6xl'>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 opacity-50 grayscale'>
                        {otherPhotos.map((photo) => (
                            <div key={photo._id} className="w-full group overflow-hidden rounded-xl shadow-lg relative mb-20 group inline-block">
                                <img
                                    key={photo._id}
                                    src={photo.src}
                                    alt="photo non finaliste"
                                    className="rounded-md w-full h-auto object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

TieBreakView.propTypes = {
    album: PropTypes.shape({
        tieBreakJudge: PropTypes.string,
    }).isRequired,
    tiedPhotos: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        })
    ).isRequired,
    otherPhotos: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        })
    ).isRequired,
    onTieBreakVote: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

export default TieBreakView;
