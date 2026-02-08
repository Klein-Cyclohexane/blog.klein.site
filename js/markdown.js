/**
 * Markdown renderer for blog posts.
 * Supports:
 * - <script type="text/markdown" data-target=".post-content"> for inline markdown
 * - <div class="post-content" data-markdown-src="path/to/file.md"> for loading external .md files
 */
(function () {
  function initMarkdown() {
    // Use marked if available (loaded via CDN)
    if (typeof marked === 'undefined') {
      console.warn('marked.js not loaded - Markdown rendering skipped');
      return;
    }

    // Configure marked
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false
    });

    function notifyTOC() {
      document.dispatchEvent(new CustomEvent('markdown-rendered'));
    }

    // 1. Render inline markdown from <script type="text/markdown">
    document.querySelectorAll('script[type="text/markdown"]').forEach(function (script) {
      var targetSelector = script.getAttribute('data-target') || '.post-content';
      var target = document.querySelector(targetSelector);
      if (target && script.textContent) {
        target.innerHTML = marked.parse(script.textContent.trim());
        runHighlight(target);
        notifyTOC();
      }
    });

    // 2. Render markdown from external file (data-markdown-src)
    document.querySelectorAll('[data-markdown-src]').forEach(function (el) {
      var src = el.getAttribute('data-markdown-src');
      if (!src) return;
      fetch(src)
        .then(function (res) { return res.text(); })
        .then(function (md) {
          el.innerHTML = marked.parse(md);
          runHighlight(el);
          notifyTOC();
        })
        .catch(function (err) {
          console.error('Failed to load markdown:', src, err);
          el.innerHTML = '<p class="markdown-error">Failed to load content.</p>';
        });
    });

    function runHighlight(container) {
      if (typeof hljs !== 'undefined' && container) {
        container.querySelectorAll('pre code').forEach(function (block) {
          hljs.highlightElement(block);
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkdown);
  } else {
    initMarkdown();
  }
})();
