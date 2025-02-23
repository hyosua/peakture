import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { EllipsisVertical } from "lucide-react";
import { useClickAway } from "react-use";

export default function EditDropdown({ actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useClickAway(dropdownRef, () => setIsOpen(false));

    return (
        <div className="relative inline-block " ref={dropdownRef}>
            {/* Bouton caché sur grand écran sauf au hover, et toujours visible sur mobile */}
            <button
                onClick={(e) => {
                    e.stopPropagation() // Empêche le clic de se propager au parent
                    setIsOpen((prev) => !prev)
                  }}
                className="lg:opacity-0 bg-emerald-400 hover:bg-emerald-400 group-hover:opacity-80 cursor-pointer transition-opacity duration-200 opacity-80 p-2 rounded-full"
                >
                <EllipsisVertical className="h-5 w-5" />
            </button>

            {isOpen && (
                <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl border border-gray-200"
                >
                <ul className="py-1">
                    {actions.map((action, index) => (
                    <li key={index}>
                        <button
                        onClick={(e) => {
                            e.stopPropagation() // Empêche le clic de se propager au parent
                            action.onClick();
                            setIsOpen(false);
                        }}
                        className="flex cursor-pointer items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
      })
    ).isRequired,
  };

  
