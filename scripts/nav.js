/** Mobile nav toggle — shared across site pages. */
(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var dropdown = document.getElementById("nav-dropdown");
  if (!toggle || !dropdown) return;

  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", function () {
    var open = dropdown.hasAttribute("hidden");
    if (open) {
      dropdown.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    } else {
      dropdown.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  });
})();
