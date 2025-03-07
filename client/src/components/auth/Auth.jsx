import '../../App.css';
import { useState } from 'react'
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion'
import Login from './Login.jsx'
import SignUp from './Signup.jsx'

const Auth = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <AnimatePresence>
        <motion.div className='fixed inset-0 min-h-screen flex items-center justify-center bg-base-200/20 backdrop-blur-sm z-50'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
        >
          {/* Conteneur principal */}
          <div className="w-96 m-4 h-auto perspective-1000 flex items-center justify-center">
            {/* Conteneur qui va tourner */}
            <motion.div 
              className="w-full h-full flex items-center relative preserve-3d"
              animate={{ rotateY: isSignUp ? 180 : 0 }}
              transition={{ 
                duration: 0.6,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
            <div className="absolute w-full backface-hidden" style={{ backfaceVisibility: "hidden" }}>
              <Login 
                onClose={onClose}
                onLoginSuccess={onLoginSuccess}
                onSwitchToSignup={() => setIsSignUp(true)}
                />
            </div>
            
            <div 
              className="absolute w-full" 
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)" 
              }}
            >
              <SignUp 
                onClose={onClose}
                onSwitchToLogin={() => setIsSignUp(false)}
                />
            </div>

            </motion.div>
          </div>
        </motion.div>
    </AnimatePresence>
    
  )
}
Auth.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
};

export default Auth