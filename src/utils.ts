let colorsCalculatedCache: { [colors: string]: string } = {};

/**
 * Creates a solid color from an translucent foreground.
 * @param fg foreground color
 * @param bg background color
 * @returns calculated solid color
 */
export function getSolidFromAlphaColor(fg: string, bg: string) {
  if (colorsCalculatedCache[fg + bg]) {
    return colorsCalculatedCache[fg + bg];
  }

  let fgColor = parseColor(fg.toUpperCase());
  if (fgColor.length < 4) {
    return fg;
  }

  let bgColor = parseColor(bg.toUpperCase());
  if (bgColor.length < 4) {
    bgColor.push(1.0);
  }

  let finalColor = [
    bgColor[0] + (fgColor[0] - bgColor[0]) * fgColor[3],
    bgColor[1] + (fgColor[1] - bgColor[1]) * fgColor[3],
    bgColor[2] + (fgColor[2] - bgColor[2]) * fgColor[3],
  ];

  colorsCalculatedCache[fg + bg] = `rgb(${finalColor.join(',')})`;
  return `rgb(${finalColor.join(',')})`;
}

/**
 * Parses a given color into a useable rgb array.
 * @param input rgb or hex css string
 * @returns color as rgb array
 */
function parseColor(input: string) {
  if (input.substring(0, 1) === '#') {
    let collen = (input.length - 1) / 3;
    let factors = [17, 1, 0.062272];
    let fact = factors[collen - 1];
    return [
      Math.round(parseInt(input.substring(1, 1 + collen), 16) * fact),
      Math.round(parseInt(input.substring(1 + collen, 1 + 2 * collen), 16) * fact),
      Math.round(parseInt(input.substring(1 + 2 * collen), 16) * fact),
    ];
  } else {
    return input
      .split('(')[1]
      .split(')')[0]
      .split(',')
      .map((x) => +x);
  }
}

// Taken from https://github.com/grafana/grafana/blob/main/packages/grafana-ui/src/utils/measureText.ts
// I want to ensure this function remains available regardless of Grafana version
const context = document.createElement('canvas').getContext('2d')!;
const cache = new Map<string, TextMetrics>();
const cacheLimit = 500;
let ctxFontStyle = '';

export function measureText(text: string, fontSize: number): TextMetrics {
  const fontStyle = `${fontSize}px 'Roboto'`;
  const cacheKey = text + fontStyle;
  const fromCache = cache.get(cacheKey);

  if (fromCache) {
    return fromCache;
  }

  if (ctxFontStyle !== fontStyle) {
    context.font = ctxFontStyle = fontStyle;
  }

  const metrics = context.measureText(text);

  if (cache.size === cacheLimit) {
    cache.clear();
  }

  cache.set(cacheKey, metrics);

  return metrics;
}
