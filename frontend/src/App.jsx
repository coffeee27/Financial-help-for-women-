import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IntroStitch from "./components/IntroStitch";
import PinScreen from "./components/PinScreen";
import RealDashboard from "./components/Dashboard/RealDashboard";
import DecoyDashboard from "./components/DecoyDashboard";
import { useFinance } from "./context/FinanceContext";
import { resetHistory } from "./lib/voiceEngine";

/* Framed on desktop the page never scrolls — the device does. */
function scrollAppToTop() {
  const scroller = document.querySelector("[data-app-scroll]");
  if (scroller) scroller.scrollTo({ top: 0 });
  else window.scrollTo(0, 0);
}

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro → pin → real | decoy
  const { setMode } = useFinance();

  const unlock = (mode) => {
    setMode(mode);
    setScreen(mode);
    scrollAppToTop();
  };

  const lock = () => {
    setMode(null);
    resetHistory();
    setScreen("pin");
  };

  const toPin = () => {
    setScreen("pin");
    scrollAppToTop();
  };

  /* Only the intro and the PIN sit inside AnimatePresence — they are the two
   * screens that need to animate *out*.
   *
   * The dashboards deliberately do not. They contain a keyed subtree that
   * remounts on every tab switch, and remounting inside a tree that
   * AnimatePresence is waiting on leaves stale presence registrations: the
   * exit never resolves, so mode="wait" never mounts the next screen and the
   * lock button silently stops working once you have changed tabs. They only
   * ever need to appear, so plain conditional rendering is both correct and
   * one less thing to deadlock.
   */
  return (
    <>
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
      </AnimatePresence>

      {screen === "real" && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <RealDashboard onLock={lock} />
        </motion.div>
      )}

      {screen === "decoy" && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <DecoyDashboard onLock={lock} />
        </motion.div>
      )}
    </>
  );
}
