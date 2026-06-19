
(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var regionSelect = scope.querySelector('[data-region-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-chip]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var activeChip = '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function fillSelect(select, attr, reverse) {
      if (!select) {
        return;
      }
      var values = cards.map(function (card) {
        return card.getAttribute(attr) || '';
      }).filter(Boolean);
      values = Array.prototype.slice.call(new Set(values)).sort(function (a, b) {
        return reverse ? String(b).localeCompare(String(a), 'zh-Hans-CN') : String(a).localeCompare(String(b), 'zh-Hans-CN');
      });
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-text'));
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (activeChip && text.indexOf(normalize(activeChip)) === -1) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        card.hidden = !matched;
      });
    }

    fillSelect(regionSelect, 'data-region', false);
    fillSelect(typeSelect, 'data-type', false);
    fillSelect(yearSelect, 'data-year', true);

    if (input) {
      var params = new URLSearchParams(window.location.search);
      if (params.get('q')) {
        input.value = params.get('q');
      }
      input.addEventListener('input', apply);
    }

    [regionSelect, typeSelect, yearSelect].forEach(function (select) {
      if (select) {
        select.addEventListener('change', apply);
      }
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeChip = chip.getAttribute('data-chip') || '';
        chips.forEach(function (item) {
          item.setAttribute('aria-pressed', item === chip ? 'true' : 'false');
        });
        apply();
      });
    });

    apply();
  });
})();
