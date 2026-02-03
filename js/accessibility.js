(function () {
  "use strict";

  var STORAGE_KEY = "blog-accessibility";
  var DEFAULTS = { textSize: "medium", lineHeight: "medium" };
  var LEVELS = ["small", "medium", "large"];

  function getIconUrl() {
    return "https://cdn.rthe.cn/cached-b872faa45202a578895aa3b0a1fe2082-avif/rayklein/accessibility.webp";
  }

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
    var root = document.documentElement;
    root.setAttribute("data-text-size", opts.textSize);
    root.setAttribute("data-line-height", opts.lineHeight);
    document.body.setAttribute("data-text-size", opts.textSize);
    document.body.setAttribute("data-line-height", opts.lineHeight);
  }

  function levelToIndex(value) {
    var i = LEVELS.indexOf(value);
    return i >= 0 ? i : 1;
  }

  function indexToLevel(i) {
    return LEVELS[i] || "medium";
  }

  function createSliderGroup(label, name, value, panel) {
    var group = document.createElement("div");
    group.className = "accessibility-slider-group";
    group.setAttribute("data-option", name);

    var title = document.createElement("div");
    title.className = "accessibility-option-label";
    title.textContent = label;
    group.appendChild(title);

    var row = document.createElement("div");
    row.className = "accessibility-slider-row";

    var track = document.createElement("div");
    track.className = "accessibility-slider-track";

    var input = document.createElement("input");
    input.type = "range";
    input.min = 0;
    input.max = 2;
    input.step = 1;
    input.value = levelToIndex(value);
    input.setAttribute("aria-label", label);
    input.setAttribute("aria-valuemin", 0);
    input.setAttribute("aria-valuemax", 2);
    input.className = "accessibility-slider-input";

    var fill = document.createElement("div");
    fill.className = "accessibility-slider-fill";

    var thumb = document.createElement("div");
    thumb.className = "accessibility-slider-thumb";

    track.appendChild(fill);
    track.appendChild(thumb);
    track.appendChild(input);
    row.appendChild(track);

    var labels = document.createElement("div");
    labels.className = "accessibility-slider-labels";
    labels.innerHTML = '<span data-value="0">Small</span><span data-value="1">Medium</span><span data-value="2">Large</span>';
    row.appendChild(labels);

    var valueLabel = document.createElement("div");
    valueLabel.className = "accessibility-slider-value";
    valueLabel.textContent = value.charAt(0).toUpperCase() + value.slice(1);
    row.appendChild(valueLabel);

    group.appendChild(row);

    function updateFillAndThumb() {
      var v = parseInt(input.value, 10);
      var pct = (v / 2) * 100;
      fill.style.width = pct + "%";
      thumb.style.left = pct + "%";
      valueLabel.textContent = indexToLevel(v).charAt(0).toUpperCase() + indexToLevel(v).slice(1);
      input.setAttribute("aria-valuenow", v);
    }

    function snapFeedback() {
      row.classList.add("accessibility-snap-active");
      clearTimeout(row._snapTimer);
      row._snapTimer = setTimeout(function () {
        row.classList.remove("accessibility-snap-active");
      }, 400);
    }

    updateFillAndThumb();

    input.addEventListener("input", function () {
      var v = parseInt(input.value, 10);
      var val = indexToLevel(v);
      updateFillAndThumb();
      panel.setOption(name, val);
      snapFeedback();
    });

    input.addEventListener("change", function () {
      var v = parseInt(input.value, 10);
      input.value = v;
      updateFillAndThumb();
      panel.setOption(name, indexToLevel(v));
      snapFeedback();
    });

    return { group: group, input: input, updateFillAndThumb: updateFillAndThumb };
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

    var iconSpan = document.createElement("span");
    iconSpan.className = "accessibility-trigger-icon";
    iconSpan.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.src = getIconUrl();
    img.alt = "";
    img.width = 48;
    img.height = 48;
    img.className = "accessibility-trigger-img";
    var fallbackSpan = document.createElement("span");
    fallbackSpan.className = "accessibility-trigger-fallback";
    fallbackSpan.textContent = "A";
    fallbackSpan.style.display = "none";
    img.onerror = function () {
      img.style.display = "none";
      fallbackSpan.style.display = "inline";
    };
    img.onload = function () {
      fallbackSpan.style.display = "none";
      img.style.display = "inline-block";
    };
    iconSpan.appendChild(img);
    iconSpan.appendChild(fallbackSpan);

    trigger.appendChild(iconSpan);
    trigger.setAttribute("aria-label", "Accessibility options");

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

    var panelAPI = {
      setOption: function (name, value) {
        opts[name] = value;
        applyToBody(opts);
        save(opts);
        if (name === "textSize" && textSizeSlider.updateFillAndThumb) textSizeSlider.updateFillAndThumb();
        if (name === "lineHeight" && lineHeightSlider.updateFillAndThumb) lineHeightSlider.updateFillAndThumb();
      },
    };

    var textSizeSlider = createSliderGroup("Text size", "textSize", opts.textSize, panelAPI);
    panel.appendChild(textSizeSlider.group);

    var lineHeightSlider = createSliderGroup("Line spacing", "lineHeight", opts.lineHeight, panelAPI);
    panel.appendChild(lineHeightSlider.group);

    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    function togglePanel() {
      panel.hidden = !panel.hidden;
      trigger.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
    }

    trigger.addEventListener("click", function () {
      togglePanel();
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
