document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".lab-summary-card");
    const tabsSection = document.querySelector(".labs-section");
    const tabsScroll = document.querySelector(".lab-tabs-scroll");
    const tabs = document.querySelectorAll("[data-bs-target]");
    const panes = document.querySelectorAll("#labTabsContent > .tab-pane");

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

            if (scroll) {
                focusTab(tab);
            }
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

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            activateTab(this);
        });
    });

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
});