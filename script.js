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
      const stageEl = document.getElementById('case-stage');
      const st = tabs[i].closest('.journey__stage');
      if (stageEl && st) {
        stageEl.textContent = st.querySelector('.journey__num').textContent + ' · ' + st.querySelector('.journey__name').textContent;
        stageEl.dataset.stage = st.dataset.stage;
      }
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
  const targets = document.querySelectorAll('.reveal, .stagger, .reveal-stack, .reveal-mask, .replay');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('js-reveal-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        /* Cada vez que el bloque vuelve a la pantalla se repite la animación */
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
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

  const BOT = 'Delfi';
  const wrap = document.createElement('div');
  wrap.className = 'assistant';
  wrap.innerHTML =
    '<div class="assistant__panel" id="assistant-panel" role="dialog" aria-modal="false" aria-labelledby="assistant-title" hidden>' +
      '<div class="assistant__head">' +
        '<span class="assistant__avatar" aria-hidden="true">D<i></i></span>' +
        '<div><p class="assistant__title" id="assistant-title">' + BOT + ', de Delta</p>' +
        '<p class="assistant__sub">En línea · te conecto con el equipo comercial</p></div>' +
        '<button type="button" class="assistant__close" aria-label="Cerrar el asistente">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="assistant__body" aria-live="polite"></div>' +
      '<form class="assistant__input" hidden autocomplete="on"><input type="text" aria-label="Tu respuesta"><button type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>' +
    '</div>' +
    '<button type="button" class="assistant__toggle" id="assistant-toggle" aria-expanded="false" aria-controls="assistant-panel">' +
      '<span class="assistant__dot" aria-hidden="true"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H6a2 2 0 0 1-2-2V5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>' +
      '<span>Asistente</span>' +
    '</button>';
  document.body.appendChild(wrap);

  const panel = wrap.querySelector('.assistant__panel');
  const toggle = wrap.querySelector('.assistant__toggle');
  const body = wrap.querySelector('.assistant__body');
  const form = wrap.querySelector('.assistant__input');
  const input = form.querySelector('input');
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lead = { tema: '', nombre: '', contacto: '', mensaje: '' };
  let step = null, started = false;

  const scroll = () => { body.scrollTop = body.scrollHeight; };
  const say = (html, delay = 650) => new Promise((res) => {
    const t = document.createElement('p');
    t.className = 'assistant__bubble assistant__typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(t); scroll();
    setTimeout(() => { t.classList.remove('assistant__typing'); t.innerHTML = html; scroll(); res(); }, delay);
  });
  const me = (text) => { const p = document.createElement('p'); p.className = 'assistant__bubble assistant__bubble--me'; p.textContent = text; body.appendChild(p); scroll(); };
  const options = (list) => {
    const box = document.createElement('div');
    box.className = 'assistant__options';
    box.innerHTML = list.map(([label, val, href]) => href
      ? '<a class="assistant__opt" href="' + href + '">' + label + '</a>'
      : '<button type="button" class="assistant__opt" data-val="' + esc(val) + '">' + label + '</button>').join('');
    body.appendChild(box); scroll();
    return new Promise((res) => box.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      box.remove(); me(b.textContent); res(b.dataset.val);
    }));
  };
  const ask = (placeholder, type = 'text') => new Promise((res) => {
    form.hidden = false; input.type = type; input.value = ''; input.placeholder = placeholder;
    setTimeout(() => input.focus(), 50);
    step = (v) => { form.hidden = true; step = null; res(v); };
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v || !step) return;
    if (input.dataset.check === 'contact' && !(/\S+@\S+\.\S+/.test(v) || v.replace(/\D/g, '').length >= 8)) {
      input.setCustomValidity('Escribí un mail o un teléfono'); input.reportValidity(); input.setCustomValidity(''); return;
    }
    me(v); step(v);
  });

  /* Envía la consulta a Netlify Forms (formulario "asistente" declarado en index.html) */
  const send = () => fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ 'form-name': 'asistente', pagina: location.pathname, ...lead }).toString()
  }).then((r) => { if (!r.ok) throw new Error(r.status); });

  async function chat() {
    started = true;
    await say('¡Hola! Soy <strong>' + BOT + '</strong>, del equipo de Delta 👋', 500);
    await say('¿En qué te puedo ayudar?', 600);
    const pick = await options([
      ['Hablar con el equipo comercial', 'una consulta comercial'],
      ['Consultar por un servicio', 'servicio'],
      ['Ver casos de éxito', '', '/casos-exito'],
      ['Conocer a Delta', '', home + '#quienes-somos']
    ]);
    lead.tema = pick;
    if (pick === 'servicio') {
      await say('¿Cuál te interesa?');
      lead.tema = 'el servicio de ' + await options(SERVICES.map((sv) => [sv, sv]));
    }
    await say('¡Genial! ¿Cómo te llamás?');
    lead.nombre = (await ask('Tu nombre')).slice(0, 80);
    const first = esc(lead.nombre.split(' ')[0]);
    await say('Un gusto, ' + first + '. ¿Me dejás un mail o un teléfono para que te contactemos?');
    input.dataset.check = 'contact';
    lead.contacto = (await ask('Mail o teléfono')).slice(0, 120);
    input.dataset.check = '';
    await say('¿Querés contarnos algo más sobre tu consulta?');
    const more = await options([['Sí, quiero contar algo', 'si'], ['No, así está bien', 'no']]);
    if (more === 'si') { await say('Te leo 🙂'); lead.mensaje = (await ask('Tu mensaje')).slice(0, 600); }
    await say('Perfecto, ya le paso tu consulta al equipo comercial…', 700);
    /* Se intenta guardar en Netlify Forms; el mensaje al usuario es el mismo en los dos casos */
    try { await send(); } catch (err) { /* sin conexión con Netlify Forms */ }
    await say('¡Listo, ' + first + '! 🎉 En breve te va a estar llegando un mensaje del equipo comercial de Delta a <strong>' + esc(lead.contacto) + '</strong>.', 900);
    await say('¡Gracias por escribirnos!', 500);
  }

  function open() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    wrap.classList.add('is-open');
    if (!started) chat();
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
  document.addEventListener('click', (e) => { if (!panel.hidden && !wrap.contains(e.target) && document.contains(e.target)) close(false); });
  void goContact;
}

