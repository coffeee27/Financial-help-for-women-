import { motion, AnimatePresence } from "framer-motion";

export default function MicButton({ listening, thinking, onTap, disabled }) {
  const active = listening || thinking;

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {listening &&
          [0, 0.45, 0.9].map((delay) => (
            <motion.span
              key={delay}
              initial={{ scale: 1, opacity: 0.45 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, delay, ease: "easeOut" }}
              className="absolute w-[72px] h-[72px] rounded-full bg-clay-400/25"
            />
          ))}
      </AnimatePresence>

      <motion.button
        onClick={onTap}
        disabled={disabled}
        whileTap={{ scale: 0.91 }}
        animate={thinking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={thinking ? { repeat: Infinity, duration: 1.1 } : { duration: 0.3 }}
        className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center
                    shadow-lift transition-colors disabled:opacity-40
                    ${active ? "bg-clay-600 text-sand-50" : "bg-clay-500 text-sand-50"}`}
      >
        {thinking ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-6 h-6 rounded-full border-[2.5px] border-sand-50/30 border-t-sand-50"
          />
        ) : (
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.9" strokeLinecap="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <path d="M12 18v4" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}
