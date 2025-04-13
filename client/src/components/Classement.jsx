import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchClassement } from "../store/slices/classementSlice";

const Classement = () => {
    const dispatch = useDispatch();
    const {classement, loading, error } = useSelector((state) => state.classement);

    useEffect(() => {
        dispatch(fetchClassement());
    }, [dispatch])

    if(loading) return <span className="loading loading-infinity loading-xl"></span>
    if(error) return 
        <div role="alert" className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Erreur: {error}</span>
        </div>
    

    return (
        
        <div className="tabs tabs-lift">
            {/* Classement Annuel */}
            <input type="radio" name="annuel" className="tab" aria-label="Annuel" />
            <div className="tab-content bg-base-100 border-base-300 p-6">
                <ul className="list bg-base-100 rounded-box shadow-md mb-20">
    
                    <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Classement Annuel</li>
                    
                    {classement.map((user, index) => (
                        <li key={index} 
                            className={`list-row flex items-center p-4 border-b border-base-200 ${
                            index === 0 ? " border border-yellow-200 font-extrabold scale-105" : ""
                        }`}>
                            <div className={`text-4xl text-secondary font-thin opacity-60 tabular-nums ${
                                index === 0 ? "text-yellow-200" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-500" : "text-secondary"
                            }`}>{index+1}</div>
                            <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp"/></div>
                            <div className='list-grow'>
                                <div className="text-xs uppercase font-semibold opacity-60">{user.username}</div> 
                            </div>
                            <div className="text-2xl text-primary text-right ml-auto font-bold ">
                                {user.score}
                            </div>
                        </li>
                    ))}
                </ul>       
            </div>

            {/* Classement Mensuel */}
            <input type="radio" name="mensuel" className="tab" aria-label="Mensuel" defaultChecked />
            <div className="tab-content bg-base-100 border-base-300 p-6">Tab content 2</div>

        </div>
        
    )
}

export default Classement;