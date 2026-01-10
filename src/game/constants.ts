export type SkinDefinition = {
  id: string;
  name: string;
  src: string;
};

export type DifficultyId = 'easy' | 'normal' | 'hard';

export type DifficultyConfig = {
  gap: {
    min: number;
    max: number;
  };
  ceilingChance: number;
  midChance: number;
  wallHeightWeights: Array<{
    rows: number;
    weight: number;
  }>;
};

export type SpeedMode = 'linear' | 'step';

export type SpeedConfig = {
  mode: SpeedMode;
  base: number;
  linear: {
    gainPerScore: number;
  };
  step: {
    scoreStep: number;
    speedStep: number;
    max: number;
  };
};

export type GameSettings = {
  defaultDifficulty: DifficultyId;
  speed: SpeedConfig;
  obstacles: {
    initialSpawnRange: {
      min: number;
      max: number;
    };
    minSpawnPadding: number;
    spawnAheadBuffer: number;
    gapAdjustments: {
      tallWall: {
        min: number;
        max: number;
      };
      shortToTall: {
        min: number;
        max: number;
      };
    };
    wall: {
      columns: {
        min: number;
        max: number;
      };
      maxRows: number;
    };
    ceiling: {
      minScore: number;
      clearance: number;
      height: number;
      width: {
        min: number;
        max: number;
      };
    };
    mid: {
      minScore: number;
      height: number;
      width: number;
      yRange: { min: number; max: number };
      moveAmplitude: number;
      moveSpeed: number;
    };
  };
  difficulties: Record<DifficultyId, DifficultyConfig>;
};

export const GAME_SETTINGS: GameSettings = {
  defaultDifficulty: 'normal',
  speed: {
    mode: 'step',
    base: 500,
    linear: {
      gainPerScore: 10,
    },
    step: {
      scoreStep: 10,
      speedStep: 35,
      max: 1100,
    },
  },
  obstacles: {
    initialSpawnRange: {
      min: 100,
      max: 300,
    },
    minSpawnPadding: 80,
    spawnAheadBuffer: 150,
    gapAdjustments: {
      tallWall: {
        min: 300,
        max: 450,
      },
      shortToTall: {
        min: 250,
        max: 400,
      },
    },
    wall: {
      columns: {
        min: 1,
        max: 2,
      },
      maxRows: 3,
    },
    ceiling: {
      minScore: 10,
      clearance: 75,
      height: 60,
      width: {
        min: 160,
        max: 450,
      },
    },
    mid: {
      minScore: 20,
      height: 40,
      width: 60,
      yRange: { min: 120, max: 200 },
      moveAmplitude: 40,
      moveSpeed: 3,
    },
  },
  difficulties: {
    easy: {
      gap: { min: 380, max: 650 },
      ceilingChance: 0.15,
      midChance: 0,
      wallHeightWeights: [
        { rows: 1, weight: 0.5 },
        { rows: 2, weight: 0.35 },
        { rows: 3, weight: 0.15 },
      ],
    },
    normal: {
      gap: { min: 320, max: 550 },
      ceilingChance: 0.25,
      midChance: 0.1,
      wallHeightWeights: [
        { rows: 1, weight: 0.35 },
        { rows: 2, weight: 0.35 },
        { rows: 3, weight: 0.3 },
      ],
    },
    hard: {
      gap: { min: 280, max: 480 },
      ceilingChance: 0.35,
      midChance: 0.25,
      wallHeightWeights: [
        { rows: 1, weight: 0.2 },
        { rows: 2, weight: 0.3 },
        { rows: 3, weight: 0.5 },
      ],
    },
  },
};

export const CONSTANTS = {
  G: 2200,
  GROUND_H: 110,
  PLAYER_R: 18,
  BASE_JUMP: 650,
  MAX_CHARGE: 1.35,
  CHARGE_MULT: 1.6,
  BLOCK_SIZE: 64,
  HORSE_SKINS: [
    { id: 'default', name: 'Original', src: 'horse.svg' },
    { id: 'fire', name: 'Fire Steed', src: 'horse_fire.svg' },
    { id: 'spirit', name: 'Spirit Gallop', src: 'horse_spirit.svg' },
    { id: 'gold', name: 'Golden Myth', src: 'horse_gold.svg' },
    { id: 'shadow_neon', name: 'Neon Shadow', src: 'horse_shadow_neon.svg' },
  ] as SkinDefinition[],
  WINGS_SKINS: [
    { id: 'default', name: 'Basic', src: 'wings.svg' },
    { id: 'angel', name: 'Heavenly', src: 'wings_angel.svg' },
    { id: 'mecha', name: 'Cybernetic', src: 'wings_mecha.svg' },
    { id: 'butterfly', name: 'Vibrant', src: 'wings_butterfly.svg' },
    { id: 'bat_purple', name: 'Neon Bat', src: 'wings_bat_neon.svg' },
  ] as SkinDefinition[],
};
