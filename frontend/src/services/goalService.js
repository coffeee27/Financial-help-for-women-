/* Every mutation the voice layer or the UI can make to the ledger.
 * Pure functions: state in, new state out. No component touches the shape
 * directly, so the voice layer and the buttons can never drift apart.
 *
 * One pot: `hiddenSavings` is the money, and `goal.saved` mirrors it. They
 * always move together, so the two numbers on screen can never disagree.
 *
 * Transaction labels are load-bearing — TransactionList styles rows by
 * matching them, so don't rename without updating that component:
 *   "नया लक्ष्य: X"  🎯   "सपना पूरा: X"  🎉
 *   "ज़रूरी निकासी"  🆘   "मिलान"         🔄
 */

/* Date.now() alone collided: changing a goal writes a row and completing one
 * writes another, and two in the same millisecond gave React duplicate keys,
 * which silently drops rows from the list. */
let txSeq = 0;
const nextId = () => `${Date.now()}-${++txSeq}`;

export function saveToGoal(state, amount) {
  const amt = Math.abs(Math.round(amount || 0));
  if (!amt) return state;

  return {
    ...state,
    hiddenSavings: state.hiddenSavings + amt,
    weekDelta: (state.weekDelta || 0) + amt,
    goal: state.goal ? { ...state.goal, saved: state.goal.saved + amt } : null,
    transactions: [
      { id: nextId(), type: "save", amount: amt, label: "आवाज़ से बचत", date: "अभी" },
      ...state.transactions,
    ],
  };
}

/* Refuse rather than clamp: clamping silently empties the tijori on a request
 * that was meant to be declined. */
function take(state, amount, label) {
  const amt = Math.abs(Math.round(amount || 0));
  if (!amt || amt > state.hiddenSavings) return { state, refused: true };

  return {
    state: {
      ...state,
      hiddenSavings: state.hiddenSavings - amt,
      goal: state.goal ? { ...state.goal, saved: Math.max(0, state.goal.saved - amt) } : null,
      transactions: [
        { id: nextId(), type: "withdraw", amount: amt, label, date: "अभी" },
        ...state.transactions,
      ],
    },
    refused: false,
  };
}

export function withdraw(state, amount) {
  return take(state, amount, "निकासी");
}

/* Same movement of money, different story in the history. Worth separating:
 * "ज़रूरी निकासी" tells her later why the goal slipped. */
export function emergencyWithdraw(state, amount) {
  return take(state, amount, "ज़रूरी निकासी");
}

/* Correct the ledger to what she actually has.
 *
 * If she takes money out in an emergency and doesn't tell the app, the number
 * on screen drifts from the cash in her hand — and a savings app whose number
 * is wrong is worse than no app, because she stops trusting it. The difference
 * is logged rather than silently rewritten, so the history stays honest.
 */
export function reconcile(state, actualTotal) {
  const actual = Math.max(0, Math.round(actualTotal || 0));
  const diff = actual - state.hiddenSavings;
  if (diff === 0) return { state, diff: 0 };

  return {
    state: {
      ...state,
      hiddenSavings: actual,
      goal: state.goal
        ? { ...state.goal, saved: Math.max(0, state.goal.saved + diff) }
        : null,
      transactions: [
        {
          id: nextId(),
          type: diff > 0 ? "save" : "withdraw",
          amount: Math.abs(diff),
          label: "मिलान",
          date: "अभी",
        },
        ...state.transactions,
      ],
    },
    diff,
  };
}

/* Point the tijori at a new dream.
 *
 * The pot carries over — she doesn't restart from zero just because the target
 * changed, so switching goals is never punished.
 */
export function changeGoal(state, name, target, nameEn = "") {
  const t = Math.max(0, Math.round(target || 0));
  const goalName = (name || "").trim() || "नया लक्ष्य";

  return {
    ...state,
    goal: { id: nextId(), name: goalName, nameEn, target: t, saved: state.hiddenSavings },
    transactions: [
      // amount carries the estimate so the row survives TransactionList's
      // zero-filter; that component deliberately hides it for this label
      { id: nextId(), type: "save", amount: t, label: `नया लक्ष्य: ${goalName}`, date: "अभी" },
      ...state.transactions,
    ],
  };
}

export function isGoalAchieved(state) {
  return !!state.goal && state.goal.target > 0 && state.goal.saved >= state.goal.target;
}

/* She reached the target and bought the thing, so the price leaves the tijori.
 * Anything saved above the target stays in the pot for whatever comes next.
 * Returns refused: true if the goal isn't actually complete, so a mis-heard
 * "मेरा सपना पूरा हो गया" can't empty her savings. */
export function accomplishGoal(state) {
  if (!isGoalAchieved(state)) return { state, refused: true, completed: null };

  const g = state.goal;

  return {
    state: {
      ...state,
      hiddenSavings: Math.max(0, state.hiddenSavings - g.target),
      goal: null,
      transactions: [
        { id: nextId(), type: "withdraw", amount: g.target, label: `सपना पूरा: ${g.name}`, date: "अभी" },
        ...state.transactions,
      ],
    },
    refused: false,
    completed: { name: g.name, target: g.target },
  };
}

export function goalProgress(goal) {
  if (!goal || !goal.target) return 0;
  return Math.min(100, Math.round((goal.saved / goal.target) * 100));
}

/* Weeks left, derived from what's actually missing and what she can actually
 * put aside. Never hardcode this: the seed data once carried a "4 weeks" that
 * the Goals tab contradicted with 44, because ₹6,460 at ₹150/week is 44. */
export function weeksAtPace(state) {
  if (!state.goal || !state.safeToSave) return null;
  const remaining = Math.max(0, state.goal.target - state.goal.saved);
  if (remaining === 0) return 0;
  return Math.ceil(remaining / state.safeToSave);
}
