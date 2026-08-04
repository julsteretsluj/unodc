/**
 * Access gate — UDHR document; click the golden seal circle to stamp.
 * Skip also unlocks. Then reveals the main UNODC site UI.
 */
(function () {
  var gate = document.getElementById("payment-gate");
  var siteApp = document.getElementById("site-app");
  if (!gate) return;

  var unlocked = false;
  var stamped = false;
  var timers = [];

  function clearTimers() {
    timers.forEach(function (id) {
      clearTimeout(id);
    });
    timers = [];
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    clearTimers();
    var msg = gate.querySelector("[data-pay-success]");
    if (msg) msg.hidden = false;
    timers.push(
      setTimeout(function () {
        gate.hidden = true;
        gate.setAttribute("aria-hidden", "true");
        document.body.classList.remove("payment-open");
        if (siteApp) {
          siteApp.hidden = false;
          siteApp.removeAttribute("aria-hidden");
        }
        window.scrollTo(0, 0);
      }, 1400)
    );
  }

  function stamp() {
    if (stamped || unlocked) return;
    stamped = true;

    var btn = gate.querySelector("[data-seal-target]");
    var seal = gate.querySelector("[data-wax-seal]");
    var hint = gate.querySelector("[data-pay-hint]");

    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-pressed", "true");
      btn.classList.add("is-stamped");
    }
    if (hint) hint.textContent = "Sealing the declaration…";

    if (seal) {
      seal.hidden = false;
      // restart animation
      seal.classList.remove("is-stamping");
      void seal.offsetWidth;
      seal.classList.add("is-stamping");
    }

    timers.push(
      setTimeout(function () {
        if (hint) hint.textContent = "Declaration sealed. Welcome.";
        unlock();
      }, 1600)
    );
  }

  function render() {
    clearTimers();
    stamped = false;

    gate.innerHTML =
      '<div class="gate-screen payment-screen udhr-screen" role="dialog" aria-labelledby="gate-title" aria-describedby="gate-desc">' +
      '<h2 id="gate-title">Delegate access</h2>' +
      '<p id="gate-desc" class="payment-desc">Affix the seal to enter the UNODC committee portal.</p>' +
      '<div class="udhr-scene" data-scene>' +
      '<div class="udhr-frame">' +
      '<img class="udhr-doc" src="assets/gate/udhr.png?v=20260803e" alt="Committee access document" draggable="false">' +
      '<button type="button" class="udhr-seal-target" data-seal-target aria-label="Stamp the golden seal circle" aria-pressed="false"></button>' +
      '<img class="udhr-wax-seal" data-wax-seal src="assets/gate/wax-seal.png?v=20260803e" alt="" draggable="false" hidden>' +
      "</div>" +
      "</div>" +
      '<p class="payment-hint" data-pay-hint>Click the golden circle to stamp the seal</p>' +
      '<p class="payment-success" data-pay-success hidden>Sealed. Welcome to UNODC.</p>' +
      '<button type="button" class="payment-skip" data-skip>Skip — enter without stamping</button>' +
      "</div>";

    gate.querySelector("[data-seal-target]").addEventListener("click", stamp);
    gate.querySelector("[data-skip]").addEventListener("click", function () {
      clearTimers();
      unlock();
    });
  }

  window.addEventListener("unodc:show-payment", function () {
    if (!unlocked) render();
  });
})();
