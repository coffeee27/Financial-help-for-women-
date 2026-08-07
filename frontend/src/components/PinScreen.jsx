import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import LockDial, { STEP } from "./LockDial";
import { checkPIN } from "../services/duressService";

/* Rotary PIN.
 *
 * Turn the dial — drag it, or scroll — and it snaps to the nearest of 0-9.
 * Rest on a number for a moment and that digit locks in. Four digits opens it.
 *
 * Repeated digits (the decoy PIN is 9999) have to be enterable, so a commit
 * only needs the dial to have moved half a step since the last one — turn off
 * the number and back onto it to enter it twice.
 *
 * Critically: a wrong PIN and the duress PIN must be indistinguishable to
 * anyone watching. Same delay on every path, so timing can't leak which was
 * which.
 */

const DWELL_MS = 500;
/* Repeated digits matter — the decoy PIN is 9999. Rather than forcing her to
 * flick off the number and back for each one, resting keeps committing the
 * same digit, just on a slower beat so a repeat is always deliberate. */
const REPEAT_MS = 950;

const norm = (deg) => ((deg % 360) + 360) % 360;
const digitAt = (rot) => Math.round(norm(-rot) / STEP) % 10;

function snapTargetFor(rot) {
  const d = digitAt(rot);
  const base = -d * STEP;
  return base + Math.round((rot - base) / 360) * 360;
}

