(() => {
    const menuButton = document.querySelector("[data-menu-button]");
    const mainNav = document.querySelector("[data-main-nav]");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", () => {
            mainNav.classList.toggle("open");
        });
    }

    const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const heroPrev = document.querySelector("[data-hero-prev]");
    const heroNext = document.querySelector("[data-hero-next]");
    let heroIndex = 0;
    let heroTimer = null;

    function showHeroSlide(index) {
        if (!heroSlides.length) {
            return;
        }

        heroIndex = (index + heroSlides.length) % heroSlides.length;
        heroSlides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === heroIndex);
        });
        heroDots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === heroIndex);
        });
    }

    function restartHeroTimer() {
        if (!heroSlides.length) {
            return;
        }

        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(() => {
            showHeroSlide(heroIndex + 1);
        }, 5000);
    }

    if (heroSlides.length) {
        heroPrev?.addEventListener("click", () => {
            showHeroSlide(heroIndex - 1);
            restartHeroTimer();
        });
        heroNext?.addEventListener("click", () => {
            showHeroSlide(heroIndex + 1);
            restartHeroTimer();
        });
        heroDots.forEach((dot) => {
            dot.addEventListener("click", () => {
                const nextIndex = Number(dot.dataset.heroDot || 0);
                showHeroSlide(nextIndex);
                restartHeroTimer();
            });
        });
        restartHeroTimer();
    }

    const searchInput = document.querySelector("[data-search-input]");
    const filterCards = Array.from(document.querySelectorAll(".filter-card"));
    const filterButtons = Array.from(document.querySelectorAll("[data-filter-category]"));
    const filterCount = document.querySelector("[data-filter-count]");
    let activeCategory = "";

    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        const query = normalizeText(searchInput?.value);
        let visibleCount = 0;

        filterCards.forEach((card) => {
            const text = normalizeText(card.dataset.search || card.textContent);
            const category = card.dataset.category || "";
            const matchesQuery = !query || text.includes(query);
            const matchesCategory = !activeCategory || category === activeCategory;
            const isVisible = matchesQuery && matchesCategory;

            card.classList.toggle("is-hidden", !isVisible);
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (filterCount) {
            filterCount.textContent = `当前显示 ${visibleCount} 部内容`;
        }
    }

    if (filterCards.length) {
        searchInput?.addEventListener("input", applyFilters);
        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                activeCategory = button.dataset.filterCategory || "";
                filterButtons.forEach((item) => {
                    item.classList.toggle("active", item === button);
                });
                applyFilters();
            });
        });
        applyFilters();
    }
})();
