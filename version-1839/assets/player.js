(function () {
  function prepare(video) {
    if (!video || video.dataset.ready === '1') {
      return;
    }

    var url = video.getAttribute('data-url');
    if (!url) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      video.src = url;
    }

    video.dataset.ready = '1';
  }

  function play(card, video) {
    prepare(video);
    card.classList.add('playing');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        card.classList.remove('playing');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.player-card').forEach(function (card) {
      var video = card.querySelector('video');
      var button = card.querySelector('.play-overlay');

      if (!video) {
        return;
      }

      video.addEventListener('play', function () {
        card.classList.add('playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          card.classList.remove('playing');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          play(card, video);
        }
      });

      if (button) {
        button.addEventListener('click', function () {
          play(card, video);
        });
      }
    });
  });
})();
