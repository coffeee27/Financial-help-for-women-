const insights = [
  "You can safely save ₹150 this week.",
  "You are on track to reach your goal this month.",
  "Saving ₹100 today keeps you within your weekly budget.",
];

export function generateInsight() {
  const index = Math.floor(Math.random() * insights.length);

  return insights[index];
}