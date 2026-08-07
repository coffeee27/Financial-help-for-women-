/* The two worlds Tijori shows, decided entirely by which PIN was typed.
 *
 * Note on the model: `hiddenSavings` is the tijori itself — money she has put
 * away. Saving makes it go UP. The old goalService subtracted from a spending
 * balance, which is the opposite direction and would have made the voice layer
 * contradict the screen. One pot, one dream goal, they move together.
 */

export const realData = {
  user: { name: "Priya", greeting: "शुभ संध्या" },
  mode: "real",
  hiddenSavings: 18540,
  weekDelta: 620,
  safeToSave: 150,
  goal: {
    id: 1,
    name: "अपनी सिलाई मशीन",
    nameEn: "Own tailoring machine",
    target: 25000,
    saved: 18540,
    weeksRemaining: 4,
  },
  transactions: [
    { id: 1, type: "save", amount: 200, label: "साप्ताहिक बचत", date: "आज" },
    { id: 2, type: "save", amount: 150, label: "साप्ताहिक बचत", date: "3 दिन पहले" },
    { id: 3, type: "save", amount: 270, label: "सिलाई का काम", date: "पिछले हफ्ते" },
  ],
};

/* Decoy: structurally identical so it can't be spotted by shape, just poorer.
 * A small non-zero balance is more believable than ₹0 — an empty account
 * invites the question "where did it go?", which is the opposite of the point.
 */
export const decoyData = {
  user: { name: "Priya", greeting: "शुभ संध्या" },
  mode: "decoy",
  hiddenSavings: 240,
  weekDelta: 0,
  safeToSave: 0,
  goal: null,
  transactions: [
    { id: 1, type: "spend", amount: 60, label: "सब्ज़ी", date: "कल" },
    { id: 2, type: "spend", amount: 120, label: "राशन", date: "4 दिन पहले" },
  ],
};
