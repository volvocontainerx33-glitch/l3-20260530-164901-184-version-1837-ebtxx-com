(function () {
  var body = document.body;
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      body.classList.toggle("menu-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  var searchInput = document.querySelector("[data-search-input]");
  var searchClear = document.querySelector("[data-search-clear]");
  var searchList = document.querySelector("[data-search-list]");
  var emptyState = document.querySelector("[data-empty-state]");

  if (searchInput && searchList) {
    var cards = Array.prototype.slice.call(searchList.querySelectorAll("[data-search]"));
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("q") || "";

    function filterCards() {
      var query = searchInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    if (preset) {
      searchInput.value = preset;
    }

    searchInput.addEventListener("input", filterCards);

    if (searchClear) {
      searchClear.addEventListener("click", function () {
        searchInput.value = "";
        filterCards();
        searchInput.focus();
      });
    }

    filterCards();
  }
})();
