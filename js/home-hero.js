(function () {
  const HERO_TEXT = "Sunrays will make you see the clouds.";
  const TYPING_INTERVAL = 80;

  function init() {
    const el = document.getElementById("hero-typing");
    const arrow = document.getElementById("scroll-arrow");
    const postList = document.getElementById("post-list");
    const body = document.body;

    if (!el) return;

    if (body) {
      body.classList.add("accessibility-delayed");
    }

    function revealAccessibility() {
      if (body) {
        body.classList.remove("accessibility-delayed");
      }
    }

    let index = 0;
    function typeNext() {
      if (index < HERO_TEXT.length) {
        el.textContent += HERO_TEXT[index];
        index++;
        setTimeout(typeNext, TYPING_INTERVAL);
      } else {
        el.classList.add("typing-done");
        if (arrow && window.matchMedia("(min-width: 769px)").matches) {
          arrow.classList.add("visible");
        }
        revealAccessibility();
      }
    }

    typeNext();

    if (arrow && postList) {
      arrow.addEventListener("click", function () {
        const header = document.querySelector(".header");
        const postTop = postList.getBoundingClientRect().top + window.scrollY;
        let offset = 0;

        if (header) {
          const headerRect = header.getBoundingClientRect();
          const headerStyles = window.getComputedStyle(header);
          const topValue = parseFloat(headerStyles.top) || 0;
          offset = headerRect.height + topValue;
        }

        const target = Math.max(0, postTop - offset);
        window.scrollTo({ top: target, behavior: "smooth" });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
