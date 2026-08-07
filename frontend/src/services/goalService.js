/* Every mutation the voice layer or the UI can make to the ledger.
 * Pure functions: state in, new state out. No component touches the shape
 * directly, so the voice layer and the buttons can never drift apart.
 */

export function saveToGoal(state, amount) {
  const amt = Math.abs(Math.round(amount || 0));
  if (!amt) return state;

  return {
    ...state,
    hiddenSavings: state.hiddenSavings + amt,
    weekDelta: state.weekDelta + amt,
    goal: state.goal ? { ...state.goal, saved: state.goal.saved + amt } : null,
    transactions: [
      { id: Date.now(), type: "save", amount: amt, label: "आवाज़ से बचत", date: "अभी" },
      ...state.transactions,
    ],
  };
}

export function withdraw(state, amount) {
  const amt = Math.abs(Math.round(amount || 0));
  // Refuse rather than clamp: clamping silently empties the tijori on a
  // request that was meant to be declined.
  if (!amt || amt > state.hiddenSavings) return { state, refused: true };

  return {
    state: {
      ...state,
      hiddenSavings: state.hiddenSavings - amt,
      goal: state.goal ? { ...state.goal, saved: Math.max(0, state.goal.saved - amt) } : null,
      transactions: [
        { id: Date.now(), type: "withdraw", amount: amt, label: "निकासी", date: "अभी" },
        ...state.transactions,
      ],
    },
    refused: false,
  };
}

export function goalProgress(goal) {
  if (!goal || !goal.target) return 0;
  return Math.min(100, Math.round((goal.saved / goal.target) * 100));
}
