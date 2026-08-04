/**
 * Access gate — drag the pill into the bottle to enter UNODC.
 * Skip also unlocks. Then reveals the main UNODC site UI.
 */
(function () {
  var gate = document.getElementById("payment-gate");
  var siteApp = document.getElementById("site-app");
  if (!gate) return;

  var unlocked = false;
  var deposited = false;
  var isDragging = false;
  var pillEl = null;
  var bottleEl = null;
  var sceneEl = null;
  var dropZone = null;
  var dragOffset = { x: 0, y: 0 };
  var pos = null;
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
      }, 1200)
    );
  }

  function placePillHome() {
    if (!pillEl || !sceneEl) return;
    pillEl.classList.remove("is-dragging", "is-deposited", "is-free");
    pillEl.style.position = "";
    pillEl.style.left = "";
    pillEl.style.top = "";
    pillEl.style.transform = "";
    pillEl.style.zIndex = "";
    pos = null;
  }

  function placePillAt(x, y) {
    if (!pillEl) return;
    pillEl.style.left = x + "px";
    pillEl.style.top = y + "px";
    pillEl.style.transform = "none";
  }

  function pillCenter() {
    if (!pillEl) return null;
    var r = pillEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function isOverBottle() {
    var zone = dropZone || bottleEl;
    if (!zone) return false;
    var c = pillCenter();
    if (!c) return false;
    var r = zone.getBoundingClientRect();
    // Require pill center inside the bottle body (slightly inset)
    var padX = r.width * 0.18;
    var padTop = r.height * 0.12;
    var padBottom = r.height * 0.08;
    return (
      c.x >= r.left + padX &&
      c.x <= r.right - padX &&
      c.y >= r.top + padTop &&
      c.y <= r.bottom - padBottom
    );
  }

  function depositPill() {
    if (deposited || unlocked) return;
    deposited = true;
    isDragging = false;

    var hint = gate.querySelector("[data-pay-hint]");
    if (hint) hint.textContent = "Dose dispensed — entering UNODC…";

    pillEl.classList.remove("is-dragging");
    pillEl.classList.add("is-deposited");

    // Snap pill into bottle mouth, then shrink as it “drops in”
    var bottle = bottleEl.getBoundingClientRect();
    var targetX = bottle.left + bottle.width * 0.5 - pillEl.offsetWidth * 0.5;
    var targetY = bottle.top + bottle.height * 0.22 - pillEl.offsetHeight * 0.5;
    pillEl.style.position = "fixed";
    pillEl.style.left = targetX + "px";
    pillEl.style.top = targetY + "px";
    pillEl.style.zIndex = "5";

    timers.push(
      setTimeout(function () {
        pillEl.classList.add("is-swallowed");
      }, 80)
    );

    timers.push(
      setTimeout(function () {
        unlock();
      }, 900)
    );
  }

  function render() {
    clearTimers();
    deposited = false;
    isDragging = false;
    pos = null;

    gate.innerHTML =
      '<div class="gate-screen payment-screen pill-screen" role="dialog" aria-labelledby="gate-title" aria-describedby="gate-desc">' +
      '<h2 id="gate-title">Delegate access</h2>' +
      '<p id="gate-desc" class="payment-desc">Drag the pill into the bottle to enter the UNODC committee portal.</p>' +
      '<div class="pill-scene" data-scene>' +
      '<div class="pill-bottle-wrap" data-drop-zone>' +
      '<img class="pill-bottle" data-bottle src="assets/gate/pill-bottle.png?v=20260804e" alt="Pill bottle" draggable="false">' +
      "</div>" +
      '<div class="pill-drag" data-pill role="img" aria-label="Pill — drag into the bottle" tabindex="0">' +
      '<img src="assets/gate/pill.png?v=20260804e" alt="" draggable="false">' +
      "</div>" +
      "</div>" +
      '<p class="payment-hint" data-pay-hint>Drag the pill into the bottle to continue</p>' +
      '<p class="payment-success" data-pay-success hidden>Dispensed. Welcome to UNODC.</p>' +
      '<button type="button" class="payment-skip" data-skip>Skip — enter without dispensing</button>' +
      "</div>";

    pillEl = gate.querySelector("[data-pill]");
    bottleEl = gate.querySelector("[data-bottle]");
    dropZone = gate.querySelector("[data-drop-zone]");
    sceneEl = gate.querySelector("[data-scene]");
    placePillHome();

    gate.querySelector("[data-skip]").addEventListener("click", function () {
      clearTimers();
      unlock();
    });

    pillEl.addEventListener("pointerdown", function (e) {
      if (deposited || unlocked) return;
      e.preventDefault();
      isDragging = true;
      pillEl.classList.add("is-dragging", "is-free");
      pillEl.style.position = "fixed";
      pillEl.style.zIndex = "30";
      var r = pillEl.getBoundingClientRect();
      dragOffset = { x: e.clientX - r.left, y: e.clientY - r.top };
      pos = { x: r.left, y: r.top };
      placePillAt(pos.x, pos.y);
      try {
        pillEl.setPointerCapture(e.pointerId);
      } catch (err) {}
    });

    pillEl.addEventListener("pointermove", function (e) {
      if (!isDragging || deposited) return;
      pos = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
      placePillAt(pos.x, pos.y);
      if (dropZone) {
        dropZone.classList.toggle("is-target", isOverBottle());
      }
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      pillEl.classList.remove("is-dragging");
      if (dropZone) dropZone.classList.remove("is-target");
      if (isOverBottle()) {
        depositPill();
      } else {
        placePillHome();
      }
    }

    pillEl.addEventListener("pointerup", endDrag);
    pillEl.addEventListener("pointercancel", endDrag);

    // Keyboard fallback: Enter / Space deposits when focused
    pillEl.addEventListener("keydown", function (e) {
      if (deposited || unlocked) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        depositPill();
      }
    });
  }

  window.addEventListener("unodc:show-payment", function () {
    if (!unlocked) render();
  });
})();
