import { CONSTANTS } from './constants';

type ImageMap = Record<string, HTMLImageElement>;

export const assets: {
  horses: ImageMap;
  wings: ImageMap;
  fence: HTMLImageElement;
  backgrounds: {
    earth: HTMLImageElement;
    mars: HTMLImageElement;
    jupiter: HTMLImageElement;
    saturn: HTMLImageElement;
    mercury: HTMLImageElement;
    venus: HTMLImageElement;
    uranus: HTMLImageElement;
    neptune: HTMLImageElement;
    sun: HTMLImageElement;
  };
} = {
  horses: {},
  wings: {},
  fence: new Image(),
  backgrounds: {
    earth: new Image(),
    mars: new Image(),
    jupiter: new Image(),
    saturn: new Image(),
    mercury: new Image(),
    venus: new Image(),
    uranus: new Image(),
    neptune: new Image(),
    sun: new Image(),
  },
};

export function loadAssets() {
  CONSTANTS.HORSE_SKINS.forEach((skin) => {
    assets.horses[skin.id] = new Image();
    assets.horses[skin.id].src = skin.src;
  });

  CONSTANTS.WINGS_SKINS.forEach((skin) => {
    assets.wings[skin.id] = new Image();
    assets.wings[skin.id].src = skin.src;
  });

  assets.fence.src = "fence.svg";
  assets.backgrounds.earth.src = "bg_earth.svg";
  assets.backgrounds.mars.src = "bg_mars.svg";
  assets.backgrounds.jupiter.src = "bg_jupiter.svg";
  assets.backgrounds.saturn.src = "bg_saturn.svg";
  assets.backgrounds.mercury.src = "bg_mercury.svg";
  assets.backgrounds.venus.src = "bg_venus.svg";
  assets.backgrounds.uranus.src = "bg_uranus.svg";
  assets.backgrounds.neptune.src = "bg_neptune.svg";
  assets.backgrounds.sun.src = "bg_sun.svg";
}
