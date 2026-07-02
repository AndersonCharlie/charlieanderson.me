/* ============================================================
   copy.js — SINGLE SOURCE OF TRUTH for every number, claim,
   link, and placeholder on this site.

   Edit a value here and it updates everywhere it appears.
   Numbers/claims must NEVER be hard-coded in HTML — they live
   here and get injected into <span data-copy="..."> slots.
   Mirrored in COPY.md (update the mirror when you edit here).
   ============================================================ */
window.COPY = {
  config: {
    // Form POST endpoint (e.g. Formspree/Basin URL). While this is
    // still a [PLACEHOLDER], the form falls back to opening email.
    FORM_ENDPOINT: "[FORM_ENDPOINT]",
    // Optional scheduling link shown on /book/ ("or grab a time directly").
    // Stays hidden while it's a [PLACEHOLDER].
    BOOKING_URL: "[BOOKING_URL]",
    LINKEDIN_URL: "[LINKEDIN_URL]",
    IG_URL: "[IG_URL]",
    EMAIL: "charlie@charlieanderson.me",
  },
  stats: {
    // How many clients the team takes at a time
    clientCount: "5–8",
    // Meal JOY — launch return on ad spend
    mealjoyLaunchMultiple: "3.33×",
    mealjoyLaunchSpend: "$2,717.66",
    mealjoyLaunchReturn: "$9,063.31",
    // Meal JOY — peak return + the window it happened in
    mealjoyPeakMultiple: "4.43×",
    mealjoyPeakWindow: "12-day",
    // Meal JOY — what new creative did to cost-per-click
    mealjoyCpcShort: "~⅓",
    mealjoyCpcSentence: "about a third of what it was",
  },
};
