export const assets = {
  horse: new Image(),
  fence: new Image(),
  wings: new Image(),
};

export function loadAssets() {
  assets.horse.src = "horse.svg";
  assets.fence.src = "fence.svg";
  assets.wings.src = "wings.svg";
}
