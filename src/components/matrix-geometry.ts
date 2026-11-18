// Shared by the weight renderer and the landscape's exclusion boundary.
export function matrixGeometry(width: number, height: number) {
  const unit = Math.min(width * 0.21, height * 0.235);
  return {
    unit,
    centerX: width * 0.54,
    centerY: height * 0.51,
    // Bounds the projected cube throughout its rotation, including the labels.
    radius: unit * 1.86 + 14,
  };
}

export function matrixSide(width: number) {
  return width < 480 ? 4 : 5;
}
