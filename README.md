## Markdown Support

The blog supports **Markdown** for writing content in two ways:

### 1. Load from external `.md` file

```html
<main class="post-content" data-markdown-src="/blog.klein.site/content/your-post.md">
  <p>Loading...</p>
</main>
```

Place your `.md` file in `content/` and reference it with `data-markdown-src`.

### 2. Inline markdown in HTML

```html
<main class="post-content"></main>
<script type="text/markdown" data-target=".post-content">
# Hello World
This is **markdown** content.
</script>
```

**Required scripts** (add to post layout):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.0/marked.min.js"></script>
<script src="/blog.klein.site/js/markdown.js"></script>
```

See [markdown-demo/index.html](markdown-demo/index.html) for a working example.

---

## Tech Stack

- **Generator**: Hexo 7.3.0
- **Styling**: Vanilla CSS with CSS custom properties (variables)
- **Fonts**: Montserrat, JetBrains Mono (Google Fonts)
- **Highlighting**: highlight.js

## Features
**All images and documents(pdf) have been uploaded to the CDN.**
- **Theme Toggle**: Light / dark mode with system preference support
- **Accessibility**: Text size and line spacing controls, keyboard navigation
- **Responsive Design**: Mobile-first layout with breakpoints at 480px, 768px, 1024px
- **Gallery**: Image grid with modal lightbox, keyboard navigation
- **Reading Experience**: TOC, breadcrumb, reading progress bar on post pages
- **404 Page**: Custom not-found page with link back to main page
  

## Structure

```
blog/
├── 2026/01/.../       # Posts by date
├── about/             # About page
├── archives/          # Archive index & listing
├── css/
│   ├── root.css       # CSS variables, reset
│   ├── style.css      # Layout, components
│   ├── post.css       # Post content, TOC, code blocks
│   └── gallery.css    # Gallery grid & modal
├── js/
│   ├── theme.js       # Theme toggle, back-to-top button, TOC, breadcrumb navigation
│   ├── accessibility.js
│   ├── gallery.js
│   ├── home-hero.js   # Typing Homepage
│   └── highlight.js   # Code highlighting
├── tags/              # Blog, Note, Gallery tag pages
├── 404.html           # 404 page
└── index.html
```

## Deployment

The site uses static HTML and is deploy to GitHub Pages.



