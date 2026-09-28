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

/* ---------- 6. Casos de éxito: navegación por secciones (farriplast.html) ----------
   Botón "Secciones" con listado desplegable, contador, flechas, barra de
   progreso y pie de cada sección. Todo se arma a partir de los botones
   .tabs__item y sus paneles: para sumar una sección alcanza con agregar un
   botón y un panel en el HTML. La sección abierta queda en la URL
   (?seccion=<id>). */
function initTabs() {
  const nav = document.getElementById('case-nav');
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('.tabs__item'));
    if (!tabs.length) return;

    const pad = (n) => String(n).padStart(2, '0');
    const panelOf = (t) => document.getElementById(t.getAttribute('aria-controls'));
    const slugOf = (t) => t.id.replace(/^tab-/, '');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const menu = document.getElementById('case-menu');
    const menuBtn = document.getElementById('case-menu-btn');
    const stepEl = document.getElementById('case-step');
    const titleEl = document.getElementById('case-title');
    const prevBtn = document.getElementById('case-prev');
    const nextBtn = document.getElementById('case-next');
    const progress = document.getElementById('case-progress');

    /* Numerar cada opción y marcar las que todavía no tienen contenido */
    const names = tabs.map((t) => t.textContent.trim());
    tabs.forEach((t, i) => {
      t.innerHTML =
        '<span class="tabs__num">' + pad(i + 1) + '</span>' +
        '<span class="tabs__name">' + names[i] + '</span>' +
        '<span class="tabs__soon">Próximamente</span>';
      const panel = panelOf(t);
      if (panel && panel.querySelector('.tab-panel__empty')) t.classList.add('is-soon');
    });

    /* Barra de progreso: un tramo por sección */
    const segs = [];
    if (progress) {
      tabs.forEach((t, i) => {
        const seg = document.createElement('button');
        seg.type = 'button';
        seg.className = 'case-nav__seg';
        seg.setAttribute('aria-label', 'Ir a ' + pad(i + 1) + ', ' + names[i]);
        seg.title = names[i];
        seg.addEventListener('click', () => activate(i, { scroll: true }));
        progress.appendChild(seg);
        segs.push(seg);
      });
    }

    /* Pie de cada sección: anterior / siguiente */
    tabs.forEach((t, i) => {
      const panel = panelOf(t);
      if (!panel) return;
      const wrap = document.createElement('div');
      wrap.className = 'container';
      const pager = document.createElement('nav');
      pager.className = 'case-pager';
      pager.setAttribute('aria-label', 'Ir a otra sección del caso');
      const make = (target, dir, cls) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'case-pager__btn ' + cls;
        b.innerHTML = '<span class="case-pager__dir">' + dir + '</span>' +
                      '<span class="case-pager__name">' + pad(target + 1) + ' · ' + names[target] + '</span>';
        b.addEventListener('click', () => activate(target, { scroll: true }));
        return b;
      };
      if (i > 0) pager.appendChild(make(i - 1, '← Anterior', 'case-pager__btn--prev'));
      if (i < tabs.length - 1) pager.appendChild(make(i + 1, 'Siguiente →', 'case-pager__btn--next'));
      wrap.appendChild(pager);
      panel.appendChild(wrap);
    });

    let current = Math.max(0, tabs.findIndex((t) => t.classList.contains('is-active')));

    const setMenu = (open, returnFocus) => {
      if (!menu || !menuBtn) return;
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Cerrar el listado de secciones' : 'Abrir el listado de secciones del caso');
      if (nav) nav.classList.toggle('is-open', open);
      if (open) tabs[current].focus();
      else if (returnFocus) menuBtn.focus();
    };

    function activate(i, opts) {
      opts = opts || {};
      current = i;
      tabs.forEach((t, k) => {
        const on = k === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = panelOf(t);
        if (panel) panel.hidden = !on;
      });
      if (stepEl) stepEl.textContent = pad(i + 1) + ' / ' + pad(tabs.length);
      if (titleEl) titleEl.textContent = names[i];
      if (prevBtn) prevBtn.disabled = i === 0;
      if (nextBtn) nextBtn.disabled = i === tabs.length - 1;
      segs.forEach((seg, k) => {
        seg.classList.toggle('is-active', k === i);
        seg.classList.toggle('is-done', k < i);
      });
      if (opts.focusTab) tabs[i].focus();
      if (opts.closeMenu) setMenu(false, false);
      if (opts.scroll && nav && nav.getBoundingClientRect().top < 90) {
        nav.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
      try {
        history.replaceState(null, '', i === 0 ? location.pathname : location.pathname + '?seccion=' + slugOf(tabs[i]));
      } catch (e) { /* sin historial (por ejemplo, abierto como archivo): se ignora */ }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(index, { scroll: true, closeMenu: true }));

      tab.addEventListener('keydown', (event) => {
        let target = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = tabs.length - 1;
        if (target !== null) {
          event.preventDefault();
          activate(target, { focusTab: true });
        }
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => { if (current > 0) activate(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (current < tabs.length - 1) activate(current + 1); });

    if (menuBtn && menu) {
      menuBtn.addEventListener('click', () => setMenu(menu.hidden, true));
      document.addEventListener('click', (e) => {
        if (!menu.hidden && nav && !nav.contains(e.target)) setMenu(false, false);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) setMenu(false, true);
      });
    }

    /* Abrir directo la sección indicada en la URL (?seccion=estructura) */
    const wanted = new URLSearchParams(location.search).get('seccion');
    const start = wanted ? tabs.findIndex((t) => slugOf(t) === wanted) : -1;
    activate(start >= 0 ? start : current);
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
