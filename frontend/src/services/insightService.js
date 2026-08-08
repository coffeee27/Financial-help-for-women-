import { weeksAtPace } from "./goalService";

export function getSavingsInsight(state) {

  if (!state.goal) {

    return {
      amount: 0,
      messageKey: "noGoal",
      values: {}
    };

  }


  const remaining = Math.max(
    0,
    state.goal.target - state.goal.saved
  );


  const weeks = weeksAtPace(state);


  return {

    amount: state.safeToSave,

    messageKey: "safeSave",

    values: {
      amount: state.safeToSave
    },


    subtextKey: weeks
      ? "goalWeeks"
      : "goalRemaining",


    subValues: weeks
      ? {
          remaining: remaining.toLocaleString("en-IN"),
          weeks
        }
      : {
          remaining: remaining.toLocaleString("en-IN")
        }

  };

}