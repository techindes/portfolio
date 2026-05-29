/* ---------- interactive dot grid (canvas) ---------- */
const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
let w, h, dots = [];
const mouse = { x: -999, y: -999 };
const finePointer = window.matchMedia("(pointer: fine)").matches;
const GAP = window.innerWidth < 640 ? 60 : 46;

function buildGrid() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  dots = [];
  for (let x = GAP; x < w; x += GAP) {
    for (let y = GAP; y < h; y += GAP) {
      dots.push({ x, y });
    }
  }
}
window.addEventListener("resize", buildGrid);
buildGrid();

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function drawGrid() {
  ctx.clearRect(0, 0, w, h);
  for (const d of dots) {
    const dx = d.x - mouse.x;
    const dy = d.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const near = Math.max(0, 1 - dist / 150);
    const r = 1 + near * 2.5;
    ctx.beginPath();
    ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 77, 28, ${0.12 + near * 0.55})`;
    ctx.fill();
  }
  if (finePointer) requestAnimationFrame(drawGrid);
}
drawGrid();
// on touch devices the grid is static, so redraw once after a resize
if (!finePointer) window.addEventListener("resize", () => { buildGrid(); drawGrid(); });

/* ---------- cursor glow ---------- */
const glow = document.querySelector(".cursor-glow");
window.addEventListener("mousemove", (e) => {
  glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  glow.style.opacity = "1";
});
window.addEventListener("mouseleave", () => (glow.style.opacity = "0"));

/* ---------- role rotator ---------- */
const phrases = [
  "software that works",
  "Python tooling",
  "systems-level code",
  "tools people rely on",
  "with finance in mind",
];
const rotator = document.getElementById("rotator");
let pi = 0;
setInterval(() => {
  if (!rotator) return;
  rotator.style.opacity = "0";
  setTimeout(() => {
    pi = (pi + 1) % phrases.length;
    rotator.textContent = phrases[pi];
    rotator.style.opacity = "1";
  }, 300);
}, 2600);

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll("[data-reveal]");
const revObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("in"), i * 60);
        revObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => revObserver.observe(el));

/* ---------- animated counters ---------- */
const counters = document.querySelectorAll("[data-count]");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals);
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
counters.forEach((c) => countObserver.observe(c));

/* ---------- nav: scrolled state + active link ---------- */
const nav = document.querySelector("nav");
const sections = document.querySelectorAll("section[id], header[id]");
const navLinks = document.querySelectorAll(".nav-links a");
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 30);
  toTop.classList.toggle("show", y > 600);

  let current = "";
  sections.forEach((sec) => {
    if (y >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
});

toTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

/* ---------- mobile nav toggle ---------- */
const navToggle = document.getElementById("navToggle");
const navLinksEl = document.getElementById("navLinks");
if (navToggle && navLinksEl) {
  navToggle.addEventListener("click", () => {
    const open = navLinksEl.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  // close the menu after tapping a link
  navLinksEl.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinksEl.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* ---------- pointer-only effects (skip on touch devices) ---------- */
const isFinePointer = window.matchMedia("(pointer: fine)").matches;

if (isFinePointer) {
  /* magnetic buttons */
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });
} else {
  /* hide the cursor glow on touch */
  if (glow) glow.style.display = "none";
}
