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
  initParallax();
  initServiceStack();
  initAssistant();
  initCaseExtras();
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
    const reduceMotion = false; // animaciones siempre activas

    const menu = document.getElementById('case-menu');
    const menuBtn = document.getElementById('case-menu-btn');
    const stepEl = document.getElementById('case-step');
    const titleEl = document.getElementById('case-title');
    const prevBtn = document.getElementById('case-prev');
    const nextBtn = document.getElementById('case-next');
    const progress = document.getElementById('case-progress');

    /* Numerar cada opción y marcar las que todavía no tienen contenido */
    const names = tabs.map((t) => t.textContent.trim());
    const shorts = tabs.map((t, i) => t.dataset.short || names[i]);
    tabs.forEach((t, i) => {
      /* Al pasar el mouse se ve de qué template sale cada sección */
      if (t.dataset.template) t.title = t.dataset.template;
      else if (t.dataset.short) t.title = names[i];
      t.innerHTML =
        '<span class="tabs__num">' + pad(i + 1) + '</span>' +
        '<span class="tabs__name">' + shorts[i] + '</span>' +
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
      /* Al cambiar de sección se vuelve al comienzo del contenido */
      const body = document.querySelector('.case-body');
      const anchor = opts.scroll ? (body || nav) : null;
      if (anchor && anchor.getBoundingClientRect().top < 0) {
        anchor.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
      /* Marca la etapa que contiene la sección abierta */
      document.querySelectorAll('.journey__stage').forEach((st) => {
        st.classList.toggle('is-current', st.contains(tabs[i]));
      });
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
   Progresivo: si no hay IntersectionObserver se muestra todo de una y no se agrega la clase
   .js-reveal-ready, que es la que habilita el estado oculto inicial en
   CSS. Así, si este script no llegara a correr, el contenido nunca queda
   invisible (las reglas .reveal/.stagger solo ocultan bajo esa clase). */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .stagger, .reveal-stack, .reveal-mask');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
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
    /* Aparece apenas su borde superior entra 40px en pantalla. Un
       porcentaje del bloque (threshold) no sirve: en celular un bloque
       alto tardaba en llegar al 12% visible y quedaba en blanco. */
    { threshold: 0, rootMargin: '0px 0px -40px 0px' }
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

/* ---------- Parallax sutil de scroll (solo desktop) ----------
   Dos variantes, elegidas con data-parallax:
   - "scroll": se corre en proporción al scroll absoluto de la página, acotado
     a un máximo. Pensado para el fondo del Hero, para que quede "atrás",
     más lento que el contenido.
   - "center": se corre según qué tan lejos está su centro del centro de la
     pantalla, en un rango chico. Pensado para una imagen de contenido (la
     foto de "Quiénes somos"), para que no se note como un parallax de fondo
     sino como un acompañamiento sutil del scroll.
   Se desactiva en mobile a propósito: es el efecto con más costo de layout/
   scroll y el que menos se nota en una pantalla chica. */
function initParallax() {
  const els = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;

  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  if (!isDesktop || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
    },
    { rootMargin: '150px 0px' }
  );

  els.forEach((el) => observer.observe(el));

  let ticking = false;

  const update = () => {
    visible.forEach((el) => {
      if (el.dataset.parallax === 'scroll') {
        const offset = Math.min(window.scrollY * 0.15, 80);
        el.style.transform = 'translateY(' + offset + 'px)';
      } else {
        const rect = el.getBoundingClientRect();
        const distanceFromCenter = window.innerHeight / 2 - (rect.top + rect.height / 2);
        const offset = Math.max(-24, Math.min(24, distanceFromCenter * 0.08));
        el.style.transform = 'translateY(' + offset + 'px)';
      }
    });
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  update();
}

/* ---------- Servicios: tarjetas apiladas ----------
   Las tarjetas son sticky por CSS (se superponen solas). Acá solo se
   calcula, para cada una, cuánto la está tapando la siguiente (0 a 1) y se
   pasa como --cover: el CSS la achica un poco y le baja el brillo, para
   que se lea como que queda "atrás". */
function initServiceStack() {
  const cards = Array.from(document.querySelectorAll('.svc-card'));
  if (cards.length < 2) return;

  let ticking = false;

  const update = () => {
    for (let i = 0; i < cards.length - 1; i++) {
      const card = cards[i];
      const next = cards[i + 1];
      const stickyTop = parseFloat(getComputedStyle(card).top) || 0;
      const h = card.offsetHeight;
      const nextTop = next.getBoundingClientRect().top;
      const cover = Math.max(0, Math.min(1, (stickyTop + h - nextTop) / h));
      card.style.setProperty('--cover', cover.toFixed(3));
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* ---------- Asistente: botón flotante que lleva al equipo comercial ----------
   Aparece en todas las páginas (abajo a la derecha, por encima del cartel de
   Netlify). Abre un panel con opciones; las que piden contacto llevan al
   formulario de la home con el mensaje ya escrito (?tema=...#contacto).
   No hay chat en vivo ni backend: todo termina en el formulario de contacto.
   FALTA: si Delta tiene WhatsApp o mail comercial, sumarlo como opción acá. */
function initAssistant() {
  const SERVICES = [
    'Desarrollo de Software',
    'Optimización de Procesos',
    'Soluciones en la Nube',
    'Arquitectura y Transformación Digital',
    'Data & Business Intelligence',
    'Capacitación y Formación de Equipos'
  ];
  const isHome = !!document.getElementById('contact-form');
  const home = isHome ? '' : '/';

  /* Si llegamos a la home con ?tema=..., se completa el mensaje del formulario */
  const prefill = (tema) => {
    const msg = document.getElementById('mensaje');
    if (!msg || !tema) return;
    if (!msg.value.trim()) {
      msg.value = 'Hola, quiero hablar con el equipo comercial de Delta sobre: ' + tema + '.';
    }
  };
  const goContact = (tema) => {
    if (isHome) {
      prefill(tema);
      const contact = document.getElementById('contacto');
      if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const name = document.getElementById('nombre');
      if (name) setTimeout(() => name.focus({ preventScroll: true }), 700);
      close();
    } else {
      location.href = home + '?tema=' + encodeURIComponent(tema) + '#contacto';
    }
  };
  try {
    const tema = new URLSearchParams(location.search).get('tema');
    if (tema && isHome) prefill(tema.slice(0, 120));
  } catch (e) { /* sin parámetros: nada que completar */ }

  const wrap = document.createElement('div');
  wrap.className = 'assistant';
  wrap.innerHTML =
    '<div class="assistant__panel" id="assistant-panel" role="dialog" aria-modal="false" aria-labelledby="assistant-title" hidden>' +
      '<div class="assistant__head">' +
        '<img src="delta-simbolo.png" alt="" class="assistant__logo">' +
        '<div><p class="assistant__title" id="assistant-title">Asistente Delta</p>' +
        '<p class="assistant__sub">Te conectamos con el equipo comercial</p></div>' +
        '<button type="button" class="assistant__close" aria-label="Cerrar el asistente">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="assistant__body">' +
        '<p class="assistant__bubble">¡Hola! ¿En qué te podemos ayudar?</p>' +
        '<div class="assistant__options" data-view="main">' +
          '<button type="button" class="assistant__opt assistant__opt--main" data-action="comercial">Hablar con el equipo comercial</button>' +
          '<button type="button" class="assistant__opt" data-action="servicios">Consultar por un servicio</button>' +
          '<a class="assistant__opt" href="/casos-exito">Ver casos de éxito</a>' +
          '<a class="assistant__opt" href="' + home + '#quienes-somos">Conocer a Delta</a>' +
        '</div>' +
        '<div class="assistant__options" data-view="servicios" hidden>' +
          '<p class="assistant__bubble assistant__bubble--small">¿Cuál te interesa?</p>' +
          SERVICES.map((sv) => '<button type="button" class="assistant__opt" data-service="' + sv + '">' + sv + '</button>').join('') +
          '<button type="button" class="assistant__back" data-action="volver">← Volver</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="assistant__toggle" id="assistant-toggle" aria-expanded="false" aria-controls="assistant-panel">' +
      '<span class="assistant__dot" aria-hidden="true"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H6a2 2 0 0 1-2-2V5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>' +
      '<span>Asistente</span>' +
    '</button>';
  document.body.appendChild(wrap);

  const panel = wrap.querySelector('.assistant__panel');
  const toggle = wrap.querySelector('.assistant__toggle');
  const views = wrap.querySelectorAll('[data-view]');
  const show = (name) => views.forEach((v) => { v.hidden = v.dataset.view !== name; });

  function open() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    wrap.classList.add('is-open');
    show('main');
    const first = panel.querySelector('.assistant__opt');
    if (first) first.focus();
  }
  function close(returnFocus) {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    wrap.classList.remove('is-open');
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => (panel.hidden ? open() : close(true)));
  wrap.querySelector('.assistant__close').addEventListener('click', () => close(true));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(true); });
  document.addEventListener('click', (e) => { if (!panel.hidden && !wrap.contains(e.target)) close(false); });

  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.action === 'comercial') goContact('una consulta comercial');
    else if (b.dataset.action === 'servicios') { show('servicios'); const f = panel.querySelector('[data-service]'); if (f) f.focus(); }
    else if (b.dataset.action === 'volver') show('main');
    else if (b.dataset.service) goContact('el servicio de ' + b.dataset.service);
  });
}

/* ---------- Caso Farriplast: glosario, gráficos interactivos y encabezado por etapa ----------
   Todo se arma sobre el HTML que ya existe: si este script no corre, la
   página se lee igual (los gráficos quedan con sus valores fijos). */
function initCaseExtras() {
  if (!document.querySelector('.case-body')) return;
  const tip = createTip();
  initStageIntros();
  initGlossary(tip);
  initChartTips(tip);
  initScoreToggle();
  initCostToggle();
  initWeights();
  initGantt();
  initValuesWheel();
  initCountUp();
}

/* Un solo globo de ayuda para glosario y gráficos */
function createTip() {
  const el = document.createElement('div');
  el.className = 'tip';
  el.setAttribute('role', 'tooltip');
  el.id = 'case-tip';
  el.hidden = true;
  document.body.appendChild(el);
  let owner = null;
  const place = (target) => {
    const r = target.getBoundingClientRect();
    el.style.left = '0px';
    el.style.top = '0px';
    const w = el.offsetWidth, h = el.offsetHeight;
    let x = r.left + r.width / 2 - w / 2;
    x = Math.max(12, Math.min(x, window.innerWidth - w - 12));
    let y = r.top - h - 10;
    el.classList.toggle('tip--below', y < 80);
    if (y < 80) y = r.bottom + 10;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  };
  const show = (target, html) => {
    owner = target;
    el.innerHTML = html;
    el.hidden = false;
    target.setAttribute('aria-describedby', 'case-tip');
    place(target);
  };
  const hide = () => {
    if (owner) owner.removeAttribute('aria-describedby');
    owner = null;
    el.hidden = true;
  };
  window.addEventListener('scroll', () => { if (owner) place(owner); }, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  document.addEventListener('click', (e) => {
    if (owner && !owner.contains(e.target) && !el.contains(e.target)) hide();
  });
  return {
    bind(target, getHtml) {
      target.addEventListener('mouseenter', () => show(target, getHtml()));
      target.addEventListener('mouseleave', hide);
      target.addEventListener('focus', () => show(target, getHtml()));
      target.addEventListener('blur', hide);
      target.addEventListener('click', (e) => {
        e.stopPropagation();
        if (owner === target) hide(); else show(target, getHtml());
      });
    },
    hide
  };
}

/* Encabezado de color al principio de cada sección: etapa y posición */
function initStageIntros() {
  const panels = Array.from(document.querySelectorAll('.tab-panel[data-stage]'));
  panels.forEach((panel, i) => {
    const tab = document.getElementById(panel.getAttribute('aria-labelledby'));
    const stage = tab ? tab.closest('.journey__stage') : null;
    if (!stage || panel.querySelector('.tab-panel__empty')) return;
    const num = stage.querySelector('.journey__num').textContent;
    const name = stage.querySelector('.journey__name').textContent;
    const q = stage.querySelector('.journey__q').textContent;
    const title = tab.dataset.short ? tab.querySelector('.tabs__name') : null;
    const intro = document.createElement('div');
    intro.className = 'panel-intro';
    intro.innerHTML =
      '<div class="container panel-intro__inner">' +
        '<span class="panel-intro__stage">' + num + ' · ' + name + '</span>' +
        '<span class="panel-intro__q">' + q + '</span>' +
        '<span class="panel-intro__pos">Sección ' + String(i + 1).padStart(2, '0') + ' de ' + panels.length + '</span>' +
      '</div>';
    panel.insertBefore(intro, panel.firstChild);
  });
}

/* Glosario: la primera vez que aparece un término en cada sección queda
   subrayado y, al pasar el mouse o tocarlo, explica qué significa. */
const GLOSSARY = [
  ['arquitectura empresarial', 'Arquitectura empresarial', 'El mapa de cómo funciona la empresa por dentro: sus procesos, su información, sus herramientas y sus equipos.'],
  ['relevamiento', 'Relevamiento', 'La etapa en la que entrevistamos y observamos para entender cómo se trabaja hoy.'],
  ['scrap', 'Scrap', 'Descartes y sobrantes de plástico que dejan las fábricas y se pueden volver a usar.'],
  ['fasón', 'Fasón', 'Servicio en el que Farriplast procesa el material de un cliente y se lo devuelve. Cobra solo el trabajo.'],
  ['agruma', 'Agrumar', 'Compactar el plástico blando, como el film, en grumos para poder procesarlo.'],
  ['agrumado', 'Agrumado', 'Compactar el plástico blando, como el film, en grumos para poder procesarlo.'],
  ['extruye', 'Extrusión', 'Fundir el plástico y pasarlo por un molde para obtener un material uniforme.'],
  ['extrusión', 'Extrusión', 'Fundir el plástico y pasarlo por un molde para obtener un material uniforme.'],
  ['mermas?', 'Merma', 'El material que se pierde durante el proceso.'],
  ['trazabilidad', 'Trazabilidad', 'Poder seguir cada lote de material desde que entra hasta que sale.'],
  ['ERP', 'ERP', 'Sistema de gestión que reúne en un solo lugar compras, ventas, stock y cuentas.'],
  ['SaaS', 'SaaS', 'Software como servicio: se usa por internet, se paga una cuota y el proveedor se encarga de mantenerlo.'],
  ['On-premises', 'On-premises', 'Software instalado en servidores propios de la empresa, que ella misma tiene que mantener.'],
  ['Big Bang', 'Big Bang', 'Implementación de una sola vez: todos los módulos y todos los usuarios arrancan el mismo día.'],
  ['Doblin', 'Modelo de Doblin', 'Un modelo que mira diez aspectos de un negocio para ver en cuáles impacta una innovación.'],
  ['RFP', 'RFP', 'Solicitud de propuesta: el cuadro con lo que el cliente necesita, para comparar proveedores con los mismos criterios.'],
  ['partes interesadas', 'Partes interesadas', 'Las personas o grupos a los que afecta el proyecto (en inglés, stakeholders).'],
  ['sponsor', 'Sponsor', 'Quien impulsa y aprueba el proyecto del lado del cliente. En este caso, Mariano.'],
  ['Success Pack', 'Success Pack', 'Paquete de horas de consultoría de Odoo para configurar el sistema y capacitar a los usuarios.'],
  ['IoT Box', 'IoT Box', 'Un dispositivo de Odoo que conecta equipos físicos, como la balanza, con el sistema.'],
  ['CTS', 'CTS', 'Costo total del servicio: todo lo que se paga en 3 años por un sistema en la nube.'],
  ['CTP', 'CTP o TCO', 'Costo total de propiedad: lo mismo que el CTS, pero para un software que se compra e instala en servidores propios.'],
  ['partner', 'Partner', 'Empresa autorizada por un proveedor para vender e implementar su sistema.'],
  ['localización argentina', 'Localización argentina', 'La adaptación del sistema a las normas del país, como la factura electrónica.'],
  ['ARCA', 'ARCA', 'Agencia de Recaudación y Control Aduanero, el organismo fiscal nacional (ex AFIP).'],
  ['conciliación bancaria', 'Conciliación bancaria', 'Comparar lo registrado en el sistema con los movimientos del banco.'],
  ['usuarios concurrentes', 'Usuarios concurrentes', 'Se paga por la cantidad de personas conectadas al mismo tiempo, no por cada persona.'],
  ['cuentas corrientes', 'Cuentas corrientes', 'Lo que debe o tiene a favor cada cliente y cada proveedor.'],
  ['remitos?', 'Remito', 'El documento que acompaña cada entrega de material.'],
  ['tablero de indicadores', 'Tablero de indicadores', 'Una pantalla que resume los números clave del negocio.'],
  ['brechas?', 'Brecha', 'La diferencia entre cómo funciona la empresa hoy y cómo debería funcionar.'],
  ['ponderado', 'Ponderado', 'Cada puntaje se multiplica por el peso de su aspecto y después se suman.'],
  ['acuerdo de nivel de servicio', 'Acuerdo de nivel de servicio', 'El compromiso por escrito del proveedor sobre disponibilidad y tiempos de respuesta (en inglés, SLA).']
];

function initGlossary(tip) {
  const panels = document.querySelectorAll('.tab-panel');
  const letters = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
  const terms = GLOSSARY.map(([pat, title, def]) => ({
    re: new RegExp('(^|[^' + letters + '])(' + pat + ')(?![' + letters + '])', /[A-Z]{2,}/.test(pat) ? '' : 'i'),
    title, def
  }));
  const skip = 'h1,h2,h3,h4,button,a,.eyebrow,.case-card__tag,.score-row__label,.cap-chart,.panel-intro,.term,.score-bar,.gantt,.weights,.gap-tag,.ae-chip,.case-docs,.case-pager,.tip';
  panels.forEach((panel) => {
    const used = new Set();
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (!n.nodeValue.trim() || n.parentElement.closest(skip)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let current = node;
      /* En cada tramo de texto se busca el término no usado que aparece primero */
      while (current && current.parentNode) {
        let best = null;
        terms.forEach((t) => {
          if (used.has(t.title)) return;
          const m = t.re.exec(current.nodeValue);
          if (m && (!best || m.index + m[1].length < best.start)) best = { t, start: m.index + m[1].length, len: m[2].length };
        });
        if (!best) break;
        used.add(best.t.title);
        const after = current.splitText(best.start);
        const rest = after.splitText(best.len);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'term';
        btn.textContent = after.nodeValue;
        btn.setAttribute('aria-label', after.nodeValue + ': ver qué significa');
        after.parentNode.replaceChild(btn, after);
        const t = best.t;
        tip.bind(btn, () => '<strong>' + t.title + '</strong>' + t.def);
        current = rest;
      }
    });
  });
}

/* Barras de los gráficos con detalle al pasar el mouse o tocar */
function initChartTips(tip) {
  document.querySelectorAll('[data-tip]').forEach((el) => {
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    tip.bind(el, () => el.dataset.tip);
  });
}

function setToggle(group, btn) {
  group.querySelectorAll('.chart-toggle__btn').forEach((b) => {
    const on = b === btn;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
  });
}
const fmt1 = (n) => n.toFixed(1).replace('.', ',');
const fmtUsd = (n) => Math.round(n).toLocaleString('es-AR');

/* Puntajes: sobre 100 por aspecto, o puntos que aporta cada aspecto al total */
function initScoreToggle() {
  const chart = document.querySelector('.js-score');
  if (!chart) return;
  const toggle = chart.previousElementSibling;
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.chart-toggle__btn');
    if (!btn) return;
    setToggle(toggle, btn);
    const weighted = btn.dataset.view === 'weighted';
    chart.classList.toggle('is-weighted', weighted);
    chart.querySelectorAll('.score-row:not(.score-row--total)').forEach((row) => {
      const w = Number(row.dataset.weight);
      row.querySelectorAll('.score-bar').forEach((bar) => {
        const v = weighted ? Number(bar.dataset.weighted) : Number(bar.dataset.raw);
        /* en "aporte", la barra llena es el peso del aspecto: así se ve cuánto pierde cada uno */
        bar.querySelector('.score-bar__fill').style.setProperty('--w', (weighted ? v / 35 * 100 : v) + '%');
        bar.querySelector('.score-bar__track').style.setProperty('--max', weighted ? (w / 35 * 100) + '%' : '100%');
        bar.querySelector('.score-bar__value').textContent = fmt1(v) + (weighted ? ' de ' + w : '');
      });
    });
  });
}

