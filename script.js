/* =========================================================
   DELTA CONSULTORA — Landing page
   Interacciones: menú hamburguesa, año dinámico, solapas de
   casos de éxito (farriplast.html) y envío del formulario de contacto.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  setCurrentYear();
  initTabs();
  initContactForm();
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

/* ---------- 7. Formulario de contacto ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Enviando...';
    status.removeAttribute('data-state');

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        status.textContent = '¡Gracias! Tu mensaje fue enviado correctamente.';
        status.setAttribute('data-state', 'success');
        form.reset();
      } else {
        throw new Error('Respuesta no exitosa del servidor');
      }
    } catch (error) {
      // Si el envío por fetch falla (por ejemplo, endpoint aún no configurado
      // con un ID/URL real de Formspree o Netlify), se hace un envío tradicional.
      status.textContent = 'No se pudo confirmar el envío. Reintentando...';
      status.setAttribute('data-state', 'error');
      form.submit();
    }
  });
}
