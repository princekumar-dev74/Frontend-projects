// effect from awwwards SOTD | 2025-08-26
// https://compsych.konpo.co/

const panes = gsap.utils.toArray(".pane");
const panesContainer = document.getElementById("panes-container");
const containerWidth = panesContainer.offsetWidth;
const rootElement = document.documentElement;
const images = gsap.utils.toArray("img");

const themes = [
  {
    mainBg: "#b9dcff",
    subBg: "#f2fbfe",
    text: "#070f36",
    title: "#8dc9f4"
  },
  {
    mainBg: "#fff58c",
    subBg: "#fbf1ed",
    text: "#9c4e23",
    title: "#9c4e23"
  },
  {
    mainBg: "#c4ffb2",
    subBg: "#f1ffec",
    text: "#164c3b",
    title: "#164c3b"
  }
];

const thresholds = new Array(panes.length)
  .fill(0)
  .map((_, i) => parseFloat(((1 / panes.length) * i).toFixed(2)));

let activeThemeIndex = 0;

gsap.set(panes, {
  width: containerWidth / panes.length
});

const paneWidth = panes[0].offsetWidth;

gsap.to(panes, {
  x: -paneWidth * (panes.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: panesContainer,
    pin: true,
    scrub: 1,
    onUpdate: (self) => {
      const progress = parseFloat(self.progress.toFixed(2));
      const themeIndex = thresholds.findLastIndex(
        (threshold) => progress >= threshold
      );
      if (themeIndex === activeThemeIndex) return;
      activeThemeIndex = themeIndex;
      updateTheme(themeIndex);
    },
    end: () => "+=" + containerWidth
  }
});

function updateTheme(themeIndex) {
  const theme = themes[themeIndex];

  gsap.to(document.documentElement, {
    "--theme-main-bg": theme.mainBg,
    "--theme-sub-bg": theme.subBg,
    "--theme-title": theme.title,
    "--theme-text": theme.text,
    duration: 1,
    ease: "power2.out"
  });
}
