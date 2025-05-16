// components/CallyDatePicker.jsx
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "cally"; // Import Cally Web Component

const CallyDatePicker = ({ id = "cally1", onDateChange, placeholder="Choisis une date" }) => {
  const [selectedDate, setSelectedDate] = useState(placeholder);
  const calendarRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const calendar = calendarRef.current;

    const handleChange = (e) => {
      const value = e.target.value;
      setSelectedDate(value);
      if (onDateChange) onDateChange(value);
    };

    if (calendar) {
      calendar.addEventListener("change", handleChange);
    }

    return () => {
      if (calendar) {
        calendar.removeEventListener("change", handleChange);
      }
    };
  }, [onDateChange]);

  return (
    <>
      <button
        ref={buttonRef}
        popovertarget="cally-popover1"
        className="input input-border"
        id={id}
        style={{ anchorName: `--${id}` }}
      >
        {selectedDate}
      </button>

      <div
        popover="auto"
        id="cally-popover1"
        className="dropdown bg-base-100 rounded-box shadow-lg"
        style={{ positionAnchor: `--${id}` }}
      >
        <calendar-date class="cally" ref={calendarRef}>
          <svg
            aria-label="Previous"
            className="fill-current size-4"
            slot="previous"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
          <svg
            aria-label="Next"
            className="fill-current size-4"
            slot="next"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
          </svg>
          <calendar-month></calendar-month>
        </calendar-date>
      </div>
    </>
  );
};
CallyDatePicker.propTypes = {
  id: PropTypes.string,
  onDateChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default CallyDatePicker;
