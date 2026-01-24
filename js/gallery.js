// Gallery Images Data
const galleryData = [
  {
    src: 'https://cdn.rthe.cn/cached-dd1c71bda9073e500cfe907f23699ae4-avif/rayklein/Gallery/IMG_6990.JPG',
    tag: 'Travel to Beijing',
    description: 'A corner of Beihai Park.'
  },
  {
    src: 'https://cdn.rthe.cn/cached-76358601ffa5e280033f6dbab166b866-avif/rayklein/Gallery/alch.JPG',
    tag: 'Have a drink',
    description: 'Found a tavern to drink and chat with high school friends.'
  },
  {
    src: 'https://cdn.rthe.cn/cached-03386ebf14a244ec36c0949246312408-avif/rayklein/Gallery/df.PNG',
    tag: 'Murder on the Orient Express',
    description: 'Watch a drama.'
  },
  {
    src: 'https://cdn.rthe.cn/cached-eacc1cd212a4cae3f7379e7c1aaf0785-avif/rayklein/Gallery/light.JPG',
    tag: 'Light',
    description: '<em>In the light of your sun</em> ——crywolf'
  },
  {
    src: 'https://cdn.rthe.cn/cached-01bc6b092fb168261b3de60d122b8985-avif/rayklein/Gallery/moon.jpg',
    tag: 'Moon',
    description: '千里共婵娟'
  },
  {
    src: 'https://cdn.rthe.cn/cached-875ef07b80facf44ea0df364927d05f3-avif/rayklein/Gallery/mooncake.JPG',
    tag: 'Mooncake',
    description: 'Boyfriend\'s college mooncake taste good.'
  },
  {
    src: 'https://cdn.rthe.cn/cached-03327d3f64db9c591a05a71468273f2f-avif/rayklein/Gallery/rouge.JPG',
    tag: 'Le Rouge et Noir',
    description: 'Watch a musical.'
  },
  {
    src: 'https://cdn.rthe.cn/cached-01cfd3ded62e035a8db188714a4e5ef4-avif/rayklein/Gallery/sunset.JPG',
    tag: 'Sunset',
    description: 'Sunset on the bund.'
  }
];

let currentImageIndex = 0;

// DOM Elements
const galleryModal = document.getElementById('galleryModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalImage = document.getElementById('modalImage');
const modalTag = document.getElementById('modalTag');
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
  modalTag.textContent = data.tag;
  modalDesc.innerHTML = data.description;
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
