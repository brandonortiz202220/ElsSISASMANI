/* ============================================
   CréditoAR — Main JavaScript
   ============================================ */

// ─── CUSTOM CURSOR ───
document.addEventListener('mousemove', e => {
  document.body.style.setProperty('--cx', e.clientX + 'px');
  document.body.style.setProperty('--cy', e.clientY + 'px');
});

// ─── NAVBAR SCROLL ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, { passive: true });

// ─── HAMBURGER MENU ───
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ─── PARTICLE CANVAS ───
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrame;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4 - 0.2;
    this.opacity = Math.random() * 0.6 + 0.1;
    this.color = this.randomColor();
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
  }
  randomColor() {
    const colors = ['0, 255, 136', '0, 229, 255', '178, 255, 89', '29, 233, 182'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
      this.reset();
    }
  }
  draw() {
    const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
    ctx.fill();
  }
}

// Create particles
for (let i = 0; i < 80; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.08 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  animFrame = requestAnimationFrame(animateParticles);
}
animateParticles();

// Pause when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(animFrame);
  else animateParticles();
});

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = performance.now();
  
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

// ─── INTERSECTION OBSERVER ───
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Counter observer
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('[data-target]');
      counters.forEach(c => animateCounter(c));
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// Risk bars animation
const riskObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.risk-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = w; }, 300);
      });
      riskObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const ratesTable = document.querySelector('.rates-table');
if (ratesTable) riskObserver.observe(ratesTable);

// ─── FAQ ACCORDION ───
function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// ─── FORM VALIDATION ───
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;

    // Clear errors
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const mensaje = document.getElementById('mensaje');
    const acepto = document.getElementById('acepto');

    if (!nombre.value.trim() || nombre.value.trim().length < 2) {
      document.getElementById('err-nombre').textContent = 'Por favor ingresá tu nombre (mínimo 2 caracteres).';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
      document.getElementById('err-email').textContent = 'Ingresá un correo electrónico válido.';
      valid = false;
    }

    if (!mensaje.value.trim() || mensaje.value.trim().length < 10) {
      document.getElementById('err-mensaje').textContent = 'La consulta debe tener al menos 10 caracteres.';
      valid = false;
    }

    if (!acepto.checked) {
      document.getElementById('err-acepto').textContent = 'Debés aceptar los términos para continuar.';
      valid = false;
    }

    if (valid) {
      const btn = form.querySelector('.btn-primary');
      btn.disabled = true;
      btn.innerHTML = '<span>Enviando...</span>';

      // Simulate send
      setTimeout(() => {
        form.reset();
        document.getElementById('formSuccess').style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = `<span>Enviar consulta</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
        setTimeout(() => {
          document.getElementById('formSuccess').style.display = 'none';
        }, 6000);
      }, 1500);
    }
  });
}

// ─── COOKIE CONSENT ───
function checkCookieConsent() {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) {
    setTimeout(() => {
      document.getElementById('cookie-banner').classList.add('visible');
    }, 2000);
  }
}

function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  hideCookieBanner();
}

function rejectCookies() {
  localStorage.setItem('cookieConsent', 'rejected');
  hideCookieBanner();
}

function hideCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  banner.classList.remove('visible');
}

checkCookieConsent();

// ─── SMOOTH ANCHOR SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── ACTIVE NAV HIGHLIGHT ───
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
      });
    }
  });
}, { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ─── RGB GLOW ON SCROLL ───
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      const hue = (scrolled / 5) % 360;
      document.documentElement.style.setProperty('--rgb-dynamic', `hsl(${hue}, 100%, 60%)`);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ─── FORM INPUT ANIMATIONS ───
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    input.parentElement.classList.remove('focused');
  });
});

// ─── CARD TILT EFFECT ───
document.querySelectorAll('.card, .req-step, .entity-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

console.log('%cCréditoAR 🟢', 'color: #00ff88; font-size: 20px; font-weight: bold;');
console.log('%cPortal informativo sobre créditos en Argentina.', 'color: #a5d6a7; font-size: 12px;');
