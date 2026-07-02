/* main.js — shared infrastructure for every page.
   Load order: copy.js first (defines window.COPY), then this, both deferred.
   Conventions:
     [data-copy="stats.x"]        -> textContent injected from COPY
     [data-copy-href="config.x"]  -> href injected; hides closest [data-optional] if placeholder
     [data-stats-block]           -> hidden by CSS when html.no-js (numbers only exist in copy.js)
     [data-reveal]                -> IO adds .is-in; [data-reveal-group] staggers its children
     [data-cycle-words='[...]']   -> kinetic cycling word
     [data-lead-form]             -> fetch POST to FORM_ENDPOINT, mailto fallback
     [data-event="name"]          -> analytics event on click
*/
(function () {
  "use strict";

  var COPY = window.COPY || { config: {}, stats: {} };
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.__motionOK = !REDUCED;

  function get(path) {
    return path.split(".").reduce(function (o, k) { return o && o[k]; }, COPY);
  }
  function isPlaceholder(v) {
    return typeof v !== "string" || /^\[.*\]$/.test(v) || v === "";
  }

  /* ---------- copy injection ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (el) {
    var v = get(el.getAttribute("data-copy"));
    if (!isPlaceholder(v)) el.textContent = v;
  });
  document.querySelectorAll("[data-copy-href]").forEach(function (el) {
    var v = get(el.getAttribute("data-copy-href"));
    if (isPlaceholder(v)) {
      var wrap = el.closest("[data-optional]") || el;
      wrap.setAttribute("hidden", "");
    } else {
      el.setAttribute("href", v);
    }
  });

  /* scoreboard digits: split stat values into chars that roll in (CSS-driven) */
  if (!REDUCED) {
    document.querySelectorAll(".stat__big").forEach(function (el) {
      var t = el.textContent;
      if (!t) return;
      el.setAttribute("aria-label", t);
      el.textContent = "";
      t.split("").forEach(function (c, i) {
        var s = document.createElement("span");
        s.className = "ch";
        s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--i", i);
        s.textContent = c;
        el.appendChild(s);
      });
    });
  }

  document.querySelectorAll("[data-copy-mailto]").forEach(function (el) {
    var email = (COPY.config || {}).EMAIL;
    if (isPlaceholder(email)) return;
    el.setAttribute("href", "mailto:" + email);
    el.textContent = email;
  });

  /* ---------- analytics (Vercel Web Analytics shim + events) ---------- */
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  function track(name, data) { try { window.va("event", { name: name, data: data || {} }); } catch (e) {} }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-event]");
    if (el) track(el.getAttribute("data-event"), { label: el.getAttribute("data-event-label") || el.textContent.trim().slice(0, 40) });
  });

  /* ---------- nav: solid after scroll, hide down / show up ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        nav.classList.toggle("nav--solid", y > 40);
        if (!REDUCED) nav.classList.toggle("nav--hidden", y > lastY && y > 320);
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- reveal system ---------- */
  var reveals = document.querySelectorAll("[data-reveal]");
  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    var i = 0;
    group.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (!el.style.getPropertyValue("--reveal-delay")) {
        el.style.setProperty("--reveal-delay", (i * 90) + "ms");
      }
      i++;
    });
  });
  if (REDUCED || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- kinetic cycling word ---------- */
  document.querySelectorAll("[data-cycle-words]").forEach(function (el) {
    var words;
    try { words = JSON.parse(el.getAttribute("data-cycle-words")); } catch (e) { return; }
    if (!words || words.length < 2 || REDUCED) return;
    var i = 0, visible = true, timer = null;
    var wrap = el.parentNode;
    var counter = wrap.querySelector(".cycle-count");
    var vio = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; });
    vio.observe(el);
    // draw the underline in once the hero line has landed
    setTimeout(function () { wrap.classList.remove("u-out"); }, 1150);
    function next() {
      timer = setTimeout(function () {
        if (visible && !document.hidden) {
          i = (i + 1) % words.length;
          el.classList.add("cycle-out");
          wrap.classList.add("u-out"); // erase the annotation with the word
          setTimeout(function () {
            el.textContent = words[i];
            if (counter) counter.textContent = String(i + 1).padStart(2, "0") + "/" + String(words.length).padStart(2, "0");
            el.classList.remove("cycle-out");
            el.classList.add("cycle-in");
            wrap.classList.remove("u-out"); // redraw, fitted to the new word
            setTimeout(function () { el.classList.remove("cycle-in"); }, 620);
          }, 380);
        }
        next();
      }, 2600);
    }
    // pause the loop entirely while the tab is hidden
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { clearTimeout(timer); timer = null; }
      else if (!timer) next();
    });
    next();
  });

  /* ---------- lead form: fetch POST, mailto fallback ---------- */
  document.querySelectorAll("[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var btn = form.querySelector("button[type=submit]");
      var status = form.querySelector(".form-status");
      var endpoint = (COPY.config || {}).FORM_ENDPOINT;

      function showStatus(msg, ok) {
        if (status) {
          status.textContent = msg;
          status.classList.toggle("form-status--ok", !!ok);
          status.removeAttribute("hidden");
        }
      }

      if (isPlaceholder(endpoint)) {
        // No endpoint configured yet: build the email instead.
        var lines = [];
        data.forEach(function (v, k) { if (v) lines.push(k + ": " + v); });
        var mail = "mailto:" + (COPY.config.EMAIL || "charlie@charlieanderson.me") +
          "?subject=" + encodeURIComponent("Free diagnosis request — " + (data.get("business") || data.get("name") || "")) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        track("diagnosis_submit", { via: "mailto" });
        window.location.href = mail;
        showStatus("Opening your email app — hit send and I'll take it from there.", true);
        return;
      }

      if (btn) { btn.disabled = true; btn.classList.add("is-busy"); }
      fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("bad status " + res.status);
          track("diagnosis_submit", { via: "form" });
          form.querySelectorAll(".form-fields, button[type=submit]").forEach(function (n) { n.setAttribute("hidden", ""); });
          showStatus("Got it. I'll take a look and get back to you within a couple of days.", true);
        })
        .catch(function () {
          var email = COPY.config.EMAIL || "charlie@charlieanderson.me";
          if (status) {
            status.innerHTML = 'Something glitched — <a href="mailto:' + email + '">email me directly</a> instead.';
            status.classList.remove("form-status--ok");
            status.removeAttribute("hidden");
          }
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.classList.remove("is-busy"); }
        });
    });
  });
})();