export default function PinScreen({ onUnlock }) {
  const rotation = useMotionValue(0);
  const [pin, setPin] = useState([]);
  const [hovered, setHovered] = useState(0);
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);
  const [keypad, setKeypad] = useState(false);

  const wrapRef = useRef(null);
  const dragging = useRef(false);
  const lastPointerAngle = useRef(0);
  const lastCommitRot = useRef(null);
  const dwellTimer = useRef(null);
  const touched = useRef(false);
  const pinRef = useRef(pin);
  useEffect(() => { pinRef.current = pin; }, [pin]);

  const finish = useCallback((digits) => {
    setBusy(true);
    const { mode } = checkPIN(digits.join(""));
    setTimeout(() => {
      if (mode === "invalid") {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin([]);
          lastCommitRot.current = null;
          setBusy(false);
        }, 520);
        return;
      }
      onUnlock(mode);
    }, 420);
  }, [onUnlock]);

  const commitRef = useRef(() => {});

  const schedule = useCallback((ms) => {
    clearTimeout(dwellTimer.current);
    if (!touched.current) return;
    dwellTimer.current = setTimeout(() => commitRef.current(), ms);
  }, []);

  const commit = useCallback(() => {
    if (busy) return;
    const current = pinRef.current;
    if (current.length >= 4) return;

    const rot = rotation.get();
    const d = digitAt(rot);
    animate(rotation, snapTargetFor(rot), { type: "spring", stiffness: 300, damping: 30 });

    const next = [...current, d];
    setPin(next);
    if (navigator.vibrate) navigator.vibrate(12);

    if (next.length === 4) finish(next);
    else schedule(REPEAT_MS);   // keep resting → same digit again
  }, [busy, finish, rotation, schedule]);

  useEffect(() => { commitRef.current = commit; }, [commit]);

  // a new number under the pointer restarts the (faster) first dwell
  useEffect(() => {
    const unsub = rotation.on("change", (v) => {
      const d = digitAt(v);
      setHovered((prev) => {
        if (prev !== d) schedule(DWELL_MS);
        return d;
      });
    });
    return () => { unsub(); clearTimeout(dwellTimer.current); };
  }, [rotation, schedule]);

  /* ---- pointer drag ---- */
  const angleFromEvent = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
  };

  const onPointerDown = (e) => {
    if (busy) return;
    dragging.current = true;
    touched.current = true;
    lastPointerAngle.current = angleFromEvent(e);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    schedule(DWELL_MS);   // resting without turning still counts
  };

  const onPointerMove = (e) => {
    if (!dragging.current || busy) return;
    const a = angleFromEvent(e);
    let delta = a - lastPointerAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastPointerAngle.current = a;
    rotation.set(rotation.get() + delta);
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
  };

  /* ---- wheel, for laptops ---- */
  const onWheel = (e) => {
    if (busy) return;
    touched.current = true;
    const before = digitAt(rotation.get());
    rotation.set(rotation.get() + e.deltaY * 0.35);
    // if the wheel didn't cross into a new number, the change watcher won't
    // fire, so start the clock here instead
    if (digitAt(rotation.get()) === before) schedule(DWELL_MS);
  };

  const clearAll = () => {
    setPin([]);
    lastCommitRot.current = null;
    touched.current = false;
    clearTimeout(dwellTimer.current);
  };

  return (
    <div className="h-[var(--app-h)] overflow-hidden bg-sand-200 relative flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#FFFCF7_0%,#F5EFE6_52%,#E8DCCB_100%)]" />
      <div
        className="absolute inset-0 opacity-[.5] mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(160,140,115,.10) 0 1px,transparent 1px 5px)," +
            "repeating-linear-gradient(90deg,rgba(160,140,115,.10) 0 1px,transparent 1px 5px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[360px] flex flex-col items-center">
        <div className="text-[10px] tracking-[.5em] uppercase text-clay-500 mb-1">Tijori</div>
        <p className="deva text-[14px] text-bark-500 mb-5">
          {keypad ? "अपना पिन डालिए" : "घुमाइए और रुकिए"}
        </p>

        {!keypad && (
          <>
            <motion.div
              ref={wrapRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onWheel={onWheel}
              animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
              className="relative w-[min(80vw,326px)] aspect-square touch-none cursor-grab active:cursor-grabbing"
            >
              <LockDial reveal={1} rotation={rotation} tumblers={pin.length} live />
            </motion.div>

            {/* the number currently under the pointer */}
            <div className="mt-5 flex items-center gap-3">
              <span className="deva text-[12px] text-bark-500">अभी</span>
              <motion.span
                key={hovered}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display text-[26px] font-semibold text-clay-500 tnum"
              >
                {hovered}
              </motion.span>
            </div>
          </>
        )}

        {keypad && (
          <div className="grid grid-cols-3 gap-3 w-full max-w-[300px] mt-2">
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => {
              if (k === "") return <div key={i} />;
              const back = k === "⌫";
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (busy) return;
                    if (back) return setPin(pin.slice(0, -1));
                    if (pin.length >= 4) return;
                    const next = [...pin, Number(k)];
                    setPin(next);
                    if (next.length === 4) finish(next);
                  }}
                  className={`h-[58px] rounded-2xl border transition-colors
                    ${back
                      ? "bg-transparent border-sand-400 text-bark-500 text-[18px]"
                      : "bg-sand-50 border-sand-400/80 shadow-card text-bark-900 text-[21px] font-medium hover:border-clay-400"}`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        )}

        {/* locked digits */}
        <div className="mt-6 flex gap-3.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: pin.length === i + 1 ? [1, 1.4, 1] : 1,
                backgroundColor: pin.length > i ? "#B4532A" : "#DFD1BE",
              }}
              transition={{ duration: 0.25 }}
              className="w-[11px] h-[11px] rounded-full"
            />
          ))}
        </div>

        <div className="h-6 mt-3">
          <AnimatePresence>
            {shake && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="deva text-[13px] text-clay-600"
              >
                गलत पिन, फिर कोशिश कीजिए
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-1 flex items-center gap-5 text-[11px] tracking-wide text-bark-500">
          <button onClick={clearAll} className="deva hover:text-clay-500 transition-colors">
            मिटाइए
          </button>
          <span className="text-bark-300">·</span>
          <button
            onClick={() => { setKeypad(!keypad); clearAll(); }}
            className="hover:text-clay-500 transition-colors uppercase tracking-[.15em]"
          >
            {keypad ? "Use dial" : "Use keypad"}
          </button>
        </div>
      </div>

      {/* Demo crib sheet. Delete before presenting. */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] tracking-wide text-bark-300">
        demo · 1234 real · 9999 decoy
      </div>
    </div>
  );
}
