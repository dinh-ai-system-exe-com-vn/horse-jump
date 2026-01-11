import { CONSTANTS, GAME_SETTINGS } from './constants';
import { rand, circleRect } from './utils';
import { GameState, type Obstacle } from './state';
import { audioManager } from './audio';
import { Renderer } from './renderer';

type UIUpdateCallback = (state: GameState) => void;

export class GameEngine {
  state: GameState;
  renderer: Renderer;
  onUIUpdate: UIUpdateCallback;
  running: boolean;
  tPrev: number;
  reqId: number | null;
  trueScore: number;
  isLooping: boolean;

  constructor(canvas: HTMLCanvasElement, onUIUpdate: UIUpdateCallback) {
    this.state = new GameState();
    this.renderer = new Renderer(canvas);
    this.onUIUpdate = onUIUpdate;
    this.running = true;
    this.tPrev = performance.now();
    this.reqId = null;
    this.trueScore = 0;

    let internalScore = 0;
    Object.defineProperty(this.state, 'score', {
      get: () => internalScore,
      set: (val) => {
        if (val !== this.trueScore) {
          this.state.isCheater = true;
        }
        internalScore = val;
      }
    });

    this.spawnObstacle(true);
    this.isLooping = false;
  }

  start() {
    if (!this.isLooping) {
      this.isLooping = true;
      this.loop(performance.now());
    }
  }

  stop() {
    if (this.reqId !== null) {
      cancelAnimationFrame(this.reqId);
    }
    this.running = false;
    this.isLooping = false;
  }

  destroy() {
    this.stop();
  }

