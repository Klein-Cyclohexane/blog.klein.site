/**
 * @param {MediaQueryList} mqList
 * @param {((this: MediaQueryList, ev: MediaQueryListEvent) => any)} listener
 */
function observeMediaChange(mqList, listener) {
  let disposeFunc = () => {};
  if (mqList.addEventListener && mqList.removeEventListener) {
    mqList.addEventListener("change", listener);

    disposeFunc = () => {
      mqList.removeEventListener("change", listener);
    };
  } else if (mqList.addListener && mqList.removeListener) {
    mqList.addListener(listener);

    disposeFunc = () => {
      mqList.removeListener(listener);
    };
  }

  return disposeFunc;
}

function checkIsDarkMode() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (err) {
    return false;
  }
}

function switchThemeMode(mode) {
  /** @type {HTMLLinkElement} */
  const link = document.querySelector("link#theme");
  if (!link) {
    return;
  }

  const nextMode = themeMode[mode] || themeMode.light;
  if (link.href !== nextMode) {
    link.href = nextMode;
  }
}

const themeMode = {
  light:
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.css",
  dark: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.css",
};

const THEME_STORAGE_KEY = "blog-theme-mode";
const rootElement = document.documentElement;
const mqList = window.matchMedia("(prefers-color-scheme: dark)");
let themeToggleButton = null;
let manualTheme = getStoredManualTheme();
let currentTheme = manualTheme || (mqList.matches ? "dark" : "light");

applyTheme(currentTheme);
switchThemeMode(currentTheme);

observeMediaChange(mqList, (event) => {
  if (manualTheme) {
    return;
  }
  currentTheme = event.matches ? "dark" : "light";
  applyTheme(currentTheme);
  switchThemeMode(currentTheme);
  updateThemeToggleAppearance();
});

initThemeToggle();

function getStoredManualTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark") {
      return value;
    }
  } catch (err) {}
  return null;
}

