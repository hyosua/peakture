import { motion } from "framer-motion";
import { Trophy } from "lucide-react"; 
import PropTypes from "prop-types";

const WinnerBanner = ({ winner }) => {


  return (
    <div className="relative flex flex-col items-center justify-center my-2">

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
        className="flex items-center space-x-3 bg-neutral text-yellow-600 px-6 py-3 rounded-2xl shadow-xl"
      >
        <Trophy className="w-6 h-6 text-yellow-600" />
        <span className="text-xl font-bold">
        {winner?.username}
        </span>
      </motion.div>
    </div>
  );
};

WinnerBanner.propTypes = {
  winner: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
};

export default WinnerBanner;
