import { CONSTANTS } from './constants.js';
import { rand, circleRect } from './utils.js';
import { GameState } from './state.js';
import { audioManager } from './audio.js';
import { Renderer } from './renderer.js';

export class GameEngine {
  constructor(canvas, onUIUpdate) {
    this.state = new GameState();
    this.renderer = new Renderer(canvas);
    this.onUIUpdate = onUIUpdate; // Callback to update React UI
    this.running = true;
    this.tPrev = performance.now();
    this.reqId = null;

    this.spawnObstacle(true);
  }

  start() {
    this.loop(performance.now());
  }

  stop() {
    cancelAnimationFrame(this.reqId);
    this.running = false;
  }

  destroy() {
    this.stop();
    // Cleanup listeners if any (window resize is in Renderer, inputs handled externally or here)
  }

  // Input Handlers called from React or DOM listeners
  press() {
    if (this.state.inMenu || this.state.gameOver) return;
    const { player } = this.state;
    
    if (!player.onGround && player.canDoubleJump) {
      player.vy = -CONSTANTS.BASE_JUMP * 0.9;
      player.canDoubleJump = false;
      player.charging = false;
      audioManager.jump();
      for (let i = 0; i < 5; i++) this.spawnDust(player.x, player.y + CONSTANTS.PLAYER_R);
      return;
    }
    // Fixed: prevent reset if already charging
    if (player.onGround && !player.charging) {
      player.charging = true;
      player.chargeT = 0;
    }
  }

  release() {
    if (this.state.inMenu || this.state.gameOver) return;
    const { player } = this.state;
    
    if (player.charging && player.onGround) {
      const p = Math.min(1, player.chargeT / CONSTANTS.MAX_CHARGE);
      const boost = 1 + p * CONSTANTS.CHARGE_MULT;
      player.vy = -CONSTANTS.BASE_JUMP * boost;
      player.onGround = false;
      player.charging = false;
      player.chargeT = 0;
      this.state.shake = 10 * p;
      audioManager.jump();
    }
  }

  startGame() {
    audioManager.resume();
    this.state.inMenu = false;
    this.state.reset();
    this.spawnObstacle(true);
    this.onUIUpdate(this.state);
  }

  resetGame() {
    this.state.reset();
    this.spawnObstacle(true);
    this.onUIUpdate(this.state);
  }

  toggleTrajectory() {
    this.state.showTrajectory = !this.state.showTrajectory;
    this.onUIUpdate(this.state);
  }

  // Logic
  spawnObstacle(initial = false) {
    const { obstacles } = this.state;
    const width = this.renderer.width; // Use renderer's width which tracks window
    
    const cols = Math.floor(Math.random() * 2) + 1;
    let rows = Math.floor(Math.random() * 3) + 1;

    const lastOb = obstacles[obstacles.length - 1];
    if (lastOb) {
      const lastRows = lastOb.h / CONSTANTS.BLOCK_SIZE;
      if (lastRows >= 2 && rows === lastRows) rows = 1;
    }

    const w = cols * CONSTANTS.BLOCK_SIZE;
    const h = rows * CONSTANTS.BLOCK_SIZE;

    let x;
    if (initial) {
      x = width + rand(100, 300);
    } else {
      let gapMin = CONSTANTS.OBSTACLE_GAP_MIN;
      let gapMax = CONSTANTS.OBSTACLE_GAP_MAX;

      if (rows === 3) {
        gapMin += 300;
        gapMax += 450;
      }

      const nextX = (lastOb ? lastOb.x + lastOb.w : width) + rand(gapMin, gapMax);
      x = Math.max(width + 50, nextX);
    }

    obstacles.push({ x, w, h, y: this.renderer.groundY() - h, passed: false });
  }

  spawnDust(x, y) {
    const count = rand(1, 2);
    for (let i = 0; i < count; i++) {
      this.state.particles.push({
        x: x + rand(-10, 10),
        y: y + rand(-5, 5),
        vx: -this.state.speed + rand(-50, 50),
        vy: rand(-50, -150),
        life: 1.0,
        size: rand(2, 5),
        color: `rgba(180, 160, 140, ${rand(0.4, 0.8)})`
      });
    }
  }

  update(dt) {
    const { state } = this;
    if (!this.running || state.inMenu) return;

    if (!state.gameOver) {
      state.timeAlive += dt;
      state.speed = CONSTANTS.SPEED_BASE + state.score * CONSTANTS.SPEED_GAIN;
      state.distance += state.speed * dt;

      // Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.life -= dt * 2;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // Footprints
      for (let i = state.footprints.length - 1; i >= 0; i--) {
        state.footprints[i].x -= state.speed * dt;
        if (state.footprints[i].x < -20) state.footprints.splice(i, 1);
      }
      
      const { player } = state;
      const groundY = this.renderer.groundY();

      if (player.onGround) {
        this.spawnDust(player.x - 10, player.y + CONSTANTS.PLAYER_R - 5);
        const lastFp = state.footprints[state.footprints.length - 1];
        if (!lastFp || (player.x - lastFp.x > 40)) {
          state.footprints.push({ x: player.x, y: groundY });
        }
      }

      // Player Logic
      if (player.charging) {
        player.chargeT += dt;
        if (player.chargeT > CONSTANTS.MAX_CHARGE) player.chargeT = CONSTANTS.MAX_CHARGE;
      }
      
      player.blinkTimer -= dt;
      if (player.blinkTimer <= 0) {
        if (player.isBlinking) {
          player.isBlinking = false;
          player.blinkTimer = rand(2, 5);
        } else {
          player.isBlinking = true;
          player.blinkTimer = 0.15;
        }
      }

      player.vy += CONSTANTS.G * dt;
      player.y += player.vy * dt;

      const gy = groundY - CONSTANTS.PLAYER_R;
      if (player.y >= gy) {
        player.y = gy;
        player.vy = 0;
        player.onGround = true;
        player.canDoubleJump = true;
      } else {
        player.onGround = false;
      }

      // Obstacles
      for (const o of state.obstacles) {
        o.x -= state.speed * dt;
        if (!o.passed && o.x + o.w < player.x - CONSTANTS.PLAYER_R) {
          o.passed = true;
          state.score += 1;
          // Trigger UI update only on score change to avoid React thrashing
          this.onUIUpdate(state); 
        }
      }

      if (state.obstacles.length > 0 && state.obstacles[0].x + state.obstacles[0].w < -100) {
        state.obstacles.shift();
      }

      const lastOb = state.obstacles[state.obstacles.length - 1];
      if (!lastOb || lastOb.x + lastOb.w < this.renderer.width + 100) {
        this.spawnObstacle(lastOb ? false : true);
      }

      // Collision
      for (const o of state.obstacles) {
        if (circleRect(player.x, player.y, CONSTANTS.PLAYER_R, o.x, o.y, o.w, o.h)) {
          state.gameOver = true;
          state.saveBest();
          state.shake = 14;
          audioManager.crash();
          this.onUIUpdate(state);
          break;
        }
      }
    }

    state.shake = Math.max(0, state.shake - 40 * dt);
  }

  loop(now) {
    if (!this.running) return;
    
    const dt = Math.min(0.033, (now - this.tPrev) / 1000);
    this.tPrev = now;

    this.update(dt);
    this.renderer.draw(this.state);

    this.reqId = requestAnimationFrame((t) => this.loop(t));
  }
}
