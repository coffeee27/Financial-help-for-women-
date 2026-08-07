import { motion } from "framer-motion";

/* The dial — one component, two lives.
 *
 * The intro stitches it into existence (`reveal` 0→1, driven by scroll).
 * The PIN screen then turns that same object (`reveal` = 1, `rotation` live).
 *
 * Reveal is passed down as a CSS custom property and each stitch clamps its
 * own opacity off it. That keeps the whole draw-on on the compositor — no
 * React re-render per frame, and no 200 useTransform hooks.
 */

const DIGITS = 10;              // 0-9, one per PIN digit, 36° apart
const STEP = 360 / DIGITS;

const R_BEZEL = 174;
const R_FACE = 152;
const R_TICK = 138;
const R_NUM = 108;
const R_HUB = 60;

/* Each stitch lands almost binary rather than fading up over its neighbours.
 * A soft ramp made several stitches semi-transparent at once, which read as
 * motion blur smeared along the arc instead of thread going into cloth. */
const at = (t) => ({ opacity: `clamp(0, calc((var(--reveal) - ${t}) * 150), 1)` });

// deterministic jitter — hand-sewn, not laser-printed, and stable across renders
const rnd = (i, seed) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* Running stitch: stitch length and gap roughly equal. Spacing is derived
 * from the radius so every ring has the same stitch density. */
function stitches(radius, spacing, phaseStart, phaseEnd, seed) {
  const count = Math.round((2 * Math.PI * radius) / spacing);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 360) / count;
    const rad = ((angle - 90) * Math.PI) / 180;
    const j = rnd(i, seed);
    return {
      key: i,
      x: 200 + radius * Math.cos(rad),
      y: 200 + radius * Math.sin(rad),
      angle: angle + (j - 0.5) * 5,
      len: spacing * 0.52 + j * 1.1,
      opacity: 0.84 + j * 0.16,
      t: phaseStart + ((phaseEnd - phaseStart) * i) / count,
    };
  });
}

/* Phases must not overlap: the needle can only be in one place, and stitches
 * appearing ahead of it was the giveaway that this wasn't really being sewn. */
const BEZEL_STITCHES = stitches(R_BEZEL, 12, 0.04, 0.36, 1);
const FACE_STITCHES = stitches(R_FACE, 11, 0.36, 0.6, 2);
const HUB_STITCHES = stitches(R_HUB, 9, 0.6, 0.74, 3);

function Stitch({ s, color, w }) {
  return (
    <rect
      x={s.x - s.len / 2}
      y={s.y - w / 2}
      width={s.len}
      height={w}
      rx={w / 2}
      fill={color}
      fillOpacity={s.opacity}
      transform={`rotate(${s.angle} ${s.x} ${s.y})`}
      style={at(s.t)}
    />
  );
}

