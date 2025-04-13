import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchClassement } from "../store/slices/classementSlice";
import { useAuth } from "../context/AuthContext";
import { fetchClassementAlbum } from "../store/slices/classementAlbumSlice";
import { motion } from 'framer-motion'
import ClassementVide from "./ClassementVide";

const Classements = () => {
    const dispatch = useDispatch();
    const { currentFamily } = useAuth()
    const {rankings, loading, error } = useSelector((state) => state.classement);
    const {albumRankings, albumLoading, albumError } = useSelector((state) => state.classementAlbum);
    const [activeTab, setActiveTab] = useState("mensuel")

    useEffect(() => {
        if(currentFamily){
            dispatch(fetchClassement(currentFamily.family._id));
            dispatch(fetchClassementAlbum(currentFamily.family._id))
        }
    }, [dispatch, currentFamily])

    if(loading || albumLoading) return <span className="loading loading-infinity loading-xl"></span>
    
    const handleChange = (e) => {
        setActiveTab(e.target.value)
    }

    const container = {
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      };
      
      const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      };

    return (
        
        <div className="tabs tabs-lift p-4">
            {/* Classement Annuel */}
            <input type="radio" name="classement" className="tab" aria-label="Annuel" checked={activeTab === "annuel"} value="annuel" onChange={handleChange} />
            <div className="tab-content bg-base-100 border-base-300 p-6">

                {error && activeTab === "annuel" ? (
                    <ClassementVide key="annuel" />
                ) : activeTab === "annuel" ? (
                    <motion.ul
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="list bg-base-100 rounded-box shadow-md mb-20"
                        >
                        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                            Classement Annuel
                        </li>

                        {rankings?.map((user, index) => (
                            <motion.li
                            key={index}
                            variants={item}
                            className={`list-row flex items-center p-4 border-b border-base-200 ${
                                index === 0
                                ? " border border-yellow-200 font-extrabold "
                                : ""
                            }`}
                            >
                            <div
                                className={`text-4xl text-secondary font-thin opacity-60 tabular-nums ${
                                index === 0
                                    ? "text-yellow-200"
                                    : index === 1
                                    ? "text-slate-400"
                                    : index === 2
                                    ? "text-amber-500"
                                    : "text-secondary"
                                }`}
                            >
                                {index + 1}
                            </div>
                            <div>
                                <img
                                className="size-10 rounded-box"
                                src="https://img.daisyui.com/images/profile/demo/1@94.webp"
                                />
                            </div>
                            <div className="list-grow">
                                <div className="text-xs uppercase font-semibold opacity-60">
                                {user.username}
                                </div>
                            </div>
                            <div className="text-2xl text-primary text-right ml-auto font-bold">
                                {user.score}
                            </div>
                            </motion.li>
                        ))}
                        </motion.ul>      
                     ): ( <></>)
                }
            </div>


            {/* Classement Mensuel */}
            <input type="radio" name="classement" className="tab" aria-label="Mensuel"  value="mensuel" onChange={handleChange} checked={activeTab === "mensuel"} />
            <div className="tab-content bg-base-100 border-base-300 p-6">
            {albumError && activeTab ==="mensuel" ? (
                        <ClassementVide key="mensuel"/>
                ) : (
                <>
                    
                        <ul className="list bg-base-100 rounded-box shadow-md mb-20">
            
                            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide" >Classement Mensuel</li>
                            
                            {albumRankings?.map((user, index) => (
                                <li key={index} 
                                    className={`list-row flex items-center p-4 border-b border-base-200 ${
                                    index === 0 ? " border border-yellow-200 font-extrabold " : ""
                                }`}>
                                    <div className={`text-4xl text-secondary font-thin opacity-60 tabular-nums ${
                                        index === 0 ? "text-yellow-200" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-500" : "text-secondary"
                                    }`}>{index+1}</div>
                                    <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp"/></div>
                                    <div className='list-grow'>
                                        <div className="text-xs uppercase font-semibold opacity-60">{user.username}</div> 
                                    </div>
                                    <div className="text-2xl text-primary text-right ml-auto font-bold ">
                                        {user.votes}
                                    </div>
                                </li>
                            ))}
                        </ul>       
                </>
            )}
        </div>



        </div>
        
    )
}

export default Classements;