/* ---------- Caso Farriplast: glosario, gráficos interactivos y encabezado por etapa ----------
   Todo se arma sobre el HTML que ya existe: si este script no corre, la
   página se lee igual (los gráficos quedan con sus valores fijos). */
function initCaseExtras() {
  if (!document.querySelector('.case-body')) { initCountUp(); return; }
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
  initRoadmap();
  initFlips();
  initPmx();
  initPmap();
  initTryscore();
  initRiskFlips();
  initDash();
  initDraftCursor();
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
    /* La etapa se muestra en la barra fija (case-stage); la franja ya no se agrega. */
  });
}

/* Glosario: la primera vez que aparece un término en cada sección queda
   subrayado y, al pasar el mouse o tocarlo, explica qué significa. */
const GLOSSARY = [
  ['ISO 9001', 'ISO 9001', 'Norma internacional de gestión de la calidad. Propone ordenar los procesos de una empresa en tres grupos: estratégicos (los que marcan el rumbo), operativos (los que generan lo que se vende) y de apoyo (los que sostienen a los demás).'],
  ['arquitectura empresarial', 'Arquitectura empresarial', 'El mapa de cómo funciona la empresa por dentro: sus procesos, su información, sus herramientas y sus equipos.'],
  ['relevamiento', 'Relevamiento', 'La etapa en la que entrevistamos y observamos para entender cómo se trabaja hoy.'],
  ['scrap', 'Scrap', 'Descartes y sobrantes de plástico que dejan las fábricas y se pueden volver a usar.'],
  ['fasón', 'Fasón', 'Servicio en el que Farriplast procesa el material de un cliente y se lo devuelve. Cobra solo el trabajo.'],
  ['agrum(?:ado|ar|a)', 'Agrumado', 'Compactar el plástico blando, como el film, en grumos para poder procesarlo.'],
  ['extru(?:sión|ye)', 'Extrusión', 'Fundir el plástico y pasarlo por un molde para obtener un material uniforme.'],
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
  ['Must Have', 'Must Have', 'Imprescindible: sin esto el sistema no sirve. Va en la primera etapa.'],
  ['Should Have', 'Should Have', 'Importante: suma mucho valor, pero no frena la operación diaria si llega después.'],
  ['Could Have', 'Could Have', 'Deseable: aporta, pero puede esperar si hace falta priorizar.'],
  ['MoSCoW', 'MoSCoW', 'Método para priorizar: lo imprescindible (Must), lo importante (Should), lo deseable (Could) y lo que queda para más adelante (Won\'t).'],
  ['acuerdo de nivel de servicio', 'Acuerdo de nivel de servicio', 'El compromiso por escrito del proveedor sobre disponibilidad y tiempos de respuesta (en inglés, SLA).'],
  ['IA generativa', 'IA generativa', 'Inteligencia artificial que crea contenido nuevo, como un texto, a partir de lo que se le pide.'],
  ['Machine learning', 'Machine learning', 'Técnica que aprende de datos históricos para predecir, por ejemplo, qué entregas se van a demorar.'],
  ['prototipo', 'Prototipo', 'Una versión de prueba, con datos de ejemplo, para mostrar cómo funcionaría la solución.'],
  ['cuello de botella', 'Cuello de botella', 'La máquina con más trabajo acumulado: la que frena al resto.'],
  ['API', 'API', 'Una conexión para que dos sistemas se pasen datos de forma automática.'],
  ['piloto', 'Piloto', 'Usar la solución un tiempo con datos reales antes de decidir si se adopta.']
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
  const aspx = document.querySelector('[data-aspx]');
  if (!box && !aspx) return;
  const data = [
    { name: 'Proveedor', w: 20, cats: [
      ['Implementación y capacitación', 40, [['Implementación por fases', 50], ['Capacitación en el puesto', 50]]],
      ['Soporte y validación previa', 35, [['Demostración previa y período de prueba', 40], ['Soporte remoto por WhatsApp', 40], ['Tiempos de respuesta del soporte', 20]]],
      ['Trayectoria y adecuación al cliente', 25, [['Presencia y trayectoria en Argentina', 30], ['Implementaciones en el rubro', 40], ['Experiencia con empresas de tamaño similar', 30]]]] },
    { name: 'Funcional', w: 35, cats: [
      ['Núcleo operativo · fase 1', 45, [['Compras y recepción', 15], ['Stock y trazabilidad por lote', 25], ['Ventas, remitos y entregas', 15], ['Facturación electrónica y cumplimiento fiscal', 10], ['Cuentas corrientes y cobranzas', 20], ['Reporte al cliente de fasón', 15]]],
      ['Producción y control del servicio · fase 2', 30, [['Producción por etapa', 25], ['Costos y rentabilidad', 35], ['Entregas y rechazos', 20], ['Gastos generales y cierre mensual', 15], ['Registro de mermas', 5]]],
      ['Análisis y trazabilidad · fases 3 y 4', 25, [['Tablero de indicadores', 35], ['Identificación de lotes', 20], ['Balanza conectada', 20], ['Conciliación bancaria', 25]]]] },
    { name: 'Técnico', w: 25, cats: [
      ['Usabilidad y acceso', 45, [['Facilidad de uso y curva de aprendizaje', 45], ['Uso desde celular y computadora', 20], ['Perfiles de acceso', 35]]],
      ['Infraestructura y continuidad', 30, [['Operación en la nube', 20], ['Resguardo automático', 40], ['Tolerancia a conectividad limitada', 40]]],
      ['Datos e integración', 25, [['Portabilidad de los datos', 55], ['Exportación a Excel', 45]]]] },
    { name: 'Económico', w: 20, cats: [
      ['Costo inicial', 40, [['Implementación y puesta en marcha', 60], ['Capacitación', 20], ['Equipos a comprar', 20]]],
      ['Costo recurrente', 60, [['Cuota mensual de la fase 1', 50], ['Variación de la cuota por fase', 35], ['Mantenimiento y soporte no incluidos', 15]]]] }
  ];
  if (aspx) { initAspx(aspx, data); return; }
  const detail = box.querySelector('.weights__detail');
  const segs = Array.from(box.querySelectorAll('.weights__seg'));
  const render = (i) => {
    const a = data[i];
    segs.forEach((s, k) => { s.setAttribute('aria-selected', String(k === i)); s.tabIndex = k === i ? 0 : -1; });
    box.querySelectorAll('.weights__slice').forEach((c, k) => c.classList.toggle('is-on', k === i));
    detail.dataset.aspect = String(i + 1);
    const n = a.cats.reduce((t, c) => t + c[2].length, 0);
    detail.innerHTML =
      '<p class="weights__title"><strong>' + a.name + '</strong> vale ' + a.w + ' de los 100 puntos · ' + a.cats.length + ' categorías y ' + n + ' requisitos</p>' +
      '<div class="weights__cats">' + a.cats.map(([cn, cp, items]) =>
        '<div class="weights__cat"><span class="weights__cat-name">' + cn + '</span>' +
        '<span class="weights__cat-track"><span class="weights__cat-fill" style="--p:' + cp + '%"></span></span>' +
        '<span class="weights__cat-val">' + cp + '% · ' + fmt1(a.w * cp / 100) + ' pts</span>' +
        '<ul class="weights__items">' + items.map(([iname, ip]) =>
          '<li><span>' + iname + '</span><b>' + fmt1(a.w * cp * ip / 10000) + ' pts</b></li>').join('') + '</ul></div>').join('') +
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
    ['Fase 1 · Meses 1 a 6', 'Núcleo operativo', ['Stock, compras, ventas y remitos', 'Cuentas corrientes y cobranzas', 'Facturación electrónica', 'Control mensual del stock de fasón'],
      [['Quién lo usa', 'Mariano y Samuel'], ['Arranque', 'Mariano carga los saldos iniciales de stock, cuentas corrientes y cheques'], ['Qué ve Samuel', 'Stock y movimientos en cantidades, sin precios ni saldos'], ['Turno noche', 'Se anota en la pizarra y Samuel lo carga al día siguiente. Si no está, lo hace Mariano'], ['Cuaderno', 'Sigue en paralelo hasta que coincida el primer cierre mensual, como máximo 3 meses'], ['Se compra', 'Una computadora o tablet y un teléfono para el sistema']]],
    ['Fase 2 · Meses 7 a 12', 'Producción y costos', ['Producción por etapa', 'Costo y margen por kilo', 'Entregas y rechazos', 'Gastos generales y reporte de fin de mes'],
      [['Quién lo usa', 'Mariano y Samuel'], ['Para qué sirve', 'Medir la meta de reputación y decidir sobre el galpón, ambas a 12 meses']]],
    ['Fase 3 · Meses 13 a 18', 'Análisis y trazabilidad', ['Tablero de indicadores', 'Reporte de fasón para todos los clientes', 'QR por lote y balanza conectada', 'Conciliación bancaria'],
      [['Se compra', 'Una balanza que se conecta al sistema: la actual no admite conexión ni impresión'], ['Para qué sirve', 'Seguir la meta de retención y satisfacción de clientes, a 18 meses'], ['Equipo', 'Samuel capacita al resto de los operarios para cargar información']]],
    ['Fase 4 · Meses 19 a 24', 'Consolidación', ['Consolidar el uso del sistema', 'Seguimiento de las metas', 'Evaluar el costo de la solución', 'Evaluar que carguen más operarios'],
      [['Para qué sirve', 'Seguir la meta de crecer 20% en volumen, con la información ya consolidada']]]
  ];
  const rows = Array.from(box.querySelectorAll('.gantt__row'));
  const detail = box.querySelector('.gantt__detail');
  const render = (i) => {
    rows.forEach((r, k) => { r.setAttribute('aria-pressed', String(k === i)); r.classList.toggle('is-on', k === i); });
    const [when, name, items, how] = phases[i];
    detail.dataset.phase = String(i + 1);
    detail.innerHTML = '<p class="gantt__detail-when">' + when + '</p><p class="gantt__detail-name">' + name + '</p>' +
      '<div class="gantt__cols"><div><span class="gantt__h">Qué incluye</span><ul>' + items.map((it) => '<li>' + it + '</li>').join('') + '</ul></div>' +
      '<div><span class="gantt__h">Cómo se trabaja</span><dl class="gantt__how">' + how.map(([k, v]) => '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>').join('') + '</dl></div></div>';
  };
  rows.forEach((r, i) => { r.addEventListener('click', () => render(i)); r.addEventListener('mouseenter', () => render(i)); r.addEventListener('focus', () => render(i)); });
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
    const el = e.target, end = Number(el.dataset.count), suf = el.dataset.suffix || '';
    const dec = Number(el.dataset.decimals || 0);
    const show = (v) => (dec ? v.toFixed(dec).replace('.', ',') : ('thousands' in el.dataset ? Math.round(v).toLocaleString('es-AR') : String(Math.round(v)))) + suf;
    const from = end > 1000 && !('thousands' in el.dataset) ? end - 30 : 0;
    if (!e.isIntersecting) { el.textContent = show(from); return; }
    const t0 = performance.now(), dur = 1100;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), v = from + (end - from) * (1 - Math.pow(1 - p, 3));
      el.textContent = show(v);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

