import { CONSTANTS } from './constants.js';

export class GameState {
  constructor() {
    this.score = 0;
    this.best = parseInt(localStorage.getItem('chargeJumpBest')) || 0;
    this.timeAlive = 0;
    this.speed = CONSTANTS.SPEED_BASE;
    this.shake = 0;
    this.distance = 0;
    this.gameOver = false;
    this.inMenu = true;
    this.showTrajectory = true;
    
    // Entities
    this.player = {
      x: 140,
      y: 0,
      vy: 0,
      onGround: true,
      charging: false,
      chargeT: 0,
      blinkTimer: 0,
      isBlinking: false,
      canDoubleJump: true,
    };
    
    this.obstacles = [];
    this.particles = [];
    this.footprints = [];
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('chargeJumpBest', this.best);
    }
  }

  reset() {
    this.gameOver = false;
    this.score = 0;
    this.timeAlive = 0;
    this.speed = CONSTANTS.SPEED_BASE;
    this.shake = 0;
    this.distance = 0;

    this.player.x = 140;
    // Note: Y reset depends on innerHeight, handled in GameEngine or resized
    this.player.vy = 0;
    this.player.onGround = true;
    this.player.charging = false;
    this.player.chargeT = 0;
    this.player.canDoubleJump = true;

    this.obstacles = [];
    this.particles = [];
    this.footprints = [];
  }
}
