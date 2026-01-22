const panels = document.querySelectorAll(".panel");
const scrollBtns = document.querySelectorAll(".scroll-btn");
const scrollIndicator = document.getElementById("scrollIndicator");

let vh = window.innerHeight;
const BASE_SCROLL = vh * 4;
const SECTIONS_SCROLL_MULTIPLIER = 2; // Extra scroll time for non-landing sections

// Responsive positioning: sections centered based on viewport height
function getSectionTop() {
  const isMobile = window.innerWidth < 600;
  const isTablet = window.innerWidth < 900;
  
  if (isMobile) {
    return 35; // Mobile: 35% from top
  } else if (isTablet) {
    return 38; // Tablet: 38% from top
  } else {
    return 32; // Desktop: 32% from top
  }
}

// --- Measure panels ---
const panelData = [];

panels.forEach(panel => {
  panel.style.visibility = "hidden";
  panel.style.opacity = 1;
  panel.style.transform = "translate(-50%, 0) scale(1)";

  const height = panel.offsetHeight;

  // Extra readable distance for tall panels
  const hold = Math.max(0, height - vh * 0.7);

  panelData.push({ hold });

  panel.style.visibility = "";
});

// --- Total scroll height ---
let totalScroll = 0;
const scrollAmounts = [];
panelData.forEach((d, index) => {
  const sectionScroll = index === 0 ? BASE_SCROLL : BASE_SCROLL * SECTIONS_SCROLL_MULTIPLIER;
  scrollAmounts.push(sectionScroll);
  totalScroll += sectionScroll + d.hold;
});
document.body.style.height = `${totalScroll}px`;

// --- Scroll indicator ---
function updateScrollIndicator() {
  if (!scrollIndicator) return;
  
  const scrollY = window.scrollY;
  const threshold = vh * 0.5;
  
  if (scrollY < threshold && window.innerWidth >= 600) {
    scrollIndicator.classList.add("visible");
  } else {
    scrollIndicator.classList.remove("visible");
  }
}

// --- Scroll buttons ---
scrollBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    let offset = 0;
    for (let i = 0; i <= index; i++) {
      offset += scrollAmounts[i] + panelData[i].hold;
    }

    const sectionTop = getSectionTop();
    const scrollOffset = window.innerWidth < 600 ? vh * 0.45 : vh * 0.5;
    
    window.scrollTo({
      top: offset + scrollOffset * 8,
      behavior: "smooth"
    });
  });
});

// --- Animation ---
function updatePanels() {
  const scrollY = window.scrollY;
  const sectionTop = getSectionTop();
  let accumulated = 0;

  panels.forEach((panel, index) => {
    const { hold } = panelData[index];
    const sectionScroll = scrollAmounts[index];

    const start = accumulated;
    const end = start + sectionScroll + hold;

    const localScroll = scrollY - start;
    const maxScroll = sectionScroll + hold;

    const clamped = Math.min(Math.max(localScroll, 0), maxScroll);
    const progress = clamped / maxScroll;

    let opacity = 0;
    let scale = 1;
    let y = 60 - progress * 120;

    if (index === 0) {
      // LANDING
      const eased = 1 - Math.cos(progress * Math.PI / 2);
      opacity = 1 - eased;
      scale = 1.25 - eased * 0.25;
      y = -eased * 60;
    } else {
      // ENTRY fade-in with smoother, more visible animation
      if (progress < 0.35) {
        const eased = progress / 0.35;
        opacity = eased;
        scale = 0.6 + eased * 0.75;
      } else {
        opacity = 1;
        scale = 1.35;
      }

      // CONTENT-AWARE FADE OUT
      const fadeDelay = hold / maxScroll;
      const fadeStart = 0.8 + fadeDelay * 0.4;

      if (progress > fadeStart) {
        const p = (progress - fadeStart) / (1 - fadeStart);
        const eased = Math.max(0, 1 - p);

        opacity = eased;
        scale = 0.6 + eased * 0.75;
      }
    }

    panel.style.opacity = opacity;
    panel.style.transform = `translate(-50%, ${y}vh) scale(${scale})`;
    panel.style.top = `${sectionTop}%`;

    accumulated = end;
  });
}

// Handle resize
window.addEventListener("resize", () => {
  vh = window.innerHeight;
  updatePanels();
});

// Scroll events
window.addEventListener("scroll", () => {
  updatePanels();
  updateScrollIndicator();
});

// Initialize
updatePanels();
updateScrollIndicator();

