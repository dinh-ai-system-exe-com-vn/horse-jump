import { assets } from './assets';
import { CONSTANTS } from './constants';
import type { GameState } from './state';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  gameScale: number;
  currentBg: HTMLImageElement | null = null;
  prevBg: HTMLImageElement | null = null;
  bgAlpha: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }
    this.ctx = ctx;
    this.width = 0;
    this.height = 0;
    this.gameScale = 1;

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

  drawTrajectory(state: GameState) {
    const { player, speed } = state;

    let vy, x = player.x, y = player.y;

    if (player.charging) {
      const p = Math.min(1, player.chargeT / CONSTANTS.MAX_CHARGE);
      const boost = 1 + p * CONSTANTS.CHARGE_MULT;
      vy = -CONSTANTS.BASE_JUMP * boost;
    } else if (!player.onGround) {
      vy = player.vy;
    } else {
      return;
    }

    const dt = 0.05;
    const groundY = this.groundY() - CONSTANTS.PLAYER_R;
    const limit = 2.5;

    this.ctx.save();

    // Optimization: Batch all dots into one path
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    this.ctx.beginPath();

    let landed = false;
    let landX = 0;

    for (let t = 0; t < limit; t += dt) {
      vy += CONSTANTS.G * dt;
      y += vy * dt;
      x += speed * dt;

      if (y >= groundY) {
        landed = true;
        landX = x;
        break;
      }

      if (t > 0) {
        this.ctx.moveTo(x + 3, y);
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      }
    }
    this.ctx.fill(); // Single draw call for all dots

    // Draw Landing Marker
    if (landed) {
      this.ctx.beginPath();
      this.ctx.fillStyle = "#ef4444";
      this.ctx.arc(landX, groundY + CONSTANTS.PLAYER_R, 6, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(landX - 8, groundY + CONSTANTS.PLAYER_R);
      this.ctx.lineTo(landX + 8, groundY + CONSTANTS.PLAYER_R);
      this.ctx.moveTo(landX, groundY + CONSTANTS.PLAYER_R - 8);
      this.ctx.lineTo(landX, groundY + CONSTANTS.PLAYER_R + 8);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  draw(state: GameState) {
    const { ctx, width, height } = this;
    const { player, obstacles, particles, footprints, score, timeAlive, distance, shake } = state;

    let sx = 0, sy = 0;
    if (shake > 0) {
      sx = (Math.random() - 0.5) * shake;
      sy = (Math.random() - 0.5) * shake;
    }

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(sx, sy);

    // BG Gradient & Theme Selection
    let cTop, cBot;
    let groundColor = "#121a2a";
    let groundAccent = "#1f2b44";
    let mountainColor = "#162035";
    let showStars = true;
    let targetBg: HTMLImageElement | null = null;

    if (score < 10) {
      // Earth Theme
      cTop = "#7dd3fc"; cBot = "#bae6fd";
      groundColor = "#166534"; groundAccent = "#14532d";
      mountainColor = "#1e40af"; showStars = false;
      targetBg = assets.backgrounds.earth;
    } else if (score < 25) {
      // Mars Theme
      cTop = "#86c4b4"; cBot = "#afd3a5";
      groundColor = "#c85434"; groundAccent = "#8b2b1d";
      mountainColor = "#98b89e"; showStars = false;
      targetBg = assets.backgrounds.mars;
    } else if (score < 45) {
      // Mercury Theme
      cTop = "#475569"; cBot = "#1e293b";
      groundColor = "#334155"; groundAccent = "#0f172a";
      mountainColor = "#1e293b"; showStars = true;
      targetBg = assets.backgrounds.mercury;
    } else if (score < 70) {
      // Venus Theme
      cTop = "#a16207"; cBot = "#713f12";
      groundColor = "#451a03"; groundAccent = "#2d0f02";
      mountainColor = "#713f12"; showStars = false;
      targetBg = assets.backgrounds.venus;
    } else if (score < 100) {
      // Jupiter Theme
      cTop = "#92400e"; cBot = "#d97706";
      groundColor = "#78350f"; groundAccent = "#451a03";
      mountainColor = "#b45309"; showStars = true;
      targetBg = assets.backgrounds.jupiter;
    } else if (score < 140) {
      // Saturn Theme
      cTop = "#422006"; cBot = "#713f12";
      groundColor = "#ca8a04"; groundAccent = "#a16207";
      mountainColor = "#422006"; showStars = true;
      targetBg = assets.backgrounds.saturn;
    } else if (score < 190) {
      // Uranus Theme
      cTop = "#0891b2"; cBot = "#22d3ee";
      groundColor = "#0e7490"; groundAccent = "#155e75";
      mountainColor = "#0891b2"; showStars = true;
      targetBg = assets.backgrounds.uranus;
    } else if (score < 250) {
      // Neptune Theme
      cTop = "#1e3a8a"; cBot = "#2563eb";
      groundColor = "#1e40af"; groundAccent = "#1e3a8a";
      mountainColor = "#1e3a8a"; showStars = true;
      targetBg = assets.backgrounds.neptune;
    } else {
      // Sun Theme (Final)
      cTop = "#f59e0b"; cBot = "#ef4444";
      groundColor = "#b91c1c"; groundAccent = "#7f1d1d";
      mountainColor = "#991b1b"; showStars = false;
      targetBg = assets.backgrounds.sun;
    }

    // Draw Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, cTop);
    bgGrad.addColorStop(1, cBot);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-50, -50, width + 100, height + 100);

    // Draw Stars (Conditional)
    if (showStars) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#cfe8ff";
      ctx.beginPath();
      for (let i = 0; i < 60; i++) {
        const x = (i * 97 + (timeAlive * 120)) % (width + 40) - 20;
        const y = (i * 53) % (height - 160) + 30;
        ctx.rect(x, y, 2, 2);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (this.currentBg !== targetBg) {
      this.prevBg = this.currentBg;
      this.currentBg = targetBg;
      this.bgAlpha = 0;
    }

    if (this.bgAlpha < 1) {
      this.bgAlpha += 0.01; // Fade speed
      if (this.bgAlpha > 1) this.bgAlpha = 1;
    }

    const drawBg = (img: HTMLImageElement, alpha: number) => {
      if (!img.complete || img.naturalWidth === 0) return;
      ctx.globalAlpha = alpha;
      const bgW = img.naturalWidth;
      const parallax = 0.15;
      const scroll = (distance * parallax) % bgW;
      ctx.drawImage(img, -scroll, 0, bgW, height);
      ctx.drawImage(img, bgW - scroll, 0, bgW, height);
      ctx.globalAlpha = 1;
    };

    if (this.prevBg && this.bgAlpha < 1) {
      drawBg(this.prevBg, 1 - this.bgAlpha);
    }
    if (this.currentBg) {
      drawBg(this.currentBg, this.bgAlpha);
    }

    // Mountains
    ctx.fillStyle = mountainColor;
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
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, gy, width, CONSTANTS.GROUND_H);
    ctx.fillStyle = groundAccent;
    ctx.fillRect(0, gy, width, 5);

    // Footprints
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); // Batch footprints
    for (const fp of footprints) {
      ctx.moveTo(fp.x + 8, fp.y + 2);
      ctx.ellipse(fp.x, fp.y + 2, 8, 3, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Obstacles
    for (const o of obstacles) {
      if (o.type === 'ceiling') {
        // Draw Ceiling Obstacle: Industrial Metal Crate

        // 1. Metallic Base Gradient
        const grad = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
        grad.addColorStop(0, '#64748b'); // Slate 500
        grad.addColorStop(0.4, '#94a3b8'); // Slate 400 (Highlight)
        grad.addColorStop(1, '#334155'); // Slate 700 (Shadow)

        ctx.fillStyle = grad;
        ctx.fillRect(o.x, o.y, o.w, o.h);

        // 2. Industrial Texture (Diagonal Stripes)
        ctx.save();
        ctx.beginPath();
        ctx.rect(o.x, o.y, o.w, o.h);
        ctx.clip();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 8;
        for (let i = -o.h; i < o.w; i += 20) {
          ctx.beginPath();
          ctx.moveTo(o.x + i, o.y - 10);
          ctx.lineTo(o.x + i + 20, o.y + o.h + 10);
          ctx.stroke();
        }
        ctx.restore();

        // 3. Reinforced Frame
        ctx.strokeStyle = '#1e293b'; // Dark Slate
        ctx.lineWidth = 4;
        ctx.strokeRect(o.x + 2, o.y + 2, o.w - 4, o.h - 4);

        // Inner Highlight Frame
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(o.x + 6, o.y + 6, o.w - 12, o.h - 12);

        // 4. Rivets (Corners)
        ctx.fillStyle = '#cbd5e1'; // Light Grey
        const rSize = 4;
        const margin = 8;
        // Top-Left
        ctx.beginPath(); ctx.arc(o.x + margin, o.y + margin, rSize, 0, Math.PI * 2); ctx.fill();
        // Top-Right
        ctx.beginPath(); ctx.arc(o.x + o.w - margin, o.y + margin, rSize, 0, Math.PI * 2); ctx.fill();
        // Bottom-Left
        ctx.beginPath(); ctx.arc(o.x + margin, o.y + o.h - margin, rSize, 0, Math.PI * 2); ctx.fill();
        // Bottom-Right
        ctx.beginPath(); ctx.arc(o.x + o.w - margin, o.y + o.h - margin, rSize, 0, Math.PI * 2); ctx.fill();

        // 5. Caution Stripe (Bottom Edge)
        ctx.fillStyle = '#eab308'; // Yellow
        ctx.fillRect(o.x + 4, o.y + o.h - 6, o.w - 8, 2);

      }
      else if (o.type === 'mid') {
        // Draw Mid-air Obstacle: Security Drone
        ctx.save();
        ctx.translate(o.x + o.w / 2, o.y + o.h / 2);

        // Hover bobbing effect
        const bob = Math.sin(timeAlive * 8) * 4;
        ctx.translate(0, bob);

        // 1. Drone Body (Spherical/Oval)
        const bodyGrad = ctx.createRadialGradient(-5, -5, 2, 0, 0, 25);
        bodyGrad.addColorStop(0, '#94a3b8');
        bodyGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Glowing "Eye" (Scanner)
        const scannerGlow = Math.abs(Math.sin(timeAlive * 5));
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + scannerGlow * 0.6})`;
        ctx.beginPath();
        ctx.arc(8, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        // Inner lens
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(10, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        // 3. Side Thrusters/Wings
        ctx.fillStyle = '#475569';
        ctx.fillRect(-o.w / 2 - 5, -2, 8, 4); // Left
        ctx.fillRect(o.w / 2 - 3, -2, 8, 4);  // Right

        // Thruster Glow
        ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + scannerGlow * 0.3})`;
        ctx.beginPath();
        ctx.arc(-o.w / 2 - 5, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
      else if (assets.fence.complete && assets.fence.naturalWidth > 0) {
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
        ctx.font = "bold 20px 'Be Vietnam Pro', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("!", wx, wy);
        ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
        ctx.globalAlpha = 1;
      }
    }

    if (state.showTrajectory) {
      this.drawTrajectory(state);
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

    // Player Context
    ctx.save();

    // Physical exhaustion effect (shivering)
    let shiverX = 0, shiverY = 0;
    if (state.deathCount >= 50) {
      // Starts at 50 deaths, intensity increases up to 100
      const shiverIntensity = Math.min(5, (state.deathCount - 50) / 10);
      shiverX = (Math.random() - 0.5) * shiverIntensity;
      shiverY = (Math.random() - 0.5) * shiverIntensity;
    }

    ctx.translate(player.x + shiverX, player.y + shiverY);

    // Optimized Player Glow
    const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
    const glowAlpha = Math.max(0, 0.15 - (state.deathCount * 0.001)); // Glow fades slower, reaches min at 150
    glow.addColorStop(0, `rgba(255, 255, 200, ${glowAlpha})`);
    glow.addColorStop(1, "rgba(255, 255, 200, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();

    let rot = 0;
    if (!player.onGround) {
      rot = Math.min(0.5, Math.max(-0.5, player.vy / 1000));
    }
    // Exhaustion tilt: reaches max at 100 deaths
    const exhaustionTilt = Math.min(0.3, (state.deathCount / 100));
    ctx.rotate(rot + exhaustionTilt);

    const horseAsset = assets.horses[player.horseSkin] || assets.horses['default'];
    if (horseAsset && horseAsset.complete && horseAsset.naturalWidth > 0) {
      const drawSize = 48;
      const offset = drawSize / 2;

      ctx.drawImage(horseAsset, -offset, -offset, drawSize, drawSize);

      // Procedural Scars and Dirt (Starts at 25 deaths)
      if (state.deathCount >= 25) {
        ctx.save();
        const numScars = Math.min(12, Math.floor((state.deathCount - 25) / 6) + 1);
        ctx.strokeStyle = "rgba(60, 0, 0, 0.6)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < numScars; i++) {
          const seed = (i * 13.5) % 30;
          const sx = -15 + (seed % 30);
          const sy = -10 + ((seed * 7) % 20);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + 5, sy + 5);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(40, 30, 20, 0.5)";
        for (let i = 0; i < numScars; i++) {
          const dx = 10 - ((i * 17) % 25);
          const dy = 5 - ((i * 23) % 15);
          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      const wingsAsset = assets.wings[player.wingsSkin] || assets.wings['default'];
      if (!player.onGround && wingsAsset && wingsAsset.complete && wingsAsset.naturalWidth > 0) {
        ctx.save();
        ctx.translate(-15, -12);
        const flapSpeed = player.vy < 0 ? 25 : 12;
        const flapAngle = Math.sin(timeAlive * flapSpeed) * 0.5;
        ctx.rotate(flapAngle - 0.1);

        // Tattered wings: reaches 0.2 alpha at 100 deaths
        // Drawing original wings without color filter
        ctx.drawImage(wingsAsset, -15, -10, 30, 20);
        ctx.restore();
      }

      if (player.charging) {
        // ... (charging effects logic unchanged)
        const p = Math.min(1, player.chargeT / CONSTANTS.MAX_CHARGE);
        ctx.globalCompositeOperation = "lighter";

        const parts = 5 + Math.floor(p * 10);
        ctx.fillStyle = `rgba(255, 230, 100, ${0.5 + p * 0.5})`;
        for (let i = 0; i < parts; i++) {
          const px = (Math.random() - 0.5) * 40;
          const py = (Math.random() - 0.5) * 40;
          const ph = 10 + Math.random() * 20 * p;
          ctx.fillRect(px, py - ph / 2, 2, ph);
        }

        ctx.beginPath();
        const auraR = 25 + p * 15;
        for (let i = 0; i <= 360; i += 20) {
          const rad = (i * Math.PI) / 180;
          const r = auraR + (Math.random() - 0.5) * 10 * p;
          const ax = Math.cos(rad) * r;
          const ay = Math.sin(rad) * r;
          if (i === 0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
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
          for (let k = 0; k < 3; k++) { lx += (Math.random() - 0.5) * 20; ly += (Math.random() - 0.5) * 20; ctx.lineTo(lx, ly); }
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // Eyes logic - Starts at 75 deaths
      const ex = 9, ey = -7.5;
      if (player.isBlinking) {
        ctx.fillStyle = "#dfa";
        ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ex - 3, ey); ctx.lineTo(ex + 3, ey); ctx.stroke();
      } else if (state.deathCount >= 75) {
        // Tired eyes intensity grows from 75 to 100
        const eyeRedness = Math.min(0.6, (state.deathCount - 75) / 40);
        ctx.fillStyle = `rgba(255, 0, 0, ${eyeRedness})`;
        ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(ex, ey, 2, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = `rgba(0, 0, 0, ${0.2 + eyeRedness})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(ex, ey + 4, 3, 0.2, Math.PI - 0.2); ctx.stroke();
      }

    } else {
      ctx.beginPath(); ctx.fillStyle = "#7dd3fc";
      ctx.arc(0, 0, CONSTANTS.PLAYER_R, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    if (player.charging) {
      const p = Math.min(1, player.chargeT / CONSTANTS.MAX_CHARGE);
      const bw = 88, bh = 10;
      const bx = player.x - bw / 2;
      const by = player.y - CONSTANTS.PLAYER_R - 26;
      ctx.fillStyle = "#0f172a"; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#22c55e"; ctx.fillRect(bx, by, bw * p, bh);
      ctx.strokeStyle = "#334155"; ctx.strokeRect(bx, by, bw, bh);
    }

    ctx.restore();
  }
}
