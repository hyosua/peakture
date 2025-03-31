import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import avatarPic from "../assets/img/avatars/avatar.jpg";

const Peakture = () => {
    const navigate = useNavigate();
    const {familyId} = useParams()
    const [peakture, setPeakture] = useState(null)

    useEffect(() => {
        const getPeakture = async () => {
            fetch(`http://localhost:5000/api/family/${familyId}/peakture`)
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
                console.log("Data:",data)
                setPeakture(data)
            })
            .catch((err) => console.error(err));
        }
        getPeakture();
    }, [familyId]);

    

    return (
        <>
        {peakture && (
            <div className='m-8 p-8 w-80 md:w-[500px] lg:w-96 flex flex-col items-center bg-base-200 rounded-xl overflow-hidden shadow-lg'>
            <h1 className='font-bold text-4xl text-center mb-10'>Peakture</h1>
            <img key={peakture._id} 
                src={peakture.src} 
                alt={`Photo of the Month`} 
                className="w-full h-auto border-4 border-primary rounded-3xl"
                onClick={() => navigate(`/album/${peakture.albumId}`)} 
            />
            <div className='w-80 m-7 flex gap-4 justify-center items-center'>
                <img className='w-16 h-16 border-2 border-primary rounded-full object-cover' src={avatarPic} alt={"peakture winner"} /><h2 className="text-xl font-semibold">{peakture.username}</h2>
                <span className='m-4'><h4 className='text-primary text-xl font-semibold'>{peakture.votes}</h4></span>
            </div>
        </div>
        )}
        </>

    );
}

export default Peakture;