import { useEffect, useRef, useState } from "react";

/* Device shell for desktop viewing.
 *
 * On a real phone this gets out of the way entirely — a phone frame drawn
 * inside a phone is silly, and it would steal half the screen from the person
 * the product is actually for. It only appears when there's room for it.
 *
 * Two things inside the app depend on the viewport and would break in a box:
 *   · screens sized with 100svh — solved by publishing the frame's real pixel
 *     height as --app-h, which those screens use instead
 *   · the intro, which measures window scroll — it looks for [data-app-scroll]
 *     and follows that element instead when it exists
 */

const IDEAL_W = 400;
const IDEAL_H = 860;
const MIN_DESKTOP_W = 1024;

export default function PhoneFrame({ children }) {
  const innerRef = useRef(null);
  const [framed, setFramed] = useState(false);
  const [appH, setAppH] = useState(IDEAL_H);

  useEffect(() => {
    const measure = () => {
      const wide = window.innerWidth >= MIN_DESKTOP_W;
      setFramed(wide);
      if (!wide) return;
      // leave room for the bezel and a little breathing space
      setAppH(Math.min(IDEAL_H, window.innerHeight - 96));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (!framed) return children;

  return (
    <div className="min-h-[100svh] w-full flex items-center justify-center
                    bg-sand-200 relative overflow-hidden">
      {/* page backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#FFFCF7_0%,#F5EFE6_55%,#E8DCCB_100%)]" />
      <div
        className="absolute inset-0 opacity-[.45] mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(160,140,115,.08) 0 1px,transparent 1px 6px)," +
            "repeating-linear-gradient(90deg,rgba(160,140,115,.08) 0 1px,transparent 1px 6px)",
        }}
      />

      <div className="absolute top-8 left-0 right-0 text-center">
        <div className="text-[10px] tracking-[.5em] uppercase text-clay-500">Tijori</div>
        <p className="deva text-[12.5px] text-bark-500 mt-1.5">
          वह तिजोरी जो सिर्फ़ उसकी है
        </p>
      </div>

      {/* device */}
      <div
        className="relative rounded-[46px] bg-bark-900 p-[11px]
                   shadow-[0_40px_90px_-20px_rgba(42,33,27,.45),0_0_0_1px_rgba(42,33,27,.18)]"
        style={{ width: IDEAL_W + 22 }}
      >
        {/* side buttons */}
        <div className="absolute -left-[3px] top-[112px] w-[3px] h-9 rounded-l bg-bark-700" />
        <div className="absolute -left-[3px] top-[162px] w-[3px] h-14 rounded-l bg-bark-700" />
        <div className="absolute -right-[3px] top-[136px] w-[3px] h-20 rounded-r bg-bark-700" />

        <div
          ref={innerRef}
          data-app-scroll
          className="relative rounded-[36px] overflow-y-auto overflow-x-hidden no-scrollbar bg-sand-200"
          style={{ width: IDEAL_W, height: appH, "--app-h": `${appH}px` }}
        >
          {children}
        </div>

        {/* dynamic-island style pill, floating above the app */}
        <div className="pointer-events-none absolute top-[22px] left-1/2 -translate-x-1/2
                        w-[86px] h-[26px] rounded-full bg-bark-900" />
      </div>
    </div>
  );
}