/* Objetivos: un punto recorre la línea de Hoy a 24 meses y cada meta
   aparece cuando el punto llega a su fecha. */
function initRoadmap() {
  const box = document.querySelector('.roadmap');
  if (!box) return;
  const line = box.querySelector('.roadmap__line');
  const fill = box.querySelector('.roadmap__fill');
  const runner = box.querySelector('.roadmap__runner');
  const stops = Array.from(box.querySelectorAll('.roadmap__stop'));
  const replay = box.querySelector('.roadmap__replay');
  box.classList.add('is-js');
  let raf = null;
  const run = () => {
    cancelAnimationFrame(raf);
    const vertical = getComputedStyle(line).width === '4px';
    const lr = line.getBoundingClientRect();
    const len = vertical ? lr.height : lr.width;
    const marks = stops.map((st) => {
      const d = st.querySelector('.roadmap__dot').getBoundingClientRect();
      return vertical ? d.top + d.height / 2 - lr.top : d.left + d.width / 2 - lr.left;
    });
    stops.forEach((st) => st.classList.remove('is-reached'));
    const dur = 5200, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const pos = e * len;
      if (vertical) { runner.style.transform = 'translate(-50%, ' + pos + 'px)'; fill.style.transform = 'scaleY(' + e + ')'; }
      else { runner.style.transform = 'translate(' + pos + 'px, -50%)'; fill.style.transform = 'scaleX(' + e + ')'; }
      marks.forEach((m, i) => { if (pos >= m - 4) stops[i].classList.add('is-reached'); });
      if (p < 1) raf = requestAnimationFrame(step);
      else box.classList.add('is-done');
    };
    box.classList.remove('is-done');
    raf = requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    /* Se repite cada vez que la línea vuelve a la pantalla */
    const reset = () => {
      cancelAnimationFrame(raf);
      stops.forEach((st) => st.classList.remove('is-reached'));
      box.classList.remove('is-done');
      runner.style.transform = '';
      fill.style.transform = '';
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) run(); else reset(); }), { threshold: 0.35 });
    io.observe(box);
  } else run();
  if (replay) replay.addEventListener('click', run);
}

