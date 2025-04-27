// ConfettiElement.jsx
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import confetti from 'canvas-confetti';

/**
 * A component that displays confetti when it enters the viewport
 * @param {Object} props
 * @param {string} props.id - Unique identifier for this confetti element
 * @param {React.ReactNode} props.children - The content to display
 * @param {Object} props.options - Optional confetti configuration options
 */
const ConfettiElement = ({ id, children, options = {} }) => {
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  const defaultOptions = {
    particleCount: 100,
    spread: 70,
    colors: ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FF69B4']
  };

  const confettiOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    // Reset triggered state when id changes
    hasTriggeredRef.current = false;
  }, [id]);
  
  useEffect(() => {
    // Create IntersectionObserver instance
    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      
      if (entry?.isIntersecting && !hasTriggeredRef.current) {
        triggerConfetti(entry.target);
        hasTriggeredRef.current = true;
        
        // Stop observing after triggering
        if (observerRef.current && elementRef.current) {
          observerRef.current.unobserve(elementRef.current);
        }
      }
    }, { threshold: 0.7 });

    // Start observing the element
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    // Cleanup on component unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const triggerConfetti = (element) => {
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.right) / 2 / window.innerWidth;
    const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
    
    confetti({
      ...confettiOptions,
      origin: { x, y }
    });
  };

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
