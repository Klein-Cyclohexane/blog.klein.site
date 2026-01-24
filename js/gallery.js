// Gallery Images Data
const galleryData = [
  {
    src: '/blog.klein.site/images/2026/image_Gallery_2/IMG_6120.JPG',
    title: 'Mountain Adventure',
    description: '探索自然的美丽，在高山之间感受心灵的宁静。这一刻，天地间只有我们与风景的对话。'
  },
  {
    src: '/blog.klein.site/images/2026/image_Gallery_2/IMG_7005.JPG',
    title: 'Sunset View',
    description: '日落时分的绝美景色，金色的光线洒落在大地上，绘出最温暖的色彩画卷。'
  },
  {
    src: '/blog.klein.site/images/2026/image_Gallery_2/IMG_8033.JPG',
    title: 'Portrait Moments',
    description: '捕捉那些真实的瞬间，每一个眼神都诉说着一个故事，每一个表情都是灵魂的映照。'
  },
  {
    src: '/blog.klein.site/images/2026/image_Gallery_2/IMG_9112.JPG',
    title: 'Daily Life',
    description: '生活中最平凡的时刻往往最珍贵，那些与朋友的笑声，都成了我们最美好的回忆。'
  },
  {
    src: '/blog.klein.site/images/2026/image_Gallery_2/17F3F7E71CB3228F82F2BD30E9DF8C67.png',
    title: 'Shared Moments',
    description: '分享欢笑，分享梦想，在这个时刻，我们一起见证生活中最闪闪发光的秒钟。'
  }
];

let currentImageIndex = 0;

// DOM Elements
const galleryModal = document.getElementById('galleryModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalClose = document.getElementById('modalClose');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Gallery items
const galleryItems = document.querySelectorAll('.gallery-item');

// Initialize gallery
function initGallery() {
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('.gallery-image');
    img.addEventListener('click', () => {
      openModal(index);
    });
  });

  // Modal controls
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  prevBtn.addEventListener('click', showPrevious);
  nextBtn.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboard);
}

// Open modal
function openModal(index) {
  currentImageIndex = index;
  updateModalContent();
  galleryModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
  galleryModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Update modal content
function updateModalContent() {
  const data = galleryData[currentImageIndex];
  modalImage.src = data.src;
  modalTitle.textContent = data.title;
  modalDesc.textContent = data.description;
}

// Show next image
function showNext() {
  currentImageIndex = (currentImageIndex + 1) % galleryData.length;
  updateModalContent();
  // Add animation
  animateImageChange();
}

// Show previous image
function showPrevious() {
  currentImageIndex = (currentImageIndex - 1 + galleryData.length) % galleryData.length;
  updateModalContent();
  // Add animation
  animateImageChange();
}

// Animate image change
function animateImageChange() {
  modalImage.style.animation = 'none';
  setTimeout(() => {
    modalImage.style.animation = 'fadeIn 0.3s ease-out';
  }, 10);
}

// Handle keyboard navigation
function handleKeyboard(e) {
  if (!galleryModal.classList.contains('active')) return;

  switch (e.key) {
    case 'ArrowLeft':
      showPrevious();
      break;
    case 'ArrowRight':
      showNext();
      break;
    case 'Escape':
      closeModal();
      break;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGallery);
} else {
  initGallery();
}
