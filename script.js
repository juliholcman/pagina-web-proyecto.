/* =========================================================
   DELTA CONSULTORA — Landing page
   Interacciones: menú hamburguesa, año dinámico, solapas de
   casos de éxito (farriplast.html), envío del formulario de contacto,
   transiciones de scroll (fade-in de secciones/tarjetas) y header
   que se achica al bajar.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  setCurrentYear();
  initTabs();
  initContactForm();
  initScrollReveal();
  initHeaderScroll();
});

/* ---------- 1. Menú hamburguesa (header) ---------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Cierra el menú al elegir un enlace (comportamiento esperado en mobile)
  nav.querySelectorAll('.primary-nav__link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Cierra el menú si la ventana pasa a tamaño desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) closeNav();
  });
}

/* ---------- 8. Copyright con año actual ---------- */
function setCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- 6. Casos de éxito: sub-navegación por solapas (farriplast.html) ---------- */
function initTabs() {
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('.tabs__item'));

    const activate = (tab) => {
      tabs.forEach((t) => {
        const isSelected = t === tab;
        t.classList.toggle('is-active', isSelected);
        t.setAttribute('aria-selected', String(isSelected));
        t.tabIndex = isSelected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !isSelected;
      });
      tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));

      tab.addEventListener('keydown', (event) => {
        let targetIndex = null;
        if (event.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') targetIndex = 0;
        else if (event.key === 'End') targetIndex = tabs.length - 1;

        if (targetIndex !== null) {
          event.preventDefault();
          activate(tabs[targetIndex]);
        }
      });
    });
  });
}

/* ---------- 7. Formulario de contacto ----------
   Demo sin backend: valida los campos obligatorios con el navegador y,
   si están completos, muestra el cartel de éxito en vez del formulario.
   No se envían datos a ningún servicio (ver comentario en el <form>
   sobre cómo conectarlo de verdad más adelante). */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-form-success');
  const resetButton = document.getElementById('contact-form-reset');
  if (!form || !success) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    form.hidden = true;
    success.hidden = false;
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      form.reset();
      success.hidden = true;
      form.hidden = false;
    });
  }
}

/* ---------- Transiciones al hacer scroll (fade-in de secciones y
   cascada de tarjetas) ----------
   Progresivo: si no hay IntersectionObserver o el usuario tiene activado
   prefers-reduced-motion, se muestra todo de una y no se agrega la clase
   .js-reveal-ready, que es la que habilita el estado oculto inicial en
   CSS. Así, si este script no llegara a correr, el contenido nunca queda
   invisible (las reglas .reveal/.stagger solo ocultan bajo esa clase). */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .stagger');
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('js-reveal-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Header que se achica levemente al bajar el scroll ---------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 80;
  let ticking = false;

  const updateHeader = () => {
    header.classList.toggle('site-header--scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateHeader(); // estado correcto si la página carga con scroll ya bajado
}
