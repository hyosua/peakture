import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { EllipsisVertical } from "lucide-react";
import { useClickAway } from "react-use";

export default function EditDropdown({ actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useClickAway(dropdownRef, () => setIsOpen(false));

    return (
        <div className="relative inline-block " ref={dropdownRef}>
            {/* Bouton caché sur grand écran sauf au hover, et toujours visible sur mobile */}
            <button
                onClick={(e) => {
                    e.stopPropagation() // Empêche le clic de se propager au parent
                    setIsOpen((prev) => !prev)
                  }}
                className="lg:opacity-0 text-white group-hover:bg-black/20 group-hover:opacity-100 cursor-pointer transition-opacity duration-200 opacity-100 p-2 rounded-full"
                >
                <EllipsisVertical className="h-6 w-6" />
            </button>

            {isOpen && (
                <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 mt-2 w-48 bg-neutral shadow-lg rounded-xl border-2 border-gray-200"
                >
                <ul className="">
                    {actions.map((action, index) => (
                    <li key={index}>
                        <button
                          onClick={(e) => {
                              e.stopPropagation() 
                              action.onClick()
                              setIsOpen(false)
                          }}
                          className={`flex font-bold rounded-lg items-center gap-2 w-full px-4 py-2 text-sm hover:bg-base-100 ${
                          action.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          }`}
                          disabled={action.disabled}
                          title={action.label}
                          >
                          {action.icon} {action.label}
                        </button>
                    </li>
                    ))}
                </ul>
                </motion.div>
            )}
        </div>
    )
    
}

EditDropdown.propTypes = {
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.element.isRequired,
        onClick: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
      })
    ).isRequired,
  };

  