export default function LockDial({ reveal, rotation, tumblers = 0, live = false }) {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      className="w-full h-full overflow-visible select-none"
      style={{ "--reveal": reveal }}
    >
      <defs>
        <radialGradient id="d-bezel" cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#EBD5A8" />
          <stop offset="42%" stopColor="#C9A468" />
          <stop offset="78%" stopColor="#A8834A" />
          <stop offset="100%" stopColor="#7C5F33" />
        </radialGradient>
        <radialGradient id="d-face" cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#4A3B31" />
          <stop offset="60%" stopColor="#33281F" />
          <stop offset="100%" stopColor="#251C15" />
        </radialGradient>
        <radialGradient id="d-hub" cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#E39B78" />
          <stop offset="45%" stopColor="#B4532A" />
          <stop offset="100%" stopColor="#6F2F17" />
        </radialGradient>
        <linearGradient id="d-sheen" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".5" />
          <stop offset="45%" stopColor="#fff" stopOpacity=".04" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="d-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#6F2F17" floodOpacity=".26" />
        </filter>
      </defs>

      {/* ---- the enamel, fading in under the stitches once the outline closes ---- */}
      <g
        filter="url(#d-shadow)"
        style={{ opacity: `clamp(0, calc((var(--reveal) - 0.58) * 7), 1)` }}
      >
        <circle cx="200" cy="200" r={R_BEZEL + 12} fill="url(#d-bezel)" />
        {Array.from({ length: 120 }).map((_, i) => (
          <rect
            key={i}
            x="199.2" y="16" width="1.6" height="13" rx=".8"
            fill="#000" opacity=".15"
            transform={`rotate(${i * 3} 200 200)`}
          />
        ))}
        <circle cx="200" cy="200" r={R_BEZEL + 12} fill="url(#d-sheen)" />
        <circle cx="200" cy="200" r={R_FACE + 4} fill="url(#d-face)" />
      </g>

      {/* ---- stitched outline ---- */}
      {BEZEL_STITCHES.map((s) => (
        <Stitch key={`b${s.key}`} s={s} color="#B4532A" w={3} />
      ))}
      {FACE_STITCHES.map((s) => (
        <Stitch key={`f${s.key}`} s={s} color="#93401F" w={2.6} />
      ))}

      {/* ---- rotating scale: ticks + numerals ---- */}
      <motion.g
        style={{ rotate: rotation, transformOrigin: "200px 200px", transformBox: "view-box" }}
      >
        {Array.from({ length: DIGITS * 4 }).map((_, i) => {
          const major = i % 4 === 0;
          const angle = (i * 360) / (DIGITS * 4);
          return (
            <rect
              key={`t${i}`}
              x={199.4}
              y={200 - R_TICK}
              width={major ? 2.8 : 1.4}
              height={major ? 20 : 10}
              rx="0.7"
              fill={major ? "#DCC08A" : "#9A8770"}
              transform={`rotate(${angle} 200 200)`}
              style={at(0.72 + (i / (DIGITS * 4)) * 0.1)}
            />
          );
        })}

        {Array.from({ length: DIGITS }).map((_, i) => {
          const angle = i * STEP;
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = 200 + R_NUM * Math.cos(rad);
          const y = 200 + R_NUM * Math.sin(rad);
          return (
            <text
              key={`n${i}`}
              x={x} y={y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="30" fontWeight="600" fill="#EDE3D5"
              fontFamily="Fraunces, Georgia, serif"
              transform={`rotate(${angle} ${x} ${y})`}
              style={at(0.8 + (i / DIGITS) * 0.1)}
            >
              {i}
            </text>
          );
        })}
      </motion.g>

      {/* ---- hub ---- */}
      <g style={{ opacity: `clamp(0, calc((var(--reveal) - 0.74) * 9), 1)` }}>
        <circle cx="200" cy="200" r={R_HUB + 6} fill="#1B140F" opacity=".5" />
        <circle cx="200" cy="200" r={R_HUB} fill="url(#d-hub)" />
        <circle cx="200" cy="200" r={R_HUB} fill="url(#d-sheen)" opacity=".65" />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x="197" y={200 - R_HUB + 6} width="6" height="14" rx="3"
            fill="#6F2F17" opacity=".45"
            transform={`rotate(${i * 60} 200 200)`}
          />
        ))}
      </g>
      {HUB_STITCHES.map((s) => (
        <Stitch key={`h${s.key}`} s={s} color="#6F2F17" w={2.2} />
      ))}

      {/* tumbler pips — how many PIN digits are locked in */}
      {live && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={i}
              cx={200 + (i - 1.5) * 17}
              cy="200"
              r="5"
              animate={{
                fill: i < tumblers ? "#FFFCF7" : "rgba(255,252,247,0.26)",
                scale: i === tumblers - 1 ? [1, 1.5, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{ transformOrigin: `${200 + (i - 1.5) * 17}px 200px`, transformBox: "view-box" }}
            />
          ))}
        </g>
      )}

      {/* fixed index pointer */}
      <g style={{ opacity: `clamp(0, calc((var(--reveal) - 0.9) * 12), 1)` }}>
        <path d="M200 2 L212 30 L188 30 Z" fill="#B4532A" />
        <path d="M200 2 L212 30 L188 30 Z" fill="url(#d-sheen)" opacity=".55" />
      </g>
    </motion.svg>
  );
}

export { DIGITS, STEP };