/* Frentes: tarjetas que se dan vuelta entre Hoy y Con la propuesta.
   Al aparecer la sección se dan vuelta solas, una tras otra. */
function initFlips() {
  const box = document.querySelector('[data-fronts]');
  if (!box) return;
  const cards = Array.from(box.querySelectorAll('.flip'));
  const toggle = box.previousElementSibling;
  const setCard = (c, on) => { c.classList.toggle('is-new', on); c.setAttribute('aria-pressed', String(on)); };
  const syncToggle = () => {
    const allNew = cards.every((c) => c.classList.contains('is-new'));
    const allNow = cards.every((c) => !c.classList.contains('is-new'));
    toggle.querySelectorAll('.chart-toggle__btn').forEach((b) => {
      const on = (b.dataset.flip === 'new' && allNew) || (b.dataset.flip === 'now' && allNow);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  };
  cards.forEach((c) => c.addEventListener('click', () => { setCard(c, !c.classList.contains('is-new')); syncToggle(); }));
  toggle.addEventListener('click', (e) => {
    const b = e.target.closest('[data-flip]');
    if (!b) return;
    cards.forEach((c, i) => setTimeout(() => setCard(c, b.dataset.flip === 'new'), i * 90));
    setTimeout(syncToggle, cards.length * 90 + 50);
  });
  if ('IntersectionObserver' in window) {
    /* Cada vez que vuelven a la pantalla arrancan en Hoy y se dan vuelta */
    let timers = [];
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      clear();
      if (!e.isIntersecting) { cards.forEach((c) => setCard(c, false)); syncToggle(); return; }
      timers.push(setTimeout(() => {
        cards.forEach((c, i) => timers.push(setTimeout(() => setCard(c, true), i * 260)));
        timers.push(setTimeout(syncToggle, cards.length * 260 + 50));
      }, 900));
    }), { threshold: 0.3 });
    io.observe(box);
  }
}

