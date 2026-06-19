import { H as Hls } from './hls.js';

const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function initPlayer(block) {
  const video = block.querySelector('[data-player-video]');
  const button = block.querySelector('[data-player-play]');
  const source = block.dataset.hlsSrc;
  const poster = block.dataset.poster || '';
  if (poster) {
    video.setAttribute('poster', poster);
  }

  let hls = null;
  const playVideo = async () => {
    try {
      await video.play();
      block.classList.add('is-playing');
      if (button) button.hidden = true;
    } catch (err) {
      block.classList.add('is-paused');
    }
  };

  const attach = () => {
    if (!source) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    video.addEventListener('loadedmetadata', () => {
      block.classList.add('is-ready');
    }, { once: true });
  };

  attach();

  if (button) {
    button.addEventListener('click', () => {
      video.muted = false;
      playVideo();
    });
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      video.muted = false;
      playVideo();
    } else {
      video.pause();
      if (button) button.hidden = false;
    }
  });

  video.addEventListener('play', () => {
    if (button) button.hidden = true;
  });

  video.addEventListener('pause', () => {
    if (button) button.hidden = false;
  });
}

function initSearch() {
  const input = document.querySelector('[data-search-input]');
  const list = document.querySelector('[data-search-results]');
  if (!input || !list || !window.CATALOG) return;

  const render = (items) => {
    if (!items.length) {
      list.innerHTML = '<div class="empty">没有找到符合条件的影片，试试别的关键词。</div>';
      return;
    }
    list.innerHTML = items.map((item) => `
      <article class="catalog-item">
        <a class="catalog-item__thumb" href="/movies/${item.slug}.html">${item.title.slice(0, 1)}</a>
        <div>
          <h3 class="catalog-item__title"><a href="/movies/${item.slug}.html">${item.title}</a></h3>
          <div class="catalog-item__meta">${item.year} · ${item.region} · ${item.type} · ${item.genres.join(' / ')}</div>
          <p class="catalog-item__desc">${item.summary}</p>
        </div>
      </article>
    `).join('');
  };

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    const filtered = window.CATALOG.filter((item) => {
      if (!q) return true;
      const hay = [
        item.title, item.year, item.region, item.type,
        item.genres.join(' '), item.tags.join(' '), item.summary
      ].join(' ').toLowerCase();
      return hay.includes(q);
    }).slice(0, 60);
    render(filtered);
  };

  input.addEventListener('input', filter);
  filter();
}

function initActiveNav() {
  const path = location.pathname.replace(/\/+$/, '');
  $$('.nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (path.endsWith(href.replace(/^\.\//, '')) || (path === '' && href.endsWith('index.html'))) {
      a.classList.add('active');
    }
  });
}

function initStickyButtons() {
  const topBtn = document.querySelector('[data-back-to-top]');
  if (topBtn) {
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $$('[data-player]').forEach(initPlayer);
  initSearch();
  initActiveNav();
  initStickyButtons();
});
