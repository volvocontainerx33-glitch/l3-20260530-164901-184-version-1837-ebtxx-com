(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var opened = mobileNav.hasAttribute("hidden");
        if (opened) {
          mobileNav.removeAttribute("hidden");
        } else {
          mobileNav.setAttribute("hidden", "");
        }
        menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = hero.querySelector(".hero-dots");
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function setSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        if (dots) {
          Array.prototype.slice.call(dots.children).forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === index);
          });
        }
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          setSlide(index + 1);
        }, 5200);
      }

      if (dots) {
        slides.forEach(function (_, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", "切换到第" + (i + 1) + "屏");
          dot.addEventListener("click", function () {
            setSlide(i);
            restart();
          });
          dots.appendChild(dot);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          setSlide(index + 1);
          restart();
        });
      }

      setSlide(0);
      restart();
    }

    var pageSearch = document.querySelector(".main-search-input");
    if (pageSearch) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      pageSearch.value = q;
    }

    var lists = Array.prototype.slice.call(document.querySelectorAll(".searchable-list"));
    lists.forEach(function (list) {
      var scope = list.closest(".filter-panel") || document;
      var textInput = scope.querySelector(".local-filter") || document.querySelector(".main-search-input");
      var yearSelect = scope.querySelector(".year-filter");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function applyFilter() {
        var text = textInput ? textInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-year") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var textOk = !text || haystack.indexOf(text) !== -1;
          var yearOk = !year || card.getAttribute("data-year") === year;
          card.classList.toggle("is-filtered-out", !(textOk && yearOk));
        });
      }

      if (textInput) {
        textInput.addEventListener("input", applyFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
      }
      applyFilter();
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (box) {
      var video = box.querySelector("video");
      var source = video ? video.querySelector("source") : null;
      var startButton = box.querySelector(".player-start");
      var hls = null;

      if (!video || !source) {
        return;
      }

      function begin() {
        var url = source.getAttribute("src");
        if (!url) {
          return;
        }
        if (!video.getAttribute("src") && video.canPlayType("application/vnd.apple.mpegurl")) {
          video.setAttribute("src", url);
        } else if (window.Hls && window.Hls.isSupported() && !hls) {
          hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (!video.getAttribute("src")) {
          video.setAttribute("src", url);
        }
        if (startButton) {
          startButton.classList.add("is-hidden");
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }

      if (startButton) {
        startButton.addEventListener("click", begin);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener("play", function () {
        if (startButton) {
          startButton.classList.add("is-hidden");
        }
      });
    });
  });
})();
