export function rand(a, b) {
  return a + Math.random() * (b - a);
}

export function circleRect(cx, cy, r, rx, ry, rw, rh) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nx, dy = cy - ny;
  return (dx * dx + dy * dy) <= r * r;
}
