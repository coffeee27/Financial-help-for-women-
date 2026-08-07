/* Which PIN opens which world.
 *
 * 1234 → the real tijori.  9999 → the decoy.
 * Kept identical to the PINs already in the team repo's duressService so
 * nobody rehearses against a different number. (The unused lib/pinEngine.ts
 * had 0000 for the decoy — that file is dead code; this is the live one.)
 */
const PIN_MAP = {
  "1234": "real",
  "9999": "decoy",
};

export function checkPIN(pin) {
  return { mode: PIN_MAP[pin] || "invalid" };
}

export const DEMO_PINS = { real: "1234", decoy: "9999" };
