/* The "safe to save this week" number.
 *
 * Static for the demo, deliberately behind a function with the same shape a
 * real model would return — Person C's quantile-regression forecast drops in
 * here without any component changing. Do not inline this value in the UI.
 */
import { weeksAtPace } from "./goalService";

export function getSavingsInsight(state) {
  if (!state.goal) {
    return { amount: 0, message: "इस हफ्ते कोई लक्ष्य नहीं है।" };
  }

  const remaining = Math.max(0, state.goal.target - state.goal.saved);
  const weeks = weeksAtPace(state);

  return {
    amount: state.safeToSave,
    message: `इस हफ्ते आप ₹${state.safeToSave} सुरक्षित बचा सकती हैं।`,
    subtext: weeks
      ? `लक्ष्य तक ₹${remaining.toLocaleString("en-IN")} और चाहिए — लगभग ${weeks} हफ्ते।`
      : `लक्ष्य तक ₹${remaining.toLocaleString("en-IN")} और चाहिए।`,
  };
}
