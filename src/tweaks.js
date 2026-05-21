/* ============================================================
   THOMAS LI — Portfolio · Tweaks Panel
   Vanilla JS — implements the host's edit-mode protocol so the
   tweak surface only appears when the design toolbar requests it.
   ============================================================ */

(function () {
  'use strict';

  /* ----- Defaults (rewritten on disk by the host) ----- */
  const defaults = (window.__TWEAK_DEFAULTS__ || {});
  const state = Object.assign(
    {
      accent: 'walnut',
      surface: 'cream',
      density: 'regular',
      heroAlign: 'center',
      heroVariant: 'name',
      grain: true,
    },
    defaults
  );

  /* ----- Tweak schema ----- */
  const SCHEMA = [
    {
      key: 'accent',
      label: 'Accent',
      kind: 'swatch',
      options: [
        { value: 'walnut', color: '#8B7355' },
        { value: 'clay',   color: '#B08968' },
        { value: 'sage',   color: '#5C7A6E' },
        { value: 'ink',    color: '#2C2C2C' },
      ],
    },
    {
      key: 'surface',
      label: 'Surface',
      kind: 'radio',
      options: [
        { value: 'cream', label: 'Cream' },
        { value: 'paper', label: 'Paper' },
        { value: 'stone', label: 'Stone' },
      ],
    },
    {
      key: 'density',
      label: 'Density',
      kind: 'radio',
      options: [
        { value: 'cozy',    label: 'Cozy' },
        { value: 'regular', label: 'Regular' },
        { value: 'airy',    label: 'Airy' },
      ],
    },
    {
      key: 'heroAlign',
      label: 'Hero alignment',
      kind: 'radio',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left',   label: 'Left' },
      ],
    },
    {
      key: 'heroVariant',
      label: 'Hero focal point',
      kind: 'radio',
      options: [
        { value: 'name',    label: 'Name' },
        { value: 'tagline', label: 'Tagline' },
      ],
    },
    {
      key: 'grain',
      label: 'Paper grain',
      kind: 'toggle',
    },
  ];

  /* ----- Apply state to the DOM ----- */
  function apply() {
    const body = document.body;
    body.dataset.accent   = state.accent;
    body.dataset.surface  = state.surface;
    body.dataset.density  = state.density;
    body.dataset.grain    = state.grain ? 'on' : 'off';

    const hero = document.querySelector('.hero');
    if (hero) {
      hero.dataset.align   = state.heroAlign;
      hero.dataset.variant = state.heroVariant;
    }
  }
  apply();

  /* ----- Persist (host writes to disk) ----- */
  function persist(partial) {
    try {
      window.parent.postMessage(
        { type: '__edit_mode_set_keys', edits: partial },
        '*'
      );
    } catch (_) { /* sandbox without parent */ }
  }

  function setTweak(key, value) {
    state[key] = value;
    apply();
    render();
    persist({ [key]: value });
  }

  /* ----- Render the panel ----- */
  let panel = null;

  function render() {
    if (!panel) return;
    const body = panel.querySelector('.tweaks__body');
    body.innerHTML = '';

    SCHEMA.forEach((field) => {
      const section = document.createElement('section');
      section.className = 'tweak-section';

      const label = document.createElement('p');
      label.className = 'tweak-section__label';
      label.textContent = field.label;
      section.appendChild(label);

      if (field.kind === 'radio') {
        const group = document.createElement('div');
        group.className = 'tweak-radio';
        group.setAttribute('role', 'radiogroup');
        group.setAttribute('aria-label', field.label);

        field.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'tweak-radio__btn';
          btn.textContent = opt.label;
          btn.setAttribute('role', 'radio');
          btn.setAttribute('aria-checked', String(state[field.key] === opt.value));
          if (state[field.key] === opt.value) btn.classList.add('is-active');
          btn.addEventListener('click', () => setTweak(field.key, opt.value));
          group.appendChild(btn);
        });

        section.appendChild(group);
      }

      else if (field.kind === 'swatch') {
        const group = document.createElement('div');
        group.className = 'tweak-swatches';
        group.setAttribute('role', 'radiogroup');
        group.setAttribute('aria-label', field.label);

        field.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'tweak-swatch';
          btn.setAttribute('role', 'radio');
          btn.setAttribute('aria-checked', String(state[field.key] === opt.value));
          btn.setAttribute('aria-label', opt.value);
          btn.title = opt.value;
          if (state[field.key] === opt.value) btn.classList.add('is-active');

          const dot = document.createElement('span');
          dot.className = 'tweak-swatch__dot';
          dot.style.background = opt.color;
          btn.appendChild(dot);

          btn.addEventListener('click', () => setTweak(field.key, opt.value));
          group.appendChild(btn);
        });

        section.appendChild(group);
      }

      else if (field.kind === 'toggle') {
        const wrap = document.createElement('label');
        wrap.className = 'tweak-toggle' + (state[field.key] ? ' is-on' : '');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!state[field.key];
        input.addEventListener('change', () => setTweak(field.key, input.checked));
        wrap.appendChild(input);

        const track = document.createElement('span');
        track.className = 'tweak-toggle__track';
        const thumb = document.createElement('span');
        thumb.className = 'tweak-toggle__thumb';
        track.appendChild(thumb);
        wrap.appendChild(track);

        const text = document.createElement('span');
        text.textContent = state[field.key] ? 'On' : 'Off';
        wrap.appendChild(text);

        section.appendChild(wrap);
      }

      body.appendChild(section);
    });
  }

  function build() {
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.id = 'tweaksPanel';
    panel.className = 'tweaks';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Design tweaks');

    panel.innerHTML = [
      '<header class="tweaks__head" id="tweaksHead">',
      '  <span class="tweaks__title">Tweaks</span>',
      '  <button class="tweaks__close" id="tweaksClose" aria-label="Close tweaks">&times;</button>',
      '</header>',
      '<div class="tweaks__body"></div>'
    ].join('');

    document.body.appendChild(panel);

    panel.querySelector('#tweaksClose').addEventListener('click', () => {
      hide();
      try {
        window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
      } catch (_) {}
    });

    // Drag support
    enableDrag(panel.querySelector('#tweaksHead'), panel);
    render();
    return panel;
  }

  function enableDrag(handle, target) {
    let startX = 0, startY = 0, originLeft = 0, originTop = 0, dragging = false;
    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tweaks__close')) return;
      dragging = true;
      const rect = target.getBoundingClientRect();
      originLeft = rect.left;
      originTop  = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      target.style.left   = rect.left + 'px';
      target.style.top    = rect.top + 'px';
      target.style.right  = 'auto';
      target.style.bottom = 'auto';
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const w = target.offsetWidth;
      const h = target.offsetHeight;
      const left = Math.max(8, Math.min(window.innerWidth  - w - 8, originLeft + dx));
      const top  = Math.max(8, Math.min(window.innerHeight - h - 8, originTop  + dy));
      target.style.left = left + 'px';
      target.style.top  = top + 'px';
    });
    handle.addEventListener('pointerup',   () => { dragging = false; });
    handle.addEventListener('pointercancel', () => { dragging = false; });
  }

  function show() { build().hidden = false; }
  function hide() { if (panel) panel.hidden = true; }

  /* ----- Host protocol: register listener FIRST, then announce ----- */
  window.addEventListener('message', (event) => {
    const data = event && event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === '__activate_edit_mode')   show();
    if (data.type === '__deactivate_edit_mode') hide();
  });

  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (_) {}
})();
