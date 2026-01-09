import { CONSTANTS } from './constants.js';

export const assets = {
  horses: {},
  wings: {},
  fence: new Image(),
};

export function loadAssets() {
  CONSTANTS.HORSE_SKINS.forEach(skin => {
    assets.horses[skin.id] = new Image();
    assets.horses[skin.id].src = skin.src;
  });

  CONSTANTS.WINGS_SKINS.forEach(skin => {
    assets.wings[skin.id] = new Image();
    assets.wings[skin.id].src = skin.src;
  });

  assets.fence.src = "fence.svg";
}

