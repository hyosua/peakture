import { useToast } from "@/context/ToastContext.jsx"
import { useState } from "react"
import { X } from "lucide-react"
import ValidateMail from "./ValidateMail"
import { motion, AnimatePresence } from 'framer-motion';
import ResetPasswordForm from "./ResetPasswordForm"


const ForgotPassword = () => {

    const [emailData, setEmailData] = useState({email: "", isValid: false})

    const handleEmailData = ({email, isValid}) => {
        setEmailData({email, isValid} )
    }

    return (
        <div className="min-h-screen bg-base-300 flex flex-col justify-center items-center p-4">
          <motion.div 
            className="card w-full max-w-md bg-base-100 shadow-xl"
            initial={{ scale : 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
          >
            <div className="card-body">
              <div className="flex justify-center mb-6">
                <AnimatePresence mode="wait">
                    ${emailData.isValid ? (
                        <motion.div
                            key="spying-bat-logo"
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1, transition: { duration: 0.3 } }}
                            exit={{ y: -100, opacity: 0, transition: { duration: 0.2 } }}
                        >
                            <img 
                                src="https://res.cloudinary.com/djsj0pfm3/image/upload/v1746109401/spying-bat_apzxl6.png"
                                alt="Chauve-souris espionne" 
                                className="w-32 h-32 object-contain"
                            />
                            </motion.div>
                    ) : (
                        <motion.div
                            key="lost-bat-logo"
                            initial={{ y: -100, opacity: 0, transition: { duration: 0.3 } }}
                            animate={{ y: 0, opacity: 1, transition: { duration: 0.3 }, delay: 0.4 } }
                            exit={{ y: -100, opacity: 0, transition: { duration: 0.2 } }}
                        >
                            <img 
                                src="https://res.cloudinary.com/djsj0pfm3/image/upload/v1746109401/lost-bat_gviw1q.png"
                                alt="Chauve-souris perdue" 
                                className="w-32 h-32 object-contain"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.h2 
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { duration: 0.3 } }}
                    exit={{ y: -100, opacity: 0, transition: { duration: 0.2 } }}
                    key="forgot-password-title"
                    className="card-title text-center text-2xl font-bold text-primary mb-2">
                        Mot de passe oublié?
                </motion.h2>
              </div>
              

                <div>

                  <AnimatePresence mode="wait">
                    {emailData.isValid ? (
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
                                emailData={emailData}
                            />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="email-form"
                                initial={{ x: 0, opacity: 1 }}
                                exit={{ 
                                  x: -100,
                                  opacity: 0, 
                                  transition: { 
                                    x: { duration: 0.2, ease: "easeInOut" },
                                    opacity: { duration: 0.1, ease: "easeOut" },
                                  }
                                }}
                                style={{ overflow: "hidden" }}
                            >
                                 <ValidateMail onInputChange={handleEmailData}/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              
              <div className="divider my-4">OU</div>
              
              <div className="text-center">
                <a href="/" className="link link-hover text-primary">Retour à la connexion</a>
              </div>
            </div>
          </motion.div>
        </div>
    );
}   
export default ForgotPassword;