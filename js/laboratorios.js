document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".lab-summary-card");
    const tabsSection = document.querySelector(".labs-section");
    const tabsScroll = document.querySelector(".lab-tabs-scroll");
    const tabs = document.querySelectorAll("[data-bs-target]");
    const panes = document.querySelectorAll("#labTabsContent > .tab-pane");

    // Scroll horizontal de tabs con la rueda
    if (tabsScroll) {
        tabsScroll.addEventListener("wheel", function (event) {
            if (event.deltaY === 0) return;
            event.preventDefault();
            tabsScroll.scrollLeft += event.deltaY;
        }, { passive: false });
    }

    // Arrastrar tabs horizontalmente
    if (tabsScroll) {
        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;
        let animationFrame;

        tabsScroll.addEventListener("mousedown", function (event) {
            isDragging = true;
            startX = event.pageX;
            startScrollLeft = tabsScroll.scrollLeft;
            tabsScroll.classList.add("dragging");
        });

        window.addEventListener("mouseup", function () {
            isDragging = false;
            tabsScroll.classList.remove("dragging");
        });

        tabsScroll.addEventListener("mousemove", function (event) {
            if (!isDragging) return;
            event.preventDefault();
            const currentX = event.pageX;
            const distance = currentX - startX;

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            animationFrame = requestAnimationFrame(() => {
                tabsScroll.scrollLeft = startScrollLeft - distance;
            });
        });
    }

    function activateTab(tab, scroll = true) {
        const target = tab.dataset.bsTarget;
        const pane = document.querySelector(target);
        if (!pane) return;

        tabs.forEach(item => {
            item.classList.toggle("active", item === tab);
            item.setAttribute("aria-selected", item === tab ? "true" : "false");
        });

        panes.forEach(item => {
            item.classList.toggle("show", item === pane);
            item.classList.toggle("active", item === pane);
        });

        if (target === "#todos") {
            history.replaceState(null, "", window.location.pathname);
        } else {
            history.replaceState(null, "", target);
            if (scroll) focusTab(tab);
        }
    }

    function focusTab(tab) {
        if (!tabsScroll || tab.id === "todos-tab") return;

        const tabRect = tab.getBoundingClientRect();
        const scrollRect = tabsScroll.getBoundingClientRect();
        const padding = 8;

        if (tabRect.left < scrollRect.left) {
            tabsScroll.scrollBy({
                left: tabRect.left - scrollRect.left - padding,
                behavior: "smooth"
            });
        } else if (tabRect.right > scrollRect.right) {
            tabsScroll.scrollBy({
                left: tabRect.right - scrollRect.right + padding,
                behavior: "smooth"
            });
        }
    }

    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            activateTab(this);
        });
    });

    // Tarjetas
    cards.forEach(card => {
        card.addEventListener("click", function () {
            const labId = this.dataset.lab;
            const tab = document.querySelector(`[data-bs-target="#${labId}"]`);
            if (!tab) return;

            activateTab(tab);

            setTimeout(() => {
                tabsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        });
    });

    // Hash de la URL
    const hash = window.location.hash.replace("#", "");

    if (hash) {
        const targetTab = document.querySelector(`[data-bs-target="#${hash}"]`);

        if (targetTab) {
            activateTab(targetTab, false);

            setTimeout(() => {
                focusTab(targetTab);

                tabsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        }
    }

    // Carrusel de imágenes de las tarjetas
    document.querySelectorAll(".summary-image").forEach(function (gallery) {
        const slides = gallery.querySelectorAll(".summary-slide");

        if (slides.length < 2) return;

        let current = 0;

        setInterval(function () {
            slides[current].classList.remove("active");
            current = (current + 1) % slides.length;
            slides[current].classList.add("active");
        }, 5000);
    });

    // Mostrar / ocultar equipamiento adicional
    document.querySelectorAll("[data-equipment-toggle]").forEach(function (button) {
        button.addEventListener("click", function () {
            const section = button.closest(".lab-detail-modern");
            if (!section) return;

            const more = section.querySelector("[data-equipment-more]");
            if (!more) return;

            const isOpen = more.classList.toggle("open");

            if (isOpen) {
                button.innerHTML = 'Ocultar equipamiento <i class="bi bi-arrow-up"></i>';
            } else {
                button.innerHTML = 'Ver todo el equipamiento <i class="bi bi-arrow-right"></i>';
            }
        });
    });

    /* =========================================================
       GALERÍA DEL LABORATORIO
       Carrusel automático + visor
       ========================================================= */

    const galleryCarousel = document.querySelector(".lab-gallery-carousel");
    const galleryTrack = document.querySelector(".lab-gallery-track");
    const galleryItems = document.querySelectorAll(".lab-gallery-item");
    const galleryPrev = document.querySelector(".lab-gallery-prev");
    const galleryNext = document.querySelector(".lab-gallery-next");

    if (galleryCarousel && galleryTrack && galleryItems.length > 0) {
        let galleryPosition = 0;
        let galleryTimer = null;

        function getVisibleItems() {
            const width = window.innerWidth;
            if (width <= 575) return 2;
            if (width <= 767) return 3;
            if (width <= 1200) return 4;
            return 5;
        }

        function updateGallery() {
            const visibleItems = getVisibleItems();
            const maxPosition = Math.max(0, galleryItems.length - visibleItems);

            if (galleryPosition > maxPosition) {
                galleryPosition = 0;
            }

            if (galleryPosition < 0) {
                galleryPosition = maxPosition;
            }

            const item = galleryItems[0];
            const itemWidth = item.offsetWidth;
            const gap = window.innerWidth <= 767 ? 14 : 18;
            const translate = galleryPosition * (itemWidth + gap);

            galleryTrack.style.transform = "translateX(-" + translate + "px)";

            if (galleryPrev) {
                galleryPrev.disabled = galleryPosition === 0;
            }

            if (galleryNext) {
                galleryNext.disabled = galleryPosition >= maxPosition;
            }
        }

        function nextGallery() {
            const visibleItems = getVisibleItems();
            const maxPosition = Math.max(0, galleryItems.length - visibleItems);

            galleryPosition++;

            if (galleryPosition > maxPosition) {
                galleryPosition = 0;
            }

            updateGallery();
        }

        function startGallery() {
            if (galleryTimer) {
                clearInterval(galleryTimer);
            }

            galleryTimer = setInterval(function () {
                nextGallery();
            }, 3000);
        }

        // Botón anterior
        if (galleryPrev) {
            galleryPrev.addEventListener("click", function () {
                galleryPosition--;
                updateGallery();
                startGallery();
            });
        }

        // Botón siguiente
        if (galleryNext) {
            galleryNext.addEventListener("click", function () {
                nextGallery();
                startGallery();
            });
        }

        // Reiniciar posición al cambiar tamaño
        window.addEventListener("resize", function () {
            galleryPosition = 0;
            updateGallery();
            startGallery();
        });

        updateGallery();
        startGallery();

        /* =====================================================
           VISOR / LIGHTBOX
           ===================================================== */

        const lightbox = document.getElementById("labLightbox");
        const lightboxImage = document.querySelector(".lab-lightbox-image");
        const lightboxClose = document.querySelector(".lab-lightbox-close");
        const lightboxPrev = document.querySelector(".lab-lightbox-prev");
        const lightboxNext = document.querySelector(".lab-lightbox-next");
        const lightboxCurrent = document.getElementById("labLightboxCurrent");
        const lightboxTotal = document.getElementById("labLightboxTotal");

        if (lightbox && lightboxImage) {
            let currentImage = 0;

            if (lightboxTotal) {
                lightboxTotal.textContent = galleryItems.length;
            }

            function showLightboxImage(index) {
                if (index < 0) {
                    index = galleryItems.length - 1;
                }

                if (index >= galleryItems.length) {
                    index = 0;
                }

                currentImage = index;

                const item = galleryItems[currentImage];
                const imageUrl = item.getAttribute("data-gallery-image");
                const thumbnail = item.querySelector("img");

                if (imageUrl) {
                    lightboxImage.src = imageUrl;
                } else if (thumbnail) {
                    lightboxImage.src = thumbnail.src;
                }

                if (thumbnail) {
                    lightboxImage.alt = thumbnail.alt || "Imagen del laboratorio";
                }

                if (lightboxCurrent) {
                    lightboxCurrent.textContent = currentImage + 1;
                }
            }

            function openLightbox(index) {
                showLightboxImage(index);
                lightbox.classList.add("open");
                document.body.style.overflow = "hidden";
            }

            function closeLightbox() {
                lightbox.classList.remove("open");
                document.body.style.overflow = "";
            }

            // Abrir visor al hacer clic
            galleryItems.forEach(function (item, index) {
                item.addEventListener("click", function () {
                    openLightbox(index);
                });
            });

            // Imagen anterior
            if (lightboxPrev) {
                lightboxPrev.addEventListener("click", function (event) {
                    event.stopPropagation();
                    showLightboxImage(currentImage - 1);
                });
            }

            // Imagen siguiente
            if (lightboxNext) {
                lightboxNext.addEventListener("click", function (event) {
                    event.stopPropagation();
                    showLightboxImage(currentImage + 1);
                });
            }

            // Cerrar visor
            if (lightboxClose) {
                lightboxClose.addEventListener("click", function (event) {
                    event.stopPropagation();
                    closeLightbox();
                });
            }

            // Cerrar haciendo clic fuera de la imagen
            lightbox.addEventListener("click", function (event) {
                if (event.target === lightbox) {
                    closeLightbox();
                }
            });

            // Controles de teclado
            document.addEventListener("keydown", function (event) {
                if (!lightbox.classList.contains("open")) {
                    return;
                }

                if (event.key === "Escape") {
                    closeLightbox();
                }

                if (event.key === "ArrowLeft") {
                    showLightboxImage(currentImage - 1);
                }

                if (event.key === "ArrowRight") {
                    showLightboxImage(currentImage + 1);
                }
            });
        }
    }
});