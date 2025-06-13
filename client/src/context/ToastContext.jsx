import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const ToastContext = createContext();
export const ToastProvider = ({ children }) => {

  const [toast, setToast] = useState(null);

  const showToast = ({ message, type = "info", duration = 5000 }) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="toast z-50">
          <div className={`alert alert-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
export const useToast = () => useContext(ToastContext);
