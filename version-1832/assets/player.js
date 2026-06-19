(function () {
  var hlsPromise = null;

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js").catch(function () {
        return import("./hls-vendor.js").then(function (module) {
          return module.H;
        });
      });
    }

    return hlsPromise;
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("movie-player");
    var startButton = document.getElementById("player-start");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function hideButton() {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    }

    function showButton() {
      if (startButton) {
        startButton.classList.remove("is-hidden");
      }
    }

    function attachSource() {
      if (loaded) {
        return Promise.resolve();
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return Promise.resolve();
      }

      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }).catch(function () {
        video.src = sourceUrl;
      });
    }

    function playVideo() {
      attachSource().then(function () {
        hideButton();
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            showButton();
          });
        }
      });
    }

    if (startButton) {
      startButton.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", hideButton);
    video.addEventListener("pause", showButton);
    video.addEventListener("ended", showButton);

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  };
})();
