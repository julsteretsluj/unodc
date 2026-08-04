/**
 * Scroll reveals, header polish, and reduced-motion support.
 */
(function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setupHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setupReveal() {
    if (prefersReducedMotion) return;

    var selector = [
      ".section-title",
      ".section-desc",
      ".about-card",
      ".home-committee-group",
      ".home-committee-card",
      ".committee-card",
      ".leadership-card",
      ".schedule-grid > *",
      ".sponsor-tier",
      ".partnership-card",
      ".meta-row",
      ".contact-lead",
      ".contact-note",
      ".hero-actions .btn",
      ".forms-page > h2",
      ".forms-page > p",
      ".form-tabs",
      ".form-panel",
      ".schedule-tabs",
      ".schedule-panel",
      ".schedule-day",
      ".topic-block",
      ".topic-panel",
      ".resource-card",
      ".placeholder-panel",
      ".allocation-grid",
      ".schedule-grid-local > *",
      ".committee-btn",
      ".agenda-logo",
      ".agenda-title",
    ].join(", ");

    var items = document.querySelectorAll(selector);
    if (!items.length) return;

    items.forEach(function (el, index) {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", (index % 10) * 0.05 + "s");
    });

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    document.documentElement.classList.add(prefersReducedMotion ? "motion-reduced" : "motion-ok");
    setupHeaderScroll();
    setupReveal();
  }
})();
