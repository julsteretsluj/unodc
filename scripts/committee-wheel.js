/**
 * Vinyl committee selector — mirrors ecosoc-rose.vercel.app flow.
 * On Enter for current committee (UNODC), hides wheel and shows payment gate.
 */
(function () {
  var COMMITTEES = window.SEAMUN_COMMITTEES || [];
  var TOTAL = COMMITTEES.length;
  if (!TOTAL) return;

  var WHEEL_CX = 300;
  var WHEEL_CY = 300;
  var WHEEL_SIZE = 600;
  var VINYL_RADIUS = 240;
  var CENTER_LABEL_RADIUS = 88;
  var LABELS_RADIUS = 270;
  var LABEL_ARC_SPAN = 32;
  var CENTER_HOLE_RADIUS = 10;
  var ANGLE_PER = 360 / TOTAL;
  var DRAG_THRESHOLD_PX = 8;

  function getAngle(i) {
    return TOTAL <= 1 ? 90 : 90 - (360 * i) / TOTAL;
  }

  function getArcPath(angleDeg, spanDeg) {
    var half = spanDeg / 2;
    var r = LABELS_RADIUS;
    var toRad = function (d) {
      return (d * Math.PI) / 180;
    };
    var x1 = WHEEL_CX + r * Math.cos(toRad(angleDeg - half));
    var y1 = WHEEL_CY - r * Math.sin(toRad(angleDeg - half));
    var x2 = WHEEL_CX + r * Math.cos(toRad(angleDeg + half));
    var y2 = WHEEL_CY - r * Math.sin(toRad(angleDeg + half));
    return "M " + x1 + " " + y1 + " A " + r + " " + r + " 0 0 0 " + x2 + " " + y2;
  }

  function getPointerAngle(clientX, clientY, rect) {
    var cx = rect.left + (WHEEL_CX / WHEEL_SIZE) * rect.width;
    var cy = rect.top + (WHEEL_CY / WHEEL_SIZE) * rect.height;
    var dx = clientX - cx;
    var dy = cy - clientY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

  var initialIndex = COMMITTEES.findIndex(function (c) {
    return c.isCurrent;
  });
  var index = initialIndex >= 0 ? initialIndex : 0;
  var isDragging = false;
  var dragStartIndex = 0;
  var dragOffset = 0;
  var dragOffsetRef = 0;
  var hasCapture = false;
  var dragStart = null;

  var root = document.getElementById("committee-wheel");
  var paymentGate = document.getElementById("payment-gate");
  var siteApp = document.getElementById("site-app");
  if (!root) return;

  function committee() {
    return COMMITTEES[index] || COMMITTEES[0];
  }

  function displayIndex() {
    if (!isDragging) return index;
    return (dragStartIndex + Math.round(dragOffset / ANGLE_PER) + TOTAL * 100) % TOTAL;
  }

  function displayCommittee() {
    return COMMITTEES[displayIndex()] || COMMITTEES[0];
  }

  function rotationDeg() {
    var selectedAngle = getAngle(index);
    return 90 - selectedAngle + (isDragging ? dragOffset : 0);
  }

  function buildGrooves() {
    var html = "";
    for (var i = 0; i < 120; i++) {
      var r = CENTER_LABEL_RADIUS + 12 + i * 1.15;
      if (r >= VINYL_RADIUS - 2) continue;
      html +=
        '<circle cx="' +
        WHEEL_CX +
        '" cy="' +
        WHEEL_CY +
        '" r="' +
        r +
        '" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"></circle>';
    }
    return html;
  }

  function render() {
    var c = displayCommittee();
    var logoSrc = c.logo ? "assets/committee-logos/" + c.logo + "?v=20260804d" : "";
    var label = c.shortName || c.name;
    var isCurrent = committee().isCurrent;
    var rot = rotationDeg();
    var dIdx = displayIndex();

    var labels = COMMITTEES.map(function (item, i) {
      var angle = getAngle(i);
      var isSelected = i === dIdx;
      var arcD = getArcPath(angle, LABEL_ARC_SPAN);
      var pathId = "label-path-" + item.id;
      var itemLabel = item.shortName || item.name;
      var fill = isSelected ? "rgb(254 243 199)" : "rgba(255,255,255,0.6)";
      var dot =
        isSelected
          ? '<circle cx="' +
            (WHEEL_CX + (LABELS_RADIUS + 14) * Math.cos((angle * Math.PI) / 180)) +
            '" cy="' +
            (WHEEL_CY - (LABELS_RADIUS + 14) * Math.sin((angle * Math.PI) / 180)) +
            '" r="4" fill="#fbbf24" style="filter:drop-shadow(0 0 2px rgba(0,0,0,0.5))"></circle>'
          : "";
      return (
        '<g class="wheel-label" data-index="' +
        i +
        '" role="presentation" aria-hidden="true">' +
        '<path id="' +
        pathId +
        '" d="' +
        arcD +
        '" fill="none"></path>' +
        '<text fill="' +
        fill +
        '" font-size="14" font-family="system-ui, sans-serif" font-weight="500" letter-spacing="0.15em" style="text-transform:uppercase;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.8))">' +
        '<textPath href="#' +
        pathId +
        '" startOffset="50%" text-anchor="middle">' +
        itemLabel +
        "</textPath></text>" +
        '<path d="' +
        arcD +
        '" fill="none" stroke="transparent" stroke-width="28" style="pointer-events:stroke"></path>' +
        dot +
        "</g>"
      );
    }).join("");

    root.innerHTML =
      '<div class="gate-screen">' +
      '<div class="gate-header">' +
      "<h1>SEAMUN I 2027</h1>" +
      "<p>Choose your committee</p>" +
      "</div>" +
      '<div class="wheel-stage">' +
      '<div class="wheel-surface" data-wheel style="width:' +
      WHEEL_SIZE +
      "px;height:" +
      WHEEL_SIZE +
      'px;max-width:100%">' +
      '<svg class="wheel-vinyl" viewBox="0 0 ' +
      WHEEL_SIZE +
      " " +
      WHEEL_SIZE +
      '" fill="none" preserveAspectRatio="xMidYMid meet">' +
      "<defs>" +
      '<radialGradient id="vinylGradient" cx="35%" cy="35%" r="70%">' +
      '<stop offset="0%" stop-color="#2a2a2a"></stop>' +
      '<stop offset="70%" stop-color="#0f0f0f"></stop>' +
      '<stop offset="100%" stop-color="#0a0a0a"></stop>' +
      "</radialGradient>" +
      '<filter id="vinylShadow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.5"></feDropShadow>' +
      "</filter>" +
      "</defs>" +
      '<circle cx="' +
      WHEEL_CX +
      '" cy="' +
      WHEEL_CY +
      '" r="' +
      VINYL_RADIUS +
      '" fill="url(#vinylGradient)" filter="url(#vinylShadow)"></circle>' +
      buildGrooves() +
      '<circle cx="' +
      WHEEL_CX +
      '" cy="' +
      WHEEL_CY +
      '" r="' +
      CENTER_HOLE_RADIUS +
      '" fill="#0a0a0a" stroke="#1a1a1a" stroke-width="2"></circle>' +
      "</svg>" +
      '<div class="wheel-center-label" style="width:' +
      CENTER_LABEL_RADIUS * 2 +
      "px;height:" +
      CENTER_LABEL_RADIUS * 2 +
      'px">' +
      (logoSrc
        ? '<img src="' + logoSrc + '" alt="" class="wheel-center-logo">'
        : '<span class="wheel-center-fallback">' + label + "</span>") +
      '<span class="wheel-center-name">' +
      label +
      "</span>" +
      "</div>" +
      '<div class="wheel-rotator" style="width:' +
      WHEEL_SIZE +
      "px;height:" +
      WHEEL_SIZE +
      "px;max-width:100%;aspect-ratio:1;transform:rotate(" +
      rot +
      'deg)">' +
      '<svg class="wheel-labels" viewBox="0 0 ' +
      WHEEL_SIZE +
      " " +
      WHEEL_SIZE +
      '" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      labels +
      "</svg>" +
      "</div>" +
      "</div>" +
      '<div class="wheel-controls">' +
      '<button type="button" class="wheel-ctrl" data-prev aria-label="Previous committee">‹</button>' +
      '<button type="button" class="wheel-ctrl wheel-ctrl-play" data-play aria-label="' +
      (isCurrent ? "Continue into UNODC" : "Continue to selected committee") +
      '" title="' +
      (isCurrent ? "Continue" : "Visit site") +
      '">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7L8 5z"></path></svg>' +
      "</button>" +
      '<button type="button" class="wheel-ctrl" data-next aria-label="Next committee">›</button>' +
      "</div>" +
      "</div>" +
      '<div class="wheel-actions">' +
      '<button type="button" class="wheel-enter" data-enter>' +
      (isCurrent ? "Enter profile" : "Visit site") +
      "</button>" +
      (isCurrent
        ? '<p class="wheel-hint">UNODC committee portal — topics, allocations, resources</p>'
        : "") +
      "</div>" +
      '<a class="wheel-seamun" href="https://seamun.com" target="_blank" rel="noopener noreferrer">seamun.com</a>' +
      "</div>";

    bind();
  }

  function go(delta) {
    index = (index + delta + TOTAL) % TOTAL;
    render();
  }

  function enter() {
    var c = committee();
    if (c.isCurrent) {
      root.hidden = true;
      root.setAttribute("aria-hidden", "true");
      if (paymentGate) {
        paymentGate.hidden = false;
        paymentGate.removeAttribute("aria-hidden");
        window.dispatchEvent(new CustomEvent("unodc:show-payment"));
      } else if (siteApp) {
        siteApp.hidden = false;
      }
      document.body.classList.remove("gate-open");
      document.body.classList.add("payment-open");
    } else if (c.href) {
      window.location.href = c.href;
    }
  }

  function bind() {
    var wheelEl = root.querySelector("[data-wheel]");
    var rotator = root.querySelector(".wheel-rotator");

    root.querySelector("[data-prev]").addEventListener("click", function () {
      go(-1);
    });
    root.querySelector("[data-next]").addEventListener("click", function () {
      go(1);
    });
    root.querySelector("[data-play]").addEventListener("click", enter);
    root.querySelector("[data-enter]").addEventListener("click", enter);

    Array.prototype.forEach.call(root.querySelectorAll(".wheel-label"), function (g) {
      g.addEventListener("click", function () {
        index = Number(g.getAttribute("data-index"));
        render();
      });
    });

    if (!wheelEl) return;

    wheelEl.addEventListener("pointerdown", function (e) {
      var rect = wheelEl.getBoundingClientRect();
      var angle = getPointerAngle(e.clientX, e.clientY, rect);
      dragStart = { index: index, lastAngle: angle };
      dragStartIndex = index;
      dragOffset = 0;
      dragOffsetRef = 0;
      hasCapture = false;
      isDragging = false;
    });

    wheelEl.addEventListener("pointermove", function (e) {
      if (!dragStart) return;
      var rect = wheelEl.getBoundingClientRect();
      var angle = getPointerAngle(e.clientX, e.clientY, rect);
      var delta = angle - dragStart.lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      dragStart.lastAngle = angle;
      dragOffset += delta;
      dragOffsetRef = dragOffset;
      var movePx = Math.abs(dragOffset) * (rect.width / 360);
      if (!hasCapture && movePx >= DRAG_THRESHOLD_PX) {
        hasCapture = true;
        isDragging = true;
        dragStartIndex = dragStart.index;
        try {
          wheelEl.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
      if (isDragging && rotator) {
        rotator.style.transition = "none";
        rotator.style.transform = "rotate(" + rotationDeg() + "deg)";
        // Update center label without full re-render during drag
        var dc = displayCommittee();
        var img = root.querySelector(".wheel-center-logo");
        var name = root.querySelector(".wheel-center-name");
        if (img && dc.logo) img.src = "assets/committee-logos/" + dc.logo + "?v=20260804d";
        if (name) name.textContent = dc.shortName || dc.name;
      }
    });

    function commitDrag() {
      if (!dragStart) return;
      if (hasCapture) {
        var steps = Math.round(dragOffsetRef / ANGLE_PER);
        index = (dragStart.index + steps + TOTAL * 100) % TOTAL;
      }
      dragOffset = 0;
      dragOffsetRef = 0;
      hasCapture = false;
      isDragging = false;
      dragStart = null;
      render();
    }

    wheelEl.addEventListener("pointerup", commitDrag);
    wheelEl.addEventListener("pointercancel", commitDrag);
    wheelEl.addEventListener("pointerleave", function () {
      if (dragStart) commitDrag();
    });
  }

  document.body.classList.add("gate-open");
  if (siteApp) siteApp.hidden = true;
  if (paymentGate) {
    paymentGate.hidden = true;
    paymentGate.setAttribute("aria-hidden", "true");
  }
  render();
})();
