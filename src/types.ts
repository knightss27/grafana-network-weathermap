export interface SimpleOptions {
  panelOptions: PanelOptions;
  weathermap: Weathermap;
  enableNodeGrid: boolean;
  gridSizePx: number;
}

export interface PanelOptions {
  backgroundColor: string;
  panelSize: PanelSize;
}

export interface PanelSize {
  width: number,
  height: number,
}

export interface Node {
  ID: string;
  LABEL?: string;
  POSITION: [number, number];
  INFOURL?: string;
  ICON?: string;
  ICONHEIGHT?: string;
  LABELOFFSET?: 'N' | 'S' | 'E' | 'W';
  [propName: string]: any;
}

export interface Link {
  ID: string;
  NODES: [Node, Node];
  bandwidth: number;
  bandwidthQuery: string;
  ASideQuery: string | undefined;
  BSideQuery: string | undefined;
  units: string | undefined;
  TARGET?: string;
  WIDTH?: string;
  [propName: string]: any;
}

export interface DrawnNode {
  ID: string;
  LABEL?: string;
  POSITION: [number, number];
  INFOURL?: string;
  ICON?: string;
  ICONHEIGHT?: string;
  LABELOFFSET?: 'N' | 'S' | 'E' | 'W';
  name: string;
  index: number;
  x: number;
  y: number;
}

export interface DrawnLink {
  ID: string;
  NODES: [Node, Node];
  bandwidth: number;
  bandwidthQuery: string;
  ASideQuery: string | undefined;
  BSideQuery: string | undefined;
  units: string | undefined;
  TARGET?: string;
  WIDTH?: string;
  index: number;
  source: DrawnNode;
  target: DrawnNode,
  currentASideValue: number;
  currentBSideValue: number;
  currentASideValueText: string;
  currentBSideValueText: string;
}

export interface Weathermap {
  NODES: Node[];
  LINKS: Link[];
  SCALE: {[propName: number]: string};
  BG_COLOR: string;
}

