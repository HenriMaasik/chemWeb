const panels = document.querySelectorAll(".panel");
const scrollBtns = document.querySelectorAll(".scroll-btn");

const vh = window.innerHeight;
const BASE_SCROLL = vh * 4;

// --- Measure panels ---
const panelData = [];

panels.forEach(panel => {
  panel.style.visibility = "hidden";
  panel.style.opacity = 1;
  panel.style.transform = "translate(-50%, 0) scale(1)";

  const height = panel.offsetHeight;

  // Extra readable distance for tall panels
  const hold = Math.max(0, height - vh * 0.8);

  panelData.push({ hold });

  panel.style.visibility = "";
});

// --- Total scroll height ---
let totalScroll = 0;
panelData.forEach(d => totalScroll += BASE_SCROLL + d.hold);
document.body.style.height = `${totalScroll}px`;

// --- Scroll buttons ---
scrollBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    let offset = 0;
    for (let i = 0; i <= index; i++) {
      offset += BASE_SCROLL + panelData[i].hold;
    }

    window.scrollTo({
      top: offset + vh * 0.6,
      behavior: "smooth"
    });
  });
});

// --- Animation ---
function updatePanels() {
  const scrollY = window.scrollY;
  let accumulated = 0;

  panels.forEach((panel, index) => {
    const { hold } = panelData[index];

    const start = accumulated;
    const end = start + BASE_SCROLL + hold;

    const localScroll = scrollY - start;
    const maxScroll = BASE_SCROLL + hold;

    const clamped = Math.min(Math.max(localScroll, 0), maxScroll);
    const progress = clamped / maxScroll;

    let opacity = 0;
    let scale = 1;
    let y = 60 - progress * 120; // ← movement stays unchanged

    if (index === 0) {
      // LANDING (unchanged)
      const eased = 1 - Math.cos(progress * Math.PI / 2);
      opacity = 1 - eased;
      scale = 1.25 - eased * 0.25;
      y = -eased * 60;
    } else {
      // ENTRY fade-in with smoother, more visible animation
      if (progress < 0.35) {
        const eased = progress / 0.35;
        opacity = eased;
        scale = 0.6 + eased * 0.75; // Start at 0.6, end at 1.35
      } else {
        opacity = 1;
        scale = 1.35;
      }

      // --- CONTENT-AWARE FADE OUT ---
      const fadeDelay = hold / maxScroll;
      const fadeStart = 0.6 + fadeDelay * 0.4;

      if (progress > fadeStart) {
        const p = (progress - fadeStart) / (1 - fadeStart);
        const eased = Math.max(0, 1 - p);

        opacity = eased;
        scale = 0.6 + eased * 0.75; // Match entry scale range
      }
    }

    panel.style.opacity = opacity;
    panel.style.transform = `translate(-50%, ${y}vh) scale(${scale})`;

    accumulated = end;
  });
}

window.addEventListener("scroll", updatePanels);
updatePanels();