  press() {
    if (this.state.inMenu || this.state.gameOver) return;
    const { player } = this.state;

    if (!player.onGround && player.canDoubleJump) {
      player.vy = -CONSTANTS.BASE_JUMP * 0.9;
      player.canDoubleJump = false;
      player.charging = false;
      this.state.totalJumps++; // Đếm cú nhảy đôi
      audioManager.jump();
      for (let i = 0; i < 5; i++) this.spawnDust(player.x, player.y + CONSTANTS.PLAYER_R);
      return;
    }
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
      player.hasJumped = true;
      player.currentJumpScore = 0;
      this.state.totalJumps++; // Đếm cú nhảy từ mặt đất
      this.state.shake = 10 * p;
      audioManager.jump();
    }
  }

  startGame() {
    audioManager.resume();
    const antiDebugger = () => {
      if (this.state.gameOver) return;
      (function () { }.constructor("debugger")());
      setTimeout(antiDebugger, 100);
    };
    this.state.inMenu = false;
    this.trueScore = 0;
    this.state.reset();
    antiDebugger();
    this.spawnObstacle(true);
    this.onUIUpdate(this.state);
    this.start();
  }

  resetGame() {
    audioManager.resume();
    this.trueScore = 0;
    this.state.reset();
    const antiDebugger = () => {
      if (this.state.gameOver) return;
      (function () { }.constructor("debugger")());
      setTimeout(antiDebugger, 100);
    };
    antiDebugger();
    this.spawnObstacle(true);
    this.onUIUpdate(this.state);
    this.start();
  }

  toggleTrajectory() {
    this.state.showTrajectory = !this.state.showTrajectory;
    this.onUIUpdate(this.state);
  }

  spawnObstacle(initial = false) {
    const { obstacles } = this.state;
    const width = this.renderer.width;
    const obstacleSettings = GAME_SETTINGS.obstacles;
    const difficultySettings = GAME_SETTINGS.difficulties[this.state.difficulty] ?? GAME_SETTINGS.difficulties[GAME_SETTINGS.defaultDifficulty];
    const lastOb = obstacles[obstacles.length - 1];
    let forceEasy = false;

    if (lastOb && lastOb.type === 'wall' && (lastOb.h / CONSTANTS.BLOCK_SIZE) === 3) {
      if (Math.random() < 0.5) forceEasy = true;
    }

    let type: Obstacle['type'] = 'wall';
    const roll = Math.random();

    if (!initial && !forceEasy) {
      const score = this.trueScore;
      const canSpawnMid = score >= obstacleSettings.mid.minScore;
      const canSpawnCeiling = score >= obstacleSettings.ceiling.minScore;

      if (canSpawnMid && roll < difficultySettings.midChance) {
        type = 'mid';
      } else if (canSpawnCeiling && roll < (canSpawnMid ? difficultySettings.midChance : 0) + difficultySettings.ceilingChance) {
        type = 'ceiling';
      }
    }
    let x = 0, w = 0, h = 0, y = 0, rows = 0;
    const groundY = this.renderer.groundY();
    let baseY: number | undefined, moveAmplitude: number | undefined, moveSpeed: number | undefined, movePhase: number | undefined;

    if (type === 'ceiling') {
      const clearance = obstacleSettings.ceiling.clearance;
      h = obstacleSettings.ceiling.height;
      w = rand(obstacleSettings.ceiling.width.min, obstacleSettings.ceiling.width.max);
      y = groundY - clearance - h;
    } else if (type === 'mid') {
      h = obstacleSettings.mid.height;
      w = obstacleSettings.mid.width;
      const yr = obstacleSettings.mid.yRange;
      baseY = groundY - rand(yr.min, yr.max);
      y = baseY;
      moveAmplitude = obstacleSettings.mid.moveAmplitude;
      moveSpeed = obstacleSettings.mid.moveSpeed;
      movePhase = Math.random() * Math.PI * 2;
    } else {
      if (forceEasy) {
        rows = Math.random() < 0.6 ? 1 : 2;
      } else {
        let totalWeight = 0;
        for (const entry of difficultySettings.wallHeightWeights) totalWeight += entry.weight;
        let pick = Math.random() * totalWeight;
        for (const entry of difficultySettings.wallHeightWeights) {
          if (pick <= entry.weight) { rows = entry.rows; break; }
          pick -= entry.weight;
        }
      }
      if (rows === 0) rows = 1;
      const diff = this.state.difficulty;
      const colChance = diff === 'hard' ? 0.8 : 0.5;
      const cols = Math.random() < colChance ? 2 : 1;
      w = cols * CONSTANTS.BLOCK_SIZE;
      h = rows * CONSTANTS.BLOCK_SIZE;
      y = groundY - h;
    }

    if (initial) {
      x = width + rand(obstacleSettings.initialSpawnRange.min, obstacleSettings.initialSpawnRange.max);
    } else {
      let gapMin = difficultySettings.gap.min;
      let gapMax = difficultySettings.gap.max;
      if (lastOb) {
        // Prepare gap adjustments
        if (lastOb.type === 'wall') {
          const lastH = lastOb.h / CONSTANTS.BLOCK_SIZE;
          const currentH = h / CONSTANTS.BLOCK_SIZE;

          if (lastH >= 2) {
            // Previous was tall, need cooldown
            gapMin += obstacleSettings.gapAdjustments.tallWall.min;
            gapMax += obstacleSettings.gapAdjustments.tallWall.max;
          } else if (lastH === 1 && currentH === 3) {
            // Short then Tall: NEED extra space to charge safely
            gapMin += obstacleSettings.gapAdjustments.shortToTall.min;
            gapMax += obstacleSettings.gapAdjustments.shortToTall.max;
          }
        } else if (lastOb.type === 'ceiling') {
          gapMin += 50; gapMax += 100;
        } else if (lastOb.type === 'mid') {
          gapMin += 25; gapMax += 75;
        }
      }
      const nextX = (lastOb ? lastOb.x + lastOb.w : width) + rand(gapMin, gapMax);
      x = Math.max(width + obstacleSettings.minSpawnPadding, nextX);
    }
    obstacles.push({ x, w, h, y, type, passed: false, baseY, moveAmplitude, moveSpeed, movePhase });
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

  update(dt: number) {
    const { state } = this;
    if (!this.running || state.inMenu) return;
    if (!state.gameOver) {
      const scoreValue = Number(state.score);
      const speedSettings = GAME_SETTINGS.speed;
      const expectedSpeed = speedSettings.mode === 'step'
        ? Math.min(speedSettings.base + Math.floor(this.trueScore / speedSettings.step.scoreStep) * speedSettings.step.speedStep, speedSettings.step.max)
        : speedSettings.base + this.trueScore * speedSettings.linear.gainPerScore;

      if (this.trueScore < 5) state.difficulty = 'easy';
      else if (this.trueScore < 15) state.difficulty = 'normal';
      else state.difficulty = 'hard';

      if (state.isCheater) { state.speed = 3000; state.shake = 50; }
      else state.speed = expectedSpeed;

      state.timeAlive += dt;
      state.distance += state.speed * dt;

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.life -= dt * 2; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life <= 0) state.particles.splice(i, 1);
      }
      for (let i = state.footprints.length - 1; i >= 0; i--) {
        state.footprints[i].x -= state.speed * dt;
        if (state.footprints[i].x < -20) state.footprints.splice(i, 1);
      }

      const { player } = state;
      const groundY = this.renderer.groundY();

      if (player.onGround) {
        this.spawnDust(player.x - 10, player.y + CONSTANTS.PLAYER_R - 5);
        const lastFp = state.footprints[state.footprints.length - 1];
        if (!lastFp || (player.x - lastFp.x > 40)) state.footprints.push({ x: player.x, y: groundY });
      }

      if (player.charging) {
        player.chargeT += dt;
        if (player.chargeT > CONSTANTS.MAX_CHARGE) player.chargeT = CONSTANTS.MAX_CHARGE;
      }

      player.blinkTimer -= dt;
      if (player.blinkTimer <= 0) {
        if (player.isBlinking) { player.isBlinking = false; player.blinkTimer = rand(2, 5); }
        else { player.isBlinking = true; player.blinkTimer = 0.15; }
      }

      player.vy += CONSTANTS.G * dt;
      player.y += player.vy * dt;
      const gy = groundY - CONSTANTS.PLAYER_R;
      if (player.y >= gy) { player.y = gy; player.vy = 0; player.onGround = true; player.canDoubleJump = true; player.hasJumped = false; player.currentJumpScore = 0; }
      else player.onGround = false;

      for (const o of state.obstacles) {
        o.x -= state.speed * dt;
        if (o.type === 'mid' && o.baseY !== undefined && o.moveAmplitude !== undefined && o.movePhase !== undefined && o.moveSpeed !== undefined) {
          o.movePhase += dt * o.moveSpeed; o.y = o.baseY + Math.sin(o.movePhase) * o.moveAmplitude;
        }
        if (!o.passed && o.x + o.w < player.x - CONSTANTS.PLAYER_R) {
          o.passed = true;
          if (player.hasJumped) {
            this.trueScore += 1; state.score = this.trueScore;
            player.currentJumpScore += 1;
            if (player.currentJumpScore > 3) state.isCheater = true;
          }
          this.onUIUpdate(state);
        }
      }
      if (state.obstacles.length > 0 && state.obstacles[0].x + state.obstacles[0].w < -100) state.obstacles.shift();
      const lastOb = state.obstacles[state.obstacles.length - 1];
      if (!lastOb || lastOb.x + lastOb.w < this.renderer.width + GAME_SETTINGS.obstacles.spawnAheadBuffer) this.spawnObstacle(lastOb ? false : true);

      for (const o of state.obstacles) {
        if (circleRect(player.x, player.y, CONSTANTS.PLAYER_R, o.x, o.y, o.w, o.h)) {
          state.gameOver = true; state.deathCount++;
          state.saveDeaths(); state.saveBest();
          state.shake = 14; audioManager.crash();
          this.onUIUpdate(state);
          break;
        }
      }
    }
    state.shake = Math.max(0, state.shake - 40 * dt);
  }

  loop(now: number) {
    if (!this.running) return;
    const dt = Math.min(0.033, (now - this.tPrev) / 1000);
    this.tPrev = now;
    this.update(dt);
    this.renderer.draw(this.state);
    if (this.state.inMenu || this.state.gameOver) { this.isLooping = false; return; }
    this.reqId = requestAnimationFrame((t) => this.loop(t));
  }
}
