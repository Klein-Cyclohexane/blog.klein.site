(function () {
  "use strict";

  var STORAGE_KEY = "blog-accessibility";
  var DEFAULTS = { textSize: "medium", lineHeight: "medium" };

  function getStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        return {
          textSize: parsed.textSize || DEFAULTS.textSize,
          lineHeight: parsed.lineHeight || DEFAULTS.lineHeight,
        };
      }
    } catch (e) {}
    return { textSize: DEFAULTS.textSize, lineHeight: DEFAULTS.lineHeight };
  }

  function save(opts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
    } catch (e) {}
  }

  function applyToBody(opts) {
    document.body.setAttribute("data-text-size", opts.textSize);
    document.body.setAttribute("data-line-height", opts.lineHeight);
  }

  function createOptionGroup(label, name, value, options) {
    var group = document.createElement("div");
    group.className = "accessibility-option-group";
    var title = document.createElement("div");
    title.className = "accessibility-option-label";
    title.textContent = label;
    group.appendChild(title);
    var row = document.createElement("div");
    row.className = "accessibility-option-row";
    options.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "accessibility-option-btn";
      btn.textContent = opt;
      btn.setAttribute("data-option", name);
      btn.setAttribute("data-value", opt.toLowerCase());
      if (opt.toLowerCase() === value) btn.classList.add("active");
      row.appendChild(btn);
    });
    group.appendChild(row);
    return group;
  }

  function init() {
    var opts = getStored();
    applyToBody(opts);

    var wrap = document.createElement("div");
    wrap.className = "accessibility-widget";
    wrap.setAttribute("aria-label", "Accessibility options");

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "accessibility-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.innerHTML =
      '<span class="accessibility-trigger-icon" aria-hidden="true">A</span><span class="accessibility-trigger-label">Accessibility</span>';
    wrap.appendChild(trigger);

    var panel = document.createElement("div");
    panel.className = "accessibility-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Accessibility options");

    var panelTitle = document.createElement("div");
    panelTitle.className = "accessibility-panel-title";
    panelTitle.textContent = "Accessibility Options";
    panel.appendChild(panelTitle);

    panel.appendChild(
      createOptionGroup("Text size", "textSize", opts.textSize, [
        "Small",
        "Medium",
        "Large",
      ])
    );
    panel.appendChild(
      createOptionGroup("Line spacing", "lineHeight", opts.lineHeight, [
        "Small",
        "Medium",
        "Large",
      ])
    );

    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    function updateActiveButtons(name, value) {
      wrap
        .querySelectorAll('.accessibility-option-btn[data-option="' + name + '"]')
        .forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-value") === value);
        });
    }

    function setOption(name, value) {
      opts[name] = value;
      applyToBody(opts);
      save(opts);
      updateActiveButtons(name, value);
    }

    function togglePanel() {
      var open = !panel.hidden;
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }

    trigger.addEventListener("click", function () {
      togglePanel();
    });

    panel.addEventListener("click", function (e) {
      var btn = e.target.closest(".accessibility-option-btn");
      if (!btn) return;
      var name = btn.getAttribute("data-option");
      var value = btn.getAttribute("data-value");
      setOption(name, value);
    });

    document.addEventListener("click", function (e) {
      if (panel.hidden) return;
      if (!wrap.contains(e.target)) {
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) {
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