/* Costos: lo que se paga cada año o el acumulado */
function initCostToggle() {
  const chart = document.querySelector('.js-cost');
  if (!chart) return;
  const toggle = chart.previousElementSibling;
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.chart-toggle__btn');
    if (!btn) return;
    setToggle(toggle, btn);
    const view = btn.dataset.view;
    chart.querySelectorAll('.score-row:not(.score-row--total)').forEach((row) => {
      const note = row.querySelector('.score-row__weight');
      note.textContent = note.dataset[view];
      row.querySelectorAll('.score-bar').forEach((bar) => {
        const v = Number(bar.dataset[view]);
        bar.querySelector('.score-bar__fill').style.setProperty('--w', (v / 15044 * 100) + '%');
        bar.querySelector('.score-bar__value').textContent = fmtUsd(v);
        bar.dataset.tip = view === 'cum' ? bar.dataset.tipCum : bar.dataset.tipYear;
      });
    });
  });
}

/* Matriz RFP: cuánto pesa cada aspecto y en qué se divide */
function initWeights() {
  const box = document.querySelector('[data-weights]');
  if (!box) return;
  const data = [
    { name: 'Proveedor', w: 20, why: 'Farriplast depende del proveedor durante los 24 meses, por eso lo que más pesa es que acompañe la implementación.', cats: [['Implementación y capacitación', 40], ['Soporte y validación previa', 35], ['Trayectoria y adecuación al cliente', 25]] },
    { name: 'Funcional', w: 35, why: 'Es el aspecto que más pesa: sin el núcleo de la fase 1 no se puede dejar el cuaderno.', cats: [['Núcleo operativo, fase 1', 45], ['Producción y control del servicio, fase 2', 30], ['Análisis y trazabilidad, fases 3 y 4', 25]] },
    { name: 'Técnico', w: 25, why: 'La facilidad de uso es la prioridad de Mariano: los operarios nunca usaron un sistema de gestión.', cats: [['Usabilidad y acceso', 45], ['Infraestructura y continuidad', 30], ['Datos e integración', 25]] },
    { name: 'Económico', w: 20, why: 'La cuota pesa más que la puesta en marcha porque compite todos los meses con la inversión en la planta.', cats: [['Costo inicial', 40], ['Costo recurrente', 60]] }
  ];
  const detail = box.querySelector('.weights__detail');
  const segs = Array.from(box.querySelectorAll('.weights__seg'));
  const render = (i) => {
    const a = data[i];
    segs.forEach((s, k) => { s.setAttribute('aria-selected', String(k === i)); s.tabIndex = k === i ? 0 : -1; });
    box.querySelectorAll('.weights__slice').forEach((c, k) => c.classList.toggle('is-on', k === i));
    detail.dataset.aspect = String(i + 1);
    detail.innerHTML =
      '<p class="weights__title"><strong>' + a.name + '</strong> vale ' + a.w + ' de los 100 puntos</p>' +
      '<div class="weights__cats">' + a.cats.map(([n, p]) =>
        '<div class="weights__cat"><span class="weights__cat-name">' + n + '</span>' +
        '<span class="weights__cat-track"><span class="weights__cat-fill" style="--p:' + p + '%"></span></span>' +
        '<span class="weights__cat-val">' + p + '% · ' + fmt1(a.w * p / 100) + ' pts</span></div>').join('') +
      '</div>';
  };
  segs.forEach((s, i) => {
    s.addEventListener('click', () => render(i));
    s.addEventListener('keydown', (e) => {
      let t = null;
      if (e.key === 'ArrowRight') t = (i + 1) % segs.length;
      if (e.key === 'ArrowLeft') t = (i - 1 + segs.length) % segs.length;
      if (t !== null) { e.preventDefault(); render(t); segs[t].focus(); }
    });
  });
  box.querySelectorAll('.weights__slice').forEach((c) => c.addEventListener('click', () => render(Number(c.dataset.aspect))));
  render(1);
}

