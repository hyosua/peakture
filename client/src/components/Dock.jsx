import { useNavigate, useLocation } from "react-router-dom";
import SettingsMenu from "./SettingsMenu";
import { useAuth } from '../context/AuthContext.jsx';


const Dock = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {currentUser} = useAuth()

    const currentPath = location.pathname;
    

    return (
        <div className="dock dock-sm lg:dock-lg">
            <button className={`${currentPath.includes("family") || currentPath === "/" ? "dock-active" : ""}`} onClick={() => navigate('/')}>
              <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" strokeLinejoin="miter" strokeLinecap="butt"><polyline points="1 11 12 2 23 11" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="2"></polyline><path d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2"></path><line x1="12" y1="22" x2="12" y2="18" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2"></line></g></svg>
            </button>
    
            <button className={`${currentPath === "/classement" ? "dock-active" : ""}`} disabled={!currentUser || currentUser?.sessionId} onClick={() => navigate('/classement')}>
              <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path fill="currentColor" d="M7 14H3v7h4v-7Zm7-9h-4v16h4V5Zm7 5h-4v11h4V10Z"/>
              </svg>
            </button>

            <SettingsMenu />
        </div>
    );
};

export default Dock;