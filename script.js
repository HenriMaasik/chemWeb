const panels = document.querySelectorAll(".panel");
const scrollBtns = document.querySelectorAll(".scroll-btn");

const vh = window.innerHeight;
const SCROLL_PER_SECTION = vh * 4; // slower scroll animation for sections

// total scroll height to show all sections
document.body.style.height = `${(panels.length - 0.05) * SCROLL_PER_SECTION}px`;

// scroll-down buttons
scrollBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const targetSection = index + 1;
    if (targetSection < panels.length) {
      window.scrollTo({
        top: SCROLL_PER_SECTION * (targetSection + 0.6),
        behavior: "smooth"
      });
    }
  });
});

function updatePanels() {
  const scrollY = window.scrollY;

  panels.forEach((panel, index) => {
    // each section has a full scroll block
    const start = index * SCROLL_PER_SECTION;
    const progress = (scrollY - start) / SCROLL_PER_SECTION;

    let opacity, scale, y;

    if (index === 0) {
      // Landing section: centered at top of page, moves UP as scrolling
      // Full animation range: scrollY=0 to scrollY=SCROLL_PER_SECTION
      if (progress <= 0) {
        // Before landing section (page just loaded)
        opacity = 1;
        scale = 1.25;
        y = 0;
      } else if (progress >= 1) {
        // After landing section (scrolled past)
        opacity = 0;
        scale = 1;
        y = -60;
      } else {
        // During landing animation: move up and fade out
        // Use eased progress for smoother animation
        const easedProgress = 1 - Math.cos(progress * Math.PI / 2);
        opacity = 1 - easedProgress;
        scale = 1.25 - easedProgress * 0.25;
        y = -easedProgress * 60;
      }
    } else {
      // Other sections: come from bottom, go to center, then exit
      if (progress <= 0) {
        // Before this section
        opacity = 0;
        scale = 0.85;
        y = 60;
      } else if (progress >= 1) {
        // After this section
        opacity = 0;
        scale = 1;
        y = -60;
      } else {
        // During this section animation
        const curve = Math.sin(progress * Math.PI);
        opacity = curve;
        scale = 0.85 + curve * 0.4;
        y = 60 - progress * 120;
      }
    }

    panel.style.opacity = opacity;
    panel.style.transform = `translate(-50%, ${y}vh) scale(${scale})`;
  });
}

window.addEventListener("scroll", updatePanels);

// Initialize panels on page load
updatePanels();
