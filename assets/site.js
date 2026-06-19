(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function norm(s) { return (s || '').toString().trim().toLowerCase(); }

  function initMenu() {
    var btn = qs('[data-menu-toggle]');
    var panel = qs('[data-menu-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      panel.classList.toggle('hidden');
    });
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = qs('input[type="search"], input[type="text"]', form);
        var value = input ? input.value.trim() : '';
        var url = 'search.html';
        if (value) url += '?q=' + encodeURIComponent(value);
        window.location.href = url;
      });
    });
  }

  function attachCardHover() {
    qsa('[data-card]').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.classList.add('is-hovered');
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-hovered');
      });
    });
  }

  function loadHlsScript(callback) {
    if (window.Hls) return callback();
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function initPlayer() {
    qsa('[data-player]').forEach(function (wrap) {
      var video = qs('video', wrap);
      if (!video) return;
      var mp4 = video.getAttribute('data-mp4');
      var m3u8 = video.getAttribute('data-m3u8');
      var playBtn = qs('[data-play-btn]', wrap);
      var cover = qs('[data-player-cover]', wrap);

      function playVideo() {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      }

      if (m3u8) {
        loadHlsScript(function () {
          try {
            if (window.Hls && window.Hls.isSupported()) {
              var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
              });
              hls.loadSource(m3u8);
              hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = m3u8;
            } else if (mp4) {
              video.src = mp4;
            }
          } catch (err) {
            if (mp4) video.src = mp4;
          }
        });
      } else if (mp4) {
        video.src = mp4;
      }

      if (playBtn) {
        playBtn.addEventListener('click', function () {
          if (cover) cover.classList.add('opacity-0', 'pointer-events-none');
          playVideo();
        });
      }
      video.addEventListener('play', function () {
        if (cover) cover.classList.add('opacity-0', 'pointer-events-none');
      });
      video.addEventListener('pause', function () {
        if (cover) cover.classList.remove('opacity-0', 'pointer-events-none');
      });
      wrap.addEventListener('click', function (e) {
        if (e.target === video) return;
      });
    });
  }

  function initSearchPage() {
    var data = window.MOVIE_CATALOG;
    var grid = qs('[data-search-grid]');
    if (!grid || !Array.isArray(data)) return;

    var qInput = qs('[data-q]');
    var regionSel = qs('[data-region]');
    var typeSel = qs('[data-type]');
    var yearSel = qs('[data-year]');
    var categorySel = qs('[data-category]');
    var countEl = qs('[data-result-count]');

    function card(m) {
      return '\n<a class="group block" href="' + m.url + '">\n' +
        '  <div class="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">\n' +
        '    <div class="poster-box ' + m.toneClass + '">\n' +
        '      <div class="poster-chip">' + m.year + '</div>\n' +
        '      <div class="poster-title">' + m.title + '</div>\n' +
        '    </div>\n' +
        '    <div class="p-4">\n' +
        '      <div class="text-sm text-slate-500">' + m.region + ' · ' + m.type + '</div>\n' +
        '      <h3 class="mt-1 line-clamp-1 text-base font-semibold text-slate-900">' + m.title + '</h3>\n' +
        '      <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">' + m.oneLine + '</p>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</a>';
    }

    function apply() {
      var q = norm(qInput && qInput.value);
      var region = regionSel && regionSel.value;
      var type = typeSel && typeSel.value;
      var year = yearSel && yearSel.value;
      var cat = categorySel && categorySel.value;
      var result = data.filter(function (m) {
        if (region && m.region !== region) return false;
        if (type && m.type !== type) return false;
        if (year && m.year !== year) return false;
        if (cat && m.category !== cat) return false;
        if (!q) return true;
        var hay = [m.title, m.region, m.type, m.year, m.genre, m.tags.join(' '), m.summary, m.oneLine].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      grid.innerHTML = result.map(card).join('') || '<div class="col-span-full rounded-3xl bg-white p-12 text-center shadow-lg ring-1 ring-slate-200"><p class="text-lg font-semibold text-slate-900">没有找到匹配影片</p><p class="mt-2 text-sm text-slate-500">试试更换关键词或筛选条件。</p></div>';
      if (countEl) countEl.textContent = result.length;
    }

    [qInput, regionSel, typeSel, yearSel, categorySel].forEach(function (el) {
      if (el) el.addEventListener('input', apply);
      if (el) el.addEventListener('change', apply);
    });
    var searchParam = new URLSearchParams(location.search).get('q');
    if (searchParam && qInput) qInput.value = searchParam;
    apply();
  }

  function initFloatingTop() {
    var btn = qs('[data-back-top]');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) btn.classList.remove('opacity-0', 'pointer-events-none');
      else btn.classList.add('opacity-0', 'pointer-events-none');
    }, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    attachCardHover();
    initPlayer();
    initSearchPage();
    initFloatingTop();
  });
})();
