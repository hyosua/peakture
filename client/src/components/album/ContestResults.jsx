import PropTypes from 'prop-types';
import { motion } from "framer-motion";

const ContestResults = ( {results} ) => {
    const container = {
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
    };
      
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    

    return (
        <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="list bg-base-100 rounded-box shadow-md mb-20"
            >
  
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Classement</li>
            
            {results.map((result, index) => (
                <motion.li key={index} 
                    variants={item}
                     className={`list-row flex items-center p-4 border-b border-base-200 ${
                     index === 0 ? " border border-yellow-200 font-extrabold scale-105" : ""
                }`}>
                    <div className={`text-4xl text-secondary font-thin opacity-60 tabular-nums ${
                        index === 0 ? "text-yellow-200" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-500" : "text-secondary"
                    }`}>{index+1}</div>

                    <img className="size-12 object-cover rounded-box" src={result.user?.avatar} />
                    

                    <div className='list-grow'>
                         <div className="text-xs uppercase font-semibold opacity-60">{result.user?.username}</div> 
                    </div>
                    <div className="text-2xl text-primary text-right ml-auto font-bold ">
                        {result.votes}
                    </div>
                </motion.li>
            ))}
            
            
        </motion.ul>
    )
    
};

ContestResults.propTypes = {
    results: PropTypes.arrayOf(
        PropTypes.shape({
            votes: PropTypes.number.isRequired,
        })
    ).isRequired,
}

export default ContestResults;
