(() => {
  "use strict";

  const W = 960;
  const H = 600;
  const PLAYER_R = 15;
  const canvas = document.querySelector("#arena");
  const ctx = canvas.getContext("2d");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ui = {
    score: document.querySelector("#score"), best: document.querySelector("#best"), rank: document.querySelector("#rank"),
    charge: document.querySelector("#charge"), time: document.querySelector("#time"), pulse: document.querySelector("#pulseButton"),
    pause: document.querySelector("#pauseButton"), intro: document.querySelector("#introOverlay"), paused: document.querySelector("#pauseOverlay"),
    gameover: document.querySelector("#gameoverOverlay"), finalScore: document.querySelector("#finalScore"), finalRank: document.querySelector("#finalRank"),
    sound: document.querySelector("#soundButton"), shields: [...document.querySelectorAll(".shield-meter i")],
  };
  let muted = false;
  let audio = null;
  let pointer = null;
  const keys = new Set();

  const freshState = () => ({
    mode: "intro", player: { x: W / 2, y: H / 2, vx: 0, vy: 0, health: 3, invulnerable: 0 },
    shards: [], cores: [], particles: [], score: 0, charge: 0, elapsed: 0, spawnTimer: .8, coreTimer: .4,
    wave: 0, waveAge: 0, shake: 0, lastTime: 0, hudTimer: 0,
  });
  let state = freshState();

  function rankFor(score) {
    if (score >= 5000) return "اسطوره";
    if (score >= 3000) return "نواختر";
    if (score >= 1500) return "پیشتاز";
    if (score >= 600) return "تک‌خال";
    return "تازه‌کار";
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const bestScore = () => Number(localStorage.getItem("orbit-breaker-best") || 0);
  const faNum = value => Number(value).toLocaleString("fa-IR");
  const faDigits = value => String(value).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);

  function tone(frequency, duration = .08, type = "sine", volume = .04) {
    if (muted) return;
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    audio ||= new AudioEngine();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  }

  function syncHud() {
    const score = Math.floor(state.score);
    const rank = rankFor(score);
    ui.score.textContent = faNum(score);
    ui.best.textContent = faNum(Math.max(score, bestScore()));
    ui.rank.textContent = rank;
    ui.charge.textContent = state.charge >= 100 ? "موج" : `${faNum(Math.floor(state.charge))}٪`;
    ui.pulse.classList.toggle("ready", state.charge >= 100);
    ui.pulse.setAttribute("aria-label", `آزادکردن موج؛ ${faNum(Math.floor(state.charge))} درصد شارژ`);
    const minutes = String(Math.floor(state.elapsed / 60)).padStart(2, "0");
    const seconds = String(Math.floor(state.elapsed) % 60).padStart(2, "0");
    ui.time.textContent = `${faDigits(minutes)}:${faDigits(seconds)}`;
    ui.shields.forEach((shield, i) => shield.classList.toggle("active", i < state.player.health));
    document.querySelector(".shield-meter").setAttribute("aria-label", `${faNum(state.player.health)} سپر باقی مانده`);
  }

  function burst(x, y, color, count) {
    const amount = reducedMotion ? Math.ceil(count / 3) : count;
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 170;
      const life = .3 + Math.random() * .5;
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, color, size: 2 + Math.random() * 4 });
    }
  }

  function spawnShard(speed) {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = Math.random() * W; y = -30; }
    if (side === 1) { x = W + 30; y = Math.random() * H; }
    if (side === 2) { x = Math.random() * W; y = H + 30; }
    if (side === 3) { x = -30; y = Math.random() * H; }
    const dx = state.player.x - x;
    const dy = state.player.y - y;
    const len = Math.hypot(dx, dy) || 1;
    state.shards.push({ x, y, vx: dx / len * speed, vy: dy / len * speed, r: 12 + Math.random() * 8, spin: (Math.random() - .5) * 4, angle: Math.random() * Math.PI });
  }

  function startGame() {
    state = freshState();
    state.mode = "playing";
    state.cores.push({ x: W / 2 + 150, y: H / 2, r: 11, pulse: 0 });
    keys.clear(); pointer = null;
    ui.intro.hidden = true; ui.paused.hidden = true; ui.gameover.hidden = true;
    ui.pause.disabled = false; ui.pause.textContent = "توقف";
    document.querySelector("#heroStart").firstChild.textContent = "بازی تازه ";
    syncHud(); tone(440);
  }

  function togglePause() {
    if (state.mode === "playing") {
      state.mode = "paused"; keys.clear(); pointer = null;
      ui.paused.hidden = false; ui.pause.textContent = "ادامه";
    } else if (state.mode === "paused") {
      state.mode = "playing"; state.lastTime = performance.now();
      ui.paused.hidden = true; ui.pause.textContent = "توقف";
    }
  }

  function pulse() {
    if (state.mode !== "playing" || state.charge < 100) return;
    state.charge = 0; state.wave = 1; state.waveAge = 0; state.shake = reducedMotion ? 0 : 8;
    tone(110, .28, "sawtooth", .06); syncHud();
  }

  function endGame() {
    state.mode = "gameover";
    const score = Math.floor(state.score);
    localStorage.setItem("orbit-breaker-best", String(Math.max(bestScore(), score)));
    ui.finalScore.textContent = `${faNum(score)} امتیاز`;
    ui.finalRank.textContent = rankFor(score);
    ui.gameover.hidden = false; ui.pause.disabled = true;
    syncHud();
  }

  function update(dt) {
    state.elapsed += dt;
    state.player.invulnerable = Math.max(0, state.player.invulnerable - dt);
    state.shake = Math.max(0, state.shake - dt * 22);
    let ix = 0, iy = 0;
    if (keys.has("arrowleft") || keys.has("a")) ix--;
    if (keys.has("arrowright") || keys.has("d")) ix++;
    if (keys.has("arrowup") || keys.has("w")) iy--;
    if (keys.has("arrowdown") || keys.has("s")) iy++;
    if (pointer) {
      const dx = pointer.x - state.player.x, dy = pointer.y - state.player.y;
      if (Math.hypot(dx, dy) > 10) { ix = dx; iy = dy; }
    }
    const inputLength = Math.hypot(ix, iy) || 1;
    const moving = ix || iy;
    const response = 1 - Math.exp(-12 * dt);
    state.player.vx += (ix / inputLength * (moving ? 300 : 0) - state.player.vx) * response;
    state.player.vy += (iy / inputLength * (moving ? 300 : 0) - state.player.vy) * response;
    state.player.x = Math.max(PLAYER_R + 8, Math.min(W - PLAYER_R - 8, state.player.x + state.player.vx * dt));
    state.player.y = Math.max(PLAYER_R + 8, Math.min(H - PLAYER_R - 8, state.player.y + state.player.vy * dt));

    const difficulty = 1 + state.elapsed / 42;
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnShard(75 + difficulty * 18 + Math.random() * 35);
      state.spawnTimer = Math.max(.28, 1.05 - difficulty * .11) * (.75 + Math.random() * .5);
    }
    state.coreTimer -= dt;
    if (state.coreTimer <= 0 && state.cores.length < 2) {
      state.cores.push({ x: 80 + Math.random() * (W - 160), y: 80 + Math.random() * (H - 160), r: 11, pulse: Math.random() * 6 });
      state.coreTimer = 2.2 + Math.random() * 2.2;
    }
    state.shards.forEach(shard => { shard.x += shard.vx * dt; shard.y += shard.vy * dt; shard.angle += shard.spin * dt; });
    state.cores.forEach(core => core.pulse += dt * 4);
    state.cores = state.cores.filter(core => {
      if (dist(core, state.player) < core.r + PLAYER_R + 3) {
        state.score += 120; state.charge = Math.min(100, state.charge + 25);
        burst(core.x, core.y, "#b7ff5a", 15); tone(620 + state.charge * 3); return false;
      }
      return true;
    });
    if (state.wave > 0) {
      state.waveAge += dt; state.wave = Math.min(1, state.waveAge / .42);
      const radius = state.wave * 360;
      state.shards = state.shards.filter(shard => {
        if (dist(shard, state.player) < radius + shard.r) { state.score += 45; burst(shard.x, shard.y, "#ff5dba", 10); return false; }
        return true;
      });
      if (state.waveAge > .55) state.wave = 0;
    }
    state.shards = state.shards.filter(shard => {
      if (dist(shard, state.player) < shard.r + PLAYER_R - 2) {
        if (state.player.invulnerable <= 0) {
          state.player.health--; state.player.invulnerable = 1.15; state.shake = reducedMotion ? 0 : 12;
          burst(state.player.x, state.player.y, "#ff5470", 24); tone(125, .22, "square", .055);
          if (state.player.health <= 0) endGame();
        }
        return false;
      }
      return shard.x > -100 && shard.x < W + 100 && shard.y > -100 && shard.y < H + 100;
    });
    state.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.pow(.06, dt); p.vy *= Math.pow(.06, dt); p.life -= dt; });
    state.particles = state.particles.filter(p => p.life > 0).slice(-180);
    state.score += dt * 9;
    state.hudTimer += dt;
    if (state.hudTimer > .1) { syncHud(); state.hudTimer = 0; }
  }

  function draw() {
    const sx = state.shake ? (Math.random() - .5) * state.shake : 0;
    const sy = state.shake ? (Math.random() - .5) * state.shake : 0;
    ctx.save(); ctx.clearRect(0, 0, W, H); ctx.translate(sx, sy);
    ctx.fillStyle = "#070716"; ctx.fillRect(-20, -20, W + 40, H + 40);
    const glow = ctx.createRadialGradient(state.player.x, state.player.y, 0, state.player.x, state.player.y, 320);
    glow.addColorStop(0, "rgba(82,255,219,.09)"); glow.addColorStop(1, "rgba(7,7,22,0)"); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,.045)"; ctx.lineWidth = 1;
    const drift = state.elapsed * 12 % 48;
    for (let x = -48 + drift; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = -48 + drift; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    state.cores.forEach(core => {
      ctx.save(); ctx.translate(core.x, core.y); ctx.shadowColor = "#b7ff5a"; ctx.shadowBlur = 22; ctx.strokeStyle = "#b7ff5a"; ctx.fillStyle = "rgba(183,255,90,.16)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, core.r * (1 + Math.sin(core.pulse) * .12), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#efffcf"; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    state.shards.forEach(shard => {
      ctx.save(); ctx.translate(shard.x, shard.y); ctx.rotate(shard.angle); ctx.shadowColor = "#ff3f91"; ctx.shadowBlur = 14;
      ctx.fillStyle = "rgba(255,63,145,.22)"; ctx.strokeStyle = "#ff5dba"; ctx.lineWidth = 2.5; ctx.beginPath();
      ctx.moveTo(shard.r, 0); ctx.lineTo(-shard.r * .65, shard.r * .7); ctx.lineTo(-shard.r * .35, -shard.r); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    });
    state.particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
    if (state.wave > 0) { ctx.strokeStyle = `rgba(82,255,219,${1 - state.wave})`; ctx.lineWidth = 9 * (1 - state.wave) + 2; ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.wave * 360, 0, Math.PI * 2); ctx.stroke(); }
    const blink = state.player.invulnerable > 0 && Math.floor(state.player.invulnerable * 10) % 2 === 0;
    if (!blink) {
      ctx.save(); ctx.translate(state.player.x, state.player.y); ctx.rotate(Math.atan2(state.player.vy, state.player.vx) + Math.PI / 2); ctx.shadowColor = "#52ffdb"; ctx.shadowBlur = 24;
      ctx.fillStyle = "#52ffdb"; ctx.beginPath(); ctx.moveTo(0, -19); ctx.lineTo(13, 13); ctx.lineTo(0, 8); ctx.lineTo(-13, 13); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#071717"; ctx.beginPath(); ctx.arc(0, 2, 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }

  function loop(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.min((timestamp - state.lastTime) / 1000, .05);
    state.lastTime = timestamp;
    if (state.mode === "playing") update(dt);
    draw(); requestAnimationFrame(loop);
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width * W, y: (event.clientY - rect.top) / rect.height * H };
  }
  canvas.addEventListener("pointerdown", event => { canvas.setPointerCapture(event.pointerId); pointer = canvasPoint(event); });
  canvas.addEventListener("pointermove", event => { if (canvas.hasPointerCapture(event.pointerId)) pointer = canvasPoint(event); });
  canvas.addEventListener("pointerup", event => { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); pointer = null; });
  canvas.addEventListener("pointercancel", () => pointer = null);
  addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
    if ((key === " " || key === "enter") && (state.mode === "intro" || state.mode === "gameover")) startGame();
    else if (key === " ") pulse();
    else if (key === "p" || key === "escape") togglePause();
    keys.add(key);
  }, { passive: false });
  addEventListener("keyup", event => keys.delete(event.key.toLowerCase()));
  addEventListener("blur", () => { keys.clear(); pointer = null; });
  document.addEventListener("visibilitychange", () => { if (document.hidden && state.mode === "playing") togglePause(); });
  document.querySelector("#heroStart").addEventListener("click", startGame);
  document.querySelector("#overlayStart").addEventListener("click", startGame);
  document.querySelector("#retryButton").addEventListener("click", startGame);
  document.querySelector("#overlayResume").addEventListener("click", togglePause);
  ui.pause.addEventListener("click", togglePause);
  ui.pulse.addEventListener("click", pulse);
  ui.sound.addEventListener("click", () => { muted = !muted; ui.sound.textContent = muted ? "صدا خاموش" : "صدا روشن"; ui.sound.setAttribute("aria-label", muted ? "روشن‌کردن صدای بازی" : "قطع صدای بازی"); });

  ui.best.textContent = faNum(bestScore());
  requestAnimationFrame(loop);
})();
