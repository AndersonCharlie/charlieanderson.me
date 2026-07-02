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
    // FormSubmit AJAX endpoint — delivers form submissions to Charlie's inbox.
    // NOTE: the very first submission triggers an activation email to that
    // address; click the confirm link once and everything after flows through.
    FORM_ENDPOINT: "https://formsubmit.co/ajax/charlie@charlieanderson.me",
    // Calendly — direct call booking
    BOOKING_URL: "https://calendly.com/charlie-interviews",
    // Redefining Limits — the podcast (footer links; episode links live inline on Home)
    SPOTIFY_URL: "https://open.spotify.com/show/21qiKQ9A0Dk0hfDmqYaZOF",
    LINKEDIN_URL: "[LINKEDIN_URL]",
    IG_URL: "[IG_URL]",
    EMAIL: "charlie@charlieanderson.me",
  },
  stats: {
    // How many clients the team takes at a time
    clientCount: "5–8",
    // Charlie's mile time (About page)
    mileTime: "5:56",
    // Meal JOY — average ROAS range on Meta ads
    mealjoyRoasRange: "4–11×",
    // Meal JOY — what happened to their overall revenue
    mealjoyRevenueMultiple: "4×",
    // Meal JOY — launch-month receipts (the "show your work" numbers)
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
