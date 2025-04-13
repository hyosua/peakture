import { motion } from "framer-motion";

export default function ClassementVide() {
  return (
    <motion.div
      key="classement-vide"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center p-8"
    >
      <motion.img
        src="https://img.icons8.com/clouds/200/medal2.png"
        alt="Pas de classement"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="mb-4"
      />
      <h2 className="text-xl font-bold">Classement en attente...</h2>
      <p className="text-sm text-gray-500 mt-2">
        Une fois le concours terminé, vous verrez ici les résultats ✨
      </p>
    </motion.div>
  );
}
