(function () {
  "use strict";

  var KEY = "resume-theme";
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  /* Mark JS available — reveal CSS only hides after this class exists */
  root.classList.add("js");
  if (document.body.classList.contains("page-sysadmin")) {
    root.classList.add("page-sysadmin-js");
  }
  if (document.body.classList.contains("page-teacher")) {
    root.classList.add("page-teacher-js");
  }

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function apply(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    if (btn) {
      var cur = root.getAttribute("data-theme");
      if (!cur) {
        cur = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      btn.textContent = cur === "dark" ? "☀︎" : "☾";
      btn.setAttribute(
        "aria-label",
        cur === "dark" ? "Светлая тема" : "Тёмная тема"
      );
    }
  }

  apply(stored());

  if (btn) {
    btn.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      if (!cur) {
        cur = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      var next = cur === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
      apply(next);
    });
  }

  /* ---------- Scroll reveal (progressive: only if JS adds .reveal) ---------- */
  function setupReveal() {
    var selector = ".exp-card, .switch-card, .contact-item, .chips";
    var nodes = document.querySelectorAll(selector);
    var i;
    for (i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.classList.contains("hero")) continue;
      if (document.body.classList.contains("page-sysadmin")) {
        el.classList.add("reveal-boot");
      } else if (document.body.classList.contains("page-teacher")) {
        el.classList.add("reveal-slide");
      } else {
        el.classList.add("reveal");
      }
    }

    var targets = document.querySelectorAll(".reveal, .reveal-boot, .reveal-slide");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (i = 0; i < targets.length; i++) {
        targets[i].classList.add("is-visible");
      }
      return;
    }

    function revealNow(el) {
      el.classList.add("is-visible");
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealNow(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.01 }
    );

    for (i = 0; i < targets.length; i++) {
      io.observe(targets[i]);
    }

    /* Flush in-view items (headless Chrome / IO quirks) */
    function flushInView() {
      for (var j = 0; j < targets.length; j++) {
        var el = targets[j];
        if (el.classList.contains("is-visible")) continue;
        var r = el.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (r.top < vh * 0.98 && r.bottom > 0) {
          revealNow(el);
          try { io.unobserve(el); } catch (e) {}
        }
      }
    }
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () {
        flushInView();
        window.requestAnimationFrame(flushInView);
      });
    } else {
      flushInView();
    }
    /* Hard fallback: never leave content invisible */
    window.setTimeout(function () {
      for (var k = 0; k < targets.length; k++) {
        revealNow(targets[k]);
      }
    }, 1200);
  }

  /* ---------- Sysadmin terminal typing ---------- */
  function typeText(el, text, msPerChar, done) {
    var i = 0;
    el.textContent = "";
    function tick() {
      if (i >= text.length) {
        if (done) done();
        return;
      }
      el.textContent += text.charAt(i);
      i += 1;
      window.setTimeout(tick, msPerChar);
    }
    tick();
  }

  function setupTerminal() {
    var block = document.getElementById("term-block");
    if (!block) return;

    var skills = [
      "Linux",
      "Windows",
      "SQL",
      "bash",
      "Git",
      "Docker-compose",
      "Go",
      "PHP",
      "JS",
      "1С",
      "OpenStreetMap"
    ];

    var staticLine = block.querySelector("[data-term-static]");
    if (reduceMotion) {
      if (staticLine) {
        staticLine.innerHTML =
          '<span class="prompt">$</span> whoami';
      }
      var out = document.createElement("p");
      out.className = "term-out";
      out.textContent =
        "$ cat skills.txt\n" + skills.join("  ");
      block.appendChild(out);
      return;
    }

    /* Clear static; rebuild with typing */
    block.innerHTML = "";
    var line1 = document.createElement("p");
    line1.className = "term-line";
    line1.setAttribute("aria-live", "polite");
    var prompt1 = document.createElement("span");
    prompt1.className = "prompt";
    prompt1.textContent = "$ ";
    var typed1 = document.createElement("span");
    var cursor = document.createElement("span");
    cursor.className = "term-cursor";
    cursor.setAttribute("aria-hidden", "true");
    line1.appendChild(prompt1);
    line1.appendChild(typed1);
    line1.appendChild(cursor);
    block.appendChild(line1);

    typeText(typed1, "whoami", 70, function () {
      window.setTimeout(function () {
        var name = document.createElement("p");
        name.className = "term-out";
        name.textContent = "arseniy_galkin";
        block.insertBefore(name, null);

        var line2 = document.createElement("p");
        line2.className = "term-line";
        var prompt2 = document.createElement("span");
        prompt2.className = "prompt";
        prompt2.textContent = "$ ";
        var typed2 = document.createElement("span");
        line2.appendChild(prompt2);
        line2.appendChild(typed2);
        line2.appendChild(cursor);
        block.appendChild(line2);

        typeText(typed2, "cat skills.txt", 55, function () {
          window.setTimeout(function () {
            var skillsOut = document.createElement("p");
            skillsOut.className = "term-out";
            skillsOut.textContent = skills.join("  ");
            block.appendChild(skillsOut);
            cursor.remove();
            var idle = document.createElement("p");
            idle.className = "term-line";
            idle.innerHTML =
              '<span class="prompt">$</span> <span class="term-cursor" aria-hidden="true"></span>';
            block.appendChild(idle);
          }, 180);
        });
      }, 280);
    });
  }

  setupReveal();
  setupTerminal();
})();

/* Keep skill tips inside the viewport */
(function () {
  var tips = document.querySelectorAll('ul.skill-tips > li.tip');
  if (!tips.length) return;
  function place(el) {
    var vw = document.documentElement.clientWidth || window.innerWidth;
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var w = Math.min(16 * rem, vw - 24);
    var r = el.getBoundingClientRect();
    var center = r.left + r.width / 2;
    var left = center - w / 2;
    var shift = 0;
    if (left < 12) shift = 12 - left;
    else if (left + w > vw - 12) shift = (vw - 12) - (left + w);
    el.style.setProperty('--tip-x', shift + 'px');
  }
  for (var i = 0; i < tips.length; i++) {
    (function (el) {
      var h = function () { place(el); };
      el.addEventListener('mouseenter', h);
      el.addEventListener('focus', h);
      el.addEventListener('touchstart', h, { passive: true });
    })(tips[i]);
  }
})();
