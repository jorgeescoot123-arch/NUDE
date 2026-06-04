document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const burgerBtn = document.querySelector('.burger-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    // Close mobile menu when clicking a link
    const mobileLinks = mobileNav.querySelectorAll('.nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Header scroll effect
  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  if (header) {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
  }

  // Scroll reveal animations
  const revealElements = document.querySelectorAll('.reveal');
  const checkReveal = () => {
    const triggerBottom = window.innerHeight * 0.85;

    revealElements.forEach(el => {
      const elTop = el.getBoundingClientRect().top;
      if (elTop < triggerBottom) {
        el.classList.add('active');
      }
    });
  };

  if (revealElements.length > 0) {
    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Check initial state
  }

  // Gallery Lightbox functionality
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');

  if (galleryItems.length > 0 && lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-content img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxTitle = lightbox.querySelector('.lightbox-caption h4');
    const lightboxDesc = lightbox.querySelector('.lightbox-caption p');

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.querySelector('h4');
        const category = item.querySelector('p');

        if (img && lightboxImg) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || 'Galeía NUDE';
          
          if (title && lightboxTitle) {
            lightboxTitle.textContent = title.textContent;
          }
          if (category && lightboxDesc) {
            lightboxDesc.textContent = category.textContent;
          }

          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden'; // prevent scrolling
        }
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // restore scrolling
    };

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // Floating label active state helper
  const formControls = document.querySelectorAll('.form-control, .form-select');
  formControls.forEach(control => {
    const formGroup = control.closest('.form-group');
    if (!formGroup) return;

    control.addEventListener('focus', () => {
      formGroup.classList.add('focused');
    });

    control.addEventListener('blur', () => {
      formGroup.classList.remove('focused');
    });
  });
});
