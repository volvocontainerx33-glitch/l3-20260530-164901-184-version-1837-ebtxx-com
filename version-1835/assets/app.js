(function () {
  function closestSection(element) {
    var section = element.closest('.movie-section') || document;

    if (section !== document && !section.querySelector('.movie-card')) {
      return document;
    }

    return section;
  }

  function refreshCards(section) {
    var input = section.querySelector('.movie-search');
    var query = input ? input.value.trim().toLowerCase() : '';
    var active = section.querySelector('.filter-pill.active');
    var filter = active ? active.getAttribute('data-filter') : 'all';
    var cards = section.querySelectorAll('.movie-card');

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var tagText = (card.getAttribute('data-tags') || '').toLowerCase();
      var passQuery = !query || text.indexOf(query) !== -1;
      var passFilter = filter === 'all' || tagText.indexOf(filter.toLowerCase()) !== -1;
      card.hidden = !(passQuery && passFilter);
    });
  }

  document.querySelectorAll('.movie-search').forEach(function (input) {
    input.addEventListener('input', function () {
      refreshCards(closestSection(input));
    });
  });

  document.querySelectorAll('.filter-pill').forEach(function (button) {
    button.addEventListener('click', function () {
      var section = closestSection(button);
      section.querySelectorAll('.filter-pill').forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      refreshCards(section);
    });
  });

  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-slide-target]'));
  var currentSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    targets.forEach(function (target) {
      target.classList.toggle('active', Number(target.getAttribute('data-slide-target')) === currentSlide);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(slideTimer);
    slideTimer = setInterval(function () {
      showSlide(currentSlide + 1);
    }, 6200);
  }

  targets.forEach(function (target) {
    target.addEventListener('click', function () {
      showSlide(Number(target.getAttribute('data-slide-target')) || 0);
      startSlider();
    });
  });

  startSlider();

  function initVideo(video) {
    var stream = video.getAttribute('data-stream');
    var shell = video.closest('.video-shell');
    var startButton = shell ? shell.querySelector('.video-start') : null;
    var hls = null;
    var loaded = false;
    var requestedPlay = false;

    if (!stream) {
      return;
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (startButton) {
            startButton.classList.remove('is-hidden');
          }
        });
      }
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        if (requestedPlay) {
          playVideo();
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requestedPlay) {
            playVideo();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }

      video.src = stream;
      if (requestedPlay) {
        playVideo();
      }
    }

    function startPlayback() {
      requestedPlay = true;
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
      loadStream();
      if (loaded && !hls) {
        playVideo();
      }
    }

    if (startButton) {
      startButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  document.querySelectorAll('.movie-video').forEach(initVideo);
})();
