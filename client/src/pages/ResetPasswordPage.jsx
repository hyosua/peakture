import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Loader from "@/components/ui/Loader";
import GoneLink from "./error/GoneLink";
import { motion } from 'framer-motion';
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify-reset-token?token=${token}`)
      .then(res => setIsValid(res.data.isValid))
      .catch(() => setIsValid(false))
      .finally(() => setIsLoading(false))
  }, [token])

  if(isLoading) return <Loader />
  if(isValid === false) return <GoneLink />

      return (
          <div className="min-h-screen bg-base-300 flex flex-col justify-center items-center p-4">
            <motion.div 
              className="card w-full max-w-md bg-base-100 shadow-xl"
              initial={{ scale : 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
              exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
            >
              <div className="card-body">
                <div className="flex justify-center">
                <motion.div
                    key="spying-bat-logo"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { duration: 0.3 } }}
                    exit={{ y: -100, opacity: 0, transition: { duration: 0.2 } }}
                >
                    <img 
                        src="https://res.cloudinary.com/djsj0pfm3/image/upload/v1746109401/spying-bat_apzxl6.png"
                        alt="Chauve-souris espionne" 
                        className="w-50 h-50 object-contain"
                    />
                    </motion.div>
                  <motion.h2 
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1, transition: { duration: 0.3 } }}
                      exit={{ y: -100, opacity: 0, transition: { duration: 0.2 } }}
                      key="forgot-password-title"
                      className="card-title text-center text-2xl font-bold text-primary">
                          Changement de mot de passe
                  </motion.h2>
                </div>
                
  
                  <div>
  
                    <motion.div 
                        key="password-form"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ 
                          x: 0,
                          opacity: 1, 
                          transition: { 
                            x: { duration: 0.2, ease: "easeOut", delay: 0.1 },
                            opacity: { duration: 0.2, ease: "easeIn",delay: 0.1 },
                          }
                        }}
                    >
                        <ResetPasswordForm 
                            resetToken={token}
                        />
                    </motion.div>
                  </div>
                
                <div className="divider my-4">OU</div>
                
                <div className="text-center">
                  <a href="https://www.peakture.fr/?showLoginForm=true" className="link link-hover text-accent">Retour à la connexion</a>
                </div>
              </div>
            </motion.div>
          </div>
      );
}
export default ResetPasswordPage;