/**
 * EYANDRADHAI SEIVOM – main.js
 * Pure vanilla JavaScript: nav, hamburger, counters,
 * lightbox, scroll-reveal, form validation, copy-to-clipboard
 */

'use strict';

/* ─── Helpers ─────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── Sticky header shadow ────────────────────────────────── */
const header = qs('#header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ─── Hamburger / mobile menu ─────────────────────────────── */
const hamburger  = qs('.hamburger');
const mobileMenu = qs('.mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  // Close menu when a link is clicked
  qsa('a', mobileMenu).forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ─── Active nav link ─────────────────────────────────────── */
const currentPage = location.pathname.split('/').pop() || 'index.html';
qsa('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.split('#')[0] === currentPage) {
    link.classList.add('active');
  }
  // Root path edge case
  if ((currentPage === '' || currentPage === 'index.html') && (href === 'index.html' || href === './')) {
    link.classList.add('active');
  }
});

/* ─── Animated Counters ───────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target.toLocaleString('en-IN') + '+';
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current).toLocaleString('en-IN') + '+';
    }
  }, 16);
}

const counters = qsa('[data-target]');
if (counters.length) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        entry.target.dataset.done = '1';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterObserver.observe(c));
}

/* ─── Scroll-reveal ───────────────────────────────────────── */
const revealEls = qsa('.reveal');
if (revealEls.length) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));
}

/* ─── Gallery Lightbox ────────────────────────────────────── */
const lightbox     = qs('#lightbox');
const lightboxImg  = qs('#lightboxImg');
const lightboxClose = qs('#lightboxClose');
const lightboxPrev = qs('#lightboxPrev');
const lightboxNext = qs('#lightboxNext');
const galleryItems = qsa('.gallery-item img');
let currentGalleryIndex = 0;

function openLightbox(idx) {
  if (!lightbox || !galleryItems.length) return;
  currentGalleryIndex = idx;
  lightboxImg.src = galleryItems[idx].src;
  lightboxImg.alt = galleryItems[idx].alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}
function showPrev() { openLightbox((currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length); }
function showNext() { openLightbox((currentGalleryIndex + 1) % galleryItems.length); }

galleryItems.forEach((img, idx) => {
  img.parentElement.addEventListener('click', () => openLightbox(idx));
});
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev)  lightboxPrev.addEventListener('click', showPrev);
if (lightboxNext)  lightboxNext.addEventListener('click', showNext);
if (lightbox) {
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
}
document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

/* ─── Contact form validation ─────────────────────────────── */
const contactForm = qs('#contactForm');
if (contactForm) {
  const fields = {
    name:    { el: qs('#fname'),   msg: qs('#fnameErr'),   validate: v => v.trim().length >= 2 },
    email:   { el: qs('#femail'),  msg: qs('#femailErr'),  validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    phone:   { el: qs('#fphone'),  msg: qs('#fphoneErr'),  validate: v => v.trim() === '' || /^[6-9]\d{9}$/.test(v.trim().replace(/\s/g,'')) },
    message: { el: qs('#fmessage'),msg: qs('#fmessageErr'),validate: v => v.trim().length >= 10 }
  };

  function showError(key, show) {
    const f = fields[key];
    if (!f.el) return;
    f.el.classList.toggle('error', show);
    f.el.closest('.form-group').classList.toggle('has-error', show);
  }

  Object.keys(fields).forEach(key => {
    const f = fields[key];
    if (!f.el) return;
    f.el.addEventListener('blur', () => showError(key, !f.validate(f.el.value)));
    f.el.addEventListener('input', () => { if (f.el.classList.contains('error')) showError(key, !f.validate(f.el.value)); });
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    Object.keys(fields).forEach(key => {
      const f = fields[key];
      if (!f.el) return;
      const ok = f.validate(f.el.value);
      showError(key, !ok);
      if (!ok) valid = false;
    });
    if (!valid) return;

    // mailto fallback
    const name    = qs('#fname').value.trim();
    const email   = qs('#femail').value.trim();
    const phone   = qs('#fphone').value.trim();
    const message = qs('#fmessage').value.trim();
    const subject = encodeURIComponent(`Message from ${name} – Eyandradhai Seivom Website`);
    const body    = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
    );
    // TODO: Replace with actual trust email
    window.location.href = `mailto:info@example.org?subject=${subject}&body=${body}`;
  });
}

/* ─── Copy to clipboard (bank details) ────────────────────── */
qsa('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.copy;
    if (!target) return;
    navigator.clipboard.writeText(target).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 2000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = target;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });
});

/* ─── Back to top ─────────────────────────────────────────── */
const backTop = qs('.back-top');
if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─── Services dropdown keyboard nav ──────────────────────── */
const dropdown = qs('.dropdown');
if (dropdown) {
  const dropBtn = qs('a', dropdown);
  const dropMenu = qs('.dropdown-menu', dropdown);
  if (dropBtn && dropMenu) {
    dropBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isVisible = dropMenu.style.display === 'block';
        dropMenu.style.display = isVisible ? '' : 'block';
      }
    });
    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) dropMenu.style.display = '';
    });
  }
}

/* ─── Smooth scroll for anchor links ──────────────────────── */
qsa('a[href*="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    const [page, hash] = href.split('#');
    // Only handle same-page anchors
    if (!page || page === currentPage || page === './') {
      const target = hash ? qs('#' + hash) : null;
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

/* ─── Placeholder image fallback ──────────────────────────── */
qsa('img[data-placeholder]').forEach(img => {
  img.addEventListener('error', function() {
    this.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'img-placeholder';
    div.style.cssText = `width:100%;height:${this.dataset.ph || '200px'};border-radius:inherit`;
    div.innerHTML = `<i class="fa-solid fa-image"></i><span>${this.alt || 'Image'}</span>`;
    this.parentNode.insertBefore(div, this);
  });
  // Trigger if already broken
  if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
});
