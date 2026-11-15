/* ========================================
   Admin Panel JS
   ======================================== */

(function () {
  'use strict';

  let content = null;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  // ── Init ──
  async function init() {
    try {
      const res = await fetch('data/content.json');
      content = await res.json();
    } catch {
      content = getDefaultContent();
    }
    setupTabs();
    setupActions();
    renderAll();
    toast('Contenuti caricati');
  }

  function getDefaultContent() {
    return {
      site: { title: 'Maurice Bellanova | R A G A Z Z A C L A N', description: { it: '', en: '' }, defaultLang: 'it', backgroundVideo: '', socialLinks: { bandcamp: '', soundcloud: '', instagram: '', email: '' } },
      nav: { it: { home: 'Home', residencies: 'Residenze', sculptures: 'Sculture', music: 'Musica', about: 'Info' }, en: { home: 'Home', residencies: 'Residencies', sculptures: 'Sculptures', music: 'Music', about: 'About' } },
      hero: { title: 'Maurice Bellanova', subtitle: 'R A G A Z Z A C L A N', tagline: { it: '', en: '' } },
      theme: { colors: { bg: '#0a0a0a', bgCard: '#141414', text: '#ede8e0', textMuted: '#8a8580', accent: '#c9a84c' }, fontBody: 'Source Sans 3', fontDisplay: 'Cormorant Garamond' },
      shortcuts: { residencies: '', sculptures: '', music: '' },
      residencies: { headerImage: '', sectionTitle: { it: 'Residenze Artistiche', en: 'Artistic Residencies' }, sectionDescription: { it: '', en: '' }, items: [] },
      sculptures: { sectionTitle: { it: 'Sculture', en: 'Sculptures' }, sectionDescription: { it: '', en: '' }, items: [] },
      music: { sectionTitle: { it: 'Musica', en: 'Music' }, sectionDescription: { it: '', en: '' }, albums: [] },
      backgroundMusic: { enabled: true, autoplay: false, volume: 0.3, tracks: [] },
      about: { sectionTitle: { it: 'Info', en: 'About' }, bio: { it: '', en: '' }, photo: '', contact: { email: '', instagram: '', website: '' } }
    };
  }

  // ── Tabs ──
  function setupTabs() {
    $$('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        renderPanel(tab.dataset.tab);
      });
    });
  }

  // ── Actions ──
  function setupActions() {
    $('#btnPreview').addEventListener('click', () => window.open('index.html', '_blank'));

    $('#btnExport').addEventListener('click', () => {
      collectAll();
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'content.json';
      a.click();
      URL.revokeObjectURL(a.href);
      toast('content.json scaricato');
    });

    $('#btnImport').addEventListener('click', () => $('#fileImport').click());
    $('#fileImport').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          content = JSON.parse(ev.target.result);
          renderAll();
          toast('JSON importato');
        } catch { toast('Errore nel file JSON'); }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  // ── Render ──
  function renderAll() {
    renderPanel('general');
  }

  function renderPanel(name) {
    const main = $('#main');
    $$('.panel', main).forEach((p) => p.remove());
    const panel = document.createElement('div');
    panel.className = 'panel active';
    panel.id = 'panel-' + name;

    switch (name) {
      case 'general': panel.innerHTML = renderGeneral(); break;
      case 'style': panel.innerHTML = renderStylePanel(); break;
      case 'residencies': panel.innerHTML = renderResidencies(); break;
      case 'sculptures': panel.innerHTML = renderSculptures(); break;
      case 'music': panel.innerHTML = renderMusicPanel(); break;
      case 'about': panel.innerHTML = renderAbout(); break;
      case 'bgmusic': panel.innerHTML = renderBgMusic(); break;
      case 'github': panel.innerHTML = renderGitHub(); break;
    }

    main.appendChild(panel);
    bindPanel(name);
  }

  // ── General Panel ──
  function renderGeneral() {
    const s = content.site;
    const h = content.hero;
    return `
      <div class="panel__section">
        <h3 class="panel__section-title">Sito</h3>
        ${field('Titolo sito', 'site-title', s.title)}
        <div class="field__row">
          ${field('Descrizione (IT)', 'site-desc-it', s.description.it)}
          ${field('Descrizione (EN)', 'site-desc-en', s.description.en)}
        </div>
        ${field('Lingua default', 'site-lang', s.defaultLang, 'select', [{ v: 'it', l: 'Italiano' }, { v: 'en', l: 'English' }])}
        ${field('Video di sfondo (percorso)', 'site-bgvideo', s.backgroundVideo, 'text', null, 'Es: assets/videos/hero-bg.mp4')}
      </div>
      <div class="panel__section">
        <h3 class="panel__section-title">Hero</h3>
        ${field('Titolo', 'hero-title', h.title)}
        ${field('Sottotitolo', 'hero-subtitle', h.subtitle)}
        <div class="field__row">
          ${field('Tagline (IT)', 'hero-tagline-it', h.tagline.it)}
          ${field('Tagline (EN)', 'hero-tagline-en', h.tagline.en)}
        </div>
      </div>
      <div class="panel__section">
        <h3 class="panel__section-title">Immagini Shortcut (Home Page)</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.8rem">Foto di sfondo per le card nella home page.</p>
        ${field('Residenze', 'shortcut-residencies', (content.shortcuts || {}).residencies || '', 'text', null, 'Es: assets/images/cave-primitive/IMG_4624.jpg')}
        ${field('Sculture', 'shortcut-sculptures', (content.shortcuts || {}).sculptures || '', 'text', null, 'Es: assets/images/ragazzaclan/R0004767.jpg')}
        ${field('Musica', 'shortcut-music', (content.shortcuts || {}).music || '', 'text', null, 'Es: assets/images/ragazzaclan/DSC_0283.JPG')}
      </div>
      <div class="panel__section">
        <h3 class="panel__section-title">Link Social / Musica</h3>
        ${field('Bandcamp URL', 'social-bandcamp', s.socialLinks.bandcamp)}
        ${field('SoundCloud URL', 'social-soundcloud', s.socialLinks.soundcloud)}
        ${field('Instagram URL', 'social-instagram', s.socialLinks.instagram || '')}
        ${field('Email', 'social-email', s.socialLinks.email || '')}
      </div>`;
  }

  // ── Style Panel ──
  function renderStylePanel() {
    if (!content.theme) content.theme = { colors: { bg: '#0a0a0a', bgCard: '#141414', text: '#ede8e0', textMuted: '#8a8580', accent: '#c9a84c' }, fontBody: 'Source Sans 3', fontDisplay: 'Cormorant Garamond' };
    const th = content.theme;
    const c = th.colors || {};
    return `
      <div class="panel__section">
        <h3 class="panel__section-title">Colori</h3>
        <div class="field__row">
          <div class="field">
            <label class="field__label">Sfondo</label>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <input type="color" data-id="theme-bg" value="${esc(c.bg || '#0a0a0a')}" style="width:48px;height:36px;border:1px solid var(--border);border-radius:4px;background:none;cursor:pointer">
              <input class="field__input" data-id="theme-bg-hex" value="${esc(c.bg || '#0a0a0a')}" style="width:90px">
            </div>
          </div>
          <div class="field">
            <label class="field__label">Sfondo Card</label>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <input type="color" data-id="theme-bgcard" value="${esc(c.bgCard || '#141414')}" style="width:48px;height:36px;border:1px solid var(--border);border-radius:4px;background:none;cursor:pointer">
              <input class="field__input" data-id="theme-bgcard-hex" value="${esc(c.bgCard || '#141414')}" style="width:90px">
            </div>
          </div>
        </div>
        <div class="field__row">
          <div class="field">
            <label class="field__label">Testo</label>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <input type="color" data-id="theme-text" value="${esc(c.text || '#ede8e0')}" style="width:48px;height:36px;border:1px solid var(--border);border-radius:4px;background:none;cursor:pointer">
              <input class="field__input" data-id="theme-text-hex" value="${esc(c.text || '#ede8e0')}" style="width:90px">
            </div>
          </div>
          <div class="field">
            <label class="field__label">Testo Secondario</label>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <input type="color" data-id="theme-textmuted" value="${esc(c.textMuted || '#8a8580')}" style="width:48px;height:36px;border:1px solid var(--border);border-radius:4px;background:none;cursor:pointer">
              <input class="field__input" data-id="theme-textmuted-hex" value="${esc(c.textMuted || '#8a8580')}" style="width:90px">
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label">Accento</label>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <input type="color" data-id="theme-accent" value="${esc(c.accent || '#c9a84c')}" style="width:48px;height:36px;border:1px solid var(--border);border-radius:4px;background:none;cursor:pointer">
            <input class="field__input" data-id="theme-accent-hex" value="${esc(c.accent || '#c9a84c')}" style="width:90px">
          </div>
        </div>
      </div>
      <div class="panel__section">
        <h3 class="panel__section-title">Font</h3>
        ${field('Font Paragrafi (body)', 'theme-font-body', th.fontBody || 'Source Sans 3', 'text', null, 'Nome del font per paragrafi e testo')}
        ${field('Font Titoli (display)', 'theme-font-display', th.fontDisplay || 'Cormorant Garamond', 'text', null, 'Nome del font per titoli e intestazioni')}
      </div>
      <div class="panel__section">
        <h3 class="panel__section-title">Immagini Header Sezioni</h3>
        ${field('Residenze — sfondo header', 'res-header-img', content.residencies.headerImage || '', 'text', null, 'Es: assets/images/cave-primitive/IMG_4624.jpg')}
      </div>`;
  }

  // ── Residencies Panel ──
  function renderResidencies() {
    const d = content.residencies;
    let html = `
      <div class="panel__section">
        <h3 class="panel__section-title">Sezione Residenze</h3>
        <div class="field__row">
          ${field('Titolo sezione (IT)', 'res-sec-title-it', d.sectionTitle.it)}
          ${field('Titolo sezione (EN)', 'res-sec-title-en', d.sectionTitle.en)}
        </div>
        <div class="field__row">
          ${field('Descrizione (IT)', 'res-sec-desc-it', d.sectionDescription.it)}
          ${field('Descrizione (EN)', 'res-sec-desc-en', d.sectionDescription.en)}
        </div>
      </div>
      <div class="panel__sort-bar">
        <span class="panel__sort-label">Ordina per:</span>
        <button class="btn btn--sm btn--outline" data-action="sort-residencies" data-sort="date-desc">Data ↓</button>
        <button class="btn btn--sm btn--outline" data-action="sort-residencies" data-sort="date-asc">Data ↑</button>
        <button class="btn btn--sm btn--outline" data-action="sort-residencies" data-sort="location">Luogo</button>
      </div>`;

    d.items.forEach((item, i) => {
      html += renderResidencyCard(item, i, d.items.length);
    });

    html += `<button class="btn btn--add" data-action="add-residency">+ Aggiungi Residenza</button>`;
    return html;
  }

  function renderResidencyCard(item, index, total) {
    return `
      <div class="item-card item-card--collapsed" data-type="residency" data-index="${index}">
        <div class="item-card__header" data-action="toggle-card">
          <div class="item-card__left">
            <span class="item-card__index">${index + 1}</span>
            <span class="item-card__title">${esc(item.title.it || 'Nuova residenza')}</span>
            <span class="item-card__chevron">▸</span>
          </div>
          <div class="item-card__actions" onclick="event.stopPropagation()">
            ${index > 0 ? `<button class="btn btn--sm btn--outline" data-action="move-up-residency" data-index="${index}" title="Sposta su">↑</button>` : ''}
            ${index < total - 1 ? `<button class="btn btn--sm btn--outline" data-action="move-down-residency" data-index="${index}" title="Sposta giù">↓</button>` : ''}
            <button class="btn btn--sm btn--danger" data-action="delete-residency" data-index="${index}">Elimina</button>
          </div>
        </div>
        <div class="item-card__body">
          <div class="field__row">
            ${field('Titolo (IT)', 'res-' + index + '-title-it', item.title.it)}
            ${field('Titolo (EN)', 'res-' + index + '-title-en', item.title.en)}
          </div>
          <div class="field__row--3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
            ${field('Ruolo', 'res-' + index + '-role', item.role, 'select', [{ v: 'organizer', l: 'Organizzatore' }, { v: 'participant', l: 'Partecipante' }])}
            ${field('Data', 'res-' + index + '-date', item.date)}
            ${field('Luogo', 'res-' + index + '-location', item.location)}
          </div>
          <div class="field__row">
            ${field('Etichetta ruolo (IT)', 'res-' + index + '-rolelabel-it', item.roleLabel.it)}
            ${field('Etichetta ruolo (EN)', 'res-' + index + '-rolelabel-en', item.roleLabel.en)}
          </div>
          <div class="field__row">
            ${field('Descrizione (IT)', 'res-' + index + '-desc-it', item.description.it, 'textarea')}
            ${field('Descrizione (EN)', 'res-' + index + '-desc-en', item.description.en, 'textarea')}
          </div>
          ${field('Immagini (una per riga)', 'res-' + index + '-images', (item.images || []).join('\n'), 'textarea', null, 'Percorsi relativi: assets/images/nome.jpg')}
          ${field('Video (percorso)', 'res-' + index + '-video', item.video || '')}
        </div>
      </div>`;
  }

  // ── Sculptures Panel ──
  function renderSculptures() {
    const d = content.sculptures;
    let html = `
      <div class="panel__section">
        <h3 class="panel__section-title">Sezione Sculture</h3>
        <div class="field__row">
          ${field('Titolo sezione (IT)', 'scu-sec-title-it', d.sectionTitle.it)}
          ${field('Titolo sezione (EN)', 'scu-sec-title-en', d.sectionTitle.en)}
        </div>
        <div class="field__row">
          ${field('Descrizione (IT)', 'scu-sec-desc-it', d.sectionDescription.it)}
          ${field('Descrizione (EN)', 'scu-sec-desc-en', d.sectionDescription.en)}
        </div>
      </div>
      <div class="panel__sort-bar">
        <span class="panel__sort-label">Ordina per:</span>
        <button class="btn btn--sm btn--outline" data-action="sort-sculptures" data-sort="year-desc">Anno ↓</button>
        <button class="btn btn--sm btn--outline" data-action="sort-sculptures" data-sort="year-asc">Anno ↑</button>
        <button class="btn btn--sm btn--outline" data-action="sort-sculptures" data-sort="dim-desc">Dimensioni ↓</button>
        <button class="btn btn--sm btn--outline" data-action="sort-sculptures" data-sort="dim-asc">Dimensioni ↑</button>
      </div>`;

    const total = d.items.length;
    d.items.forEach((item, i) => {
      html += `
        <div class="item-card item-card--collapsed" data-type="sculpture" data-index="${i}">
          <div class="item-card__header" data-action="toggle-card">
            <div class="item-card__left">
              <span class="item-card__index">${i + 1}</span>
              <span class="item-card__title">${esc(item.title.it || 'Nuova scultura')}</span>
              <span class="item-card__chevron">▸</span>
            </div>
            <div class="item-card__actions" onclick="event.stopPropagation()">
              ${i > 0 ? `<button class="btn btn--sm btn--outline" data-action="move-up-sculpture" data-index="${i}" title="Sposta su">↑</button>` : ''}
              ${i < total - 1 ? `<button class="btn btn--sm btn--outline" data-action="move-down-sculpture" data-index="${i}" title="Sposta giù">↓</button>` : ''}
              <button class="btn btn--sm btn--danger" data-action="delete-sculpture" data-index="${i}">Elimina</button>
            </div>
          </div>
          <div class="item-card__body">
            <div class="field__row">
              ${field('Titolo (IT)', 'scu-' + i + '-title-it', item.title.it)}
              ${field('Titolo (EN)', 'scu-' + i + '-title-en', item.title.en)}
            </div>
            <div class="field__row--3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
              ${field('Anno', 'scu-' + i + '-year', item.year)}
              ${field('Dimensioni', 'scu-' + i + '-dimensions', item.dimensions || '')}
            </div>
            <div class="field__row">
              ${field('Materiali (IT)', 'scu-' + i + '-materials-it', item.materials ? item.materials.it : '')}
              ${field('Materiali (EN)', 'scu-' + i + '-materials-en', item.materials ? item.materials.en : '')}
            </div>
            <div class="field__row">
              ${field('Descrizione (IT)', 'scu-' + i + '-desc-it', item.description.it, 'textarea')}
              ${field('Descrizione (EN)', 'scu-' + i + '-desc-en', item.description.en, 'textarea')}
            </div>
            ${field('Immagini (una per riga)', 'scu-' + i + '-images', (item.images || []).join('\n'), 'textarea', null, 'Percorsi relativi: assets/images/scultura.jpg')}
            ${field('Video (percorso)', 'scu-' + i + '-video', item.video || '')}
          </div>
        </div>`;
    });

    html += `<button class="btn btn--add" data-action="add-sculpture">+ Aggiungi Scultura</button>`;
    return html;
  }

  // ── Music Panel ──
  function renderMusicPanel() {
    const d = content.music;
    let html = `
      <div class="panel__section">
        <h3 class="panel__section-title">Sezione Musica</h3>
        <div class="field__row">
          ${field('Titolo sezione (IT)', 'mus-sec-title-it', d.sectionTitle.it)}
          ${field('Titolo sezione (EN)', 'mus-sec-title-en', d.sectionTitle.en)}
        </div>
        <div class="field__row">
          ${field('Descrizione (IT)', 'mus-sec-desc-it', d.sectionDescription.it)}
          ${field('Descrizione (EN)', 'mus-sec-desc-en', d.sectionDescription.en)}
        </div>
      </div>
      <div class="panel__sort-bar">
        <span class="panel__sort-label">Ordina per:</span>
        <button class="btn btn--sm btn--outline" data-action="sort-albums" data-sort="year-desc">Anno ↓</button>
        <button class="btn btn--sm btn--outline" data-action="sort-albums" data-sort="year-asc">Anno ↑</button>
        <button class="btn btn--sm btn--outline" data-action="sort-albums" data-sort="type">Tipo</button>
        <button class="btn btn--sm btn--outline" data-action="sort-albums" data-sort="featured">Vetrina prima</button>
      </div>`;

    const total = d.albums.length;
    d.albums.forEach((album, i) => {
      const tracks = (album.tracks || []).map((tr, ti) =>
        `<div class="track-row">
          <input class="field__input" data-id="alb-${i}-track-${ti}-title" value="${esc(tr.title)}">
          <input class="field__input" data-id="alb-${i}-track-${ti}-dur" value="${esc(tr.duration)}" placeholder="3:45">
          <button class="btn btn--sm btn--danger" data-action="delete-track" data-album="${i}" data-track="${ti}">&times;</button>
        </div>`
      ).join('');

      const typeLabel = album.type === 'single' ? 'Single' : 'Album';
      html += `
        <div class="item-card item-card--collapsed" data-type="album" data-index="${i}">
          <div class="item-card__header" data-action="toggle-card">
            <div class="item-card__left">
              <span class="item-card__index">${i + 1}</span>
              <span class="item-card__title">${esc(album.title || 'Nuovo album')}${album.featured ? ' ★' : ''}</span>
              <span class="item-card__meta-tag">${typeLabel} · ${esc(album.year)}</span>
              <span class="item-card__chevron">▸</span>
            </div>
            <div class="item-card__actions" onclick="event.stopPropagation()">
              ${i > 0 ? `<button class="btn btn--sm btn--outline" data-action="move-up-album" data-index="${i}" title="Sposta su">↑</button>` : ''}
              ${i < total - 1 ? `<button class="btn btn--sm btn--outline" data-action="move-down-album" data-index="${i}" title="Sposta giù">↓</button>` : ''}
              <button class="btn btn--sm btn--danger" data-action="delete-album" data-index="${i}">Elimina</button>
            </div>
          </div>
          <div class="item-card__body">
            <div class="field__row">
              ${field('Titolo album', 'alb-' + i + '-title', album.title)}
              ${field('Anno', 'alb-' + i + '-year', album.year)}
            </div>
            <div class="field__row">
              ${field('Tipo', 'alb-' + i + '-type', album.type || 'album', 'select', [{ v: 'album', l: 'Album' }, { v: 'single', l: 'Single' }])}
              ${field('Artista (se collaborazione)', 'alb-' + i + '-artist', album.artist || '', 'text', null, 'Es: Ragazzaclan & Lorenzo Travaglini')}
            </div>
            <div class="field">
              <div class="field__toggle">
                <input type="checkbox" id="alb-${i}-featured" ${album.featured ? 'checked' : ''}>
                <label for="alb-${i}-featured">In vetrina (featured)</label>
              </div>
            </div>
            ${field('Copertina (percorso immagine)', 'alb-' + i + '-cover', album.cover || '')}
            <div class="field__row">
              ${field('Descrizione (IT)', 'alb-' + i + '-desc-it', album.description ? album.description.it : '', 'textarea')}
              ${field('Descrizione (EN)', 'alb-' + i + '-desc-en', album.description ? album.description.en : '', 'textarea')}
            </div>
            ${field('Bandcamp URL album', 'alb-' + i + '-bandcamp', album.bandcampUrl || '')}
            ${field('SoundCloud URL album', 'alb-' + i + '-soundcloud', album.soundcloudUrl || '')}
            ${field('Bandcamp Embed HTML', 'alb-' + i + '-embed', album.bandcampEmbed || '', 'textarea', null, 'Incolla il codice iframe embed di Bandcamp')}
            <div style="margin-top:1rem">
              <label class="field__label">Tracce</label>
              ${tracks}
              <button class="btn btn--sm btn--outline" data-action="add-track" data-album="${i}" style="margin-top:0.5rem">+ Aggiungi traccia</button>
            </div>
          </div>
        </div>`;
    });

    html += `<button class="btn btn--add" data-action="add-album">+ Aggiungi Album</button>`;
    return html;
  }

  // ── About Panel ──
  function renderAbout() {
    const d = content.about;
    return `
      <div class="panel__section">
        <h3 class="panel__section-title">Info / About</h3>
        <div class="field__row">
          ${field('Titolo sezione (IT)', 'about-sec-title-it', d.sectionTitle.it)}
          ${field('Titolo sezione (EN)', 'about-sec-title-en', d.sectionTitle.en)}
        </div>
        <div class="field__row">
          ${field('Biografia (IT)', 'about-bio-it', d.bio.it, 'textarea')}
          ${field('Biografia (EN)', 'about-bio-en', d.bio.en, 'textarea')}
        </div>
        ${field('Foto (percorso)', 'about-photo', d.photo || '')}
        ${field('Email contatto', 'about-email', d.contact ? d.contact.email : '')}
        ${field('Instagram URL', 'about-instagram', d.contact ? d.contact.instagram : '')}
        ${field('Sito web', 'about-website', d.contact ? d.contact.website : '')}
      </div>`;
  }

  // ── Background Music Panel ──
  function renderBgMusic() {
    const d = content.backgroundMusic;
    let html = `
      <div class="panel__section">
        <h3 class="panel__section-title">Musica di Sottofondo</h3>
        <div class="field">
          <div class="field__toggle">
            <input type="checkbox" id="bgm-enabled" ${d.enabled ? 'checked' : ''}>
            <label for="bgm-enabled">Abilita player musica di sottofondo</label>
          </div>
        </div>
        ${field('Volume (0.0 - 1.0)', 'bgm-volume', d.volume || 0.3)}
      </div>`;

    (d.tracks || []).forEach((tr, i) => {
      html += `
        <div class="item-card" data-type="bgtrack" data-index="${i}">
          <div class="item-card__header">
            <span class="item-card__title">${esc(tr.title || 'Traccia')}</span>
            <div class="item-card__actions">
              <button class="btn btn--sm btn--danger" data-action="delete-bgtrack" data-index="${i}">Elimina</button>
            </div>
          </div>
          ${field('Titolo', 'bgtr-' + i + '-title', tr.title)}
          ${field('File audio (percorso)', 'bgtr-' + i + '-file', tr.file, 'text', null, 'Es: assets/audio/background.mp3')}
        </div>`;
    });

    html += `<button class="btn btn--add" data-action="add-bgtrack">+ Aggiungi Traccia di Sfondo</button>`;
    return html;
  }

  // ── GitHub Panel ──
  function renderGitHub() {
    const gh = getGitHubConfig();
    return `
      <div class="panel__section">
        <h3 class="panel__section-title">Pubblica su GitHub Pages</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1rem">
          Configura il tuo repository GitHub per pubblicare le modifiche direttamente dal pannello admin, senza toccare il codice.
        </p>
        ${field('Repository (es: utente/nome-repo)', 'gh-repo', gh.repo)}
        ${field('Branch', 'gh-branch', gh.branch || 'main')}
        ${field('Personal Access Token', 'gh-token', gh.token, 'text', null, 'Genera un token su GitHub → Settings → Developer settings → Personal access tokens (Fine-grained). Serve il permesso "Contents: Read and Write".')}
        <div style="margin-top:1rem;display:flex;gap:0.6rem;flex-wrap:wrap">
          <button class="btn btn--outline" data-action="gh-test">Testa Connessione</button>
          <button class="btn btn--primary" data-action="gh-publish">Pubblica content.json</button>
        </div>
        <div id="ghStatus" style="margin-top:1rem"></div>
      </div>
      <div class="panel__section">
        <h3 class="panel__section-title">Come funziona</h3>
        <ol style="font-size:0.82rem;color:var(--text-muted);padding-left:1.2rem;line-height:1.8">
          <li>Crea un repository su GitHub e attiva GitHub Pages (Settings → Pages → Branch: main)</li>
          <li>Carica tutti i file del sito nel repository</li>
          <li>Genera un Personal Access Token su GitHub con permessi sul repository</li>
          <li>Inserisci repository, branch e token qui sopra</li>
          <li>Usa "Pubblica" per aggiornare il sito dopo ogni modifica</li>
        </ol>
      </div>`;
  }

  // ── Bind Panel Events ──
  function bindPanel(name) {
    const main = $('#main');

    main.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        collectAll();

        if (action === 'add-residency') {
          content.residencies.items.push({
            id: 'res-' + Date.now(),
            title: { it: '', en: '' },
            role: 'participant',
            roleLabel: { it: 'Partecipante', en: 'Participant' },
            date: '', location: '',
            description: { it: '', en: '' },
            images: [], video: ''
          });
          renderPanel('residencies');
        }
        else if (action === 'delete-residency') {
          content.residencies.items.splice(parseInt(btn.dataset.index), 1);
          renderPanel('residencies');
        }
        else if (action === 'add-sculpture') {
          content.sculptures.items.push({
            id: 'scu-' + Date.now(),
            title: { it: '', en: '' },
            year: '', materials: { it: '', en: '' }, dimensions: '',
            description: { it: '', en: '' },
            images: [], video: ''
          });
          renderPanel('sculptures');
        }
        else if (action === 'delete-sculpture') {
          content.sculptures.items.splice(parseInt(btn.dataset.index), 1);
          renderPanel('sculptures');
        }
        else if (action === 'add-album') {
          content.music.albums.push({
            id: 'alb-' + Date.now(),
            title: '', type: 'album', year: '', featured: false, artist: '',
            cover: '', description: { it: '', en: '' },
            tracks: [],
            bandcampUrl: '', soundcloudUrl: '', bandcampEmbed: ''
          });
          renderPanel('music');
        }
        else if (action === 'delete-album') {
          content.music.albums.splice(parseInt(btn.dataset.index), 1);
          renderPanel('music');
        }
        else if (action === 'add-track') {
          const ai = parseInt(btn.dataset.album);
          content.music.albums[ai].tracks.push({ title: '', duration: '' });
          renderPanel('music');
        }
        else if (action === 'delete-track') {
          const ai = parseInt(btn.dataset.album);
          const ti = parseInt(btn.dataset.track);
          content.music.albums[ai].tracks.splice(ti, 1);
          renderPanel('music');
        }
        else if (action === 'add-bgtrack') {
          content.backgroundMusic.tracks.push({ title: '', file: '' });
          renderPanel('bgmusic');
        }
        else if (action === 'delete-bgtrack') {
          content.backgroundMusic.tracks.splice(parseInt(btn.dataset.index), 1);
          renderPanel('bgmusic');
        }
        else if (action === 'sort-albums') {
          const sort = btn.dataset.sort;
          const albums = content.music.albums;
          if (sort === 'year-desc') albums.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
          else if (sort === 'year-asc') albums.sort((a, b) => (a.year || '').localeCompare(b.year || ''));
          else if (sort === 'type') albums.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
          else if (sort === 'featured') albums.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          renderPanel('music');
        }
        else if (action === 'sort-sculptures') {
          const sort = btn.dataset.sort;
          const items = content.sculptures.items;
          if (sort === 'year-desc') items.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
          else if (sort === 'year-asc') items.sort((a, b) => (a.year || '').localeCompare(b.year || ''));
          else if (sort === 'dim-desc') items.sort((a, b) => (b.dimensions || '').localeCompare(a.dimensions || ''));
          else if (sort === 'dim-asc') items.sort((a, b) => (a.dimensions || '').localeCompare(b.dimensions || ''));
          renderPanel('sculptures');
        }
        else if (action === 'sort-residencies') {
          const sort = btn.dataset.sort;
          const items = content.residencies.items;
          if (sort === 'date-desc') items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          else if (sort === 'date-asc') items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
          else if (sort === 'location') items.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
          renderPanel('residencies');
        }
        else if (action === 'move-up-residency' || action === 'move-down-residency') {
          const idx = parseInt(btn.dataset.index);
          const dir = action === 'move-up-residency' ? -1 : 1;
          const arr = content.residencies.items;
          [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
          renderPanel('residencies');
        }
        else if (action === 'move-up-sculpture' || action === 'move-down-sculpture') {
          const idx = parseInt(btn.dataset.index);
          const dir = action === 'move-up-sculpture' ? -1 : 1;
          const arr = content.sculptures.items;
          [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
          renderPanel('sculptures');
        }
        else if (action === 'move-up-album' || action === 'move-down-album') {
          const idx = parseInt(btn.dataset.index);
          const dir = action === 'move-up-album' ? -1 : 1;
          const arr = content.music.albums;
          [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
          renderPanel('music');
        }
        else if (action === 'toggle-card') {
          const card = btn.closest('.item-card');
          if (card) card.classList.toggle('item-card--collapsed');
        }
        else if (action === 'gh-test') { testGitHub(); }
        else if (action === 'gh-publish') { publishToGitHub(); }
      });
    });

    // Sync color pickers <-> hex inputs
    [['theme-bg','theme-bg-hex'],['theme-bgcard','theme-bgcard-hex'],['theme-text','theme-text-hex'],['theme-textmuted','theme-textmuted-hex'],['theme-accent','theme-accent-hex']].forEach(([colorId, hexId]) => {
      const colorEl = main.querySelector(`[data-id="${colorId}"]`);
      const hexEl = main.querySelector(`[data-id="${hexId}"]`);
      if (!colorEl || !hexEl) return;
      colorEl.addEventListener('input', () => { hexEl.value = colorEl.value; });
      hexEl.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(hexEl.value)) colorEl.value = hexEl.value; });
    });
  }

  // ── Collect form data back into content ──
  function collectAll() {
    const el = (id) => document.querySelector(`[data-id="${id}"]`);
    const v = (id) => { const e = el(id); return e ? e.value : undefined; };
    const vc = (id) => { const e = document.querySelector(`#${id}`); return e ? e.checked : undefined; };
    const s = (obj, key, id) => { const val = v(id); if (val !== undefined) obj[key] = val; };
    const sc = (obj, key, id) => { const val = vc(id); if (val !== undefined) obj[key] = val; };

    // General — only collect if this panel's elements exist
    if (el('site-title')) {
      s(content.site, 'title', 'site-title');
      s(content.site.description, 'it', 'site-desc-it');
      s(content.site.description, 'en', 'site-desc-en');
      s(content.site, 'defaultLang', 'site-lang');
      s(content.site, 'backgroundVideo', 'site-bgvideo');
      s(content.hero, 'title', 'hero-title');
      s(content.hero, 'subtitle', 'hero-subtitle');
      s(content.hero.tagline, 'it', 'hero-tagline-it');
      s(content.hero.tagline, 'en', 'hero-tagline-en');
      s(content.site.socialLinks, 'bandcamp', 'social-bandcamp');
      s(content.site.socialLinks, 'soundcloud', 'social-soundcloud');
      s(content.site.socialLinks, 'instagram', 'social-instagram');
      s(content.site.socialLinks, 'email', 'social-email');
      if (!content.shortcuts) content.shortcuts = {};
      s(content.shortcuts, 'residencies', 'shortcut-residencies');
      s(content.shortcuts, 'sculptures', 'shortcut-sculptures');
      s(content.shortcuts, 'music', 'shortcut-music');
    }

    // Style
    if (el('theme-bg')) {
      if (!content.theme) content.theme = { colors: {}, fontBody: '', fontDisplay: '' };
      if (!content.theme.colors) content.theme.colors = {};
      s(content.theme.colors, 'bg', 'theme-bg-hex');
      s(content.theme.colors, 'bgCard', 'theme-bgcard-hex');
      s(content.theme.colors, 'text', 'theme-text-hex');
      s(content.theme.colors, 'textMuted', 'theme-textmuted-hex');
      s(content.theme.colors, 'accent', 'theme-accent-hex');
      s(content.theme, 'fontBody', 'theme-font-body');
      s(content.theme, 'fontDisplay', 'theme-font-display');
      s(content.residencies, 'headerImage', 'res-header-img');
    }

    // Residencies
    if (el('res-sec-title-it')) {
      s(content.residencies.sectionTitle, 'it', 'res-sec-title-it');
      s(content.residencies.sectionTitle, 'en', 'res-sec-title-en');
      s(content.residencies.sectionDescription, 'it', 'res-sec-desc-it');
      s(content.residencies.sectionDescription, 'en', 'res-sec-desc-en');
      content.residencies.items.forEach((item, i) => {
        s(item.title, 'it', 'res-' + i + '-title-it');
        s(item.title, 'en', 'res-' + i + '-title-en');
        const role = v('res-' + i + '-role');
        if (role) item.role = role;
        s(item.roleLabel, 'it', 'res-' + i + '-rolelabel-it');
        s(item.roleLabel, 'en', 'res-' + i + '-rolelabel-en');
        s(item, 'date', 'res-' + i + '-date');
        s(item, 'location', 'res-' + i + '-location');
        s(item.description, 'it', 'res-' + i + '-desc-it');
        s(item.description, 'en', 'res-' + i + '-desc-en');
        const imgs = v('res-' + i + '-images');
        if (imgs !== undefined) item.images = imgs ? imgs.split('\n').map((x) => x.trim()).filter(Boolean) : [];
        s(item, 'video', 'res-' + i + '-video');
      });
    }

    // Sculptures
    if (el('scu-sec-title-it')) {
      s(content.sculptures.sectionTitle, 'it', 'scu-sec-title-it');
      s(content.sculptures.sectionTitle, 'en', 'scu-sec-title-en');
      s(content.sculptures.sectionDescription, 'it', 'scu-sec-desc-it');
      s(content.sculptures.sectionDescription, 'en', 'scu-sec-desc-en');
      content.sculptures.items.forEach((item, i) => {
        s(item.title, 'it', 'scu-' + i + '-title-it');
        s(item.title, 'en', 'scu-' + i + '-title-en');
        s(item, 'year', 'scu-' + i + '-year');
        s(item, 'dimensions', 'scu-' + i + '-dimensions');
        if (!item.materials) item.materials = { it: '', en: '' };
        s(item.materials, 'it', 'scu-' + i + '-materials-it');
        s(item.materials, 'en', 'scu-' + i + '-materials-en');
        s(item.description, 'it', 'scu-' + i + '-desc-it');
        s(item.description, 'en', 'scu-' + i + '-desc-en');
        const imgs = v('scu-' + i + '-images');
        if (imgs !== undefined) item.images = imgs ? imgs.split('\n').map((x) => x.trim()).filter(Boolean) : [];
        s(item, 'video', 'scu-' + i + '-video');
      });
    }

    // Music
    if (el('mus-sec-title-it')) {
      s(content.music.sectionTitle, 'it', 'mus-sec-title-it');
      s(content.music.sectionTitle, 'en', 'mus-sec-title-en');
      s(content.music.sectionDescription, 'it', 'mus-sec-desc-it');
      s(content.music.sectionDescription, 'en', 'mus-sec-desc-en');
      content.music.albums.forEach((album, i) => {
        s(album, 'title', 'alb-' + i + '-title');
        const t = v('alb-' + i + '-type');
        if (t) album.type = t;
        s(album, 'year', 'alb-' + i + '-year');
        sc(album, 'featured', 'alb-' + i + '-featured');
        s(album, 'artist', 'alb-' + i + '-artist');
        s(album, 'cover', 'alb-' + i + '-cover');
        if (!album.description) album.description = { it: '', en: '' };
        s(album.description, 'it', 'alb-' + i + '-desc-it');
        s(album.description, 'en', 'alb-' + i + '-desc-en');
        s(album, 'bandcampUrl', 'alb-' + i + '-bandcamp');
        s(album, 'soundcloudUrl', 'alb-' + i + '-soundcloud');
        s(album, 'bandcampEmbed', 'alb-' + i + '-embed');
        album.tracks.forEach((tr, ti) => {
          s(tr, 'title', 'alb-' + i + '-track-' + ti + '-title');
          s(tr, 'duration', 'alb-' + i + '-track-' + ti + '-dur');
        });
      });
    }

    // About
    if (el('about-sec-title-it')) {
      s(content.about.sectionTitle, 'it', 'about-sec-title-it');
      s(content.about.sectionTitle, 'en', 'about-sec-title-en');
      s(content.about.bio, 'it', 'about-bio-it');
      s(content.about.bio, 'en', 'about-bio-en');
      s(content.about, 'photo', 'about-photo');
      if (!content.about.contact) content.about.contact = {};
      s(content.about.contact, 'email', 'about-email');
      s(content.about.contact, 'instagram', 'about-instagram');
      s(content.about.contact, 'website', 'about-website');
    }

    // Bg Music
    if (document.querySelector('#bgm-enabled')) {
      content.backgroundMusic.enabled = vc('bgm-enabled');
      const vol = parseFloat(v('bgm-volume'));
      if (!isNaN(vol)) content.backgroundMusic.volume = Math.max(0, Math.min(1, vol));
      content.backgroundMusic.tracks.forEach((tr, i) => {
        s(tr, 'title', 'bgtr-' + i + '-title');
        s(tr, 'file', 'bgtr-' + i + '-file');
      });
    }
  }

  // ── GitHub Integration ──
  function getGitHubConfig() {
    try {
      return JSON.parse(localStorage.getItem('gh_config') || '{}');
    } catch { return {}; }
  }

  function saveGitHubConfig() {
    const config = {
      repo: val('gh-repo'),
      branch: val('gh-branch') || 'main',
      token: val('gh-token')
    };
    try { localStorage.setItem('gh_config', JSON.stringify(config)); } catch {}
    return config;
  }

  function val(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    return el ? el.value.trim() : '';
  }

  async function testGitHub() {
    const cfg = saveGitHubConfig();
    const statusEl = $('#ghStatus');
    if (!cfg.repo || !cfg.token) {
      statusEl.innerHTML = '<div class="gh-status gh-status--err">Inserisci repository e token.</div>';
      return;
    }
    try {
      const res = await fetch('https://api.github.com/repos/' + cfg.repo, {
        headers: { 'Authorization': 'Bearer ' + cfg.token }
      });
      if (res.ok) {
        const data = await res.json();
        statusEl.innerHTML = `<div class="gh-status gh-status--ok">Connesso a <strong>${esc(data.full_name)}</strong></div>`;
      } else {
        statusEl.innerHTML = `<div class="gh-status gh-status--err">Errore ${res.status}: ${res.statusText}</div>`;
      }
    } catch (err) {
      statusEl.innerHTML = `<div class="gh-status gh-status--err">Errore di rete: ${esc(err.message)}</div>`;
    }
  }

  async function publishToGitHub() {
    collectAll();
    const cfg = saveGitHubConfig();
    const statusEl = $('#ghStatus');
    if (!cfg.repo || !cfg.token) {
      statusEl.innerHTML = '<div class="gh-status gh-status--err">Inserisci repository e token.</div>';
      return;
    }

    statusEl.innerHTML = '<div class="gh-status" style="border:1px solid var(--border)">Pubblicazione in corso...</div>';

    try {
      const path = 'data/content.json';
      const apiBase = 'https://api.github.com/repos/' + cfg.repo + '/contents/' + path;
      const headers = {
        'Authorization': 'Bearer ' + cfg.token,
        'Content-Type': 'application/json'
      };

      let sha = null;
      try {
        const existing = await fetch(apiBase + '?ref=' + cfg.branch, { headers });
        if (existing.ok) {
          const data = await existing.json();
          sha = data.sha;
        }
      } catch {}

      const body = {
        message: 'Aggiorna contenuti sito — ' + new Date().toLocaleString('it-IT'),
        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
        branch: cfg.branch
      };
      if (sha) body.sha = sha;

      const res = await fetch(apiBase, { method: 'PUT', headers, body: JSON.stringify(body) });

      if (res.ok) {
        statusEl.innerHTML = '<div class="gh-status gh-status--ok">Pubblicato con successo! Il sito si aggiornerà in pochi minuti.</div>';
        toast('Pubblicato su GitHub!');
      } else {
        const err = await res.json();
        statusEl.innerHTML = `<div class="gh-status gh-status--err">Errore: ${esc(err.message || res.statusText)}</div>`;
      }
    } catch (err) {
      statusEl.innerHTML = `<div class="gh-status gh-status--err">Errore: ${esc(err.message)}</div>`;
    }
  }

  // ── UI Helpers ──
  function field(label, id, value, type, options, hint) {
    type = type || 'text';
    value = value || '';
    let input;
    if (type === 'textarea') {
      input = `<textarea class="field__textarea" data-id="${id}">${esc(value)}</textarea>`;
    } else if (type === 'select' && options) {
      input = `<select class="field__select" data-id="${id}">${options.map((o) => `<option value="${esc(o.v)}" ${o.v === value ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
    } else {
      input = `<input class="field__input" type="text" data-id="${id}" value="${esc(String(value))}">`;
    }
    return `<div class="field">
      <label class="field__label">${label}</label>
      ${input}
      ${hint ? `<p class="field__hint">${hint}</p>` : ''}
    </div>`;
  }

  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }

  // ── Boot ──
  document.addEventListener('DOMContentLoaded', init);
})();
