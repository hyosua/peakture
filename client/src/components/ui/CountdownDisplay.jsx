import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CountdownDisplay = ({ item, onCountdownEnd }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if(!item?.expiresAt) return;

        const timer = setInterval(() => {
            const now = new Date();
            const expiresAt = new Date(item.expiresAt);
            const remaining = expiresAt.getTime() - now.getTime();

            if (remaining <= 0) {
                clearInterval(timer);
                setTimeLeft(null);
                onCountdownEnd();
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [item, onCountdownEnd]);

    const getCurrentCountdown = () => {
        if (!timeLeft) return null;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        return {days, hours, minutes, seconds};
    };

    const currentCountdown = getCurrentCountdown();

    if(item?.status !== "countdown" || !currentCountdown) {
        return null; // No countdown to display
    }
  
    return (
    <div className=" rounded-lg p-2">
      
      <div className="grid grid-flow-col gap-2 text-center auto-cols-max justify-center">
        {currentCountdown.days > 0 && (
          <div className="flex flex-col p-2 bg-error/5 rounded text-error">
            <span className="countdown font-mono text-xl">
              <span style={{"--value": currentCountdown.days}}>
                {currentCountdown.days}
              </span>
            </span>
          </div>
        )}
        
        <div className="flex flex-col p-2 bg-error/5 rounded text-error">
          <span className="countdown font-mono text-xl">
            <span style={{"--value": currentCountdown.hours}}>
              {currentCountdown.hours}
            </span>
          </span>
        </div>

        <div className="flex flex-col p-2 bg-error/5 rounded text-error">
          <span className="countdown font-mono text-xl">
            <span style={{"--value": currentCountdown.minutes}}>
              {currentCountdown.minutes}
            </span>
          </span>
        </div>

        <div className="flex flex-col p-2 bg-error/5 rounded text-error">
          <span className="countdown font-mono text-xl">
            <span style={{"--value": currentCountdown.seconds}}>
              {currentCountdown.seconds}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
} 
CountdownDisplay.propTypes = {
    item: PropTypes.shape({
        expiresAt: PropTypes.instanceOf(Date),
        status: PropTypes.string,
    }).isRequired,
    onCountdownEnd: PropTypes.func.isRequired,
};

export default CountdownDisplay;