/* Matrices de 3 x 3 (riesgos y partes interesadas): al tocar un nombre se ve su detalle */
function initPmx() {
  document.querySelectorAll('[data-pmx]').forEach((box) => {
    const chips = Array.from(box.querySelectorAll('.pmx__chip'));
    const detail = box.querySelector('.pmx__detail');
    const show = (c) => {
      chips.forEach((x) => { const on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      detail.innerHTML =
        '<span class="pmx__tag">' + c.dataset.tag + '</span>' +
        '<p class="pmx__name">' + c.textContent + '</p>' +
        '<div class="pmx__cols"><div><span>' + detail.dataset.l1 + '</span><p>' + c.dataset.t1 + '</p></div>' +
        '<div><span>' + detail.dataset.l2 + '</span><p>' + c.dataset.t2 + '</p></div></div>';
    };
    chips.forEach((c) => c.addEventListener('click', () => show(c)));
    if (chips[0]) show(chips[0]);
  });
}

/* Qué se mira en cada aspecto: categorías y requisitos del aspecto elegido */
function initAspx(box, data) {
  const what = [
    'Si el proveedor acompaña: demostración, soporte, capacitación e implementación por fases.',
    'Si el sistema cubre lo que Farriplast necesita, fase por fase.',
    'Si es fácil de usar y funciona en la nube, desde el celular y con perfiles de acceso.',
    'Cuánto cuesta a tres años: la puesta en marcha y la cuota.'
  ];
  /* Puntos de cada categoría, redondeados para que sumen el peso del aspecto */
  const cells = [[8, 7, 5], [16, 10, 9], [11, 8, 6], [8, 12]];
  const segs = Array.from(box.querySelectorAll('.aspx__seg'));
  const detail = box.querySelector('.aspx__detail');
  const waffle = box.querySelector('.aspx__waffle');
  let html = '', n = 0;
  cells.forEach((cats, ai) => cats.forEach((c, ci) => {
    for (let k = 0; k < c; k++) html += '<i class="a' + (ai + 1) + '" data-a="' + ai + '" data-c="' + ci + '" style="--n:' + (n++) + '"></i>';
  }));
  waffle.innerHTML = html;
  const squares = Array.from(waffle.children);
  const light = (ai, ci) => squares.forEach((q) => {
    const inA = Number(q.dataset.a) === ai;
    q.classList.toggle('is-off', !inA);
    q.classList.toggle('is-dim', inA && ci !== undefined && Number(q.dataset.c) !== ci);
  });
  const render = (i) => {
    const a = data[i];
    segs.forEach((s, k) => { s.setAttribute('aria-selected', String(k === i)); s.classList.toggle('is-on', k === i); });
    detail.dataset.a = String(i + 1);
    light(i);
    detail.innerHTML =
      '<div class="aspx__top"><span class="aspx__big">' + a.w + '<small>de 100 puntos</small></span><div><strong>' + a.name + '</strong><p>' + what[i] + '</p></div></div>' +
      '<div class="aspx__cats">' + a.cats.map(([cn, cp, items], k) =>
        '<div class="aspx__cat" data-c="' + k + '" style="--i:' + k + ';--p:' + cp + '"><div class="aspx__cathead"><b>' + fmt1(a.w * cp / 100) + '<small> pts</small></b><span>' + cn + '</span></div>' +
        '<ul class="aspx__reqs">' + items.map(([nm, ip]) => '<li><span>' + nm + '</span><b>' + fmt1(a.w * cp * ip / 10000) + '</b></li>').join('') + '</ul></div>').join('') + '</div>' +
      '<p class="aspx__legend">Los números de cada requisito son los puntos que vale en la nota final, sobre 100.</p>';
    detail.querySelectorAll('.aspx__cat').forEach((c) => {
      c.addEventListener('mouseenter', () => light(i, Number(c.dataset.c)));
      c.addEventListener('mouseleave', () => light(i));
    });
  };
  segs.forEach((s, i) => s.addEventListener('click', () => render(i)));
  squares.forEach((q) => q.addEventListener('click', () => render(Number(q.dataset.a))));
  render(1);
}

/* Mapa de procesos: al tocar un proceso se lee de qué se trata */
function initPmap() {
  const box = document.querySelector('[data-pmap]');
  if (!box) return;
  const btns = Array.from(box.querySelectorAll('.pmap__p'));
  const detail = box.querySelector('.pmap__detail');
  const show = (b) => {
    btns.forEach((x) => x.classList.toggle('is-on', x.textContent === b.textContent));
    const band = b.closest('.pmap__band');
    const group = band ? band.querySelector('.pmap__label').firstChild.textContent : '';
    detail.classList.remove('is-in'); void detail.offsetWidth; detail.classList.add('is-in');
    detail.innerHTML = '<span class="pmap__group">' + ({ 'Estratégicos': 'Proceso estratégico', 'Operativos': 'Proceso operativo', 'Apoyo': 'Proceso de apoyo' }[group.trim()] || '') + '</span><strong>' + b.textContent + '</strong><p>' + b.dataset.desc + '</p><i class="pmap__timer"></i>';
  };
  /* Recorrido automático por los procesos mientras el mapa está a la vista */
  let idx = 2, timer = null, paused = false, resume = null;
  const next = () => { if (paused) return; idx = (idx + 1) % btns.length; show(btns[idx]); };
  const start = () => { clearInterval(timer); timer = setInterval(next, 3200); };
  const stop = () => clearInterval(timer);
  const pause = (b) => {
    paused = true; idx = btns.indexOf(b); show(b);
    clearTimeout(resume); resume = setTimeout(() => { paused = false; }, 9000);
  };
  btns.forEach((b) => { b.addEventListener('click', () => pause(b)); b.addEventListener('mouseenter', () => pause(b)); });
  show(btns[idx]);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : stop())), { threshold: 0.3 }).observe(box);
  }
}

