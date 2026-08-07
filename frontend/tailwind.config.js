/** Tijori — "Cream & Terracotta"
 *  Warm, tactile, handmade. Sand paper, clay enamel, aged brass, olive.
 *  Light-first: reads premium on a projector and doesn't go muddy in a bright room.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#FFFCF7",
          100: "#FAF6EE",
          200: "#F5EFE6",
          300: "#EDE3D5",
          400: "#DFD1BE",
          500: "#C9B7A0",
        },
        clay: {
          300: "#E39B78",
          400: "#D2734A",
          500: "#B4532A",
          600: "#93401F",
          700: "#6F2F17",
        },
        olive: {
          300: "#9AAC8B",
          400: "#7E9370",
          500: "#6B7F5E",
          600: "#54654A",
        },
        brass: {
          300: "#DCC08A",
          400: "#C9A468",
          500: "#A8834A",
        },
        bark: {
          900: "#2A211B",
          700: "#4A3B31",
          500: "#8A7A6D",
          300: "#B5A798",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        deva: ["Noto Sans Devanagari", "Nirmala UI", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(42,33,27,.04), 0 8px 24px -8px rgba(42,33,27,.10)",
        lift: "0 2px 4px rgba(42,33,27,.05), 0 20px 48px -12px rgba(42,33,27,.18)",
        dial: "0 30px 60px -18px rgba(111,47,23,.45), inset 0 2px 6px rgba(255,255,255,.5)",
        inset: "inset 0 2px 8px rgba(42,33,27,.12)",
      },
      borderRadius: {
        "4xl": "28px",
        "5xl": "36px",
      },
    },
  },
  plugins: [],
};
