// Shared by the network renderer and the landscape's exclusion boundary.
export function matrixGeometry(width: number, height: number) {
  const unit = Math.min(width * 0.25, height * 0.28);
  return {
    unit,
    // Weight labels keep their own scale, so resizing the network leaves the numbers alone.
    labelUnit: Math.min(width * 0.21, height * 0.235),
    centerX: width * 0.54,
    centerY: height * 0.51,
    // Bounds the projected network throughout its sway, including the labels.
    radius: unit * 1.86 + 14,
  };
}

// Neurons per layer, input to output; a lighter network on narrow screens.
export function networkLayers(width: number) {
  return width < 480 ? [3, 5, 5, 2] : [4, 6, 6, 3];
}
