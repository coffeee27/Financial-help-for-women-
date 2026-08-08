/* What her money does if she leaves it somewhere.
 *
 * Computed here, in code, for the same reason every other number in this app
 * is: the model must never do arithmetic. It gets these as placeholders and
 * can only put them in a sentence.
 *
 * These are illustrations, not advice and not an offer. Rates are indicative
 * Indian retail rates and move all the time, which is why the assumed rate is
 * printed on screen next to the figure rather than hidden in a formula.
 */

export const RATES = {
  home: 0,        // cash at home
  savings: 0.025, // typical savings account
  rd: 0.07,       // typical recurring / fixed deposit
};

const WEEKS = 52;

export function projectGrowth(state, years = 1) {
  const principal = Math.max(0, Math.round(state.hiddenSavings || 0));
  const perWeek = Math.max(0, Math.round(state.safeToSave || 0));

  const at = (rate) => Math.round(principal * Math.pow(1 + rate, years));

  /* If she also keeps adding every week — future value of a regular deposit,
     compounded weekly at the annual RD rate. */
  const r = RATES.rd / WEEKS;
  const n = WEEKS * years;
  const weeklyFV = perWeek > 0 ? Math.round(perWeek * ((Math.pow(1 + r, n) - 1) / r)) : 0;

  const rd = at(RATES.rd);

  return {
    principal,
    home: principal,
    savings: at(RATES.savings),
    rd,
    gain: rd - principal,
    perWeek,
    weeklyFV,
    weeklyDeposited: perWeek * WEEKS * years,
    withWeekly: rd + weeklyFV,
    ratePct: Math.round(RATES.rd * 1000) / 10,
    savingsPct: Math.round(RATES.savings * 1000) / 10,
    years,
  };
}