/* Cronograma: al tocar una fase se ve qué incluye */
function initGantt() {
  const box = document.querySelector('[data-gantt]');
  if (!box) return;
  const phases = [
    ['Fase 1 · Meses 1 a 6', 'Núcleo operativo', ['Stock, compras, ventas y remitos', 'Cuentas corrientes y cobranzas', 'Facturación electrónica', 'Control mensual del stock de fasón']],
    ['Fase 2 · Meses 7 a 12', 'Producción y costos', ['Producción por etapa', 'Costo y margen por kilo', 'Entregas y rechazos', 'Gastos generales y reporte de fin de mes']],
    ['Fase 3 · Meses 13 a 18', 'Análisis y trazabilidad', ['Tablero de indicadores', 'Reporte de fasón para todos los clientes', 'QR por lote y balanza conectada', 'Conciliación bancaria']],
    ['Fase 4 · Meses 19 a 24', 'Consolidación', ['Consolidar el uso del sistema', 'Seguimiento de las metas', 'Evaluar el costo de la solución', 'Evaluar que carguen más operarios']]
  ];
  const rows = Array.from(box.querySelectorAll('.gantt__row'));
  const detail = box.querySelector('.gantt__detail');
  const render = (i) => {
    rows.forEach((r, k) => { r.setAttribute('aria-pressed', String(k === i)); r.classList.toggle('is-on', k === i); });
    const [when, name, items] = phases[i];
    detail.dataset.phase = String(i + 1);
    detail.innerHTML = '<p class="gantt__detail-when">' + when + '</p><p class="gantt__detail-name">' + name + '</p><ul>' +
      items.map((it) => '<li>' + it + '</li>').join('') + '</ul>';
  };
  rows.forEach((r, i) => r.addEventListener('click', () => render(i)));
  render(0);
}

