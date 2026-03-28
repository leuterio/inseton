/* ─── Glitch bars ────────────────────────────────────────── */
function spawnGlitch() {
  const count = Math.floor(Math.random() * 4) + 1;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const bar    = document.createElement("div");
      const top    = Math.random() * 100;
      const height = Math.random() * 6 + 1;
      const shift  = (Math.random() * 24 - 12).toFixed(1);
      const dur    = (Math.random() * 0.08 + 0.06).toFixed(3);
      const colors = [
        "rgba(206,255,28,0.07)",
        "rgba(255,0,60,0.08)",
        "rgba(0,255,255,0.07)",
        "rgba(255,255,255,0.05)",
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      Object.assign(bar.style, {
        position:        "fixed",
        left:            "0",
        right:           "0",
        top:             `${top}vh`,
        height:          `${height}px`,
        background:      color,
        mixBlendMode:    "screen",
        pointerEvents:   "none",
        zIndex:          "200",
        animation:       `glitch-bar ${dur}s forwards`,
        "--shift":       `${shift}px`,
      });
      document.body.appendChild(bar);
      setTimeout(() => bar.remove(), parseFloat(dur) * 1000 + 50);
    }, i * 35);
  }
  setTimeout(spawnGlitch, Math.random() * 4000 + 1200);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes glitch-bar {
    0%   { opacity:1;   transform:translateX(0); }
    40%  { opacity:0.7; transform:translateX(var(--shift,12px)); }
    70%  { opacity:0.4; transform:translateX(calc(var(--shift,12px)*-0.4)); }
    100% { opacity:0;   transform:translateX(0); }
  }
`;
document.head.appendChild(style);

setTimeout(spawnGlitch, 1500);
