import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import LockDial, { STITCH_COUNTS } from "./LockDial";

/* The intro.
 *
 * A needle orbits inward and stitches the tijori into existence. When the
 * outline closes, the enamel fills in underneath and the same dial carries
 * straight over to the PIN screen — where she turns it to unlock.
 *
 * Sewing is not decoration here: the goal she is saving for is a सिलाई मशीन.
 */

// radius of the outer ring in LockDial's viewBox units
const R_OUTER_RING = 174;

const STAGES = [
  { at: 0.0, hi: "हर टाँके के साथ…", en: "With every stitch" },
  { at: 0.3, hi: "…कुछ अपना बनता है", en: "Something of her own takes shape" },
  { at: 0.6, hi: "उसकी मेहनत, उसके अंक", en: "Her work, her numbers" },
  { at: 0.86, hi: "तिजोरी तैयार है", en: "The tijori is ready" },
];

export default function IntroStitch({ onUnlocked }) {
  const ref = useRef(null);
  const [stage, setStage] = useState(0);
  const done = useRef(false);

  /* Measured directly rather than with useScroll({ target }) — that hook
     reported a flat 0 for a sticky child inside AnimatePresence, and a dead
     intro is not something to discover on stage. */
  const raw = useMotionValue(0);
  const p = useSpring(raw, { stiffness: 170, damping: 28, mass: 0.25 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Inside PhoneFrame the page doesn't scroll — the device does. Follow that
       element when it exists, and fall back to the window otherwise, so the
       same component works framed and full-screen. */
    const scroller = el.closest("[data-app-scroll]");

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const viewH = scroller ? scroller.clientHeight : window.innerHeight;
      const top = scroller ? rect.top - scroller.getBoundingClientRect().top : rect.top;
      const travel = rect.height - viewH;
      if (travel <= 0) return raw.set(0);
      raw.set(Math.min(Math.max(-top / travel, 0), 1));
    };

    measure();
    const target = scroller || window;
    target.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      target.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [raw]);

  /* One lap per ring, locked to the phases in LockDial so the needle is always
     exactly at the leading edge of the stitching. */
  const needleAngle = useTransform(
    p,
    [0, 0.04, 0.36, 0.6, 0.74, 0.95],
    [0, 0, 360, 720, 1080, 1120]
  );
  // 0 → bezel ring, 22 → face ring, 114 → hub
  const needleRing = useTransform(
    p,
    [0, 0.36, 0.38, 0.6, 0.62, 0.95],
    [0, 0, 22, 22, 114, 114]
  );

  /* One dip per stitch.
   *
   * A running stitch is only on top of the cloth for the dash — the needle
   * then goes under and travels the gap out of sight before coming up again.
   * So this is a sawtooth over each stitch: visible while laying the dash,
   * plunging at the end of it, hidden underneath, surfacing for the next one.
   * Without this the needle just glides round at a constant height, which is
   * what made it look like it was spinning on a point rather than sewing.
   */
  const stitchPhase = useTransform(needleAngle, (a) => {
    const lap = Math.max(0, Math.min(STITCH_COUNTS.length - 1, Math.floor(a / 360)));
    const per = 360 / STITCH_COUNTS[lap];
    return (((a % per) + per) % per) / per;   // 0→1 across a single stitch
  });

  //                        lay the dash │ plunge │ under │ surface
  const dipScale = useTransform(stitchPhase, [0, 0.5, 0.62, 0.88, 1], [1, 1, 0.42, 0.46, 1]);
  const dipFade = useTransform(stitchPhase, [0, 0.5, 0.64, 0.86, 1], [1, 1, 0.12, 0.16, 1]);
  // sinks toward the cloth as it goes in, lifts back out
  const dipDepth = useTransform(stitchPhase, [0, 0.5, 0.65, 0.87, 1], [0, 0, 5, 5, 0]);

  /* Position the needle in polar coordinates rather than rotating a parent
   * group around the dial centre.
   *
   * Framer Motion overrides transform-origin with the element's own bounding
   * box centre whenever `rotate` is used. On the dial that is harmless — its
   * box is already centred on the dial. On a group containing only the needle,
   * "centre" is the needle itself, so the orbit collapsed into a spin on the
   * spot. Translating to an explicit x/y and rotating about its own centre to
   * stay tangential gives the same motion with nothing to override.
   */
  const needleRadius = useTransform(needleRing, (ring) => R_OUTER_RING - ring);
  const needleX = useTransform([needleAngle, needleRadius], ([a, r]) =>
    200 + r * Math.cos(((a - 90) * Math.PI) / 180)
  );
  const needleY = useTransform([needleAngle, needleRadius], ([a, r]) =>
    200 + r * Math.sin(((a - 90) * Math.PI) / 180)
  );
  const needleOpacity = useTransform(p, [0, 0.03, 0.9, 0.97], [0, 1, 1, 0]);

  const dialScale = useTransform(p, [0, 0.95], [0.92, 1]);
  const copyOpacity = useTransform(p, [0, 0.08, 0.9, 0.98], [1, 1, 1, 0]);
  const hintOpacity = useTransform(p, [0, 0.07], [1, 0]);
  const railFill = useTransform(p, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(p, "change", (v) => {
    setStage(STAGES.reduce((acc, s, i) => (v >= s.at ? i : acc), 0));
    if (v >= 0.97 && !done.current) {
      done.current = true;
      onUnlocked();
    }
  });

  return (
    <section ref={ref} className="relative h-[calc(var(--app-h)*3.8)] bg-sand-200">
      <div className="sticky top-0 h-[var(--app-h)] overflow-hidden">
        {/* woven cloth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#FFFCF7_0%,#F5EFE6_48%,#E8DCCB_100%)]" />
        <div
          className="absolute inset-0 opacity-[.5] mix-blend-multiply"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,rgba(160,140,115,.10) 0 1px,transparent 1px 5px)," +
              "repeating-linear-gradient(90deg,rgba(160,140,115,.10) 0 1px,transparent 1px 5px)",
          }}
        />

        <button
          onClick={onUnlocked}
          className="absolute top-6 right-6 z-40 text-[11px] tracking-[.2em] uppercase
                     text-bark-500 hover:text-clay-500 transition-colors"
        >
          Skip
        </button>

        <motion.div
          style={{ opacity: copyOpacity }}
          className="absolute top-[8svh] left-0 right-0 z-30 text-center px-6"
        >
          <div className="text-[10px] tracking-[.5em] uppercase text-clay-500 mb-3">Tijori</div>
          <h1 className="deva text-[32px] leading-none font-semibold text-bark-900">तिजोरी</h1>
        </motion.div>

        {/* dial + needle share one coordinate space */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={{ scale: dialScale }}
            className="relative w-[min(86vw,376px)] aspect-square"
          >
            <LockDial reveal={p} rotation={0} />

            <motion.svg
              viewBox="0 0 400 400"
              style={{ opacity: needleOpacity }}
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
            >
              {/* travels the circle by x/y; rotates about itself to stay
                  tangential to the seam */}
              {/* outer group only translates — no origin involved */}
              <motion.g data-needle style={{ x: needleX, y: needleY }}>
                {/* rotation and scale must pivot on the needle itself. In SVG a
                    percentage transform-origin resolves against the view-box,
                    so the default 50% 50% is the dial centre — which spun the
                    already-positioned needle around the dial a second time.
                    fill-box makes "center" mean this element's own box. */}
                <motion.g
                  style={{
                    rotate: needleAngle,
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                >
                  {/* thread lies on the surface behind the needle — it does not
                      dive; only the needle goes through the cloth */}
                  <path
                    d="M-13 0.8 C -23 2.4, -31 4.4, -39 8"
                    stroke="#B4532A" strokeWidth="1.5" fill="none"
                    strokeLinecap="round" opacity=".75"
                  />
                  <motion.g
                    style={{
                      y: dipDepth,
                      scale: dipScale,
                      opacity: dipFade,
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  >
                    <path d="M16 0 L-8 -1.7 L-13 -1.2 L-13 1.2 L-8 1.7 Z" fill="#8A8177" />
                    <path d="M16 0 L-8 -1.7 L-13 -1.2 L-13 0 Z" fill="#DCD6CB" />
                    <ellipse cx="-10.2" cy="0" rx="2" ry="0.8" fill="#F5EFE6" />
                  </motion.g>
                </motion.g>
              </motion.g>
            </motion.svg>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: copyOpacity }}
          className="absolute bottom-[13svh] left-0 right-0 z-30 px-8 text-center"
        >
          <motion.div key={stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <p className="deva text-xl text-bark-900 font-medium">{STAGES[stage].hi}</p>
            <p className="mt-2 text-[11px] tracking-[.2em] uppercase text-bark-500">
              {STAGES[stage].en}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-[5svh] left-0 right-0 z-30 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[.3em] uppercase text-bark-500">Scroll to stitch</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-7 bg-gradient-to-b from-clay-400 to-transparent"
          />
        </motion.div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 h-24 w-[3px] rounded-full bg-sand-400/60">
          <motion.div style={{ height: railFill }} className="w-full rounded-full bg-clay-500" />
        </div>
      </div>
    </section>
  );
}