/* Valores: rueda que rota sola; al tocar uno se detiene en ese */
function initValuesWheel() {
  const box = document.querySelector('[data-values]');
  if (!box) return;
  const nodes = Array.from(box.querySelectorAll('.values-wheel__node'));
  const data = Array.from(box.querySelectorAll('.values-wheel__data li'));
  const title = box.querySelector('.values-wheel__title');
  const desc = box.querySelector('.values-wheel__desc');
  const center = box.querySelector('.values-wheel__center');
  let i = 0, timer = null;
  const show = (k) => {
    i = k;
    nodes.forEach((n, j) => { n.setAttribute('aria-pressed', String(j === k)); n.classList.toggle('is-on', j === k); });
    center.classList.remove('is-swap'); void center.offsetWidth; center.classList.add('is-swap');
    title.textContent = data[k].dataset.name;
    desc.textContent = data[k].textContent;
  };
  const start = () => { timer = setInterval(() => show((i + 1) % nodes.length), 3500); };
  const stop = () => { clearInterval(timer); timer = null; };
  nodes.forEach((n, k) => n.addEventListener('click', () => { stop(); show(k); }));
  box.addEventListener('mouseenter', stop);
  box.addEventListener('mouseleave', () => { if (!timer) start(); });
  /* rota solo mientras está a la vista */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { if (!timer) start(); } else stop(); })).observe(box);
  } else start();
  show(0);
}

/* Números que cuentan hacia arriba al aparecer */
function initCountUp() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, end = Number(el.dataset.count), suf = el.dataset.suffix || '';
    const from = end > 1000 ? end - 30 : 0, t0 = performance.now(), dur = 1100;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(from + (end - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}
