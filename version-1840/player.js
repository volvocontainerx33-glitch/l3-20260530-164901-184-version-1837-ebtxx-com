(() => {
    function createMessage(player, text) {
        let message = player.querySelector(".player-message");
        if (!message) {
            message = document.createElement("div");
            message.className = "player-message";
            message.style.position = "absolute";
            message.style.left = "16px";
            message.style.right = "16px";
            message.style.bottom = "16px";
            message.style.padding = "10px 12px";
            message.style.borderRadius = "12px";
            message.style.background = "rgba(2, 6, 23, 0.78)";
            message.style.color = "#e2e8f0";
            message.style.fontSize = "14px";
            message.style.lineHeight = "1.6";
            player.appendChild(message);
        }
        message.textContent = text;
    }

    function initPlayer(player) {
        const video = player.querySelector("video");
        const button = player.querySelector("[data-play-button]");
        const primarySource = player.dataset.hlsSource || "";
        const fallbackSource = player.dataset.hlsFallback || primarySource;
        let hls = null;
        let hasTriedFallback = false;

        if (!video || !button || !primarySource) {
            return;
        }

        function destroyHls() {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        }

        function playVideo() {
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(() => {
                    createMessage(player, "视频已就绪，请再次点击播放按钮。 ");
                });
            }
        }

        function loadSource(sourceUrl) {
            player.classList.add("is-playing");
            video.controls = true;

            if (window.Hls && window.Hls.isSupported()) {
                destroyHls();
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                hls.on(window.Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal && !hasTriedFallback && fallbackSource && fallbackSource !== sourceUrl) {
                        hasTriedFallback = true;
                        loadSource(fallbackSource);
                        return;
                    }
                    if (data && data.fatal) {
                        createMessage(player, "当前播放源暂时无法加载，请稍后重试。 ");
                    }
                });
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                return;
            }

            video.src = fallbackSource || sourceUrl;
            playVideo();
        }

        button.addEventListener("click", () => {
            loadSource(primarySource);
        });

        video.addEventListener("play", () => {
            player.classList.add("is-playing");
        });

        window.addEventListener("pagehide", destroyHls);
    }

    document.querySelectorAll("[data-player]").forEach(initPlayer);
})();
