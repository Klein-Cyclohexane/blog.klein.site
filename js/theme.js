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

if (checkIsDarkMode()) {
  switchThemeMode("dark");
}

var mqList = window.matchMedia("(prefers-color-scheme: dark)");

observeMediaChange(mqList, (event) => {
  // is dark mode
  if (event.matches) {
    console.log("switch to dark mode");
    switchThemeMode("dark");
  } else {
    console.log("switch to light mode");
    switchThemeMode("light");
  }
});

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
  title.textContent = 'Contents';
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

// Mobile navigation (hamburger)
(function() {
  const header = document.querySelector('.header-container');
  const nav = document.querySelector('.nav');
  if (!header || !nav) return;

  // Only enhance on small screens; still safe elsewhere
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