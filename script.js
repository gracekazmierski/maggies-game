/* ============================================================
   Mini Game Collection — script.js
   ============================================================ */

(function () {
  "use strict";

  // ── State Machine ──
  const screens = [
    "welcome-screen",
    "ski-screen",
    "dino-screen",
    "match-screen",
    "celebration-screen",
    "final-screen",
  ];
  let currentScreen = 0;

  function showScreen(index) {
    screens.forEach((id, i) => {
      document.getElementById(id).classList.toggle("active", i === index);
    });
    currentScreen = index;
  }

  function nextScreen() {
    const next = currentScreen + 1;
    if (next < screens.length) {
      showScreen(next);
      return screens[next];
    }
  }

  // Prevent Enter key from clicking focused buttons (avoids skipping screens)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement && document.activeElement.tagName === "BUTTON") {
      e.preventDefault();
    }
  });

  // ── Welcome ──
  document.getElementById("start-btn").addEventListener("click", () => {
    nextScreen();
    startSkiGame();
  });

  // ================================================================
  // BACKGROUND RENDERERS
  // ================================================================

  // Animated ski background — large snowflakes, glowing sparkles, mountain silhouettes
  let skiBgRaf = null;
  function initSkiBg() {
    if (skiBgRaf) { cancelAnimationFrame(skiBgRaf); skiBgRaf = null; }
    const canvas = document.getElementById("ski-bg");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width;
    const H = canvas.height;

    // Large slow-falling snowflakes in the background
    const FLAKE_COUNT = 55;
    const flakes = Array.from({ length: FLAKE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 2 + Math.random() * 5,
      speed: 0.4 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 0.4,
      opacity: 0.25 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }));

    // Sparkle glints that appear and fade
    const SPARKLE_COUNT = 22;
    const sparkles = Array.from({ length: SPARKLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      life: Math.random(),
      speed: 0.004 + Math.random() * 0.006,
      size: 2 + Math.random() * 4,
    }));

    function drawMountains() {
      // Far mountains — pale
      ctx.fillStyle = "rgba(200,218,205,0.5)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.52);
      ctx.lineTo(W * 0.12, H * 0.30);
      ctx.lineTo(W * 0.28, H * 0.48);
      ctx.lineTo(W * 0.44, H * 0.24);
      ctx.lineTo(W * 0.60, H * 0.45);
      ctx.lineTo(W * 0.75, H * 0.20);
      ctx.lineTo(W * 0.88, H * 0.38);
      ctx.lineTo(W, H * 0.28);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Near mountains — slightly deeper
      ctx.fillStyle = "rgba(185,208,192,0.55)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.70);
      ctx.lineTo(W * 0.18, H * 0.52);
      ctx.lineTo(W * 0.35, H * 0.68);
      ctx.lineTo(W * 0.52, H * 0.48);
      ctx.lineTo(W * 0.68, H * 0.64);
      ctx.lineTo(W * 0.82, H * 0.50);
      ctx.lineTo(W, H * 0.62);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Snow caps on far peaks
      const peaks = [
        { x: W * 0.12, y: H * 0.30 },
        { x: W * 0.44, y: H * 0.24 },
        { x: W * 0.75, y: H * 0.20 },
      ];
      peaks.forEach(({ x, y }) => {
        ctx.fillStyle = "rgba(240,248,240,0.55)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - W * 0.06, y + H * 0.10);
        ctx.lineTo(x + W * 0.06, y + H * 0.10);
        ctx.closePath();
        ctx.fill();
      });
    }

    function tick(t) {
      ctx.clearRect(0, 0, W, H);

      drawMountains();

      // Snowflakes
      flakes.forEach((f) => {
        f.y += f.speed;
        f.x += f.drift + Math.sin(t * 0.0008 + f.phase) * 0.3;
        if (f.y > H + 10) { f.y = -10; f.x = Math.random() * W; }
        if (f.x > W + 10) f.x = -10;
        if (f.x < -10) f.x = W + 10;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
      });

      // Sparkles
      sparkles.forEach((s) => {
        s.life += s.speed;
        if (s.life > 1) {
          s.life = 0;
          s.x = Math.random() * W;
          s.y = Math.random() * H;
        }
        const alpha = s.life < 0.5 ? s.life * 2 : (1 - s.life) * 2;
        const sz = s.size * alpha;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
        // Four-point star
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.ellipse(0, 0, sz * 0.18, sz, 0, (Math.PI / 2) * i, (Math.PI / 2) * i + Math.PI);
          ctx.fill();
        }
        ctx.restore();
      });

      skiBgRaf = requestAnimationFrame(tick);
    }

    skiBgRaf = requestAnimationFrame(tick);
  }

  // Soft snowfall + mountain silhouettes for welcome
  function initWelcomeBg() {
    const canvas = document.getElementById("welcome-bg");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    // Snowflakes
    const flakes = [];
    for (let i = 0; i < 60; i++) {
      flakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random() * 2.5,
        speed: 0.3 + Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 0.4,
        opacity: 0.15 + Math.random() * 0.3,
      });
    }

    function drawMountains() {
      // Far mountains
      ctx.fillStyle = "#c2d4c0";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.55);
      ctx.lineTo(w * 0.15, h * 0.42);
      ctx.lineTo(w * 0.3, h * 0.52);
      ctx.lineTo(w * 0.45, h * 0.38);
      ctx.lineTo(w * 0.6, h * 0.48);
      ctx.lineTo(w * 0.75, h * 0.35);
      ctx.lineTo(w * 0.9, h * 0.45);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Snow caps
      ctx.fillStyle = "#e4ede2";
      ctx.beginPath();
      ctx.moveTo(w * 0.45 - 20, h * 0.38 + 18);
      ctx.lineTo(w * 0.45, h * 0.38);
      ctx.lineTo(w * 0.45 + 20, h * 0.38 + 18);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.75 - 22, h * 0.35 + 20);
      ctx.lineTo(w * 0.75, h * 0.35);
      ctx.lineTo(w * 0.75 + 22, h * 0.35 + 20);
      ctx.closePath();
      ctx.fill();

      // Near hills
      ctx.fillStyle = "#b5ccb3";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.7);
      ctx.quadraticCurveTo(w * 0.25, h * 0.58, w * 0.5, h * 0.68);
      ctx.quadraticCurveTo(w * 0.75, h * 0.78, w, h * 0.65);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Tiny scattered trees on hills
      const treePositions = [
        [w * 0.08, h * 0.68], [w * 0.18, h * 0.64], [w * 0.28, h * 0.62],
        [w * 0.42, h * 0.66], [w * 0.55, h * 0.67], [w * 0.65, h * 0.72],
        [w * 0.78, h * 0.68], [w * 0.88, h * 0.66], [w * 0.35, h * 0.63],
        [w * 0.7, h * 0.7], [w * 0.92, h * 0.67],
      ];
      treePositions.forEach(([tx, ty]) => {
        drawSmallTree(ctx, tx, ty, 8 + Math.random() * 6);
      });
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#dce8da");
      grad.addColorStop(0.5, "#e4ede2");
      grad.addColorStop(1, "#eaf2e8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      drawMountains();

      // Snowflakes
      flakes.forEach((f) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        if (f.x < -5) f.x = w + 5;
        if (f.x > w + 5) f.x = -5;
      });

      requestAnimationFrame(frame);
    }
    frame();
  }

  // Static prehistoric background for dino game (no animation)
  function initDinoBg() {
    const canvas = document.getElementById("dino-bg");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    // Gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#c8ddc0");
    grad.addColorStop(0.4, "#d5e4cc");
    grad.addColorStop(1, "#e0ebda");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Rolling hills in back
    ctx.fillStyle = "#b8ceae";
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.75);
    ctx.quadraticCurveTo(w * 0.2, h * 0.65, w * 0.4, h * 0.72);
    ctx.quadraticCurveTo(w * 0.6, h * 0.8, w * 0.8, h * 0.7);
    ctx.quadraticCurveTo(w * 0.95, h * 0.64, w, h * 0.72);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Ground
    ctx.fillStyle = "#aec4a4";
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.85);
    ctx.quadraticCurveTo(w * 0.3, h * 0.82, w * 0.5, h * 0.86);
    ctx.quadraticCurveTo(w * 0.7, h * 0.9, w, h * 0.84);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Ferns / plants along bottom
    for (let i = 0; i < 14; i++) {
      const px = (i / 14) * w + Math.sin(i * 2.3) * 20;
      const py = h * 0.84 + Math.sin(i * 1.7) * 8;
      drawFern(ctx, px, py, 14 + Math.sin(i) * 6);
    }

    // Background trees (tall, thin)
    const treePosB = [
      [w * 0.05, h * 0.74], [w * 0.15, h * 0.7], [w * 0.3, h * 0.72],
      [w * 0.5, h * 0.73], [w * 0.65, h * 0.71], [w * 0.8, h * 0.69],
      [w * 0.92, h * 0.72], [w * 0.42, h * 0.7], [w * 0.72, h * 0.74],
    ];
    treePosB.forEach(([tx, ty]) => {
      drawPalmTree(ctx, tx, ty, 20 + Math.random() * 10);
    });

    // Rocks
    const rockPos = [
      [w * 0.12, h * 0.88], [w * 0.45, h * 0.9], [w * 0.78, h * 0.87],
      [w * 0.6, h * 0.92], [w * 0.25, h * 0.91],
    ];
    rockPos.forEach(([rx, ry]) => {
      ctx.fillStyle = "#99b094";
      ctx.beginPath();
      ctx.ellipse(rx, ry, 6 + Math.random() * 8, 4 + Math.random() * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Static firefly dots (no animation)
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(200, 230, 180, ${0.12 + Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Decorative background for match game
  function initMatchBg() {
    const canvas = document.getElementById("match-bg");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    // Geometric pattern particles
    const shapes = [];
    for (let i = 0; i < 35; i++) {
      shapes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 4 + Math.random() * 12,
        type: Math.floor(Math.random() * 4),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        driftY: -0.15 - Math.random() * 0.25,
        driftX: (Math.random() - 0.5) * 0.15,
        opacity: 0.06 + Math.random() * 0.1,
      });
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      // Soft gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#dae6d6");
      grad.addColorStop(0.5, "#e2ecde");
      grad.addColorStop(1, "#eaf2e6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Concentric circle pattern in center
      for (let i = 6; i >= 0; i--) {
        ctx.strokeStyle = `rgba(109, 142, 112, ${0.03 + i * 0.008})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.45, 40 + i * 35, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Floating shapes
      shapes.forEach((s) => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.fillStyle = `rgba(109, 142, 112, ${s.opacity})`;
        ctx.strokeStyle = `rgba(109, 142, 112, ${s.opacity * 0.6})`;
        ctx.lineWidth = 1;

        if (s.type === 0) {
          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, s.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.type === 1) {
          // Diamond
          ctx.beginPath();
          ctx.moveTo(0, -s.size);
          ctx.lineTo(s.size * 0.7, 0);
          ctx.lineTo(0, s.size);
          ctx.lineTo(-s.size * 0.7, 0);
          ctx.closePath();
          ctx.stroke();
        } else if (s.type === 2) {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -s.size);
          ctx.lineTo(s.size * 0.87, s.size * 0.5);
          ctx.lineTo(-s.size * 0.87, s.size * 0.5);
          ctx.closePath();
          ctx.stroke();
        } else {
          // Star
          drawStarPath(ctx, 0, 0, s.size, s.size * 0.45, 5);
          ctx.fill();
        }
        ctx.restore();

        s.y += s.driftY;
        s.x += s.driftX;
        s.rotation += s.rotSpeed;
        if (s.y < -20) { s.y = h + 20; s.x = Math.random() * w; }
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
      });

      requestAnimationFrame(frame);
    }
    frame();
  }

  // Celebration screen — confetti burst
  function initCelebrationBg() {
    const canvas = document.getElementById("celebration-bg");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    const colors = ["#7a9a7e", "#a8c4a8", "#5a7a5e", "#c8ddc0", "#8aaa8e", "#dce8da", "#6d8e70"];

    // Confetti particles bursting from center
    const particles = [];
    for (let i = 0; i < 90; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 1.5 + Math.random() * 4;
      particles.push({
        x: w / 2, y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        gravity: 0.06 + Math.random() * 0.04,
        size: 4 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        shape: Math.random() < 0.5 ? "rect" : "circle",
        opacity: 1,
        fade: 0.004 + Math.random() * 0.004,
      });
    }

    // Ripple rings from center
    const rings = [
      { r: 0, maxR: Math.max(w, h) * 0.7, speed: 3, opacity: 0.18 },
      { r: 0, maxR: Math.max(w, h) * 0.5, speed: 2, opacity: 0.12 },
    ];

    function frame() {
      ctx.clearRect(0, 0, w, h);

      // Background
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.7);
      grad.addColorStop(0, "#dfe9db");
      grad.addColorStop(1, "#c8dbc2");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Expanding rings
      rings.forEach(ring => {
        if (ring.r < ring.maxR) {
          const alpha = ring.opacity * (1 - ring.r / ring.maxR);
          ctx.strokeStyle = `rgba(109, 142, 112, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(w/2, h/2, ring.r, 0, Math.PI * 2);
          ctx.stroke();
          ring.r += ring.speed;
        }
      });

      // Confetti
      particles.forEach(p => {
        if (p.opacity <= 0) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        p.opacity -= p.fade;
      });

      requestAnimationFrame(frame);
    }
    frame();
  }

  // Grand final screen background
  function initFinalBg() {
    const canvas = document.getElementById("final-bg");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    // Sparkles
    const sparkles = [];
    for (let i = 0; i < 50; i++) {
      sparkles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
      });
    }

    // Rising orbs
    const orbs = [];
    for (let i = 0; i < 18; i++) {
      orbs.push({
        x: Math.random() * w,
        y: h + Math.random() * h,
        r: 5 + Math.random() * 15,
        speed: 0.3 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 0.3,
        opacity: 0.04 + Math.random() * 0.08,
      });
    }

    // Ripple rings
    const rings = [];
    for (let i = 0; i < 5; i++) {
      rings.push({
        x: w * 0.2 + Math.random() * w * 0.6,
        y: h * 0.2 + Math.random() * h * 0.6,
        r: 0,
        maxR: 60 + Math.random() * 80,
        speed: 0.3 + Math.random() * 0.3,
        opacity: 0.08,
      });
    }

    let t = 0;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;

      // Gradient
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, "#dfe9db");
      grad.addColorStop(0.5, "#d5e2cf");
      grad.addColorStop(1, "#c8dbc2");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle vine border decoration
      ctx.strokeStyle = "rgba(109, 142, 112, 0.08)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const offset = i * 25 + 20;
        // Top-left corner vine
        ctx.beginPath();
        ctx.moveTo(0, offset);
        ctx.quadraticCurveTo(offset, offset, offset, 0);
        ctx.stroke();
        // Bottom-right corner vine
        ctx.beginPath();
        ctx.moveTo(w, h - offset);
        ctx.quadraticCurveTo(w - offset, h - offset, w - offset, h);
        ctx.stroke();
      }

      // Ripple rings
      rings.forEach((ring) => {
        const alpha = ring.opacity * (1 - ring.r / ring.maxR);
        if (alpha > 0) {
          ctx.strokeStyle = `rgba(109, 142, 112, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ring.r += ring.speed;
        if (ring.r > ring.maxR) {
          ring.r = 0;
          ring.x = w * 0.2 + Math.random() * w * 0.6;
          ring.y = h * 0.2 + Math.random() * h * 0.6;
        }
      });

      // Rising orbs
      orbs.forEach((o) => {
        const grad2 = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        grad2.addColorStop(0, `rgba(140, 180, 140, ${o.opacity * 1.5})`);
        grad2.addColorStop(1, `rgba(140, 180, 140, 0)`);
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
        o.y -= o.speed;
        o.x += o.drift + Math.sin(t + o.r) * 0.2;
        if (o.y < -o.r * 2) {
          o.y = h + o.r;
          o.x = Math.random() * w;
        }
      });

      // Sparkles (twinkling dots)
      sparkles.forEach((s) => {
        const glow = 0.1 + Math.sin(t * 4 + s.phase) * 0.2;
        if (glow > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
          ctx.shadowColor = `rgba(200, 230, 190, ${glow})`;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * (0.5 + Math.sin(t * 3 + s.phase) * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;

      // Small decorative leaves drifting
      for (let i = 0; i < 6; i++) {
        const lx = (w * 0.1 + i * w * 0.15 + Math.sin(t * 0.5 + i) * 20) % w;
        const ly = (h * 0.1 + i * h * 0.14 + t * 8 + i * 50) % (h + 40) - 20;
        drawTinyLeaf(ctx, lx, ly, 6, t + i * 1.2);
      }

      requestAnimationFrame(frame);
    }
    frame();
  }

  // ================================================================
  // DRAWING HELPERS
  // ================================================================

  function drawSmallTree(ctx, x, y, size) {
    ctx.fillStyle = "#7a9a6e";
    // Trunk
    ctx.fillStyle = "#8a7a6a";
    ctx.fillRect(x - size * 0.08, y, size * 0.16, size * 0.35);
    // Layers
    ctx.fillStyle = "#6d8e60";
    for (let i = 0; i < 3; i++) {
      const w = size * (0.6 - i * 0.12);
      const ty = y - size * (0.1 + i * 0.25);
      ctx.beginPath();
      ctx.moveTo(x - w, ty + size * 0.2);
      ctx.lineTo(x, ty - size * 0.15);
      ctx.lineTo(x + w, ty + size * 0.2);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawFern(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "#7a9a6e";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    // Central stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.1, -size * 0.5, 0, -size);
    ctx.stroke();
    // Fronds
    for (let i = 1; i <= 4; i++) {
      const fy = -size * (i / 5);
      const fw = size * 0.4 * (1 - i / 6);
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.quadraticCurveTo(fw * 0.5, fy - fw * 0.3, fw, fy - fw * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.quadraticCurveTo(-fw * 0.5, fy - fw * 0.3, -fw, fy - fw * 0.1);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPalmTree(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    // Trunk
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.05, -size * 0.5, size * 0.02, -size);
    ctx.stroke();
    // Fronds at top
    ctx.strokeStyle = "#6d8e60";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI * 0.8 + i * (Math.PI * 0.4);
      const len = size * 0.5;
      ctx.beginPath();
      ctx.moveTo(size * 0.02, -size);
      ctx.quadraticCurveTo(
        size * 0.02 + Math.cos(angle) * len * 0.5,
        -size + Math.sin(angle) * len * 0.3,
        size * 0.02 + Math.cos(angle) * len,
        -size + Math.sin(angle) * len * 0.5 + len * 0.1
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTinyLeaf(ctx, x, y, size, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = "rgba(109, 142, 100, 0.12)";
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.8, -size * 0.3, 0, size);
    ctx.quadraticCurveTo(-size * 0.8, -size * 0.3, 0, -size);
    ctx.fill();
    ctx.restore();
  }

  function drawStarPath(ctx, cx, cy, outerR, innerR, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  // ── Tree drawing for maze walls ──
  function drawTree(ctx, x, y, cellW, cellH) {
    const cx = x + cellW / 2;
    const cy = y + cellH / 2;
    const s = Math.min(cellW, cellH);

    // Snow on ground
    ctx.fillStyle = "#e8f0e4";
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.35, s * 0.35, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = "#8a7a6a";
    ctx.fillRect(cx - s * 0.06, cy + s * 0.05, s * 0.12, s * 0.32);

    // Three triangle layers (tree shape)
    const greens = ["#5a7a50", "#6d8e60", "#7a9a6e"];
    for (let i = 0; i < 3; i++) {
      const layerW = s * (0.42 - i * 0.08);
      const layerY = cy - s * (0.05 + i * 0.18);
      ctx.fillStyle = greens[i];
      ctx.beginPath();
      ctx.moveTo(cx - layerW, layerY + s * 0.16);
      ctx.lineTo(cx, layerY - s * 0.12);
      ctx.lineTo(cx + layerW, layerY + s * 0.16);
      ctx.closePath();
      ctx.fill();
    }

    // Snow on top
    ctx.fillStyle = "#f0f5ee";
    const topY = cy - s * 0.05 - s * 0.54 + s * 0.12;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, topY + s * 0.06);
    ctx.lineTo(cx, topY - s * 0.04);
    ctx.lineTo(cx + s * 0.12, topY + s * 0.06);
    ctx.closePath();
    ctx.fill();
  }

  // ── Skier character ──
  function drawSkier(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 26;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.ellipse(0, 13 * s, 7 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Skis
    ctx.lineWidth = 2.5 * s;
    ctx.strokeStyle = "#8a6a4a";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8 * s, 12 * s);
    ctx.lineTo(-1 * s, 12 * s);
    ctx.moveTo(2 * s, 12 * s);
    ctx.lineTo(9 * s, 12 * s);
    ctx.stroke();
    // Ski tips (curved up)
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-8 * s, 12 * s);
    ctx.quadraticCurveTo(-9.5 * s, 10 * s, -9 * s, 9 * s);
    ctx.moveTo(9 * s, 12 * s);
    ctx.quadraticCurveTo(10.5 * s, 10 * s, 10 * s, 9 * s);
    ctx.stroke();

    // Legs
    ctx.strokeStyle = "#4a5a4a";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(0, 5 * s);
    ctx.lineTo(-4 * s, 11 * s);
    ctx.moveTo(0, 5 * s);
    ctx.lineTo(4 * s, 11 * s);
    ctx.stroke();

    // Body (jacket)
    ctx.fillStyle = "#c04040";
    ctx.beginPath();
    ctx.moveTo(-4 * s, -2 * s);
    ctx.lineTo(4 * s, -2 * s);
    ctx.lineTo(3.5 * s, 6 * s);
    ctx.lineTo(-3.5 * s, 6 * s);
    ctx.closePath();
    ctx.fill();

    // Arms holding poles
    ctx.strokeStyle = "#4a5a4a";
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    ctx.moveTo(-3.5 * s, 0);
    ctx.lineTo(-7 * s, 4 * s);
    ctx.moveTo(3.5 * s, 0);
    ctx.lineTo(7 * s, 4 * s);
    ctx.stroke();

    // Ski poles
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(-7 * s, 4 * s);
    ctx.lineTo(-7 * s, 13 * s);
    ctx.moveTo(7 * s, 4 * s);
    ctx.lineTo(7 * s, 13 * s);
    ctx.stroke();

    // Head
    ctx.fillStyle = "#e8cdb5";
    ctx.beginPath();
    ctx.arc(0, -6 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();

    // Beanie
    ctx.fillStyle = "#c04040";
    ctx.beginPath();
    ctx.arc(0, -6 * s, 4.2 * s, Math.PI, Math.PI * 2);
    ctx.fill();
    // Beanie brim
    ctx.fillStyle = "#eee";
    ctx.fillRect(-4.5 * s, -6.5 * s, 9 * s, 1.8 * s);
    // Pom pom
    ctx.fillStyle = "#eee";
    ctx.beginPath();
    ctx.arc(0, -10.5 * s, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.arc(-1.5 * s, -5.5 * s, 0.7 * s, 0, Math.PI * 2);
    ctx.arc(1.5 * s, -5.5 * s, 0.7 * s, 0, Math.PI * 2);
    ctx.fill();

    // Goggles strap hint
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.arc(0, -6 * s, 4 * s, -0.3, 0.3);
    ctx.stroke();

    ctx.restore();
  }

  // ── Lodge / finish flag ──
  function drawLodge(ctx, x, y, cellW, cellH) {
    const cx = x + cellW / 2;
    const cy = y + cellH / 2;
    const s = Math.min(cellW, cellH);

    // Warm glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.5);
    glow.addColorStop(0, "rgba(255, 220, 150, 0.15)");
    glow.addColorStop(1, "rgba(255, 220, 150, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, cellW, cellH);

    // Cabin body
    ctx.fillStyle = "#8a6a4a";
    ctx.fillRect(cx - s * 0.25, cy - s * 0.05, s * 0.5, s * 0.35);

    // Roof
    ctx.fillStyle = "#c04040";
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.35, cy - s * 0.05);
    ctx.lineTo(cx, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.35, cy - s * 0.05);
    ctx.closePath();
    ctx.fill();

    // Snow on roof
    ctx.fillStyle = "#f0f5ee";
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy - s * 0.08);
    ctx.lineTo(cx, cy - s * 0.28);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.08);
    ctx.closePath();
    ctx.fill();

    // Door
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(cx - s * 0.06, cy + s * 0.1, s * 0.12, s * 0.2);

    // Window glow
    ctx.fillStyle = "rgba(255, 220, 120, 0.6)";
    ctx.fillRect(cx + s * 0.08, cy + s * 0.02, s * 0.1, s * 0.08);
  }

  // ── Dino ──
  function drawDinoToCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const s = w / 48;
    ctx.fillStyle = "#5a7a5e";

    ctx.beginPath();
    ctx.ellipse(24 * s, 28 * s, 12 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(32 * s, 16 * s, 6 * s, 7 * s, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(37 * s, 14 * s, 4 * s, 3.5 * s, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f4f7f2";
    ctx.beginPath();
    ctx.arc(34 * s, 13 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a4a3c";
    ctx.beginPath();
    ctx.arc(34.5 * s, 13 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#5a7a5e";
    const legW = 3.5 * s;
    const legH = 8 * s;
    roundRectFill(ctx, 16 * s, 34 * s, legW, legH, 2 * s);
    roundRectFill(ctx, 22 * s, 34 * s, legW, legH, 2 * s);
    roundRectFill(ctx, 28 * s, 34 * s, legW, legH, 2 * s);

    ctx.lineWidth = 4 * s;
    ctx.strokeStyle = "#5a7a5e";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(12 * s, 26 * s);
    ctx.quadraticCurveTo(4 * s, 20 * s, 6 * s, 14 * s);
    ctx.stroke();

    ctx.fillStyle = "#6d8e70";
    for (let i = 0; i < 4; i++) {
      const sx = (18 + i * 5) * s;
      const sy = (20 - Math.sin(i * 0.8) * 2) * s;
      ctx.beginPath();
      ctx.moveTo(sx - 2 * s, sy + 3 * s);
      ctx.lineTo(sx, sy - 2 * s);
      ctx.lineTo(sx + 2 * s, sy + 3 * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  function roundRectFill(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();
  }

  // SVG shapes for match cards (xmlns required for innerHTML on iOS Safari)
  const svgNs = 'xmlns="http://www.w3.org/2000/svg"';
  const cardShapes = [
    `<svg ${svgNs} viewBox="0 0 40 40"><polygon points="20,4 24,15 36,15 27,22 30,34 20,27 10,34 13,22 4,15 16,15" fill="#6d8e70"/></svg>`,
    `<svg ${svgNs} viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="#7a9a7e"/></svg>`,
    `<svg ${svgNs} viewBox="0 0 40 40"><polygon points="20,4 36,20 20,36 4,20" fill="#5a7a5e"/></svg>`,
    `<svg ${svgNs} viewBox="0 0 40 40"><polygon points="20,5 36,35 4,35" fill="#4a6a4e"/></svg>`,
    `<svg ${svgNs} viewBox="0 0 40 40"><path d="M20,34 C10,26 2,20 2,13 C2,7 7,3 12,3 C16,3 19,6 20,8 C21,6 24,3 28,3 C33,3 38,7 38,13 C38,20 30,26 20,34Z" fill="#6d8e70"/></svg>`,
    `<svg ${svgNs} viewBox="0 0 40 40"><rect x="15" y="4" width="10" height="32" rx="3" fill="#7a9a7e"/><rect x="4" y="15" width="32" height="10" rx="3" fill="#7a9a7e"/></svg>`,
    `<svg ${svgNs} viewBox="0 0 40 40"><path d="M25,4 C18,8 15,16 18,25 C21,33 28,36 35,34 C30,38 22,39 15,35 C7,29 5,18 10,10 C14,5 20,3 25,4Z" fill="#5a7a5e"/></svg>`,
    `<svg ${svgNs} viewBox="0 0 40 40"><path d="M8,34 Q8,14 20,6 Q32,14 32,34 Q20,24 8,34Z" fill="#4a6a4e"/><line x1="20" y1="6" x2="20" y2="34" stroke="#e8efe6" stroke-width="1.5"/></svg>`,
  ];

  // ================================================================
  // SKI GAME — 3 Levels
  // ================================================================

  const mazes = [
    // Level 1 — 13x13
    [
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2],
    ],
    // Level 2 — 15x13, trickier paths
    [
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2],
    ],
    // Level 3 — 17x13, long winding final challenge
    [
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2],
    ],
  ];

  let currentLevel = 0;

  function startSkiGame() {
    currentLevel = 0;
    initSkiBg();
    loadMazeLevel(currentLevel);
  }

  function loadMazeLevel(levelIdx) {
    const canvas = document.getElementById("ski-canvas");
    const ctx = canvas.getContext("2d");
    const instruction = document.getElementById("ski-instruction");
    const winOverlay = document.getElementById("ski-win");
    const winText = document.getElementById("ski-win-text");

    winOverlay.classList.remove("show");
    instruction.textContent = `ski through the trees -- level ${levelIdx + 1}`;

    const maze = mazes[levelIdx];
    const rows = maze.length;
    const cols = maze[0].length;

    // Size canvas
    const maxW = Math.min(window.innerWidth - 20, 360);
    const maxH = window.innerHeight - 190;
    const cellTarget = Math.min(maxW / cols, maxH / rows);
    const cellW = cellTarget;
    const cellH = cellTarget;
    canvas.width = cellW * cols;
    canvas.height = cellH * rows;

    const player = {
      x: cellW * 0.5,
      y: cellH * 0.5,
      vx: 0,
      vy: 0,
      radius: Math.min(cellW, cellH) * 0.22,
    };
    // Slower speed
    const speed = 0.7;
    const friction = 0.78;
    const keys = { up: false, down: false, left: false, right: false };
    let won = false;
    const trail = [];
    const maxTrail = 80;

    // Falling snowflakes
    const snowflakes = [];
    for (let i = 0; i < 18; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0.8 + Math.random() * 1.4,
        speed: 0.25 + Math.random() * 0.45,
        drift: (Math.random() - 0.5) * 0.3,
        opacity: 0.3 + Math.random() * 0.35,
      });
    }

    // Occasional bird that flies across
    let bird = null;
    let birdCooldown = 180 + Math.floor(Math.random() * 200);
    let frameCount = 0;

    // Keyboard
    function keyHandler(e) {
      const down = e.type === "keydown";
      switch (e.key) {
        case "ArrowUp": case "w": keys.up = down; e.preventDefault(); break;
        case "ArrowDown": case "s": keys.down = down; e.preventDefault(); break;
        case "ArrowLeft": case "a": keys.left = down; e.preventDefault(); break;
        case "ArrowRight": case "d": keys.right = down; e.preventDefault(); break;
      }
    }
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("keyup", keyHandler);

    // Mobile controls (rebind each level)
    document.querySelectorAll(".ctrl-btn").forEach((btn) => {
      const dir = btn.dataset.dir;
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      const start = () => { keys[dir] = true; };
      const end = () => { keys[dir] = false; };
      newBtn.addEventListener("touchstart", (e) => { e.preventDefault(); start(); }, { passive: false });
      newBtn.addEventListener("touchend", (e) => { e.preventDefault(); end(); }, { passive: false });
      newBtn.addEventListener("touchcancel", end);
      newBtn.addEventListener("mousedown", start);
      newBtn.addEventListener("mouseup", end);
      newBtn.addEventListener("mouseleave", end);
    });

    function collidesWithWall(px, py, r) {
      const minCol = Math.max(0, Math.floor((px - r) / cellW));
      const maxCol = Math.min(cols - 1, Math.floor((px + r) / cellW));
      const minRow = Math.max(0, Math.floor((py - r) / cellH));
      const maxRow = Math.min(rows - 1, Math.floor((py + r) / cellH));
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          if (maze[row][col] === 1) {
            const cx = Math.max(col * cellW, Math.min(px, (col + 1) * cellW));
            const cy = Math.max(row * cellH, Math.min(py, (row + 1) * cellH));
            const dx = px - cx;
            const dy = py - cy;
            if (dx * dx + dy * dy < r * r) return true;
          }
        }
      }
      return false;
    }

    function checkGoal() {
      const col = Math.floor(player.x / cellW);
      const row = Math.floor(player.y / cellH);
      return row >= 0 && row < rows && col >= 0 && col < cols && maze[row][col] === 2;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Snow ground base
      const groundGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      groundGrad.addColorStop(0, "#eef4ec");
      groundGrad.addColorStop(0.5, "#e4ede0");
      groundGrad.addColorStop(1, "#dce6d8");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle snow texture dots
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      for (let i = 0; i < 50; i++) {
        const sx = ((i * 73 + 17) % canvas.width);
        const sy = ((i * 47 + 31) % canvas.height);
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw maze cells
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellW;
          const y = r * cellH;
          if (maze[r][c] === 1) {
            drawTree(ctx, x, y, cellW, cellH);
          } else if (maze[r][c] === 2) {
            drawLodge(ctx, x, y, cellW, cellH);
          }
        }
      }

      // Ski trail (white marks in snow)
      for (let i = 0; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.35;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, player.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Snowflakes
      snowflakes.forEach(f => {
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > canvas.height + 4) { f.y = -4; f.x = Math.random() * canvas.width; }
        if (f.x < -4) f.x = canvas.width + 4;
        if (f.x > canvas.width + 4) f.x = -4;
      });

      // Bird
      if (bird) {
        ctx.strokeStyle = `rgba(90, 120, 90, ${bird.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bird.x - bird.size, bird.y);
        ctx.quadraticCurveTo(bird.x - bird.size * 0.5, bird.y - bird.size * 0.6, bird.x, bird.y);
        ctx.quadraticCurveTo(bird.x + bird.size * 0.5, bird.y - bird.size * 0.6, bird.x + bird.size, bird.y);
        ctx.stroke();
      }

      // Player
      drawSkier(ctx, player.x, player.y, player.radius * 3);
    }

    let rafId;
    function update() {
      if (won) return;

      // Bird spawning
      frameCount++;
      if (!bird && frameCount > birdCooldown) {
        const goRight = Math.random() < 0.5;
        bird = {
          x: goRight ? -10 : canvas.width + 10,
          y: canvas.height * (0.05 + Math.random() * 0.25),
          vx: goRight ? 1.2 + Math.random() * 0.8 : -(1.2 + Math.random() * 0.8),
          size: 4 + Math.random() * 3,
          opacity: 0.55 + Math.random() * 0.3,
        };
      }
      if (bird) {
        bird.x += bird.vx;
        if (bird.x < -20 || bird.x > canvas.width + 20) {
          bird = null;
          birdCooldown = frameCount + 200 + Math.floor(Math.random() * 250);
        }
      }

      if (keys.up) player.vy -= speed;
      if (keys.down) player.vy += speed;
      if (keys.left) player.vx -= speed;
      if (keys.right) player.vx += speed;

      player.vx *= friction;
      player.vy *= friction;

      const nx = player.x + player.vx;
      const ny = player.y + player.vy;

      if (!collidesWithWall(nx, player.y, player.radius)) {
        player.x = nx;
      } else {
        player.vx = 0;
      }
      if (!collidesWithWall(player.x, ny, player.radius)) {
        player.y = ny;
      } else {
        player.vy = 0;
      }

      player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

      if (Math.abs(player.vx) > 0.2 || Math.abs(player.vy) > 0.2) {
        trail.push({ x: player.x, y: player.y });
        if (trail.length > maxTrail) trail.shift();
      }

      if (checkGoal()) {
        won = true;
        window.removeEventListener("keydown", keyHandler);
        window.removeEventListener("keyup", keyHandler);

        const skiNextBtn = document.getElementById("ski-next-btn");
        const levelEndMessages = [
          "not bad :)",
          "she's getting warmer",
          "smooth run :)",
        ];
        winText.textContent = levelEndMessages[levelIdx];
        winOverlay.classList.add("show");

        if (levelIdx < mazes.length - 1) {
          skiNextBtn.textContent = "next level";
          skiNextBtn.onclick = () => {
            currentLevel++;
            loadMazeLevel(currentLevel);
          };
        } else {
          skiNextBtn.textContent = "next game";
          skiNextBtn.onclick = () => {
            nextScreen();
            startDinoGame();
          };
        }
      }

      draw();
      rafId = requestAnimationFrame(update);
    }

    draw();
    rafId = requestAnimationFrame(update);
  }

  // ================================================================
  // DINO GAME — 20 taps
  // ================================================================
  function startDinoGame() {
    initDinoBg();

    const dinoEl = document.getElementById("dino");
    const msg = document.getElementById("dino-msg");
    const counter = document.getElementById("dino-counter");
    const area = document.getElementById("dino-area");
    const totalTaps = 20;

    const messages = [
      "oh hi",
      "hello :)",
      "hey there",
      "oh you're persistent",
      "i like it",
      "okay okay",
      "you're doing great",
      "seriously though",
      "still going?",
      "wow okay",
      "i respect it",
      "you're kind of fun",
      "okay maybe a lot",
      "you're sweet, you know that?",
      "don't stop now",
      "you're pretty.",
      "really pretty. i mean it.",
      "okay i'm flustered",
      "you win, okay?",
      "fine. you win. hi :)",
    ];

    let taps = 0;
    let animating = false;

    dinoEl.innerHTML = "";
    const dinoCanvas = document.createElement("canvas");
    dinoCanvas.width = 128;
    dinoCanvas.height = 128;
    dinoCanvas.style.width = "64px";
    dinoCanvas.style.height = "64px";
    dinoEl.appendChild(dinoCanvas);
    drawDinoToCanvas(dinoCanvas);

    const dinoSize = 64;
    const rect = area.getBoundingClientRect();
    positionDino((rect.width - dinoSize) / 2, (rect.height - dinoSize) / 2);
    counter.textContent = `0 / ${totalTaps}`;

    function positionDino(x, y) {
      dinoEl.style.left = x + "px";
      dinoEl.style.top = y + "px";
    }

    // Wander: autonomous movement starting at tap 5, 950ms interval
    let wanderInterval = null;
    function startWandering() {
      if (wanderInterval) return;
      wanderInterval = setInterval(() => {
        if (taps >= totalTaps) { clearInterval(wanderInterval); wanderInterval = null; return; }
        moveDino(taps, 0.5);
      }, 950);
    }

    function moveDino(tap, scaleFactor) {
      const areaRect = area.getBoundingClientRect();
      const padding = 8;
      const maxX = areaRect.width - dinoSize - padding;
      const maxY = areaRect.height - dinoSize - padding;
      const factor = scaleFactor !== undefined ? scaleFactor : 1;
      // Distance grows steadily with taps, small jitter for unpredictability
      const base = 35 + tap * 10;
      const jitter = Math.random() * 20;
      const distance = Math.min((base + jitter) * factor, Math.max(maxX, maxY) * 0.72);
      const angle = Math.random() * Math.PI * 2;
      const currentLeft = parseFloat(dinoEl.style.left) || 0;
      const currentTop  = parseFloat(dinoEl.style.top)  || 0;
      let newX = currentLeft + Math.cos(angle) * distance;
      let newY = currentTop  + Math.sin(angle) * distance;
      newX = Math.max(padding, Math.min(maxX, newX));
      newY = Math.max(padding, Math.min(maxY, newY));
      positionDino(newX, newY);
    }

    dinoEl.addEventListener("click", (e) => {
      e.preventDefault();
      if (animating || taps >= totalTaps) return;
      taps++;
      msg.textContent = messages[taps - 1];
      msg.style.opacity = "1";
      counter.textContent = `${taps} / ${totalTaps}`;
      dinoEl.classList.add("squash");
      setTimeout(() => dinoEl.classList.remove("squash"), 200);

      if (taps >= totalTaps) {
        if (wanderInterval) clearInterval(wanderInterval);
        setTimeout(() => {
          document.getElementById("dino-win").classList.add("show");
          document.getElementById("dino-next-btn").onclick = () => {
            nextScreen();
            startMatchGame();
          };
        }, 800);
        return;
      }

      // Start wandering at tap 5
      if (taps === 5) startWandering();

      // Move from tap 1 onward, transition speed scales gently
      if (taps >= 1) {
        animating = true;
        const transTime = Math.max(0.12, 0.22 - taps * 0.005);
        dinoEl.style.transition = `left ${transTime}s cubic-bezier(0.22,1,0.36,1), top ${transTime}s cubic-bezier(0.22,1,0.36,1)`;
        dinoEl.classList.add("wiggle");
        setTimeout(() => {
          dinoEl.classList.remove("wiggle");
          moveDino(taps);
          setTimeout(() => { animating = false; }, transTime * 1000 + 80);
        }, 170);
      }
    });
  }

  // ================================================================
  // MATCH GAME — 4x4, 8 pairs
  // ================================================================
  function startMatchGame() {
    initMatchBg();

    const grid = document.getElementById("match-grid");
    const totalPairs = 8;
    const symbols = [];
    for (let i = 0; i < totalPairs; i++) symbols.push(i, i);

    for (let i = symbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }

    let flipped = [];
    let matched = 0;
    let locked = false;

    grid.innerHTML = "";
    symbols.forEach((sym, i) => {
      const card = document.createElement("div");
      card.className = "match-card";
      card.innerHTML = `
        <div class="match-card-front">?</div>
        <div class="match-card-back">${cardShapes[sym]}</div>
      `;
      card.dataset.sym = sym;
      card.addEventListener("click", () => flipCard(card));
      grid.appendChild(card);
    });

    function flipCard(card) {
      if (locked || card.classList.contains("flipped") || card.classList.contains("flipping") || flipped.length >= 2) return;

      // scale3d to 0, swap face, scale3d back to 1
      card.classList.add("flipping");
      setTimeout(() => {
        card.classList.add("flipped");
        card.classList.remove("flipping");
        flipped.push(card);

        if (flipped.length === 2) {
          locked = true;
          const [a, b] = flipped;
          if (a.dataset.sym === b.dataset.sym) {
            a.classList.add("matched");
            b.classList.add("matched");
            matched++;
            flipped = [];
            locked = false;
            if (matched === totalPairs) {
              setTimeout(() => {
                document.getElementById("match-win").classList.add("show");
                document.getElementById("match-next-btn").onclick = () => {
                  nextScreen();
                  startCelebration();
                };
              }, 500);
            }
          } else {
            // Flip both back — scale to 0, remove flipped, scale back
            setTimeout(() => {
              [a, b].forEach((c) => {
                c.classList.add("flipping");
                setTimeout(() => {
                  c.classList.remove("flipped");
                  c.classList.remove("flipping");
                }, 200);
              });
              flipped = [];
              locked = false;
            }, 700);
          }
        }
      }, 200);
    }
  }

  // ================================================================
  // CELEBRATION SCREEN
  // ================================================================
  function startCelebration() {
    initCelebrationBg();
    document.getElementById("celebration-next-btn").onclick = () => {
      nextScreen();
      startFinalScreen();
    };
  }

  // ================================================================
  // FINAL SCREEN
  // ================================================================
  function startFinalScreen() {
    initFinalBg();
  }

  // ── Play Again ──
  document.getElementById("play-again-btn").addEventListener("click", () => {
    // Reset all win overlays
    document.querySelectorAll(".win-overlay").forEach((el) => el.classList.remove("show"));
    // Reset dino
    const dinoEl = document.getElementById("dino");
    dinoEl.innerHTML = "";
    document.getElementById("dino-msg").textContent = "";
    document.getElementById("dino-counter").textContent = "";
    // Reset match grid
    document.getElementById("match-grid").innerHTML = "";
    // Go back to welcome
    showScreen(0);
  });

  // ── Init ──
  initWelcomeBg();
  showScreen(0);
})();
