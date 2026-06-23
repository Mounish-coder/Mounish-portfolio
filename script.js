// ── Requires GSAP + ScrollTrigger (loaded via CDN in <head>) ──
gsap.registerPlugin(ScrollTrigger);

// ────────────────────────────────────────────────
// 0. UTILITY
// ────────────────────────────────────────────────
const ease = "power3.out";

// ────────────────────────────────────────────────
// 1. SCROLL PROGRESS BAR
// ────────────────────────────────────────────────
const fill = document.getElementById("scrollFill");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  fill.style.width = (scrollY / max * 100) + "%";
}, { passive: true });

// ────────────────────────────────────────────────
// 2. NAV — scroll-aware + active section
// ────────────────────────────────────────────────
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", scrollY > 40);
}, { passive: true });

const sections = document.querySelectorAll("section[id]");
const navLinks  = document.querySelectorAll(".nav-lnk");
const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => {
        l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id);
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => navObs.observe(s));

// ────────────────────────────────────────────────
// 3. MOBILE DRAWER
// ────────────────────────────────────────────────
const burger  = document.getElementById("burger");
const drawer  = document.getElementById("drawer");
let open = false;
const toggleDrawer = () => {
  open = !open;
  burger.classList.toggle("open", open);
  drawer.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", toggleDrawer);
drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  if (open) toggleDrawer();
}));

// ────────────────────────────────────────────────
// 4. HERO WORD-SPLIT ENTRANCE (GSAP)
// ────────────────────────────────────────────────
// Wrap every .word's text in a .word-inner span for clip animation
document.querySelectorAll(".word").forEach(word => {
  const inner = document.createElement("span");
  inner.className = "word-inner";
  inner.textContent = word.textContent;
  word.textContent = "";
  word.style.overflow = "hidden";
  word.style.display = "inline-block";
  word.appendChild(inner);
});

// Animate on load
gsap.to(".word-inner", {
  y: 0,
  duration: 1.0,
  ease,
  stagger: 0.07,
  delay: 0.2
});

// Chip
gsap.to(".reveal-chip", { opacity: 1, y: 0, duration: 0.8, ease, delay: 0.0 });
// Subtitle + buttons
gsap.to(".hero-sub",  { opacity: 1, y: 0, duration: 0.8, ease, delay: 0.65 });
gsap.to(".hero-btns", { opacity: 1, y: 0, duration: 0.8, ease, delay: 0.78 });
gsap.to(".stat-row",  { opacity: 1, y: 0, duration: 0.8, ease, delay: 0.9  });

// Make hero-sub / hero-btns / stat-row visible (they start hidden via .reveal-up)
document.querySelector(".hero-sub")?.classList.add("reveal-up");
document.querySelector(".hero-btns")?.classList.add("reveal-up");

// ────────────────────────────────────────────────
// 5. SCROLL-TRIGGERED REVEALS (GSAP ScrollTrigger)
// ────────────────────────────────────────────────
// Generic upward reveal
gsap.utils.toArray(".reveal-up").forEach(el => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease,
    delay: parseFloat(getComputedStyle(el).getPropertyValue("--d") || "0"),
    scrollTrigger: {
      trigger: el,
      start: "top 90%",
      toggleActions: "play none none none"
    }
  });
});

// Glass card stagger reveal
gsap.utils.toArray(".reveal-card").forEach(el => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.95,
    ease,
    delay: parseFloat(getComputedStyle(el).getPropertyValue("--d") || "0"),
    scrollTrigger: {
      trigger: el,
      start: "top 88%",
      toggleActions: "play none none none"
    }
  });
});

// Project showcase reveal
gsap.utils.toArray(".reveal-proj").forEach((el, i) => {
  const dir = (el.classList.contains("proj-alt") || el.id === "cs-02") ? 80 : -80;
  
  const visual = el.querySelector(".proj-visual") || el.querySelector(".cs-sidebar");
  const info = el.querySelector(".proj-info") || el.querySelector(".cs-narrative");
  
  if(visual) {
    gsap.fromTo(visual,
      { opacity: 0, x: dir },
      {
        opacity: 1, x: 0,
        duration: 1.1, ease,
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" }
      }
    );
  }
  if(info) {
    gsap.fromTo(info,
      { opacity: 0, x: -dir * 0.5 },
      {
        opacity: 1, x: 0,
        duration: 1.1, ease, delay: 0.15,
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" }
      }
    );
  }
});

// ────────────────────────────────────────────────
// 6. PARALLAX ON HERO ORB
// ────────────────────────────────────────────────
gsap.to(".orb-1", {
  y: -80,
  ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

// ────────────────────────────────────────────────
// 7. 3-D TILT ON AVATAR + CONTACT CARDS
// ────────────────────────────────────────────────
function addTilt(el, intensity = 10) {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    gsap.to(el, {
      rotateX: -y * intensity,
      rotateY:  x * intensity,
      scale: 1.025,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 900
    });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease });
  });
}
const avatarWrap = document.getElementById("avatarWrap");
if (avatarWrap) addTilt(avatarWrap, 12);
document.querySelectorAll(".c-card").forEach(c => addTilt(c, 5));
document.querySelectorAll(".skill-card").forEach(c => addTilt(c, 4));

// ────────────────────────────────────────────────
// 8. MAGNETIC BUTTONS
// ────────────────────────────────────────────────
document.querySelectorAll(".mag").forEach(el => {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.18;
    const y = (e.clientY - r.top  - r.height / 2) * 0.18;
    gsap.to(el, { x, y, duration: 0.35, ease: "power2.out" });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease });
  });
});

// ────────────────────────────────────────────────
// 9. COPY TO CLIPBOARD
// ────────────────────────────────────────────────
const toast = document.getElementById("toast");
document.querySelectorAll("[data-copy]").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2000);
    });
  });
});
