import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext.jsx"
import { X } from "lucide-react"


const ResetPasswordForm = ({ resetToken }) => {
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const {showToast} = useToast()
    const navigate = useNavigate()

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                if (password !== confirmPassword) {
                    showToast({ message: "Les mots de passe ne correspondent pas", type: "error" });
                    return;
                }
                if (password.length < 6) {
                    showToast({ message: "Le mot de passe doit contenir au moins 6 caractères", type: "error" });
                    return;
                }
                setLoading(true);
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ resetToken, password }),
                });
                const data = await response.json();
                if(data.success) {
                    showToast({ message: data.message, type: "success" });
                    setTimeout(() => {
                         navigate("/?showLoginForm=true")
                    }, 3000);
                }else {
                    showToast({ message: data.message, type: "error" });
                }
            }catch(error){
                console.error('Error sending password:', error);
                if (error.response) {
                    console.error('Error details:', error.response.data);
                    console.error('Status:', error.response.status);
                }
            }
        }

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
          };

    return(
        <>
            <div className="form-control mb-4">
                <label className="label hidden">
                <span className="label-text">Nouveau mot de passe</span>
                </label>
                <div className="relative">
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Nouveau mot de passe" 
                    className="input input-bordered w-full pr-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                    type="button"
                    tabIndex={"-1"} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                >
                    {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content opacity-70" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content opacity-70" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                    )}
                </button>
                </div>
                <p className="text-xs mt-1 text-base-content opacity-60">
                Minimum 6 caractères
                </p>
            </div>
            
            <div className="form-control mb-6">
                <label className="label hidden">
                <span className="label-text">Confirmer le mot de passe</span>
                </label>
                <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Confirmation du mot de passe" 
                className="input input-bordered w-full" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            
            <div className="form-control mt-2">
                <button 
                className={`relative btn btn-primary w-full`}
                disabled={loading}
                onClick={handleSubmit}
                >
                {loading ? (
                    <span className="loading-md loading loading-spinner text-primary"></span>

                ) : "Réinitialiser"}
                </button>
            </div>
        </>
    )
}
export default ResetPasswordForm