function persistManualTheme(value) {
  try {
    if (value === "light" || value === "dark") {
      localStorage.setItem(THEME_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  } catch (err) {}
}

function applyTheme(theme) {
  const mode = theme === "dark" ? "dark" : "light";
  rootElement.setAttribute("data-theme", mode);
  rootElement.style.colorScheme = mode;
}

function updateThemeToggleAppearance() {
  if (!themeToggleButton) {
    return;
  }
  themeToggleButton.dataset.theme = currentTheme;
  const label =
    currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  themeToggleButton.setAttribute("aria-label", label);
  themeToggleButton.setAttribute("title", label);
}

function initThemeToggle() {
  const headerContainer = document.querySelector(".header-container");
  if (!headerContainer) {
    return;
  }

  const existingButton = headerContainer.querySelector(".theme-toggle");
  if (existingButton) {
    themeToggleButton = existingButton;
    updateThemeToggleAppearance();
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.innerHTML =
    '<span class="theme-toggle-icon" aria-hidden="true">' +
    '<img class="icon icon-sun" src="https://cdn.rthe.cn/cached-6e4c4995cda172f070b5a271b5acbc3b-avif/rayklein/sun_icon.png" alt="" width="24" height="24">' +
    '<img class="icon icon-moon" src="https://cdn.rthe.cn/cached-cc8afbd532b73c711542a5e4c990770d-avif/rayklein/moon_icon.png" alt="" width="24" height="24">' +
    '</span>';

  const nav = headerContainer.querySelector(".nav");
  if (nav && nav.nextSibling) {
    headerContainer.insertBefore(button, nav.nextSibling);
  } else if (nav) {
    headerContainer.appendChild(button);
  } else {
    headerContainer.appendChild(button);
  }

  themeToggleButton = button;
  updateThemeToggleAppearance();

  button.addEventListener("click", () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    currentTheme = nextTheme;
    manualTheme = nextTheme;
    persistManualTheme(nextTheme);
    applyTheme(currentTheme);
    switchThemeMode(currentTheme);
    updateThemeToggleAppearance();
  });
}

// Back to Top Button Functionality
(function() {
  // Check if we're on the about page
  const isAboutPage = window.location.pathname.includes('/about');
  if (isAboutPage) {
    return; // Don't add button on about page
  }

  // Create the button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = 'Back<br>to Top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(backToTopBtn);

  // Show/hide button based on scroll position
  function toggleButton() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // Scroll to top function
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Event listeners
  window.addEventListener('scroll', toggleButton);
  backToTopBtn.addEventListener('click', scrollToTop);

  // Initial check
  toggleButton();
})();

// Breadcrumb navigation (iGEM wiki-style)
(function() {
  const main = document.querySelector('main.main');
  const post = document.querySelector('article.post');
  if (!main || !post) return;

  const postTitleEl = post.querySelector('.post-title');
  const tagEl = post.querySelector('.post-meta .tags .tag-item');
  const base = (document.querySelector('a.logo') && document.querySelector('a.logo').href) ?
    new URL(document.querySelector('a.logo').href).pathname.replace(/\/$/, '') || '' : '';

  const homeLabel = 'Home';
  const homeHref = base ? base + '/' : '/';
  const currentTitle = postTitleEl ? postTitleEl.textContent.trim() : '';
  if (!currentTitle) return;

  const nav = document.createElement('nav');
  nav.className = 'breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');

  let html = '<a href="' + homeHref + '">' + homeLabel + '</a>';
  if (tagEl) {
    const tagName = tagEl.textContent.trim();
    const tagSlug = tagName.replace(/\s+/g, '_');
    html += '<span class="separator">›</span><a href="' + base + '/tags/' + encodeURIComponent(tagName) + '">' + tagName + '</a>';
  }
  html += '<span class="separator">›</span><span class="current">' + currentTitle + '</span>';
  nav.innerHTML = html;

  main.insertBefore(nav, main.firstElementChild);
})();

// Table of Contents (TOC)
(function() {
  const post = document.querySelector('article.post');
  const content = document.querySelector('.post-content');
  if (!post || !content) return;

  const headings = content.querySelectorAll('h2, h3');
  if (!headings.length) return;

  const toc = document.createElement('nav');
  toc.className = 'post-toc';
  toc.setAttribute('aria-label', 'Table of contents');

  const title = document.createElement('div');
  title.className = 'post-toc-title';
  title.textContent = 'TOC';
  toc.appendChild(title);

  const list = document.createElement('ul');
  list.className = 'post-toc-list';

  headings.forEach((heading) => {
    const level = heading.tagName.toLowerCase() === 'h3' ? 3 : 2;
    const text = heading.textContent.trim();
    if (!text) return;

    if (!heading.id) {
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      heading.id = slug || 'section-' + Math.random().toString(36).slice(2, 8);
    }

    const li = document.createElement('li');
    li.className = 'post-toc-item level-' + level;

    const a = document.createElement('a');
    a.href = '#' + heading.id;
    a.textContent = text;
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById(heading.id);
      if (target) {
        const rect = target.getBoundingClientRect();
        const offset = window.scrollY + rect.top - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });

    li.appendChild(a);
    list.appendChild(li);
  });

  if (!list.children.length) return;

  toc.appendChild(list);

  const meta = post.querySelector('.post-meta');
  if (meta && meta.nextSibling) {
    post.insertBefore(toc, meta.nextSibling);
  } else {
    post.insertBefore(toc, post.firstChild);
  }
})();

// Reading progress bar
(function() {
  const content = document.querySelector('.post-content');
  if (!content) return;

  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.appendChild(bar);

  function updateProgress() {
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const maxScroll = docHeight - winHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    bar.style.width = (progress * 100) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();

(function() {
  const header = document.querySelector('.header-container');
  const nav = document.querySelector('.nav');
  if (!header || !nav) return;

  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Toggle navigation');
  toggle.setAttribute('aria-expanded', 'false');

  toggle.innerHTML = '<span class="nav-toggle-icon">☰</span><span class="nav-toggle-label">Menu</span>';

  header.appendChild(toggle);

  function setExpanded(isOpen) {
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.classList.toggle('is-open', isOpen);
    const icon = toggle.querySelector('.nav-toggle-icon');
    const label = toggle.querySelector('.nav-toggle-label');
    if (icon && label) {
      if (isOpen) {
        icon.textContent = '✕';
        label.textContent = 'Close';
      } else {
        icon.textContent = '☰';
        label.textContent = 'Menu';
      }
    }
  }

  toggle.addEventListener('click', function() {
    const isOpen = nav.classList.contains('is-open');
    setExpanded(!isOpen);
  });
})();