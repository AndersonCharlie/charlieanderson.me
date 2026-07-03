/* signature.js — the three signature sections on Home.
   Requires gsap + ScrollTrigger (CDN, deferred before this file).
   If GSAP is missing or the visitor prefers reduced motion, we drop the
   `motion` class and CSS presents each section in its final, static state.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  if (!window.__motionOK || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove("motion");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* iOS Safari: the collapsing URL bar fires resize events mid-scroll, which
     recalculates every trigger while pinned and breaks the choreography.
     ignoreMobileResize skips those; normalizeScroll smooths pinned scrubbing
     on touch devices. */
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.matchMedia("(pointer: coarse)").matches) {
    ScrollTrigger.normalizeScroll(true);
  }

  var MOBILE = window.matchMedia("(max-width: 640px)").matches;
  var EASE_OUT = "expo.out";
  var EASE_SNAP = "back.out(1.8)";

  /* =========================================================
     1. THE LINE — pinned spectrum, marker travels, settles mid
     ========================================================= */
  (function theLine() {
    var section = document.querySelector(".sig-line");
    if (!section) return;
    var stage = section.querySelector(".sig-line__stage");
    var track = section.querySelector(".spectrum__track");
    var marker = section.querySelector(".spectrum__marker");
    var cheap = gsap.utils.toArray(".spectrum__zone--cheap > *");
    var agency = gsap.utils.toArray(".spectrum__zone--agency > *");
    var zoneCheap = section.querySelector(".spectrum__zone--cheap");
    var zoneAgency = section.querySelector(".spectrum__zone--agency");
    var mid = section.querySelector(".spectrum__mid");
    var chips = gsap.utils.toArray(".mid-card .chip");
    var steps = gsap.utils.toArray(".sig-line__step");

    var markerX = function (p) {
      return function () { return (track.offsetWidth - marker.offsetWidth) * p; };
    };

    gsap.set(marker, { x: markerX(0.06)() });
    gsap.set(cheap, { autoAlpha: 0, y: 24 });
    gsap.set(agency, { autoAlpha: 0, y: -18 });
    gsap.set(mid, { autoAlpha: 0, scale: 0.82, y: 14 });
    gsap.set(chips, { autoAlpha: 0, y: 10 });
    gsap.set(steps, { autoAlpha: 0, y: 18 });

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: MOBILE ? "+=220%" : "+=280%", // shorter journey per beat on phones
        scrub: 0.6,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1, // sits AFTER the pinned diagnosis in the DOM — measure it second
      },
    });

    // Act 1 — the cheap end (0 → 1)
    tl.to(steps[0], { autoAlpha: 1, y: 0, duration: 0.25, ease: EASE_OUT }, 0.05)
      .to(cheap, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, ease: EASE_OUT }, 0.1)
      .add(function () { zoneCheap.classList.add("is-glitching"); }, 0.35);

    // Act 2 — travel to the agency end (1 → 2)
    // dimmed zones drop to 0 on small screens so nothing pokes out from behind the mid card
    var dimmed = function () { return window.matchMedia("(max-width: 820px)").matches ? 0 : 0.28; };
    tl.to(steps[0], { autoAlpha: 0, y: -14, duration: 0.2 }, 1.0)
      .to(marker, { x: markerX(0.94), duration: 0.9, ease: "power1.inOut" }, 0.95)
      .to(zoneCheap, { autoAlpha: dimmed, duration: 0.3 }, 1.1)
      .to(steps[1], { autoAlpha: 1, y: 0, duration: 0.25, ease: EASE_OUT }, 1.25)
      .to(agency, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.12, ease: "power2.out" }, 1.2);

    // Act 3 — the hard settle in the middle (2 → 3)
    tl.to(steps[1], { autoAlpha: 0, y: -14, duration: 0.2 }, 2.1)
      .to(zoneAgency, { autoAlpha: dimmed, duration: 0.3 }, 2.15)
      .to(marker, { x: markerX(0.5), duration: 0.55, ease: EASE_SNAP }, 2.2)
      .to(mid, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: EASE_SNAP }, 2.45)
      .to(steps[2], { autoAlpha: 1, y: 0, duration: 0.3, ease: EASE_OUT }, 2.6)
      .to(chips, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.07, ease: EASE_OUT }, 2.75)
      .to({}, { duration: 0.3 }); // breathing room at the end of the pin
  })();

  /* =========================================================
     2. DIAGNOSIS — diagram assembles, scan finds leaks, plan draws
     ========================================================= */
  (function diagnosis() {
    var section = document.querySelector(".sig-diag");
    if (!section) return;
    var stage = section.querySelector(".sig-diag__stage");

    var mm = gsap.matchMedia();
    mm.add(
      { desktop: "(min-width: 721px)", mobile: "(max-width: 720px)" },
      function (ctx) {
        var svg = section.querySelector(ctx.conditions.desktop ? ".diag--h" : ".diag--v");
        if (!svg) return;
        var nodes = gsap.utils.toArray(svg.querySelectorAll(".diag__node"));
        var links = gsap.utils.toArray(svg.querySelectorAll(".diag__link"));
        var weaks = gsap.utils.toArray(svg.querySelectorAll(".diag__weak"));
        var fixes = gsap.utils.toArray(svg.querySelectorAll(".diag__fix"));
        var scan = svg.querySelector(".diag__scan");
        var kicker = section.querySelector(".sig-diag__kicker");

        links.forEach(function (p) {
          var len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        fixes.forEach(function (g) {
          g.querySelectorAll("path, line").forEach(function (p) {
            var len = p.getTotalLength ? p.getTotalLength() : 120;
            gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
          });
        });
        gsap.set(nodes, { autoAlpha: 0.12, scale: 0.9, transformOrigin: "center" }); // ghost skeleton — the stage never looks empty
        gsap.set(weaks, { autoAlpha: 0 });
        gsap.set(svg.querySelectorAll(".diag__fix text, .diag__fix .diag__fixlabel"), { autoAlpha: 0 });
        gsap.set(scan, { autoAlpha: 0 });
        gsap.set(kicker, { autoAlpha: 0, y: 16 });

        var scanAxis = ctx.conditions.desktop
          ? { from: { x: 0 }, to: { x: function () { return svg.viewBox.baseVal.width; } } }
          : { from: { y: 0 }, to: { y: function () { return svg.viewBox.baseVal.height; } } };

        var tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: MOBILE ? "+=170%" : "+=210%",
            scrub: 0.6,
            pin: stage,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 2, // diagnosis is the FIRST pinned section in the DOM — measure it first
          },
        });

        // Assemble the funnel
        nodes.forEach(function (n, i) {
          tl.to(n, { autoAlpha: 1, scale: 1, duration: 0.22, ease: EASE_SNAP }, i * 0.28);
          if (links[i]) tl.to(links[i], { strokeDashoffset: 0, duration: 0.24 }, i * 0.28 + 0.16);
        });

        // The scan pass — leaks light up as the beam crosses them
        tl.set(scan, { autoAlpha: 1 }, 1.35)
          .fromTo(scan, scanAxis.from, Object.assign({ duration: 1.0, ease: "power1.inOut" }, scanAxis.to), 1.35);
        weaks.forEach(function (w, i) {
          tl.to(w, { autoAlpha: 1, duration: 0.12 }, 1.5 + i * 0.28)
            .add(function () { w.classList.add("is-pulsing"); }, 1.5 + i * 0.28);
        });
        tl.to(scan, { autoAlpha: 0, duration: 0.1 }, 2.4);

        // The plan draws itself in
        fixes.forEach(function (g, i) {
          var strokes = g.querySelectorAll("path, line");
          var labels = g.querySelectorAll("text, .diag__fixlabel");
          tl.to(strokes, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, 2.5 + i * 0.22)
            .to(labels, { autoAlpha: 1, duration: 0.18 }, 2.62 + i * 0.22);
        });
        tl.add(function () { section.classList.add("is-diagnosed"); }, 3.1)
          .to(kicker, { autoAlpha: 1, y: 0, duration: 0.3, ease: EASE_OUT }, 3.15)
          .to({}, { duration: 0.25 });

        return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
      }
    );
  })();

  /* =========================================================
     3. AI SPLIT — machine ticker vs. human strokes
     ========================================================= */
  (function aiSplit() {
    var section = document.querySelector(".sig-ai");
    if (!section) return;
    var rows = gsap.utils.toArray(".ai-ticker li");
    var strokes = section.querySelectorAll(".ai-human__art path");
    var machinePane = section.querySelector(".ai-split__pane--machine");

    strokes.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });

    /* IntersectionObserver instead of a ScrollTrigger: immune to the iOS
       URL-bar resize breaking trigger positions after the pinned sections. */
    var aiIO = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      aiIO.disconnect();
      // machine side: fast, mechanical
      gsap.fromTo(rows, { autoAlpha: 0, x: -14 }, {
        autoAlpha: 1, x: 0, duration: 0.28, stagger: 0.09, ease: "power3.out",
        onComplete: function () { section.classList.add("is-ticking"); },
      });
      // human side: slow, organic — strokes draw one by one
      gsap.to(strokes, {
        strokeDashoffset: 0, duration: 0.85, stagger: 0.14, ease: "power2.inOut", delay: 0.25,
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    aiIO.observe(section);

    // hover with intent: the machine speeds up when you look at it
    if (machinePane && window.matchMedia("(hover: hover)").matches) {
      machinePane.addEventListener("mouseenter", function () { section.classList.add("is-hot"); });
      machinePane.addEventListener("mouseleave", function () { section.classList.remove("is-hot"); });
    }
  })();

  /* The sections' triggers are built in file order but live in a different DOM
     order — sort by refreshPriority/position, then re-measure so each pin
     accounts for the spacers inserted by the pins before it. */
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  /* keep pin math honest once webfonts land (debounced — load + fonts.ready often coincide) */
  var refreshTimer;
  function queueRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 120);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueRefresh);
  window.addEventListener("load", queueRefresh);
})();
