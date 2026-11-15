(function () {
  'use strict';

  let content = null;
  let lang = 'it';
  let currentPage = 'home';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const t = (obj) => (obj && typeof obj === 'object' ? obj[lang] || obj.it || '' : obj || '');

  async function init() {
    try {
      const res = await fetch('data/content.json');
      content = await res.json();
    } catch {
      return;
    }
    lang = content.site.defaultLang || 'it';
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    setupNav();
    setupMobileMenu();
    setupLangToggle();
    setupMusicPlayer();
    setupLightbox();
    setupRouter();
    render();
  }

  // ── Router ──
  function setupRouter() {
    window.addEventListener('hashchange', () => navigateTo(getPageFromHash()));
    navigateTo(getPageFromHash());
  }

  function getPageFromHash() {
    const hash = location.hash.replace('#', '') || 'home';
    const valid = ['home', 'residencies', 'sculptures', 'music', 'contacts'];
    return valid.includes(hash) ? hash : 'home';
  }

  function navigateTo(page) {
    currentPage = page;
    $$('.page').forEach((p) => p.classList.remove('active'));
    const target = $(`#page-${page}`);
    if (target) target.classList.add('active');

    $$('[data-nav]').forEach((a) => {
      a.classList.toggle('active', a.dataset.nav === page);
    });

    window.scrollTo(0, 0);

    if (page !== 'home') {
      $('#nav').classList.add('nav--scrolled');
    }

  }

  // ── Navigation ──
  function setupNav() {
    window.addEventListener('scroll', () => {
      if (currentPage === 'home') {
        $('#nav').classList.toggle('nav--scrolled', window.scrollY > 80);
      }
    });
  }

  // ── Mobile Menu ──
  function setupMobileMenu() {
    const burger = $('#navBurger');
    const menu = $('#mobileMenu');
    const close = $('#menuClose');
    const backdrop = $('#menuBackdrop');

    function openMenu() { menu.classList.add('open'); }
    function closeMenu() { menu.classList.remove('open'); }

    burger.addEventListener('click', openMenu);
    close.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);

    $('#mobileMenuLinks').addEventListener('click', (e) => {
      if (e.target.tagName === 'A') closeMenu();
    });
  }

  // ── Language ──
  function setupLangToggle() {
    const btn = $('#langToggle');
    btn.textContent = lang === 'it' ? 'EN' : 'IT';
    btn.addEventListener('click', () => {
      lang = lang === 'it' ? 'en' : 'it';
      document.documentElement.lang = lang;
      document.documentElement.dataset.lang = lang;
      btn.textContent = lang === 'it' ? 'EN' : 'IT';
      render();
    });
  }

  // ── Theme ──
  function applyTheme() {
    const theme = content.theme;
    if (!theme) return;
    const root = document.documentElement.style;
    if (theme.colors) {
      if (theme.colors.bg) root.setProperty('--bg', theme.colors.bg);
      if (theme.colors.bgCard) root.setProperty('--bg-card', theme.colors.bgCard);
      if (theme.colors.text) root.setProperty('--text', theme.colors.text);
      if (theme.colors.textMuted) root.setProperty('--text-muted', theme.colors.textMuted);
      if (theme.colors.accent) {
        root.setProperty('--accent', theme.colors.accent);
        const r = parseInt(theme.colors.accent.slice(1,3),16);
        const g = parseInt(theme.colors.accent.slice(3,5),16);
        const b = parseInt(theme.colors.accent.slice(5,7),16);
        root.setProperty('--accent-dim', `rgba(${r},${g},${b},0.15)`);
      }
    }
    if (theme.fontBody) root.setProperty('--font-body', "'" + theme.fontBody + "', 'Inter', system-ui, sans-serif");
    if (theme.fontDisplay) root.setProperty('--font-display', "'" + theme.fontDisplay + "', Georgia, serif");
  }

  // ── Render ──
  function render() {
    applyTheme();
    renderHero();
    renderHomeAbout();
    renderHomeShortcuts();
    renderResidencies();
    renderSculptures();
    renderMusic();
    renderContacts();
    renderFooter();
    updateNavLabels();
  }

  function updateNavLabels() {
    if (!content) return;
    const navData = content.nav[lang] || content.nav.it;
    $$('[data-nav]').forEach((a) => {
      const key = a.dataset.nav;
      if (navData[key]) a.textContent = navData[key];
    });
  }

  // ── Hero ──
  function renderHero() {
    const hero = content.hero;
    $('#heroTitle').textContent = hero.title;
    $('#heroSubtitle').textContent = hero.subtitle;
    $('#heroTagline').textContent = t(hero.tagline);

    const videoSrc = content.site.backgroundVideo;
    const videoEl = $('#heroVideo');
    const heroSec = $('.hero');
    if (videoSrc) {
      $('#heroVideoSource').src = videoSrc;
      videoEl.load();
      videoEl.play().catch(() => {});
      heroSec.classList.remove('hero--no-video');
    } else {
      heroSec.classList.add('hero--no-video');
    }
  }

  // ── Home About ──
  function renderHomeAbout() {
    const data = content.about;
    const social = content.site.socialLinks || {};
    const wrap = $('#homeAboutContent');

    const contacts = [];
    if (data.contact && data.contact.email) contacts.push(`<li><a href="mailto:${esc(data.contact.email)}">${esc(data.contact.email)}</a></li>`);
    if (data.contact && data.contact.instagram) contacts.push(`<li><a href="${esc(data.contact.instagram)}" target="_blank" rel="noopener">Instagram</a></li>`);
    if (social.bandcamp) contacts.push(`<li><a href="${esc(social.bandcamp)}" target="_blank" rel="noopener">Bandcamp</a></li>`);
    if (social.soundcloud) contacts.push(`<li><a href="${esc(social.soundcloud)}" target="_blank" rel="noopener">SoundCloud</a></li>`);

    wrap.innerHTML = `
      <div class="about__photo ${!data.photo ? 'about__photo--placeholder' : ''}">
        ${data.photo ? `<img src="${esc(data.photo)}" alt="Maurice Bellanova">` : '<span>FOTO</span>'}
      </div>
      <div class="about__text">
        <p class="about__bio">${esc(t(data.bio))}</p>
        ${contacts.length > 0 ? `<ul class="about__contacts">${contacts.join('')}</ul>` : ''}
      </div>`;
  }

  // ── Home Shortcuts ──
  function renderHomeShortcuts() {
    const navData = content.nav[lang] || content.nav.it;
    const images = content.shortcuts || {};
    const shortcuts = [
      { page: 'residencies', label: navData.residencies, desc: t(content.residencies.sectionDescription), img: images.residencies },
      { page: 'sculptures', label: navData.sculptures, desc: t(content.sculptures.sectionDescription), img: images.sculptures },
      { page: 'music', label: navData.music, desc: t(content.music.sectionDescription), img: images.music }
    ];

    const el = $('#homeShortcuts');
    el.innerHTML = shortcuts.map((s) => `
      <a href="#${s.page}" class="shortcut">
        <div class="shortcut__bg"><img src="${esc(s.img)}" alt="${esc(s.label)}" loading="lazy"></div>
        <div class="shortcut__overlay"></div>
        <span class="shortcut__label">${esc(s.label)}</span>
        <span class="shortcut__desc">${esc(s.desc)}</span>
      </a>`).join('');
  }

  // ── Residencies ──
  function renderResidencies() {
    const data = content.residencies;
    $('#residenciesTitle').textContent = t(data.sectionTitle);
    $('#residenciesDesc').textContent = t(data.sectionDescription);

    const heroBar = $('#page-residencies .page__hero-bar');
    if (data.headerImage) {
      heroBar.style.backgroundImage = `url('${data.headerImage}')`;
      heroBar.classList.add('page__hero-bar--bg');
    }

    const grid = $('#residenciesGrid');
    grid.innerHTML = '';

    if (!data.items || data.items.length === 0) {
      grid.innerHTML = emptyMsg('residencies');
      return;
    }

    data.items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card card--wide fade-in';
      const hasImages = item.images && item.images.length > 0;

      let slideshowHtml = '';
      if (hasImages) {
        slideshowHtml = `
          <div class="slideshow" data-gallery="${esc(item.id)}">
            <div class="slideshow__track">
              ${item.images.map((img, i) => `<div class="slideshow__slide ${i === 0 ? 'slideshow__slide--active' : ''}"><img src="${esc(img)}" alt="${esc(t(item.title))} ${i + 1}" data-gallery="${esc(item.id)}" data-index="${i}" loading="lazy"></div>`).join('')}
            </div>
            ${item.images.length > 1 ? `
              <button class="slideshow__nav slideshow__nav--prev" aria-label="Precedente">&lsaquo;</button>
              <button class="slideshow__nav slideshow__nav--next" aria-label="Successiva">&rsaquo;</button>
              <div class="slideshow__dots">
                ${item.images.map((_, i) => `<span class="slideshow__dot ${i === 0 ? 'slideshow__dot--active' : ''}" data-index="${i}"></span>`).join('')}
              </div>` : ''}
          </div>`;
      }

      card.innerHTML = `
        ${hasImages ? slideshowHtml : '<div class="card__media card__media--placeholder"><span>IMG</span></div>'}
        <div class="card__body">
          <span class="card__badge card__badge--inline">${esc(t(item.roleLabel))}</span>
          <h3 class="card__title">${esc(t(item.title))}</h3>
          <p class="card__meta">${esc(item.date)} — ${esc(item.location)}</p>
          <p class="card__text">${esc(t(item.description))}</p>
          ${item.video ? `<div style="margin-top:1rem"><video controls style="width:100%;border-radius:2px" preload="metadata"><source src="${esc(item.video)}" type="video/mp4"></video></div>` : ''}
        </div>`;
      grid.appendChild(card);

      if (hasImages && item.images.length > 1) {
        initSlideshow(card.querySelector('.slideshow'));
      }
    });
    observeFadeIns();
  }

  function initSlideshow(container) {
    const slides = container.querySelectorAll('.slideshow__slide');
    const dots = container.querySelectorAll('.slideshow__dot');
    const prevBtn = container.querySelector('.slideshow__nav--prev');
    const nextBtn = container.querySelector('.slideshow__nav--next');
    let current = 0;
    let autoPlay = true;
    let timer = null;

    function goTo(index) {
      slides[current].classList.remove('slideshow__slide--active');
      if (dots[current]) dots[current].classList.remove('slideshow__dot--active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('slideshow__slide--active');
      if (dots[current]) dots[current].classList.add('slideshow__dot--active');
    }

    function startAuto() {
      if (!autoPlay) return;
      timer = setInterval(() => goTo(current + 1), 4000);
    }

    function stopAuto() {
      autoPlay = false;
      if (timer) { clearInterval(timer); timer = null; }
    }

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(current - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(current + 1); });
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(parseInt(dot.dataset.index)); });
    });

    startAuto();
  }

  // ── Sculptures ──
  function renderSculptures() {
    const data = content.sculptures;
    $('#sculpturesTitle').textContent = t(data.sectionTitle);
    $('#sculpturesDesc').textContent = t(data.sectionDescription);

    const gallery = $('#sculpturesGallery');
    gallery.innerHTML = '';

    if (!data.items || data.items.length === 0) {
      gallery.innerHTML = emptyMsg('sculptures');
      return;
    }

    data.items.forEach((item) => {
      const hasImages = item.images && item.images.length > 0;
      const el = document.createElement('div');
      el.className = `gallery__item fade-in ${!hasImages ? 'gallery__item--placeholder' : ''}`;

      if (hasImages) {
        el.innerHTML = `
          <img src="${esc(item.images[0])}" alt="${esc(t(item.title))}" data-gallery="${esc(item.id)}" data-index="0" loading="lazy">
          <div class="gallery__info">
            <h3>${esc(t(item.title))}</h3>
            <p>${esc(item.year)}${item.materials ? ' · ' + esc(t(item.materials)) : ''}${item.dimensions ? ' · ' + esc(item.dimensions) : ''}</p>
          </div>`;
      } else {
        el.innerHTML = `<span>IMG</span><span>${esc(t(item.title))}</span><span style="font-size:0.7rem">${esc(item.year)}</span>`;
      }
      gallery.appendChild(el);
    });
    observeFadeIns();
  }

  // ── Music ──
  function renderMusic() {
    const data = content.music;
    const social = content.site.socialLinks || {};
    $('#musicSectionTitle').textContent = t(data.sectionTitle);
    $('#musicDesc').textContent = t(data.sectionDescription);

    

    const grid = $('#albumsGrid');
    grid.innerHTML = '';
    if (!data.albums || data.albums.length === 0) {
      grid.innerHTML = emptyMsg('music');
      return;
    }

    const featured = data.albums.filter((a) => a.featured);
    const rest = data.albums.filter((a) => !a.featured);

    if (featured.length > 0) {
      const featWrap = document.createElement('div');
      featWrap.className = 'albums-featured';
      featured.forEach((album) => featWrap.appendChild(createAlbumCard(album, true)));
      grid.appendChild(featWrap);
    }

    if (rest.length > 0) {
      if (featured.length > 0) {
        const sep = document.createElement('div');
        sep.className = 'albums-separator';
        sep.innerHTML = `<span>${lang === 'it' ? 'Catalogo' : 'Catalog'}</span>`;
        grid.appendChild(sep);
      }
      const restWrap = document.createElement('div');
      restWrap.className = 'albums-catalog';
      rest.forEach((album) => restWrap.appendChild(createAlbumCard(album, false)));
      grid.appendChild(restWrap);
    }

    observeFadeIns();
  }

  function createAlbumCard(album, isFeatured) {
    const el = document.createElement('article');
    el.className = `album fade-in ${isFeatured ? 'album--featured' : ''}`;
    const typeLabel = album.type === 'single' ? 'Single' : 'Album';
    const artistLine = album.artist ? `<p class="album__artist">${esc(album.artist)}</p>` : '';
    el.innerHTML = `
      <div class="album__cover ${!album.cover ? 'album__cover--placeholder' : ''}">
        ${album.cover ? `<img src="${esc(album.cover)}" alt="${esc(album.title)}" loading="lazy">` : `<span>${esc(album.title)}</span>`}
        <span class="album__type">${typeLabel}</span>
      </div>
      <div class="album__body">
        <h3 class="album__title">${esc(album.title)}</h3>
        ${artistLine}
        <p class="album__year">${esc(album.year)}</p>
        <p class="album__desc">${esc(t(album.description))}</p>
        ${album.tracks && album.tracks.length > 1 ? `
          <ul class="album__tracks">
            ${album.tracks.map((tr) => `<li class="album__track"><span class="album__track-title">${esc(tr.title)}</span><span class="album__track-dur">${esc(tr.duration)}</span></li>`).join('')}
          </ul>` : ''}
        <div class="album__links">
          ${album.bandcampUrl ? `<a href="${esc(album.bandcampUrl)}" target="_blank" rel="noopener" class="album__link">Bandcamp</a>` : ''}
          ${album.soundcloudUrl ? `<a href="${esc(album.soundcloudUrl)}" target="_blank" rel="noopener" class="album__link">SoundCloud</a>` : ''}
        </div>
      </div>`;
    return el;
  }

  // ── Contacts ──
  function renderContacts() {
    const data = content.about;
    const social = content.site.socialLinks || {};
    const navData = content.nav[lang] || content.nav.it;
    $('#contactsTitle').textContent = navData.contacts;

    const wrap = $('#contactsContent');
    let html = '<div class="contacts__grid">';

    html += '<div class="contacts__block">';
    html += `<h3>${lang === 'it' ? 'Contatto' : 'Contact'}</h3>`;
    if (data.contact && data.contact.email) html += `<a href="mailto:${esc(data.contact.email)}">${esc(data.contact.email)}</a>`;
    if (data.contact && data.contact.website) html += `<a href="${esc(data.contact.website)}" target="_blank" rel="noopener">${esc(data.contact.website)}</a>`;
    html += '</div>';

    html += '<div class="contacts__block">';
    html += `<h3>${lang === 'it' ? 'Social & Musica' : 'Social & Music'}</h3>`;
    if (data.contact && data.contact.instagram) html += `<a href="${esc(data.contact.instagram)}" target="_blank" rel="noopener">Instagram</a>`;
    if (social.bandcamp) html += `<a href="${esc(social.bandcamp)}" target="_blank" rel="noopener">Bandcamp</a>`;
    if (social.soundcloud) html += `<a href="${esc(social.soundcloud)}" target="_blank" rel="noopener">SoundCloud</a>`;
    html += '</div>';

    html += '</div>';
    wrap.innerHTML = html;
  }

  // ── Footer ──
  function renderFooter() {
    $('#footerYear').textContent = new Date().getFullYear();
    const social = content.site.socialLinks || {};
    const links = $('#footerLinks');
    links.innerHTML = '';
    if (social.bandcamp) links.innerHTML += `<a href="${esc(social.bandcamp)}" target="_blank" rel="noopener">Bandcamp</a>`;
    if (social.soundcloud) links.innerHTML += `<a href="${esc(social.soundcloud)}" target="_blank" rel="noopener">SoundCloud</a>`;
    if (social.instagram) links.innerHTML += `<a href="${esc(social.instagram)}" target="_blank" rel="noopener">Instagram</a>`;
  }

  // ── Background Music ──
  function setupMusicPlayer() {
    const audio = $('#bgAudio');
    const toggle = $('#musicToggle');
    const iconPlay = $('.music-player__icon--play');
    const iconPause = $('.music-player__icon--pause');
    const titleEl = $('#musicTitle');
    const playerEl = $('#musicPlayer');

    const bgMusic = content.backgroundMusic;
    if (!bgMusic || !bgMusic.enabled || !bgMusic.tracks || bgMusic.tracks.length === 0) {
      playerEl.classList.add('hidden');
      return;
    }

    let trackIndex = 0;
    let isPlaying = false;

    function loadTrack(i) {
      const track = bgMusic.tracks[i];
      audio.src = track.file;
      audio.volume = bgMusic.volume || 0.3;
      titleEl.textContent = track.title;
    }

    loadTrack(0);

    // Entrance animation: slide in after a short delay
    requestAnimationFrame(() => {
      setTimeout(() => playerEl.classList.add('music-player--enter'), 600);
    });

    toggle.addEventListener('click', () => {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        iconPlay.style.display = '';
        iconPause.style.display = 'none';
      } else {
        audio.play().then(() => {
          isPlaying = true;
          iconPlay.style.display = 'none';
          iconPause.style.display = '';
        }).catch(() => {});
      }
    });

    audio.addEventListener('ended', () => {
      trackIndex = (trackIndex + 1) % bgMusic.tracks.length;
      loadTrack(trackIndex);
      audio.play().catch(() => {});
    });
  }

  // ── Lightbox ──
  function setupLightbox() {
    const lightbox = $('#lightbox');
    const img = $('#lightboxImg');
    const closeBtn = $('.lightbox__close');
    const prevBtn = $('.lightbox__prev');
    const nextBtn = $('.lightbox__next');
    let images = [];
    let currentIndex = 0;

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.tagName === 'IMG' && target.dataset.gallery) {
        const galleryId = target.dataset.gallery;
        images = $$(`img[data-gallery="${galleryId}"]`).map((i) => i.src);
        currentIndex = parseInt(target.dataset.index, 10) || 0;
        showImage();
        lightbox.classList.add('open');
      }
    });

    function showImage() {
      img.src = images[currentIndex];
      prevBtn.style.display = images.length > 1 ? '' : 'none';
      nextBtn.style.display = images.length > 1 ? '' : 'none';
    }

    closeBtn.addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
    prevBtn.addEventListener('click', () => { currentIndex = (currentIndex - 1 + images.length) % images.length; showImage(); });
    nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % images.length; showImage(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') lightbox.classList.remove('open');
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    });
  }

  // ── Helpers ──
  function observeFadeIns() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    $$('.fade-in:not(.visible)').forEach((el) => observer.observe(el));
  }

  function emptyMsg(section) {
    const msgs = {
      residencies: { it: 'Nessuna residenza ancora.', en: 'No residencies yet.' },
      sculptures: { it: 'Nessuna scultura ancora.', en: 'No sculptures yet.' },
      music: { it: 'Nessun album ancora.', en: 'No albums yet.' }
    };
    const m = msgs[section] || { it: '', en: '' };
    return `<p style="color:var(--text-muted);text-align:center;grid-column:1/-1">${m[lang] || m.it}</p>`;
  }

  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
