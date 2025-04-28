import { useRef } from 'react';
import PropTypes from 'prop-types';
import confetti from 'canvas-confetti';
import { useInView } from 'framer-motion';

/**
 * A component that displays confetti when it enters the viewport
 * @param {Object} props
 * @param {string} props.id - Unique identifier for this confetti element
 * @param {React.ReactNode} props.children - The content to display
 * @param {Object} props.options - Optional confetti configuration options
 */
const ConfettiElement = ({ id, children, options = {} }) => {
  const elementRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  
  // Configure useInView to trigger at 70% visibility (equivalent to threshold: 0.7)
  const isInView = useInView(elementRef, { 
    once: true, 
    amount: 0.7 
  });

  const defaultOptions = {
    particleCount: 100,
    spread: 70,
    colors: ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FF69B4']
  };

  const confettiOptions = { ...defaultOptions, ...options };

  // Trigger confetti effect when element comes into view
  if (isInView && !hasTriggeredRef.current) {
    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2 / window.innerWidth;
    const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
    
    confetti({
      ...confettiOptions,
      origin: { x, y }
    });
    
    hasTriggeredRef.current = true;
  }

  return (
    <div ref={elementRef} id={`confetti-element-${id}`}>
      {children}
    </div>
  );
};

ConfettiElement.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  options: PropTypes.object
};

export default ConfettiElement;