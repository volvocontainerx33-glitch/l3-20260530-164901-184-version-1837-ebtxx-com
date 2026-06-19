(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.main-nav');
    var search = document.querySelector('.header-search');

    if (!toggle || !nav || !search) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      search.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    document.querySelectorAll('[data-header-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var keyword = input ? input.value.trim() : '';

        if (keyword) {
          var prefix = form.getAttribute('data-root-prefix') || '';
          window.location.href = prefix + 'search.html?q=' + encodeURIComponent(keyword);
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilter() {
    var input = document.querySelector('[data-filter-input]');
    var type = document.querySelector('[data-filter-type]');
    var region = document.querySelector('[data-filter-region]');
    var year = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');

    if (!input && !type && !region && !year) {
      return;
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var selectedType = normalize(type && type.value);
      var selectedRegion = normalize(region && region.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-desc'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (selectedType && cardType !== selectedType) {
          matched = false;
        }

        if (selectedRegion && cardRegion !== selectedRegion) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }

    apply();
  }

  function initSearchPage() {
    var grid = document.querySelector('[data-search-results]');

    if (!grid || !window.MOVIES_DATA) {
      return;
    }

    var input = document.querySelector('[data-search-input]');
    var type = document.querySelector('[data-search-type]');
    var region = document.querySelector('[data-search-region]');
    var year = document.querySelector('[data-search-year]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (input && q) {
      input.value = q;
    }

    function card(movie) {
      return [
        '<a class="movie-card" data-movie-card href="' + movie.url + '"',
        ' data-title="' + escapeHtml(movie.title) + '"',
        ' data-tags="' + escapeHtml(movie.tags) + '"',
        ' data-desc="' + escapeHtml(movie.desc) + '"',
        ' data-type="' + escapeHtml(movie.type) + '"',
        ' data-region="' + escapeHtml(movie.region) + '"',
        ' data-year="' + escapeHtml(movie.year) + '">',
        '<span class="card-cover"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="cover-tag">' + escapeHtml(movie.category) + '</span></span>',
        '<span class="card-body"><strong class="card-title">' + escapeHtml(movie.title) + '</strong><span class="card-desc">' + escapeHtml(movie.desc) + '</span><span class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></span></span>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var selectedType = normalize(type && type.value);
      var selectedRegion = normalize(region && region.value);
      var selectedYear = normalize(year && year.value);
      var results = window.MOVIES_DATA.filter(function (movie) {
        var haystack = normalize(movie.title + ' ' + movie.tags + ' ' + movie.desc + ' ' + movie.genre);
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (selectedType && normalize(movie.type) !== selectedType) {
          matched = false;
        }

        if (selectedRegion && normalize(movie.region) !== selectedRegion) {
          matched = false;
        }

        if (selectedYear && normalize(movie.year) !== selectedYear) {
          matched = false;
        }

        return matched;
      }).slice(0, 240);

      grid.innerHTML = results.map(card).join('');

      if (empty) {
        empty.style.display = results.length ? 'none' : 'block';
      }
    }

    [input, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function initPlayer() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var button = shell.querySelector('.play-button');
      var status = shell.querySelector('.player-status');
      var source = shell.getAttribute('data-video-src');
      var initialized = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function start() {
        if (!video || !source) {
          setStatus('当前播放源不可用');
          return;
        }

        if (!initialized) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                setStatus('请再次点击播放按钮开始播放');
              });
            });
            hls.on(window.Hls.Events.ERROR, function () {
              setStatus('播放源加载中，如长时间无响应请刷新页面重试');
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
              video.play().catch(function () {
                setStatus('请再次点击播放按钮开始播放');
              });
            });
          } else {
            video.src = source;
            video.play().catch(function () {
              setStatus('浏览器未启用 HLS 播放能力');
            });
          }

          initialized = true;
        } else {
          video.play().catch(function () {
            setStatus('请再次点击播放按钮开始播放');
          });
        }

        video.setAttribute('controls', 'controls');
        if (overlay) {
          overlay.style.display = 'none';
        }
        setStatus('正在连接高清播放源');
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          start();
        });
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHeaderSearch();
    initHero();
    initFilter();
    initSearchPage();
    initPlayer();
  });
})();