/* Cómo se puntúa: el ejemplo cambia según la calificación elegida */
function initTryscore() {
  const box = document.querySelector('[data-tryscore]');
  if (!box) return;
  const btns = Array.from(box.querySelectorAll('[data-v]'));
  const arc = box.querySelector('.tryscore__arc');
  const val = box.querySelector('.tryscore__val b');
  const txt = box.querySelector('.tryscore__txt');
  const msg = { 100: 'Se lleva todos sus puntos.', 50: 'Se lleva la mitad de sus puntos.', 25: 'Se lleva un cuarto de sus puntos.', 0: 'No suma puntos.' };
  const set = (b) => {
    const v = Number(b.dataset.v);
    btns.forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    arc.setAttribute('stroke-dasharray', v + ' ' + (100 - v));
    arc.style.stroke = v >= 100 ? '#0B3B8C' : v >= 50 ? '#1565C0' : v > 0 ? '#2F86D8' : 'transparent';
    val.textContent = { 100: '3,9', 50: '1,95', 25: '0,98', 0: '0' }[v];
    txt.textContent = msg[v];
  };
  btns.forEach((b) => b.addEventListener('click', () => set(b)));
  set(btns.find((b) => b.getAttribute('aria-pressed') === 'true') || btns[0]);
}

/* Riesgos: las tarjetas se dan vuelta solas, una tras otra, y también al tocarlas */
function initRiskFlips() {
  const box = document.querySelector('[data-rflips]');
  if (!box) return;
  const cards = Array.from(box.querySelectorAll('.rflip'));
  const set = (c, on) => { c.classList.toggle('is-new', on); c.setAttribute('aria-pressed', String(on)); };
  cards.forEach((c) => c.addEventListener('click', () => set(c, !c.classList.contains('is-new'))));
  let timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => {
      clear();
      if (!e.isIntersecting) { cards.forEach((c) => set(c, false)); return; }
      cards.forEach((c, i) => timers.push(setTimeout(() => set(c, true), 1400 + i * 700)));
    }), { threshold: 0.35 }).observe(box);
  }
}

