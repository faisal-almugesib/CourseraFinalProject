/* ============================================================
   Travel Recommender — shared app logic
   Theme · favorites (localStorage) · live local time · search
   ============================================================ */

(() => {
  'use strict';

  const THEME_KEY = 'tr-theme';
  const FAV_KEY = 'tr-favorites';

  /* ---------- Theme ---------- */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
      });
    }
  }

  /* ---------- Favorites ---------- */
  const getFavs = () => JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
  const setFavs = (ids) => localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  const isFav = (id) => getFavs().includes(id);

  function toggleFav(id) {
    const favs = getFavs();
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id); else favs.splice(idx, 1);
    setFavs(favs);
    updateFavCount();
    return favs.includes(id);
  }

  function updateFavCount() {
    const count = getFavs().length;
    document.querySelectorAll('.fav-count').forEach((el) => {
      el.textContent = count;
      el.setAttribute('data-count', String(count));
    });
  }

  /* ---------- Local time ---------- */
  function formatTime(timeZone) {
    try {
      return new Intl.DateTimeFormat([], { timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date());
    } catch (e) {
      return '—';
    }
  }

  function startClocks() {
    const tick = () => {
      document.querySelectorAll('[data-tz]').forEach((el) => {
        el.textContent = formatTime(el.getAttribute('data-tz'));
      });
    };
    tick();
    setInterval(tick, 30000); // refresh twice a minute
  }

  /* ---------- Card rendering ---------- */
  const heartSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.4 4.5c2 0 3.4 1.2 4.6 2.8 1.2-1.6 2.6-2.8 4.6-2.8 3.4 0 5 3.5 3.4 7.2C19.5 16.4 12 21 12 21z"/></svg>';
  const clockSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  function cardHTML(d) {
    const tags = (d.tags || []).slice(0, 3).map((t) => `<span class="tag">#${t}</span>`).join('');
    const pressed = isFav(d.id);
    return `
      <article class="card" data-id="${d.id}" data-category="${d.category}">
        <div class="card-media">
          <img src="${encodeURI(d.imageUrl)}" alt="${d.name}, ${d.country}" loading="lazy">
          <span class="badge">${d.category}</span>
          <button class="fav-btn" aria-pressed="${pressed}" aria-label="Save ${d.name}" title="Save to favorites">${heartSVG}</button>
        </div>
        <div class="card-body">
          <div class="place">
            <h3>${d.name}</h3>
            <span class="country">${d.country}</span>
          </div>
          <p>${d.description}</p>
          <div class="tag-row">${tags}</div>
          <div class="card-foot">
            <span class="localtime">${clockSVG}<span data-tz="${d.timeZone}">${formatTime(d.timeZone)}</span> local</span>
          </div>
        </div>
      </article>`;
  }

  function wireFavButtons(container) {
    container.querySelectorAll('.fav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.card').getAttribute('data-id');
        btn.setAttribute('aria-pressed', String(toggleFav(id)));
        if (container.id === 'favoritesGrid' && !isFav(id)) {
          // removing from the favorites page: drop the card
          btn.closest('.card').remove();
          renderFavoritesEmptyState();
        }
      });
    });
  }

  /* ---------- Home page ---------- */
  async function initHome() {
    const grid = document.getElementById('resultsGrid');
    if (!grid) return;

    let data = [];
    try {
      const res = await fetch('travel_recommendation_api.json');
      data = (await res.json()).destinations || [];
    } catch (e) {
      grid.innerHTML = '<div class="empty"><div class="big">⚠️</div><p>Could not load destinations.</p></div>';
      return;
    }

    const countEl = document.getElementById('resultCount');
    let activeCat = 'all';
    let query = '';

    function apply() {
      const q = query.trim().toLowerCase();
      const filtered = data.filter((d) => {
        const matchCat = activeCat === 'all' || d.category === activeCat;
        const haystack = `${d.name} ${d.country} ${d.category} ${(d.tags || []).join(' ')} ${d.description}`.toLowerCase();
        const matchQuery = !q || haystack.includes(q);
        return matchCat && matchQuery;
      });
      render(filtered);
    }

    function render(list) {
      if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? 'place' : 'places'}`;
      if (!list.length) {
        grid.innerHTML = `<div class="empty"><div class="big">🧭</div><p>No destinations match “${query}”. Try “beach”, “japan”, or “temple”.</p></div>`;
        return;
      }
      grid.innerHTML = list.map(cardHTML).join('');
      grid.querySelectorAll('.card').forEach((c, i) => { c.style.animationDelay = `${i * 40}ms`; });
      wireFavButtons(grid);
    }

    // search wiring (hero + section both target the same input id)
    const input = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchButton');
    const resetBtn = document.getElementById('resetButton');
    const runSearch = () => { query = input ? input.value : ''; apply(); document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' }); };
    if (searchBtn) searchBtn.addEventListener('click', runSearch);
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });
    if (resetBtn) resetBtn.addEventListener('click', () => { if (input) input.value = ''; query = ''; activeCat = 'all'; syncChips(); apply(); });

    // category chips
    const chips = Array.from(document.querySelectorAll('.chip'));
    function syncChips() { chips.forEach((c) => c.classList.toggle('active', c.dataset.cat === activeCat)); }
    chips.forEach((chip) => chip.addEventListener('click', () => { activeCat = chip.dataset.cat; syncChips(); apply(); }));

    apply();
  }

  /* ---------- Favorites page ---------- */
  let renderFavoritesEmptyState = () => {};
  async function initFavorites() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    let data = [];
    try {
      const res = await fetch('travel_recommendation_api.json');
      data = (await res.json()).destinations || [];
    } catch (e) { /* ignore */ }

    const empty = document.getElementById('favEmpty');
    renderFavoritesEmptyState = () => {
      const has = grid.querySelector('.card');
      if (empty) empty.style.display = has ? 'none' : 'block';
    };

    const favs = getFavs();
    const list = data.filter((d) => favs.includes(d.id));
    grid.innerHTML = list.map(cardHTML).join('');
    wireFavButtons(grid);
    renderFavoritesEmptyState();
  }

  /* ---------- Contact page ---------- */
  function initContact() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const success = document.getElementById('contactSuccess');

    const showErr = (id, msg) => { const el = document.querySelector(`[data-err="${id}"]`); if (el) el.textContent = msg || ''; };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      showErr('name', ''); showErr('email', ''); showErr('message', '');

      if (name.length < 2) { showErr('name', 'Please enter your name.'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('email', 'Enter a valid email address.'); ok = false; }
      if (message.length < 10) { showErr('message', 'Message should be at least 10 characters.'); ok = false; }

      if (!ok) return;
      // No backend — acknowledge client-side
      form.reset();
      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 6000);
      }
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateFavCount();
    initHome();
    initFavorites();
    initContact();
    startClocks();
  });
})();
