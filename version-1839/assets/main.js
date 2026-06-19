(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var value = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', keyword && value.indexOf(keyword) === -1);
      });
    });
  });

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card" data-card>',
      '<a href="' + item.url + '">',
      '<div class="card-cover">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="card-badge">' + escapeHtml(item.category) + '</span>',
      '<span class="card-score">' + escapeHtml(item.score) + '</span>',
      '</div>',
      '<div class="card-content">',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.desc) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<div class="card-meta"><span>' + escapeHtml(item.genre) + '</span><span>查看详情</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchStatus = document.querySelector('[data-search-status]');

  if (searchInput && searchResults && window.VideoIndex) {
    var keyword = getQuery();
    searchInput.value = keyword;

    if (keyword) {
      var normalized = keyword.toLowerCase();
      var results = window.VideoIndex.filter(function (item) {
        return item.words.toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 120);

      searchStatus.textContent = results.length ? '搜索结果：' + keyword : '未找到匹配内容：' + keyword;
      searchResults.innerHTML = results.length ? results.map(cardTemplate).join('') : '';
    }
  }
})();
