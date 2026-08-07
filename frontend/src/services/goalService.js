/*
 * Every mutation the voice layer or the UI can make to the ledger.
 * Pure functions: state in, new state out.
 */

let txSeq = 0;

const nextId = () => `${Date.now()}-${++txSeq}`;

export function saveToGoal(state, amount) {
  const amt = Math.abs(Math.round(amount || 0));

  if (!amt) return state;

  return {
    ...state,
    hiddenSavings: state.hiddenSavings + amt,
    weekDelta: (state.weekDelta || 0) + amt,
    goal: state.goal
      ? {
          ...state.goal,
          saved: state.goal.saved + amt,
        }
      : null,
    transactions: [
      {
        id: nextId(),
        type: "save",
        amount: amt,
        label: "आवाज़ से बचत",
        date: "अभी",
      },
      ...state.transactions,
    ],
  };
}

function take(state, amount, label) {
  const amt = Math.abs(Math.round(amount || 0));

  if (!amt || amt > state.hiddenSavings) {
    return { state, refused: true };
  }

  return {
    state: {
      ...state,
      hiddenSavings: state.hiddenSavings - amt,
      goal: state.goal
        ? {
            ...state.goal,
            saved: Math.max(0, state.goal.saved - amt),
          }
        : null,
      transactions: [
        {
          id: nextId(),
          type: "withdraw",
          amount: amt,
          label,
          date: "अभी",
        },
        ...state.transactions,
      ],
    },
    refused: false,
  };
}

export function withdraw(state, amount) {
  return take(state, amount, "निकासी");
}

export function emergencyWithdraw(state, amount) {
  return take(state, amount, "ज़रूरी निकासी");
}

export function reconcile(state, actualTotal) {
  const actual = Math.max(0, Math.round(actualTotal || 0));
  const diff = actual - state.hiddenSavings;

  if (diff === 0) {
    return {
      state,
      diff: 0,
    };
  }

  return {
    state: {
      ...state,
      hiddenSavings: actual,
      goal: state.goal
        ? {
            ...state.goal,
            saved: Math.max(0, state.goal.saved + diff),
          }
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

export function changeGoal(state, name, target, nameEn = "") {
  const t = Math.max(0, Math.round(target || 0));
  const goalName = (name || "").trim() || "नया लक्ष्य";

  return {
    ...state,
    goal: {
      id: nextId(),
      name: goalName,
      nameEn,
      target: t,
      saved: state.hiddenSavings,
    },
    transactions: [
      {
        id: nextId(),
        type: "save",
        amount: t,
        label: `नया लक्ष्य: ${goalName}`,
        date: "अभी",
      },
      ...state.transactions,
    ],
  };
}

export function isGoalAchieved(state) {
  return (
    !!state.goal &&
    state.goal.target > 0 &&
    state.goal.saved >= state.goal.target
  );
}

export function accomplishGoal(state) {
  if (!isGoalAchieved(state)) {
    return {
      state,
      refused: true,
      completed: null,
    };
  }

  const g = state.goal;

  return {
    state: {
      ...state,
      hiddenSavings: Math.max(0, state.hiddenSavings - g.target),
      goal: null,
      transactions: [
        {
          id: nextId(),
          type: "withdraw",
          amount: g.target,
          label: `सपना पूरा: ${g.name}`,
          date: "अभी",
        },
        ...state.transactions,
      ],
    },
    refused: false,
    completed: {
      name: g.name,
      target: g.target,
    },
  };
}

export function goalProgress(goal) {
  if (!goal || !goal.target) return 0;

  return Math.min(100, Math.round((goal.saved / goal.target) * 100));
}

export function weeksAtPace(state) {
  if (!state.goal || !state.safeToSave) {
    return null;
  }

  const remaining = Math.max(
    0,
    state.goal.target - state.goal.saved
  );

  if (remaining === 0) {
    return 0;
  }

  return Math.ceil(remaining / state.safeToSave);
}