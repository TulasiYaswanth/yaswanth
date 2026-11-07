/* ==========================================================================
   Flowza — site interactions
   Vanilla JS, no dependencies. Everything degrades without it.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- Header: shadow on scroll ---------- */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector(".burger");
  var mobileNav = document.getElementById("mobile-nav");
  if (burger && mobileNav) {
    var setNav = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      setNav(burger.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1060) setNav(false);
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (!("IntersectionObserver" in window) || reduced) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Count-up numbers ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var formatNum = function (n, mode) {
    if (mode === "compact") return n.toLocaleString("en-US");
    return String(Math.round(n));
  };
  var runCount = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var mode = el.getAttribute("data-format") || "";
    if (isNaN(target)) return;
    if (reduced) {
      el.textContent = prefix + formatNum(target, mode) + suffix;
      return;
    }
    var start = null;
    var dur = 1300;
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + formatNum(target * eased, mode) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + formatNum(target, mode) + suffix;
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if (!("IntersectionObserver" in window) || reduced) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Capability / scenario filters ---------- */
  document.querySelectorAll("[data-filter]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var group = tab.closest(".tabs");
      var key = tab.getAttribute("data-filter");
      group.querySelectorAll("[data-filter]").forEach(function (t) {
        t.setAttribute("aria-selected", String(t === tab));
      });

      // The list this tab set controls is the next sibling matching a list selector.
      var list = null;
      var node = group.nextElementSibling;
      while (node && !list) {
        if (node.matches(".cards, [id$='-list']")) list = node;
        node = node.nextElementSibling;
      }
      if (!list) return;

      var shown = 0;
      list.querySelectorAll("[data-tags]").forEach(function (card) {
        var match = key === "all" || (card.getAttribute("data-tags") || "").split(/\s+/).indexOf(key) !== -1;
        if (match) {
          card.hidden = false;
          card.classList.add("is-in");
          shown++;
        } else {
          card.hidden = true;
        }
      });

      var note = document.getElementById("filter-note");
      if (note && list.id === "capability-list") {
        note.textContent = key === "all"
          ? "Showing all " + shown + " systems. The right mix is decided during your Profit Leak Assessment — never from a price list."
          : "Showing " + shown + " of 11 systems for this area. The right mix is decided during your Profit Leak Assessment.";
      }

    });
  });

  /* ---------- Forms ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  document.querySelectorAll("[data-assessment-form]").forEach(function (form) {
    // NOTE: static demo — the form validates and confirms locally.
    // To go live, POST the payload from `data` below to your CRM / form endpoint
    // (or replace the handler with the Calendly embed).

    var setError = function (input, hasError) {
      var field = input.closest(".field");
      if (!field) return;
      field.classList.toggle("field--error", hasError);
      input.setAttribute("aria-invalid", hasError ? "true" : "false");
    };

    var validate = function () {
      var ok = true;
      var first = null;
      form.querySelectorAll("[required]").forEach(function (input) {
        var value = input.value.trim();
        var bad = !value;
        if (input.type === "email" && value) bad = !emailRe.test(value);
        setError(input, bad);
        if (bad) {
          ok = false;
          if (!first) first = input;
        }
      });
      if (first) first.focus();
      return ok;
    };

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.closest(".field") && input.closest(".field").classList.contains("field--error")) {
          setError(input, input.required && !input.value.trim());
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var data = Object.fromEntries(new FormData(form).entries());
      data.page = window.location.pathname;
      data.submittedAt = new Date().toISOString();

      // Placeholder for the future endpoint:
      // fetch("/api/assessment", { method: "POST", body: JSON.stringify(data) })
      console.info("Assessment request (demo, not sent):", data);

      var btn = form.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      window.setTimeout(function () {
        form.classList.add("is-sent");
        var success = form.querySelector(".form__success");
        if (success) {
          success.classList.add("is-visible");
          success.setAttribute("tabindex", "-1");
          success.focus();
        }
      }, 500);
    });
  });

  /* ---------- FAQ: keep one panel open ---------- */
  var faq = document.querySelector(".faq");
  if (faq) {
    var items = faq.querySelectorAll("details");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          items.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        }
      });
    });
  }
})();
