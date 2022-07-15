import { GrafanaTheme2 } from '@grafana/data';
import merge from 'lodash.merge';
import { Anchor, DrawnNode, Link, Node, Weathermap } from 'types';
import { v4 as uuidv4 } from 'uuid';

export const CURRENT_VERSION = 3;

let colorsCalculatedCache: { [colors: string]: string } = {};

/**
 * Creates a solid color from an translucent foreground.
 * @param fg foreground color
 * @param bg background color
 * @returns calculated solid color
 */
export function getSolidFromAlphaColor(fg: string, bg: string): string {
  if (bg.startsWith('image')) {
    return getSolidFromAlphaColor(fg, bg.split('|', 3)[1]);
  }

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

// Find the nearest place to snap to on the grid
export function nearestMultiple(input: number, grid: number): number {
  return Math.ceil(input / grid) * grid;
}

// Calculate the automatically determined widths for nodes with multiple links.
export function calculateRectangleAutoWidth(d: DrawnNode, wm: Weathermap): number {
  const widerSideLinks = Math.max(d.anchors[Anchor.Top].numLinks, d.anchors[Anchor.Bottom].numLinks);

  const maxWidth =
    wm.settings.link.stroke.width * (widerSideLinks - 1) +
    wm.settings.link.spacing.horizontal * (widerSideLinks - 1) +
    d.padding.horizontal * 2;

  let final = 0;
  if (d.label !== undefined) {
    const labeledWidth = d.labelWidth + d.padding.horizontal * 2;
    if (!d.useConstantSpacing) {
      final = labeledWidth;
    } else {
      final = Math.max(labeledWidth, maxWidth);
    }
  } else {
    final = 0;
  }

  if (
    d.nodeIcon?.drawInside &&
    final < d.nodeIcon.padding.horizontal + d.nodeIcon.size.width + d.padding.horizontal * 2
  ) {
    final += d.nodeIcon.padding.horizontal + d.nodeIcon.size.width + d.padding.horizontal * 2 - final;
  }
  return final;
}

// Calculate the auto-determined height of a node's rectangle
export function calculateRectangleAutoHeight(d: DrawnNode, wm: Weathermap): number {
  const numLinks = Math.max(1, Math.max(d.anchors[Anchor.Left].numLinks, d.anchors[Anchor.Right].numLinks));
  let minHeight = wm.settings.fontSizing.node + 2 * d.padding.vertical; // fontSize + padding

  if (d.nodeIcon?.drawInside) {
    minHeight += d.nodeIcon.size.height + 2 * d.nodeIcon.padding.vertical;
  }

  if (d.nodeIcon && d.label === '') {
    minHeight -= wm.settings.fontSizing.node;
  }

  const linkHeight = wm.settings.link.stroke.width + wm.settings.link.spacing.vertical + 2 * d.padding.vertical;
  const fullHeight = linkHeight * numLinks - wm.settings.link.spacing.vertical;
  let final = !d.compactVerticalLinks && fullHeight > minHeight ? fullHeight : minHeight;

  return final;
}

// Generate a basic Node at a certain position and with a certain label.
export function generateBasicNode(label: string, position: [number, number], theme: GrafanaTheme2): Node {
  return {
    id: uuidv4(),
    position,
    label,
    anchors: {
      0: { numLinks: 0, numFilledLinks: 0 },
      1: { numLinks: 0, numFilledLinks: 0 },
      2: { numLinks: 0, numFilledLinks: 0 },
      3: { numLinks: 0, numFilledLinks: 0 },
      4: { numLinks: 0, numFilledLinks: 0 },
    },
    useConstantSpacing: false,
    compactVerticalLinks: false,
    padding: {
      vertical: 4,
      horizontal: 10,
    },
    colors: {
      font: theme.colors.secondary.contrastText,
      background: theme.colors.secondary.main,
      border: theme.colors.secondary.border,
    },
    nodeIcon: {
      src: '',
      name: '',
      size: {
        width: 0,
        height: 0,
      },
      padding: {
        vertical: 0,
        horizontal: 0,
      },
      drawInside: false,
    },
  };
}

export function generateBasicLink(nodes?: [Node, Node]): Link {
  return {
    id: uuidv4(),
    // @ts-ignore
    nodes: nodes ? nodes : [],
    sides: {
      A: {
        bandwidth: 0,
        bandwidthQuery: undefined,
        query: undefined,
        labelOffset: 55,
        anchor: Anchor.Right,
        dashboardLink: '',
      },
      Z: {
        bandwidth: 0,
        bandwidthQuery: undefined,
        query: undefined,
        labelOffset: 55,
        anchor: Anchor.Left,
        dashboardLink: '',
      },
    },
    units: undefined,
  };
}

// Handle file uploading errors consistently
export function handleFileUploadErrors(files: FileList | null): void {
  if (files && files[0]) {
    if (files[0].size > 1000000) {
      throw new Error('File must be less than 1MB in size.');
    }
    if (!files[0].type.startsWith('image')) {
      throw new Error('File type must be an image format.');
    }
  }
}

export function handleVersionedStateUpdates(wm: Weathermap, theme: GrafanaTheme2): Weathermap {
  const modelWeathermap: Weathermap = {
    version: CURRENT_VERSION,
    id: '',
    nodes: [],
    links: [],
    scale: {},
    settings: {
      link: {
        spacing: {
          horizontal: 10,
          vertical: 5,
        },
        stroke: {
          width: 8,
          color: theme.colors.secondary.main,
        },
        label: {
          background: theme.colors.secondary.main,
          border: theme.colors.secondary.border,
          font: theme.colors.secondary.contrastText,
        },
      },
      linkArrow: {
        width: 8,
        height: 10,
        offset: 2,
      },
      fontSizing: {
        node: 10,
        link: 7,
      },
      panel: {
        backgroundColor: theme.colors.background.primary,
        panelSize: {
          width: 600,
          height: 600,
        },
        zoomScale: 0,
        offset: {
          x: 0,
          y: 0,
        },
        grid: {
          enabled: false,
          size: 10,
          guidesEnabled: false,
        },
      },
      tooltip: {
        fontSize: 8,
        textColor: 'white',
        backgroundColor: 'black',
      },
    },
  };

  wm.version = CURRENT_VERSION;
  wm.nodes = wm.nodes.map((n) => merge(generateBasicNode('Node A', [200, 300], theme), n));
  wm.links = wm.links.map((l) => merge(generateBasicLink(), l));
  wm = merge(modelWeathermap, wm);
  console.log('updated weathermap state version', wm);
  return wm;
}
