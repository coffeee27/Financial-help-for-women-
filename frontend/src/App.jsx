import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IntroStitch from "./components/IntroStitch";
import PinScreen from "./components/PinScreen";
import RealDashboard from "./components/Dashboard/RealDashboard";
import DecoyDashboard from "./components/DecoyDashboard";
import { useFinance } from "./context/FinanceContext";
import { resetHistory } from "./lib/voiceEngine";

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro → pin → real | decoy
  const { setMode } = useFinance();

  const unlock = (mode) => {
    setMode(mode);
    setScreen(mode);
    window.scrollTo(0, 0);
  };

  const lock = () => {
    setMode(null);
    resetHistory();
    setScreen("pin");
  };

  const toPin = () => {
    setScreen("pin");
    window.scrollTo(0, 0);
  };

  return (
    <AnimatePresence mode="wait">
      {screen === "intro" && (
        <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <IntroStitch onUnlocked={toPin} />
        </motion.div>
      )}

      {/* barely moves — the dial is the same object the intro just stitched,
          so a big scale jump would break the illusion of continuity */}
      {screen === "pin" && (
        <motion.div
          key="pin"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <PinScreen onUnlock={unlock} />
        </motion.div>
      )}

      {screen === "real" && (
        <motion.div key="real" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <RealDashboard onLock={lock} />
        </motion.div>
      )}

      {screen === "decoy" && (
        <motion.div key="decoy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <DecoyDashboard onLock={lock} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
