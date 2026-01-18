/**
 * PDF.js viewer for mobile-optimized PDF display
 */

// Load PDF.js from CDN
const PDFJS_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

// Wait for DOM to be ready
(function() {
  'use strict';

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPDFViewer);
  } else {
    initPDFViewer();
  }

  function initPDFViewer() {
    // Load PDF.js CSS
    if (!document.getElementById('pdfjs-style')) {
      const link = document.createElement('link');
      link.id = 'pdfjs-style';
      link.rel = 'stylesheet';
      link.href = `${PDFJS_CDN}/pdf.min.css`;
      document.head.appendChild(link);
    }

    // Load PDF.js library
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = `${PDFJS_CDN}/pdf.min.js`;
      script.onload = function() {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
        // Wait a bit for worker to initialize
        setTimeout(initializePDFViewers, 100);
      };
      script.onerror = function() {
        console.error('Failed to load PDF.js library');
        showPDFErrors('无法加载PDF查看器。请刷新页面重试。');
      };
      document.head.appendChild(script);
    } else {
      initializePDFViewers();
    }
  }

  function initializePDFViewers() {
    // Find all PDF viewer containers
    const pdfContainers = document.querySelectorAll('.pdf-viewer-container');
    
    pdfContainers.forEach(container => {
      const pdfUrl = container.getAttribute('data-pdf-url');
      if (pdfUrl && window.pdfjsLib) {
        renderPDF(container, pdfUrl);
      }
    });
  }

  function showPDFErrors(message) {
    const containers = document.querySelectorAll('.pdf-viewer-container');
    containers.forEach(container => {
      const loadingDiv = container.querySelector('.pdf-loading');
      if (loadingDiv) {
        loadingDiv.style.display = 'none';
      }
      let errorDiv = container.querySelector('.pdf-error');
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'pdf-error';
        container.appendChild(errorDiv);
      }
      errorDiv.textContent = message;
    });
  }

  window.initializePDFViewers = initializePDFViewers;
})();

async function renderPDF(container, pdfUrl) {
  if (!window.pdfjsLib) {
    console.error('PDF.js library not loaded');
    return;
  }

  try {
    // Show loading indicator
    const loadingDiv = container.querySelector('.pdf-loading');
    if (loadingDiv) {
      loadingDiv.style.display = 'flex';
    }

    // Remove any existing error messages
    const existingError = container.querySelector('.pdf-error');
    if (existingError) {
      existingError.remove();
    }

    // Get container width for responsive scaling
    const containerWidth = container.offsetWidth || window.innerWidth - 80;

    // Load the PDF
    const loadingTask = window.pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: `${PDFJS_CDN}/cmaps/`,
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    
    // Hide loading indicator
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }

    // Create canvas container (remove existing one if present)
    let canvasContainer = container.querySelector('.pdf-canvas-container');
    if (!canvasContainer) {
      canvasContainer = document.createElement('div');
      canvasContainer.className = 'pdf-canvas-container';
      container.appendChild(canvasContainer);
    } else {
      canvasContainer.innerHTML = '';
    }

    // Render all pages
    const numPages = pdf.numPages;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      await renderPage(pdf, pageNum, canvasContainer, containerWidth);
    }

  } catch (error) {
    console.error('Error loading PDF:', error);
    const loadingDiv = container.querySelector('.pdf-loading');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
    
    let errorDiv = container.querySelector('.pdf-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'pdf-error';
      container.appendChild(errorDiv);
    }
    
    // Provide helpful error message
    let errorMessage = '无法加载PDF文件。';
    if (error.message && error.message.includes('CORS')) {
      errorMessage += '文件访问受限，请检查服务器配置。';
    } else if (error.message && error.message.includes('404')) {
      errorMessage += '文件未找到。';
    } else {
      errorMessage += '请尝试直接下载。';
    }
    errorDiv.textContent = errorMessage;
  }
}

async function renderPage(pdf, pageNum, container, containerWidth) {
  try {
    const page = await pdf.getPage(pageNum);
    
    // Calculate scale to fit container width (with some padding)
    // For mobile, use smaller padding
    const isMobile = containerWidth < 480;
    const padding = isMobile ? 20 : 40;
    const viewport = page.getViewport({ scale: 1.0 });
    const availableWidth = Math.max(containerWidth - padding, 300);
    const scale = availableWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale: scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    canvas.className = 'pdf-page-canvas';
    
    // Optimize canvas for retina displays
    const dpr = window.devicePixelRatio || 1;
    if (dpr > 1) {
      canvas.style.width = scaledViewport.width + 'px';
      canvas.style.height = scaledViewport.height + 'px';
      canvas.width = scaledViewport.width * dpr;
      canvas.height = scaledViewport.height * dpr;
      context.scale(dpr, dpr);
    }

    // Create page wrapper
    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'pdf-page-wrapper';
    pageWrapper.appendChild(canvas);
    container.appendChild(pageWrapper);

    // Render page
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    };

    await page.render(renderContext).promise;
  } catch (error) {
    console.error(`Error rendering page ${pageNum}:`, error);
  }
}

// Handle window resize for responsive PDF viewing
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    // Optionally re-render on resize, but this can be resource-intensive
    // For now, we'll just ensure the canvases scale properly via CSS
  }, 250);
});

