(function () {
    var body = document.body;
    var toggle = document.querySelector('.menu-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('.quick-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var target = form.getAttribute('data-search-url') || 'search.html';
            var value = input ? input.value.trim() : '';
            if (value) {
                window.location.href = target + '?q=' + encodeURIComponent(value);
            } else {
                window.location.href = target;
            }
        });
    });

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var grid = panel.parentElement.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var empty = panel.parentElement.querySelector('[data-empty-state]');
        if (keyword && initialQuery) {
            keyword.value = initialQuery;
        }
        var apply = function () {
            var q = keyword ? keyword.value.trim().toLowerCase() : '';
            var r = region ? region.value : '';
            var t = type ? type.value : '';
            var y = year ? year.value : '';
            var shown = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (r && card.getAttribute('data-region') !== r) {
                    match = false;
                }
                if (t && card.getAttribute('data-type') !== t) {
                    match = false;
                }
                if (y && card.getAttribute('data-year') !== y) {
                    match = false;
                }
                card.classList.toggle('is-hidden', !match);
                if (match) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', shown === 0);
            }
        };
        [keyword, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    });
})();
