import { motion } from "framer-motion";

const ITEMS = [
  { id: "home", label: "Home", icon: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" },
  { id: "goals", label: "Goals", icon: "M12 3v18M3 12h18" },
  { id: "voice", label: "Voice", icon: "M9 2h6v12H9zM5 11a7 7 0 0 0 14 0" },
  { id: "settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5 9.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10.5 5.6V5a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 17 7.5l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" },
];

export default function BottomNav({ active = "home", onChange }) {
  return (
    <nav className="shrink-0 z-30 border-t border-sand-300
                    bg-sand-100/90 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around max-w-md mx-auto">
        {ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onChange?.(item.id)}
              className="relative flex-1 py-3 flex flex-col items-center gap-1"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-x-3 inset-y-1.5 rounded-2xl bg-clay-500/10"
                />
              )}
              <svg
                width="19" height="19" viewBox="0 0 24 24" fill="none"
                stroke={isActive ? "#B4532A" : "#B5A798"}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                className="relative"
              >
                <path d={item.icon} />
              </svg>
              <span className={`relative text-[9.5px] tracking-wide font-medium ${
                isActive ? "text-clay-500" : "text-bark-300"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
