/**
 * Home hero typing effect: "Sunrays will make you see the clouds."
 * Letter-by-letter typing, then show scroll arrow on desktop.
 */
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
        postList.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
