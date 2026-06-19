(function () {
    var video = document.getElementById('movie-player');
    if (!video) {
        return;
    }
    var box = video.closest('.video-box');
    var button = document.querySelector('[data-play-button]');
    var streamUrl = video.getAttribute('data-stream-url');
    var hlsInstance = null;

    var attachStream = function () {
        if (!streamUrl || video.getAttribute('data-ready') === '1') {
            return;
        }
        video.setAttribute('data-ready', '1');
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        }
    };

    var playVideo = function () {
        attachStream();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (box) {
            box.classList.add('is-playing');
        }
    });

    video.addEventListener('pause', function () {
        if (box) {
            box.classList.remove('is-playing');
        }
    });

    video.addEventListener('loadedmetadata', function () {
        if (box && !video.paused) {
            box.classList.add('is-playing');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
})();
