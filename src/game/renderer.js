import { CONSTANTS } from './constants.js';
import { assets } from './assets.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Scale Logic: Ensure we see at least ~700 logical pixels of width
    // On Desktop (e.g. 1920): scale = 1
    // On Mobile (e.g. 375): scale = 375 / 700 = ~0.53
    const targetLogicalWidth = 700;
    this.gameScale = Math.min(1, winW / targetLogicalWidth);

    this.canvas.width = Math.floor(winW * dpr);
    this.canvas.height = Math.floor(winH * dpr);
    this.canvas.style.width = winW + "px";
    this.canvas.style.height = winH + "px";
    
    // Apply scale to the context
    // The physics and drawing logic continue to use "Logical Coordinates"
    // The context automatically maps them to "Physical Pixels"
    const s = this.gameScale * dpr;
    this.ctx.setTransform(s, 0, 0, s, 0, 0);

    // Update logical dimensions exposed to GameEngine
    this.width = winW / this.gameScale;
    this.height = winH / this.gameScale;
  }

  groundY() {
    return this.height - CONSTANTS.GROUND_H;
  }

  draw(state) {
    const { ctx, width, height } = this;
    const { player, obstacles, particles, footprints, score, timeAlive, distance, shake } = state;

    let sx = 0, sy = 0;
    if (shake > 0) {
      sx = (Math.random() - 0.5) * shake;
      sy = (Math.random() - 0.5) * shake;
    }

    ctx.save();
    ctx.clearRect(0, 0, width, height); // Clear previous frame
    ctx.translate(sx, sy);

    // BG Color
    let bg = "#0b0f17";
    if (score >= 10 && score < 20) bg = "#4c1d95";
    else if (score >= 20 && score < 30) bg = "#0ea5e9";
    else if (score >= 30) bg = "#be123c";
    ctx.fillStyle = bg;
    ctx.fillRect(-50, -50, width + 100, height + 100);

    // Stars
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#cfe8ff";
    for (let i = 0; i < 60; i++) {
      const x = (i * 97 + (timeAlive * 120)) % (width + 40) - 20;
      const y = (i * 53) % (height - 160) + 30;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Mountains
    ctx.fillStyle = "#162035";
    const mountainScroll = distance * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = -50; i <= width + 50; i += 50) {
      const mx = i;
      const my = height - 200 - Math.sin((mx + mountainScroll) * 0.005) * 50 - Math.cos((mx + mountainScroll) * 0.01) * 30;
      ctx.lineTo(mx, my);
    }
    ctx.lineTo(width + 50, height);
    ctx.lineTo(-50, height);
    ctx.fill();

    // Ground
    const gy = this.groundY();
    ctx.fillStyle = "#121a2a";
    ctx.fillRect(0, gy, width, CONSTANTS.GROUND_H);
    ctx.fillStyle = "#1f2b44";
    ctx.fillRect(0, gy, width, 3);

    // Footprints
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    for (const fp of footprints) {
      ctx.beginPath();
      ctx.ellipse(fp.x, fp.y + 2, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Obstacles
    for (const o of obstacles) {
      if (assets.fence.complete && assets.fence.naturalWidth > 0) {
        const size = CONSTANTS.BLOCK_SIZE;
        const cols = o.w / size;
        const rows = o.h / size;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.drawImage(assets.fence, o.x + c * size, o.y + r * size, size, size);
          }
        }
      } else {
        ctx.fillStyle = "#ff6b6b";
        ctx.fillRect(o.x, o.y, o.w, o.h);
      }

      // Warning Indicator
      if (o.x > width && o.x < width + 500) {
        const warnAlpha = Math.abs(Math.sin(timeAlive * 10));
        ctx.globalAlpha = warnAlpha;
        ctx.fillStyle = "#ef4444";
        const wx = width - 40;
        const wy = o.y + o.h / 2;
        ctx.beginPath();
        ctx.moveTo(wx, wy - 20);
        ctx.lineTo(wx + 20, wy + 10);
        ctx.lineTo(wx - 20, wy + 10);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("!", wx, wy);
        ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
        ctx.globalAlpha = 1;
      }
    }

    // Particles
    for (const p of particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Player Glow
    const glow = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, 60);
    glow.addColorStop(0, "rgba(255, 255, 200, 0.15)");
    glow.addColorStop(1, "rgba(255, 255, 200, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 60, 0, Math.PI * 2);
    ctx.fill();

    // Player Draw
    ctx.save();
    ctx.translate(player.x, player.y);
    let rot = 0;
    if (!player.onGround) {
      rot = Math.min(0.5, Math.max(-0.5, player.vy / 1000));
    }
    ctx.rotate(rot);

    if (assets.horse.complete && assets.horse.naturalWidth > 0) {
      const drawSize = 48;
      const offset = drawSize / 2;
      ctx.drawImage(assets.horse, -offset, -offset, drawSize, drawSize);

      // Wings
      if (!player.onGround && assets.wings.complete && assets.wings.naturalWidth > 0) {
        ctx.save();
        ctx.translate(-2, -12);
        const flapSpeed = player.vy < 0 ? 25 : 12;
        const flapAngle = Math.sin(timeAlive * flapSpeed) * 0.5;
        ctx.rotate(flapAngle - 0.1);
        ctx.drawImage(assets.wings, -25, -15, 30, 20);
        ctx.restore();
      }

      // Aura
      if (player.charging) {
        const p = Math.min(1, player.chargeT / CONSTANTS.MAX_CHARGE);
        ctx.globalCompositeOperation = "lighter";
        
        const parts = 5 + Math.floor(p * 10);
        ctx.fillStyle = `rgba(255, 230, 100, ${0.5 + p * 0.5})`;
        for(let i=0; i<parts; i++) {
            const px = (Math.random() - 0.5) * 40;
            const py = (Math.random() - 0.5) * 40;
            const ph = 10 + Math.random() * 20 * p;
            ctx.fillRect(px, py - ph/2, 2, ph);
        }

        ctx.beginPath();
        const auraR = 25 + p * 15;
        for (let i = 0; i <= 360; i += 20) {
           const rad = (i * Math.PI) / 180;
           const r = auraR + (Math.random() - 0.5) * 10 * p; 
           const ax = Math.cos(rad) * r;
           const ay = Math.sin(rad) * r;
           if (i===0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
        }
        ctx.closePath();
        const grad = ctx.createRadialGradient(0, 0, 15, 0, 0, auraR + 10);
        grad.addColorStop(0, "rgba(255, 255, 200, 0)");
        grad.addColorStop(0.8, `rgba(255, 215, 0, ${0.4 + p * 0.4})`);
        grad.addColorStop(1, "rgba(255, 215, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fill();

        if (p > 0.8 && Math.random() < 0.5) {
            ctx.strokeStyle = "#e0f2fe"; ctx.lineWidth = 2;
            ctx.beginPath();
            let lx = (Math.random() - 0.5) * 50; let ly = (Math.random() - 0.5) * 50;
            ctx.moveTo(lx, ly);
            for(let k=0; k<3; k++) { lx += (Math.random() - 0.5) * 20; ly += (Math.random() - 0.5) * 20; ctx.lineTo(lx, ly); }
            ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over"; 
      }

      // Blink
      if (player.isBlinking) {
        const ex = -9, ey = -7.5;
        ctx.fillStyle = "#dfa";
        ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ex - 3, ey); ctx.lineTo(ex + 3, ey); ctx.stroke();
      }

    } else {
      // Fallback
      ctx.beginPath(); ctx.fillStyle = "#7dd3fc";
      ctx.arc(0, 0, CONSTANTS.PLAYER_R, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // Charge Bar
    if (player.charging) {
      const p = Math.min(1, player.chargeT / CONSTANTS.MAX_CHARGE);
      const bw = 88, bh = 10;
      const bx = player.x - bw / 2;
      const by = player.y - CONSTANTS.PLAYER_R - 26;
      ctx.fillStyle = "#0f172a"; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#22c55e"; ctx.fillRect(bx, by, bw * p, bh);
      ctx.strokeStyle = "#334155"; ctx.strokeRect(bx, by, bw, bh);
    }

    ctx.restore(); // Restore camera shake
  }
}
