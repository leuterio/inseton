/* ─── Scroll: background gradient ────────────────────────── */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

function updateBackground() {
  const scrolled = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const t = maxScroll > 0 ? clamp(scrolled / maxScroll, 0, 1) : 0;

  const overlay = document.getElementById("bg-overlay");
  if (!overlay) return;

  let r, g, b, a;
  if (t < 0.45) {
    const t2 = t / 0.45;
    r = g = b = 8;
    a = lerp(0.88, 0.15, t2);
  } else {
    const t2 = clamp((t - 0.45) / 0.55, 0, 1);
    r = Math.round(lerp(8, 206, t2));
    g = Math.round(lerp(8, 255, t2));
    b = Math.round(lerp(8, 28, t2));
    a = lerp(0.15, 0.0, t2);
  }

  overlay.style.background = `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

window.addEventListener("scroll", updateBackground, { passive: true });
updateBackground();

/* ─── Mobile nav toggle ──────────────────────────────────── */
const navToggle = document.getElementById("navToggle");
const navLinks  = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ─── Smooth scroll offset for fixed nav ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const offset = 70;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ═══════════════════════════════════════════════════════════
   MUSIC PLAYER
   ═══════════════════════════════════════════════════════════ */

const TRACKS = [
  {
    title: "Filtro", year: "2025",
    src:   "assets/music/Singles/Filtro - 2025/Filtro.wav",
    cover: "assets/music/Singles/Filtro - 2025/CAPA SINGLE FILTRO 3000x3000.png",
  },
  {
    title: "pr3ç0", year: "2024",
    src:   "assets/music/Singles/pr3ç0 - 2024/pr3ç0.wav",
    cover: "assets/music/Singles/pr3ç0 - 2024/PR3Ç0_3000.jpg",
  },
  {
    title: "Agora (feat. Kael STN)", year: "2023",
    src:   "assets/music/Singles/Agora feat. Kael STN - 2023/Agora (feat. Kael Santana).wav",
    cover: "assets/music/Singles/Agora feat. Kael STN - 2023/Agora.png",
  },
  {
    title: "Agora", year: "2022",
    src:   "assets/music/Albuns/Montros Reais - EP - 2022/01 - Agora.wav",
    cover: "assets/music/Albuns/Montros Reais - EP - 2022/Monstros Reais.jpg",
  },
  {
    title: "Cometa", year: "2022",
    src:   "assets/music/Albuns/Montros Reais - EP - 2022/02 - Cometa.wav",
    cover: "assets/music/Albuns/Montros Reais - EP - 2022/Monstros Reais.jpg",
  },
  {
    title: "Enchente", year: "2022",
    src:   "assets/music/Albuns/Montros Reais - EP - 2022/03 - Enchente.wav",
    cover: "assets/music/Albuns/Montros Reais - EP - 2022/Monstros Reais.jpg",
  },
  {
    title: "Bug", year: "2022",
    src:   "assets/music/Albuns/Montros Reais - EP - 2022/04 - Bug.wav",
    cover: "assets/music/Albuns/Montros Reais - EP - 2022/Monstros Reais.jpg",
  },
  {
    title: "Soledad", year: "2022",
    src:   "assets/music/Albuns/Montros Reais - EP - 2022/05 - Soledad.wav",
    cover: "assets/music/Albuns/Montros Reais - EP - 2022/Monstros Reais.jpg",
  },
];

/* DOM refs */
const audio      = document.getElementById("audio-engine");
const gpPlayer   = document.getElementById("global-player");
const gpCover    = document.getElementById("gp-cover");
const gpTitle    = document.getElementById("gp-title");
const btnPlay    = document.getElementById("gp-play");
const btnPrev    = document.getElementById("gp-prev");
const btnNext    = document.getElementById("gp-next");
const iconPlay   = document.getElementById("icon-play");
const iconPause  = document.getElementById("icon-pause");
const seekBar    = document.getElementById("gp-seek");
const volBar     = document.getElementById("gp-vol");
const timeCur    = document.getElementById("gp-cur");
const timeDur    = document.getElementById("gp-dur");

let currentIndex = -1;
let isPlaying    = false;

/* Helpers */
function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function setRangePct(input, pct) {
  input.style.setProperty("--pct", `${pct}%`);
}

function setPlayIcon(playing) {
  gpPlayer.classList.toggle("is-playing", playing);
  isPlaying = playing;
}

function highlightCard(index) {
  document.querySelectorAll(".track-item").forEach((item) => {
    item.classList.toggle("is-playing", parseInt(item.dataset.index, 10) === index);
  });
}

/* Load track into player (doesn't start playback) */
function loadTrack(index) {
  const t = TRACKS[index];
  currentIndex = index;
  audio.src = encodeURI(t.src);
  gpCover.src = encodeURI(t.cover);
  gpTitle.textContent = t.title;
  gpPlayer.removeAttribute("hidden");
  document.body.classList.add("player-visible");
  timeCur.textContent = "0:00";
  timeDur.textContent = "0:00";
  seekBar.value = 0;
  setRangePct(seekBar, 0);
  highlightCard(index);
}

/* Play a specific track */
function playTrack(index) {
  if (index === currentIndex && audio.src) {
    togglePlay();
    return;
  }
  loadTrack(index);
  audio.play().then(() => setPlayIcon(true)).catch(() => {});
}

function togglePlay() {
  if (audio.paused) {
    audio.play().then(() => setPlayIcon(true)).catch(() => {});
  } else {
    audio.pause();
    setPlayIcon(false);
  }
}

/* Controls */
btnPlay.addEventListener("click", togglePlay);

btnPrev.addEventListener("click", () => {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const prev = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
  playTrack(prev);
});

btnNext.addEventListener("click", () => {
  const next = (currentIndex + 1) % TRACKS.length;
  playTrack(next);
});

/* Progress bar */
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  seekBar.value = pct;
  setRangePct(seekBar, pct);
  timeCur.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  timeDur.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
  setPlayIcon(false);
  const next = (currentIndex + 1) % TRACKS.length;
  playTrack(next);
});

audio.addEventListener("pause", () => {
  setPlayIcon(false);
  syncCardIcon(currentIndex, false);
});
audio.addEventListener("play",  () => {
  setPlayIcon(true);
  syncCardIcon(currentIndex, true);
});

function syncCardIcon(index, playing) {
  document.querySelectorAll(".track-item").forEach((item) => {
    if (parseInt(item.dataset.index, 10) !== index) return;
    item.classList.toggle("is-playing", playing);
  });
}

seekBar.addEventListener("input", () => {
  if (!audio.duration) return;
  const t = (seekBar.value / 100) * audio.duration;
  audio.currentTime = t;
  setRangePct(seekBar, parseFloat(seekBar.value));
});

/* Volume */
audio.volume = 0.8;
setRangePct(volBar, 80);

volBar.addEventListener("input", () => {
  audio.volume = parseFloat(volBar.value);
  setRangePct(volBar, parseFloat(volBar.value) * 100);
});

/* ─── Track item interactions ────────────────────────────── */
document.querySelectorAll(".track-item").forEach((item) => {
  const index = parseInt(item.dataset.index, 10);

  // Cover image → open popup (does not trigger play)
  const img = item.querySelector(".track-img");
  if (img) {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      openPopup(item.dataset.cover, item.dataset.title, item.dataset.year);
    });
  }

  // Play button → play/pause
  const playBtn = item.querySelector(".track-play-btn");
  if (playBtn) {
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playTrack(index);
    });
  }

  // Click on track name/info area → play/pause
  item.addEventListener("click", () => playTrack(index));
});

/* ─── Cover Popup ────────────────────────────────────────── */
const coverPopup    = document.getElementById("cover-popup");
const popupImg      = document.getElementById("popup-img");
const popupCaption  = document.getElementById("popup-caption");
const popupBg       = document.getElementById("popup-bg");
const popupClose    = document.getElementById("popup-close");

function openPopup(cover, title, year) {
  popupImg.src = encodeURI(cover);
  popupImg.alt = title;
  popupCaption.textContent = year ? `${title} — ${year}` : title;
  coverPopup.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}

function closePopup() {
  coverPopup.setAttribute("hidden", "");
  document.body.style.overflow = "";
  popupImg.src = "";
}

popupClose.addEventListener("click", closePopup);
popupBg.addEventListener("click", closePopup);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});

/* ─── Insects ────────────────────────────────────────────── */
const SPLAT_SVG = `<svg viewBox="0 0 56 24" xmlns="http://www.w3.org/2000/svg"
  fill="none" stroke-linecap="round" stroke-linejoin="round" overflow="visible">
  <!-- poça de sangue -->
  <ellipse cx="28" cy="12" rx="22" ry="13" fill="#8b0000" opacity="0.9"/>
  <!-- respingos -->
  <circle cx="54"  cy="-13" r="4.5" fill="#aa0000"/>
  <circle cx="-9"  cy="-9"  r="3"   fill="#aa0000"/>
  <circle cx="66"  cy="31"  r="5.5" fill="#990000"/>
  <circle cx="-13" cy="29"  r="4"   fill="#aa0000"/>
  <circle cx="29"  cy="-19" r="3"   fill="#cc0000"/>
  <circle cx="71"  cy="6"   r="3.5" fill="#bb0000"/>
  <circle cx="-4"  cy="40"  r="4"   fill="#aa0000"/>
  <circle cx="51"  cy="-20" r="2.5" fill="#dd0000"/>
  <circle cx="-19" cy="13"  r="2"   fill="#cc0000"/>
  <circle cx="73"  cy="19"  r="2.5" fill="#cc0000"/>
  <circle cx="40"  cy="-24" r="2"   fill="#dd0000"/>
  <!-- cabeça desmembrada (canto superior esquerdo) -->
  <circle cx="-13" cy="-15" r="4.5" fill="#111"/>
  <line x1="-11" y1="-18" x2="-7"  y2="-24" stroke="#111" stroke-width="1"/>
  <line x1="-14" y1="-19" x2="-19" y2="-25" stroke="#111" stroke-width="1"/>
  <!-- tórax desmembrado (canto superior direito) -->
  <circle cx="62" cy="-11" r="4" fill="#111"/>
  <!-- abdome desmembrado (canto inferior direito, rotacionado) -->
  <ellipse cx="69" cy="35" rx="10" ry="6" fill="#111"
    transform="rotate(-40 69 35)"/>
  <!-- patas espalhadas (6) -->
  <line x1="7"   y1="-11" x2="-4"  y2="-22" stroke="#111" stroke-width="1.5"/>
  <line x1="19"  y1="-15" x2="13"  y2="-26" stroke="#111" stroke-width="1.5"/>
  <line x1="56"  y1="39"  x2="65"  y2="48"  stroke="#111" stroke-width="1.5"/>
  <line x1="-9"  y1="33"  x2="-18" y2="42"  stroke="#111" stroke-width="1.5"/>
  <line x1="72"  y1="-3"  x2="80"  y2="-12" stroke="#111" stroke-width="1.5"/>
  <line x1="-16" y1="21"  x2="-26" y2="28"  stroke="#111" stroke-width="1.5"/>
</svg>`;

const ANT_SVG = `<svg viewBox="0 0 56 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
  stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
  <!-- abdomen -->
  <ellipse cx="11" cy="12" rx="10" ry="7"/>
  <!-- petiole -->
  <line x1="21" y1="12" x2="27" y2="12" stroke-width="2"/>
  <!-- thorax -->
  <circle cx="30" cy="12" r="4"/>
  <!-- head -->
  <circle cx="42" cy="12" r="5"/>
  <!-- antennae -->
  <line x1="45" y1="8"  x2="53" y2="2"  stroke-width="1"/>
  <line x1="46" y1="9"  x2="55" y2="7"  stroke-width="1"/>
  <!-- legs pair 1 (thorax front) -->
  <line x1="28" y1="10" x2="20" y2="4"  stroke-width="1"/>
  <line x1="28" y1="14" x2="20" y2="20" stroke-width="1"/>
  <!-- legs pair 2 (thorax mid) -->
  <line x1="30" y1="9"  x2="22" y2="2"  stroke-width="1"/>
  <line x1="30" y1="15" x2="22" y2="22" stroke-width="1"/>
  <!-- legs pair 3 (thorax back) -->
  <line x1="32" y1="10" x2="40" y2="4"  stroke-width="1"/>
  <line x1="32" y1="14" x2="40" y2="20" stroke-width="1"/>
</svg>`;

class Insect {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.28 + Math.random() * 0.32;
    this.turnAccel = 0;
    this.stepTimer = 0;

    this.el = document.createElement("div");
    this.el.className = "insect";
    this.el.innerHTML = ANT_SVG;

    // Slightly different walk cadence per insect
    const dur = (0.22 + Math.random() * 0.14).toFixed(2);
    this.el.style.setProperty("--walk-dur", `${dur}s`);
    // Offset animation phase
    this.el.querySelector("svg").style.animationDelay =
      `-${(Math.random() * parseFloat(dur)).toFixed(2)}s`;

    this.squashed = false;
    const svgEl = this.el.querySelector("svg");
    const doSquash = (e) => { e.stopPropagation(); this.squash(); };
    svgEl.addEventListener("click",      doSquash);
    svgEl.addEventListener("touchstart", doSquash, { passive: false });

    document.body.appendChild(this.el);
  }

  squash() {
    if (this.squashed) return;
    this.squashed = true;
    this.el.innerHTML = SPLAT_SVG;
    this.el.classList.add("squashed");
  }

  update() {
    if (this.squashed) return;

    this.stepTimer--;
    if (this.stepTimer <= 0) {
      this.turnAccel = (Math.random() - 0.5) * 0.12;
      this.stepTimer = Math.floor(Math.random() * 80) + 30;
    }
    this.angle   += this.turnAccel;
    this.turnAccel *= 0.94;

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Wrap around screen edges
    const pad = 60;
    if (this.x < -pad) this.x = window.innerWidth + pad;
    if (this.x > window.innerWidth  + pad) this.x = -pad;
    if (this.y < -pad) this.y = window.innerHeight + pad;
    if (this.y > window.innerHeight + pad) this.y = -pad;

    this.el.style.transform =
      `translate(${this.x}px,${this.y}px) rotate(${this.angle}rad)`;
  }
}

const insects = Array.from({ length: 7 }, () => new Insect());

(function tickInsects() {
  insects.forEach((ins) => ins.update());
  requestAnimationFrame(tickInsects);
})();

/* ─── CRT Glitch bars ────────────────────────────────────── */
function spawnGlitchBars() {
  const count = Math.floor(Math.random() * 6) + 1;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const bar      = document.createElement("div");
      const top      = Math.random() * 100;
      const height   = Math.random() * 8 + 1;
      const shift    = (Math.random() * 30 - 15).toFixed(1);
      const dur      = (Math.random() * 0.08 + 0.06).toFixed(3);
      const colors   = [
        "rgba(206,255,28,0.07)",
        "rgba(255,0,60,0.08)",
        "rgba(0,255,255,0.07)",
        "rgba(255,255,255,0.05)",
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      bar.className = "glitch-bar";
      bar.style.cssText =
        `top:${top}vh; height:${height}px; background:${color};` +
        `--shift:${shift}px; --dur:${dur}s;`;
      document.body.appendChild(bar);
      setTimeout(() => bar.remove(), parseFloat(dur) * 1000 + 50);
    }, i * 35);
  }

  // Ocasionalmente dispara um glitch mais intenso (tela inteira)
  if (Math.random() < 0.15) {
    setTimeout(() => {
      document.body.style.filter = "brightness(1.6) hue-rotate(5deg)";
      setTimeout(() => { document.body.style.filter = ""; }, 60);
    }, 80);
  }

  setTimeout(spawnGlitchBars, Math.random() * 3500 + 800);
}

setTimeout(spawnGlitchBars, 1500);

/* ─── Merch art popup ────────────────────────────────────── */
document.querySelectorAll(".merch-img-wrap[data-art]").forEach((wrap) => {
  wrap.style.cursor = "pointer";
  wrap.addEventListener("click", () => {
    openPopup(wrap.dataset.art, wrap.dataset.label, "");
  });
});

/* ─── Foto Popup ─────────────────────────────────────────── */
document.querySelectorAll(".foto").forEach((foto) => {
  foto.addEventListener("click", () => {
    const img = foto.querySelector("img");
    openPopup(img.src, "foto: Pedro Henrique Faria", "");
  });
});