/* Tablero del retorno: la línea de tiempo enciende los indicadores que ya se pueden medir */
function initDash() {
  const box = document.querySelector('[data-dash]');
  if (!box) return;
  const btns = Array.from(box.querySelectorAll('[data-m]'));
  const tiles = Array.from(box.querySelectorAll('.dash__tile'));
  const fill = box.querySelector('.dash__fill');
  let idx = 0, timer = null, user = false;
  const set = (i) => {
    idx = i;
    const m = Number(btns[i].dataset.m);
    btns.forEach((b, k) => b.classList.toggle('is-on', k === i));
    fill.style.width = (i / (btns.length - 1) * 100) + '%';
    tiles.forEach((t) => t.classList.toggle('is-live', Number(t.dataset.from) <= m));
  };
  btns.forEach((b, i) => b.addEventListener('click', () => { user = true; clearInterval(timer); set(i); }));
  set(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => {
      clearInterval(timer);
      if (!e.isIntersecting) { if (!user) set(0); return; }
      if (user) return;
      timer = setInterval(() => set((idx + 1) % btns.length), 2200);
    }), { threshold: 0.3 }).observe(box);
  }
}

/* Borrador del aviso: el cursor va de la casilla al botón. Las posiciones
   se calculan sobre el diseño real para que caiga justo encima. */
function initDraftCursor() {
  document.querySelectorAll('.draft').forEach((d) => {
    const box = d.querySelector('.draft__box'), btn = d.querySelector('.draft__btn');
    if (!box || !btn) return;
    const place = () => {
      const r = d.getBoundingClientRect();
      const at = (el) => { const e = el.getBoundingClientRect(); return [e.left - r.left + e.width / 2 - 6, e.top - r.top + e.height / 2 - 4]; };
      const [cx, cy] = at(box), [bx, by] = at(btn);
      d.style.setProperty('--cx', cx + 'px'); d.style.setProperty('--cy', cy + 'px');
      d.style.setProperty('--bx', bx + 'px'); d.style.setProperty('--by', by + 'px');
      d.style.setProperty('--sx', (r.width - 40) + 'px'); d.style.setProperty('--sy', (cy + 60) + 'px');
    };
    place();
    window.addEventListener('resize', place);
    new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) place(); })).observe(d);
  });
}
