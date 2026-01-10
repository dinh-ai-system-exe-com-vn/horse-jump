import { GAME_SETTINGS, CONSTANTS, type DifficultyId } from './constants';

export type PlayerState = {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  charging: boolean;
  chargeT: number;
  blinkTimer: number;
  isBlinking: boolean;
  canDoubleJump: boolean;
  horseSkin: string;
  wingsSkin: string;
  hasJumped: boolean;       // Anti-cheat: Track if player actually jumped
  currentJumpScore: number; // Anti-cheat: Track obstacles cleared in one jump
};

export type Obstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'wall' | 'ceiling' | 'mid';
  passed: boolean;
  baseY?: number;
  moveAmplitude?: number;
  moveSpeed?: number;
  movePhase?: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
};

export type Footprint = {
  x: number;
  y: number;
};

export class GameState {
  score: number;
  best: number;
  deathCount: number;
  timeAlive: number;
  speed: number;
  shake: number;
  distance: number;
  gameOver: boolean;
  inMenu: boolean;
  showTrajectory: boolean;
  isCheater: boolean;
  difficulty: DifficultyId;
  player: PlayerState;
  obstacles: Obstacle[];
  particles: Particle[];
  footprints: Footprint[];


  constructor() {
    this.score = 0;
    this.best = parseInt(localStorage.getItem('chargeJumpBest')) || 0;
    this.deathCount = parseInt(localStorage.getItem('chargeJumpDeaths')) || 0;
    this.timeAlive = 0;
    this.speed = GAME_SETTINGS.speed.base;
    this.shake = 0;
    this.distance = 0;
    this.gameOver = false;
    this.inMenu = true;
    this.showTrajectory = false;
    this.isCheater = false;
    this.difficulty = GAME_SETTINGS.defaultDifficulty;

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
      horseSkin: localStorage.getItem('chargeJumpHorse') || 'default',
      wingsSkin: localStorage.getItem('chargeJumpWings') || 'default',
      hasJumped: false,
      currentJumpScore: 0,
    };

    this.obstacles = [];
    this.particles = [];
    this.footprints = [];
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('chargeJumpBest', String(this.best));
    }
  }

  saveDeaths() {
    localStorage.setItem('chargeJumpDeaths', String(this.deathCount));
  }

  reset() {
    this.gameOver = false;
    this.score = 0;
    this.timeAlive = 0;
    this.speed = GAME_SETTINGS.speed.base;
    this.shake = 0;
    this.distance = 0;
    this.isCheater = false;

    this.player.x = 140;
    // Note: Y reset depends on innerHeight, handled in GameEngine or resized
    this.player.vy = 0;
    this.player.onGround = true;
    this.player.charging = false;
    this.player.chargeT = 0;
    this.player.canDoubleJump = true;
    this.player.hasJumped = false;
    this.player.currentJumpScore = 0;

    this.obstacles = [];
    this.particles = [];
    this.footprints = [];
  }
}
