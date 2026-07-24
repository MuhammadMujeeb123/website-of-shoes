/* =============================================
   STRYDE — Main JavaScript
   ============================================= */

'use strict';

/* ─── Utility ─────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── DOM Ready ────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initProductFilter();
  initCartButtons();
  initWishlistButtons();
  initColorDots();
  initCounterAnimation();
  initScrollAnimations();
  initBackToTop();
  initNewsletterForm();
  initContactForm();
  initStickyNavHighlight();
});

/* =============================================
   1. NAVBAR — scroll effect
   ============================================= */
function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* =============================================
   2. MOBILE NAV — open / close
   ============================================= */
function initMobileNav() {
  const hamburger  = $('#hamburger');
  const mobileNav  = $('#mobileNav');
  const mobileClose = $('#mobileClose');
  const overlay    = $('#mobileOverlay');

  if (!hamburger || !mobileNav) return;

  const open = () => {
    mobileNav.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    mobileNav.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', open);
  mobileClose?.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Close on mobile link click
  $$('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

/* =============================================
   3. PRODUCT FILTER — category tabs
   ============================================= */
function initProductFilter() {
  const filterBtns = $$('.filter-btn');
  const cards = $$('.product-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;

        if (match) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          // Force reflow then re-trigger fade
          requestAnimationFrame(() => {
            card.style.animation = 'cardFadeIn 0.35s ease forwards';
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* =============================================
   4. CART — "Add to Cart" buttons
   ============================================= */
let cartCount = 3; // starting count shown in badge

function initCartButtons() {
  const badge = $('.cart-badge');

  $$('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function () {
      cartCount++;
      if (badge) badge.textContent = cartCount;

      // Button feedback
      const original = this.textContent;
      this.textContent = '✓ Added!';
      this.style.background = '#2d6a4f';
      setTimeout(() => {
        this.textContent = original;
        this.style.background = '';
      }, 1800);

      // Toast
      const productName = this.closest('.product-card')
        ?.querySelector('h3')?.textContent || 'Item';
      showToast(`${productName} added to cart!`);
    });
  });
}

/* =============================================
   5. WISHLIST — heart toggle
   ============================================= */
function initWishlistButtons() {
  // Overlay wishlist buttons on product cards
  $$('.overlay-btn.wishlist, .overlay-btn:first-child').forEach(btn => {
    btn.addEventListener('click', function () {
      const icon = this.querySelector('i');
      if (!icon) return;

      const isWishlisted = icon.classList.contains('fa-solid');
      icon.classList.toggle('fa-solid', !isWishlisted);
      icon.classList.toggle('fa-regular', isWishlisted);
      icon.style.color = isWishlisted ? '' : '#e63946';

      showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    });
  });

  // Nav wishlist icon
  const navWishlist = $('.nav-icon-btn:first-child');
  navWishlist?.addEventListener('click', () => {
    showToast('Wishlist coming soon!');
  });
}

/* =============================================
   6. HERO COLOR DOTS — shoe color switcher
   ============================================= */
const heroImages = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=85',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&q=85',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700&q=85',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=85',
];

function initColorDots() {
  const dots     = $$('.cdot');
  const shoeImg  = $('.hero-shoe-img');

  if (!dots.length || !shoeImg) return;

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      // Smooth image swap
      shoeImg.style.opacity = '0';
      shoeImg.style.transform = 'scale(0.95)';
      setTimeout(() => {
        shoeImg.src = heroImages[i] || heroImages[0];
        shoeImg.style.opacity = '1';
        shoeImg.style.transform = '';
      }, 250);
    });
  });

  shoeImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
}

/* =============================================
   7. COUNTER ANIMATION — hero stats
   ============================================= */
function initCounterAnimation() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current < target) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  // Use IntersectionObserver so counters only start when visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* =============================================
   8. SCROLL ANIMATIONS — AOS-style
   ============================================= */
function initScrollAnimations() {
  const elements = $$('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Respect delay attribute
        const delay = entry.target.dataset.aosDelay
          ? parseInt(entry.target.dataset.aosDelay) / 1000
          : 0;

        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay * 1000);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* =============================================
   9. BACK TO TOP BUTTON
   ============================================= */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   10. NEWSLETTER FORM
   ============================================= */
function initNewsletterForm() {
  const form = $('#nlForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input?.value.trim();

    if (!email) return;

    const btn = form.querySelector('button');
    btn.textContent = '✓ Subscribed!';
    btn.style.background = '#2d6a4f';
    btn.disabled = true;
    input.value = '';

    showToast('Welcome to the Stryde community!');

    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.style.background = '';
      btn.disabled = false;
    }, 4000);
  });
}

/* =============================================
   11. CONTACT FORM
   ============================================= */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;

    // Simulate sending
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message Sent!';
      btn.style.background = '#2d6a4f';
      form.reset();
      showToast('Your message has been sent. We\'ll be in touch soon!');

      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }, 1600);
  });
}

/* =============================================
   12. ACTIVE NAV LINK on scroll
   ============================================= */
function initStickyNavHighlight() {
  const sections = $$('section[id], footer[id]');
  const navLinks = $$('.nav-links a');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle(
            'active-nav',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

/* =============================================
   13. TOAST NOTIFICATION
   ============================================= */
let toastTimer = null;

function showToast(message) {
  const toast   = $('#toast');
  const msgEl   = $('#toastMsg');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* =============================================
   14. CARD FADE-IN KEYFRAME (injected)
   ============================================= */
(function injectKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cardFadeIn {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .nav-links a.active-nav { color: var(--text) !important; }
    .nav-links a.active-nav::after { width: 100% !important; }
  `;
  document.head.appendChild(style);
})();
