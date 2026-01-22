const panels = document.querySelectorAll(".panel");
const scrollBtns = document.querySelectorAll(".scroll-btn");
const scrollIndicator = document.getElementById("scrollIndicator");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const backToTop = document.getElementById("backToTop");
const progressBar = document.getElementById("progressBar");

let vh = window.innerHeight;
const BASE_SCROLL = vh * 4;
const SECTIONS_SCROLL_MULTIPLIER = 2; // Extra scroll time for non-landing sections

// Search content data
const searchContent = [
  { title: "Kuidas aitab keemia kaitsta keskkonda?", section: "Landing", keywords: ["keemia", "keskkond", "chemistry", "environment"] },
  { title: "Miks on keemia keskkonna kaitsel oluline?", section: "Section 1", keywords: ["keskkonnaprobleemid", "pollution", "climate change", "waste", "depletion"] },
  { title: "Keskkonnaprobleemid", section: "Section 1", keywords: ["industrial emissions", "greenhouse gases", "landfills", "oceans", "natural materials"] },
  { title: "Chemistry's Role", section: "Section 1", keywords: ["detecting", "pollutants", "transforming", "eco-friendly", "sustainable"] },
  { title: "Green Chemistry", section: "Section 2", keywords: ["green chemistry", "sustainable", "principles"] },
  { title: "12 Principles of Green Chemistry", section: "Section 2", keywords: ["prevention", "atom economy", "hazardous", "solvents", "energy", "renewable"] },
  { title: "Water Purification", section: "Section 3", keywords: ["water", "purification", "filtration", "chlorination"] },
  { title: "Air Pollution Control", section: "Section 4", keywords: ["air", "pollution", "catalytic converters", "emissions"] },
  { title: "Catalytic Converters", section: "Section 4", keywords: ["catalysts", "CO", "NOx", "exhaust"] },
];

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

// --- Back to Top Button ---
function updateBackToTop() {
  if (!backToTop) return;
  
  const scrollY = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  if (scrollY > vh * 0.5) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
}

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// --- Progress Tracker ---
function updateProgressBar() {
  if (!progressBar) return;
  
  const scrollY = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollY / scrollHeight) * 100;
  
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

// --- Search Functionality ---
function performSearch(query) {
  if (!query || query.length < 2) {
    if (searchResults) {
      searchResults.classList.remove("active");
    }
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  const results = searchContent.filter(item => {
    return item.title.toLowerCase().includes(lowerQuery) ||
           item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
           item.section.toLowerCase().includes(lowerQuery);
  });
  
  displaySearchResults(results);
}

function displaySearchResults(results) {
  if (!searchResults) return;
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item"><span class="result-title">No results found</span></div>';
  } else {
    searchResults.innerHTML = results.map(item => `
      <div class="search-result-item" data-section="${item.section}">
        <span class="result-title">${item.title}</span>
        <span class="result-section">${item.section}</span>
      </div>
    `).join("");
    
    // Add click handlers
    searchResults.querySelectorAll(".search-result-item").forEach(item => {
      item.addEventListener("click", () => {
        const sectionName = item.dataset.section;
        const sectionIndex = getSectionIndex(sectionName);
        if (sectionIndex >= 0) {
          scrollToSection(sectionIndex);
          if (searchInput) searchInput.value = "";
          searchResults.classList.remove("active");
        }
      });
    });
  }
  
  searchResults.classList.add("active");
}

function getSectionIndex(sectionName) {
  const mapping = {
    "Landing": 0,
    "Section 1": 1,
    "Section 2": 2,
    "Section 3": 3,
    "Section 4": 4
  };
  return mapping[sectionName] ?? 0;
}

function scrollToSection(index) {
  let offset = 0;
  for (let i = 0; i <= index; i++) {
    offset += scrollAmounts[i] + panelData[i].hold;
  }
  
  const scrollOffset = window.innerWidth < 600 ? vh * 0.45 : vh * 0.5;
  
  window.scrollTo({
    top: offset + scrollOffset,
    behavior: "smooth"
  });
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    performSearch(e.target.value);
  });
  
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.length >= 2) {
      performSearch(searchInput.value);
    }
  });
}

// Close search results when clicking outside
document.addEventListener("click", (e) => {
  if (searchInput && !searchInput.contains(e.target) && searchResults && !searchResults.contains(e.target)) {
    searchResults.classList.remove("active");
  }
});

// --- Scroll buttons ---
scrollBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    scrollToSection(index);
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

// --- Progress Saving (localStorage) ---
function saveProgress() {
  const scrollY = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollY / scrollHeight;
  
  localStorage.setItem("chemWebProgress", progress);
}

function loadProgress() {
  const savedProgress = localStorage.getItem("chemWebProgress");
  if (savedProgress) {
    const progress = parseFloat(savedProgress);
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = progress * scrollHeight;
    
    // Only restore if it makes sense (not at the very beginning)
    if (progress > 0.05) {
      setTimeout(() => {
        window.scrollTo({
          top: scrollY,
          behavior: "auto"
        });
      }, 100);
    }
  }
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
  updateBackToTop();
  updateProgressBar();
  saveProgress();
});

// Initialize
updatePanels();
updateScrollIndicator();
updateBackToTop();
loadProgress();

