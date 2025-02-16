import { NavLink } from "react-router-dom";

const Navbar = () => {
    return (
        <div>
            <nav className="flex justify-between items-center p-4 bg-emerald-600 text-white">
                <NavLink to="/">
                    {/* <img alt="Peakture logo" className="h-10 inline" src="../assets/img/logo.png" />  */}
                    Home   
                </NavLink>

                <NavLink to="/admin/create" className="inline-flex items-center justify-center whitespace-nowrap text-md ring-offset-background 
                transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-2 focus-visible:ring-offset-background 
                focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:ring-opacity-60 disabled:pointer-events-none
                disabled:opacity-50 border border-input bg-background-hover hover:bg-emerald-400 h-9 rounded-md px-4"> 
                    Add Album 
                </NavLink>
            </nav>
        </div>
    )   
}