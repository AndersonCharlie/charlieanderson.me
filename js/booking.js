/* booking.js — /call/ page logic
   Load order: copy.js → main.js → booking.js (all defer)
   Dependencies: none (vanilla JS, IIFE pattern matching main.js style)

   Public hooks on window.Booking (for testing / orchestrator):
     Booking.state        — current state string
     Booking.slots        — raw UTC slot strings from API
     Booking.selectedSlot — currently selected UTC ISO string
     Booking.retry()      — re-fetch availability and return to picker
*/
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* DOM refs                                                             */
  /* ------------------------------------------------------------------ */
  var elLoading      = document.getElementById("booking-loading");
  var elError        = document.getElementById("booking-error");
  var elEmpty        = document.getElementById("booking-empty");
  var elPicker       = document.getElementById("booking-picker");
  var elDays         = document.getElementById("booking-days");
  var elSlotsWrap    = document.getElementById("booking-slots-wrap");
  var elSlots        = document.getElementById("booking-slots");
  var elSlotTaken    = document.getElementById("booking-slot-taken");
  var elTz           = document.getElementById("booking-tz");
  var elFormSection  = document.getElementById("booking-form-section");
  var elForm         = document.getElementById("booking-form");
  var elSubmit       = document.getElementById("booking-submit");
  var elStatus       = document.getElementById("booking-status");
  var elBack         = document.getElementById("booking-back");
  var elSelectedLbl  = document.getElementById("booking-selected-label");
  var elConfirm      = document.getElementById("booking-confirm");
  var elConfirmTime  = document.getElementById("booking-confirm-time");

  /* ------------------------------------------------------------------ */
  /* State                                                                */
  /* ------------------------------------------------------------------ */
  var visitorTz    = "";
  var tzLabel      = "";
  var allSlots     = [];    // UTC ISO strings from API
  var selectedSlot = null;  // chosen UTC ISO string
  var selectedDay  = null;  // "2026-07-06" local-date key

  /* ------------------------------------------------------------------ */
  /* Helpers                                                              */
  /* ------------------------------------------------------------------ */

  /* Detect timezone once */
  function detectTz() {
    try {
      var tf = Intl.DateTimeFormat().resolvedOptions();
      visitorTz = tf.timeZone || "UTC";
    } catch (e) {
      visitorTz = "UTC";
    }
    /* Build a friendly display name (e.g. "America/New_York" → "Eastern Time") */
    try {
      var now = new Date();
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "long",
        timeZone: visitorTz
      }).formatToParts(now);
      var tzPart = parts.find(function (p) { return p.type === "timeZoneName"; });
      tzLabel = tzPart ? tzPart.value : visitorTz;
    } catch (e) {
      tzLabel = visitorTz;
    }
  }

  /* Format a UTC ISO string for display in visitor's timezone */
  function fmtTime(isoStr) {
    return new Date(isoStr).toLocaleTimeString("en-US", {
      timeZone: visitorTz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }

  function fmtDayFull(isoStr) {
    return new Date(isoStr).toLocaleDateString("en-US", {
      timeZone: visitorTz,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  /* "MON 7" style chip label */
  function fmtDayChip(isoStr) {
    var d = new Date(isoStr);
    var weekday = d.toLocaleDateString("en-US", { timeZone: visitorTz, weekday: "short" }).toUpperCase();
    var dayNum  = d.toLocaleDateString("en-US", { timeZone: visitorTz, day: "numeric" });
    return weekday + " " + dayNum;
  }

  /* Local date key "YYYY-MM-DD" in visitor's timezone */
  function localDateKey(isoStr) {
    var d = new Date(isoStr);
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: visitorTz,
      year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(d);
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    return map.year + "-" + map.month + "-" + map.day;
  }

  /* Group slots by local date key */
  function groupByDay(slots) {
    var days = {};
    var order = [];
    slots.forEach(function (iso) {
      var key = localDateKey(iso);
      if (!days[key]) { days[key] = []; order.push(key); }
      days[key].push(iso);
    });
    return { days: days, order: order };
  }

  /* analytics shim — matches main.js pattern */
  function track(name, data) {
    try { window.va("event", { name: name, data: data || {} }); } catch (e) {}
  }

  /* Show/hide helpers — hidden attr toggles */
  function show(el) { if (el) el.removeAttribute("hidden"); }
  function hide(el) { if (el) el.setAttribute("hidden", ""); }
  function hideAll() {
    hide(elLoading); hide(elError); hide(elEmpty);
    hide(elPicker); hide(elFormSection); hide(elConfirm);
  }

  /* ------------------------------------------------------------------ */
  /* State transitions                                                    */
  /* ------------------------------------------------------------------ */

  function setState(name) {
    window.Booking.state = name;
  }

  function showLoading() {
    hideAll();
    setState("loading");
    show(elLoading);
  }

  function showError() {
    hideAll();
    setState("error");
    show(elError);
  }

  function showEmpty() {
    hideAll();
    setState("empty");
    show(elEmpty);
  }

  function showPicker(focusDay) {
    hideAll();
    setState("picker");
    hide(elSlotTaken);
    renderPicker();
    show(elPicker);
    /* scroll the section into comfortable view */
    var section = document.querySelector(".booking-section");
    if (section) {
      requestAnimationFrame(function () {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (focusDay) {
      /* find and focus the chip for focusDay */
      requestAnimationFrame(function () {
        var btn = elDays.querySelector("[data-day=\"" + focusDay + "\"]");
        if (btn) btn.focus();
      });
    }
  }

  function showSlotTaken() {
    show(elSlotTaken);
    /* re-fetch and return to picker after brief pause */
    setTimeout(function () {
      selectedSlot = null;
      fetchAvailability(true);
    }, 1400);
  }

  function showFormSection() {
    hideAll();
    setState("form");
    show(elFormSection);
    /* update the selected time label */
    if (elSelectedLbl && selectedSlot) {
      elSelectedLbl.textContent = fmtDayFull(selectedSlot) + " at " + fmtTime(selectedSlot);
    }
    if (elStatus) {
      elStatus.setAttribute("hidden", "");
      elStatus.textContent = "";
      elStatus.className = "form-status";
    }
    if (elSubmit) {
      elSubmit.disabled = false;
      elSubmit.classList.remove("is-busy");
      elSubmit.removeAttribute("hidden");
    }
    show(elFormSection.querySelector(".form-fields"));
    requestAnimationFrame(function () {
      elFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function showConfirm(startIso) {
    hideAll();
    setState("confirmed");
    // the whole picker band goes away — the confirm band is the page now
    hide(document.getElementById("booking-picker-section"));
    if (elConfirmTime) {
      elConfirmTime.textContent =
        fmtDayFull(startIso) + " at " + fmtTime(startIso) + " (" + tzLabel + ")";
    }
    show(elConfirm);
    requestAnimationFrame(function () {
      elConfirm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    track("booking_confirmed", { slot: startIso });
  }

  /* ------------------------------------------------------------------ */
  /* Render picker                                                        */
  /* ------------------------------------------------------------------ */

  function renderPicker() {
    /* timezone notice */
    if (elTz) elTz.textContent = "Times shown in " + tzLabel;

    var grouped = groupByDay(allSlots);

    /* ---- day chips ---- */
    elDays.innerHTML = "";
    grouped.order.forEach(function (dayKey, i) {
      var firstSlot = grouped.days[dayKey][0];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip booking-day-chip";
      btn.setAttribute("role", "option");
      btn.setAttribute("data-day", dayKey);
      btn.setAttribute("aria-selected", dayKey === selectedDay ? "true" : "false");
      if (dayKey === selectedDay) btn.classList.add("is-selected");
      btn.textContent = fmtDayChip(firstSlot);
      btn.addEventListener("click", function () { selectDay(dayKey); });
      elDays.appendChild(btn);
    });

    /* ---- select first day if none chosen ---- */
    if (!selectedDay && grouped.order.length > 0) {
      selectedDay = grouped.order[0];
    }

    renderSlots(grouped);
  }

  function renderSlots(grouped) {
    if (!grouped) {
      grouped = groupByDay(allSlots);
    }

    /* update day chip selection state */
    elDays.querySelectorAll("[data-day]").forEach(function (btn) {
      var active = btn.getAttribute("data-day") === selectedDay;
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.classList.toggle("is-selected", active);
    });

    /* render time slots for selected day */
    elSlots.innerHTML = "";
    var daySlots = selectedDay && grouped.days[selectedDay] ? grouped.days[selectedDay] : [];

    if (daySlots.length === 0) {
      var msg = document.createElement("p");
      msg.className = "booking-slots-empty";
      msg.textContent = "No times available for this day.";
      elSlots.appendChild(msg);
      return;
    }

    daySlots.forEach(function (iso) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip booking-slot-chip";
      btn.setAttribute("role", "option");
      btn.setAttribute("data-slot", iso);
      btn.setAttribute("aria-selected", iso === selectedSlot ? "true" : "false");
      if (iso === selectedSlot) btn.classList.add("is-selected");
      btn.textContent = fmtTime(iso);
      btn.addEventListener("click", function () { selectSlot(iso); });
      elSlots.appendChild(btn);
    });

    show(elSlotsWrap);
  }

  /* ------------------------------------------------------------------ */
  /* Interactions                                                         */
  /* ------------------------------------------------------------------ */

  function selectDay(dayKey) {
    selectedDay = dayKey;
    selectedSlot = null;
    hide(elSlotTaken);
    renderSlots(groupByDay(allSlots));
    /* scroll slot wrap into view on mobile */
    if (elSlotsWrap) {
      requestAnimationFrame(function () {
        elSlotsWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }

  function selectSlot(iso) {
    selectedSlot = iso;
    /* update chip states */
    elSlots.querySelectorAll("[data-slot]").forEach(function (btn) {
      var active = btn.getAttribute("data-slot") === iso;
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.classList.toggle("is-selected", active);
    });
    /* short delay then reveal form */
    setTimeout(function () { showFormSection(); }, 200);
  }

  /* ------------------------------------------------------------------ */
  /* API calls                                                            */
  /* ------------------------------------------------------------------ */

  function fetchAvailability(isRetry) {
    showLoading();
    fetch("/api/availability")
      .then(function (res) {
        if (!res.ok) throw new Error("non-200");
        return res.json();
      })
      .then(function (data) {
        var slots = Array.isArray(data.slots) ? data.slots : [];
        if (slots.length === 0) {
          showEmpty();
          return;
        }
        allSlots = slots;
        window.Booking.slots = allSlots;
        if (isRetry) {
          /* coming back from a 409 — reset day/slot selection */
          selectedSlot = null;
          selectedDay = null;
        }
        showPicker();
      })
      .catch(function () {
        showError();
      });
  }

  function submitBooking(name, email, notes, honeypot) {
    if (elSubmit) { elSubmit.disabled = true; elSubmit.classList.add("is-busy"); }
    hide(elSlotTaken);

    var payload = {
      start: selectedSlot,
      name: name,
      email: email,
      notes: notes,
      tz: visitorTz,
      website: honeypot   /* honeypot field — backend checks this is empty */
    };

    fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (res.status === 409) {
          /* slot taken — show message, re-fetch, return to picker */
          if (elSubmit) { elSubmit.disabled = false; elSubmit.classList.remove("is-busy"); }
          showStatus("That time was just taken — pick another.", false);
          setTimeout(function () {
            /* hide form, fetch fresh slots, return to picker with 409 notice visible */
            fetchAvailability(true);
            setTimeout(function () { show(elSlotTaken); }, 600);
          }, 800);
          return null;
        }
        if (!res.ok) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            throw new Error(body.error || "server error");
          });
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return; /* 409 already handled */
        showConfirm(data.start || selectedSlot);
      })
      .catch(function (err) {
        if (err && err.message && err.message !== "server error") {
          showStatus(err.message, false);
        } else {
          // the one intentionally-HTML message; hardcoded literal only
          showStatus(
            "Something went wrong — <a href=\"mailto:charlie@charlieanderson.me\" data-event=\"email_click\">email me directly</a> to lock in a time.",
            false,
            true
          );
        }
        if (elSubmit) { elSubmit.disabled = false; elSubmit.classList.remove("is-busy"); }
      });
  }

  function showStatus(msg, ok, isHtml) {
    if (!elStatus) return;
    // textContent by default — only hardcoded literals may pass isHtml
    if (isHtml) elStatus.innerHTML = msg;
    else elStatus.textContent = msg;
    elStatus.className = "form-status" + (ok ? " form-status--ok" : "");
    elStatus.removeAttribute("hidden");
  }

  /* ------------------------------------------------------------------ */
  /* Form submit                                                          */
  /* ------------------------------------------------------------------ */

  if (elForm) {
    elForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!selectedSlot) return;

      var nameEl  = elForm.querySelector("[name=name]");
      var emailEl = elForm.querySelector("[name=email]");
      var notesEl = elForm.querySelector("[name=notes]");
      var honeyEl = elForm.querySelector("[name=website]");

      var name  = nameEl  ? nameEl.value.trim()  : "";
      var email = emailEl ? emailEl.value.trim()  : "";
      var notes = notesEl ? notesEl.value.trim()  : "";
      var honey = honeyEl ? honeyEl.value         : "";

      /* client-side validation */
      if (!name || !email) {
        showStatus("Name and email are required.", false);
        if (!name && nameEl) nameEl.focus();
        else if (!email && emailEl) emailEl.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus("Check that email address.", false);
        if (emailEl) emailEl.focus();
        return;
      }

      submitBooking(name, email, notes, honey);
    });
  }

  /* ------------------------------------------------------------------ */
  /* "← Change time" back button                                         */
  /* ------------------------------------------------------------------ */

  if (elBack) {
    elBack.addEventListener("click", function () {
      showPicker(selectedDay);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  function init() {
    detectTz();
    fetchAvailability(false);
  }

  /* ------------------------------------------------------------------ */
  /* Public surface                                                       */
  /* ------------------------------------------------------------------ */

  window.Booking = {
    state: "init",
    slots: [],
    get selectedSlot() { return selectedSlot; },
    retry: function () { fetchAvailability(true); }
  };

  /* Run once DOM is interactive (script is deferred so DOM is ready) */
  init();

})();
