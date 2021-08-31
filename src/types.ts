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
  POSITION: [number, number];
  // links: Link[];
  numLinks: number;
  LABEL?: string;
  INFOURL?: string;
  ICON?: string;
  ICONHEIGHT?: string;
  LABELOFFSET?: 'N' | 'S' | 'E' | 'W';
  [propName: string]: any;
}

export interface Link {
  ID: string;
  NODES: [Node, Node];
  ASideBandwidth: number;
  ZSideBandwidth: number;
  ASideBandwidthQuery: string | undefined;
  ZSideBandwidthQuery: string | undefined;
  ASideQuery: string | undefined;
  ZSideQuery: string | undefined;
  ASideLabelOffset: number;
  ZSideLabelOffset: number;
  units: string | undefined;
  TARGET?: string;
  WIDTH?: string;
  [propName: string]: any;
}

export interface DrawnNode {
  ID: string;
  LABEL?: string;
  POSITION: [number, number];
  numLinks: number;
  filledLinks: number;
  INFOURL?: string;
  ICON?: string;
  ICONHEIGHT?: string;
  LABELOFFSET?: 'N' | 'S' | 'E' | 'W';
  name: string;
  index: number;
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}
export interface DrawnLink {
  ID: string;
  NODES: [Node, Node];
  ASideBandwidth: number;
  ZSideBandwidth: number;
  ASideBandwidthQuery: string | undefined;
  ZSideBandwidthQuery: string | undefined;
  ASideQuery: string | undefined;
  ZSideQuery: string | undefined;
  ASideLabelOffset: number;
  ZSideLabelOffset: number;
  units: string | undefined;
  TARGET?: string;
  WIDTH?: string;
  index: number;
  source: DrawnNode;
  target: DrawnNode,
  currentASideValue: number;
  currentZSideValue: number;
  currentASideValueText: string;
  currentZSideValueText: string;
  lineStartA: Position;
  lineEndA: Position;
  arrowCenterA: Position;
  arrowPolygonA: any;
  lineStartZ: Position;
  lineEndZ: Position;
  arrowCenterZ: Position;
  arrowPolygonZ: any;
}

export interface Weathermap {
  NODES: Node[];
  LINKS: Link[];
  SCALE: {[propName: number]: string};
  BG_COLOR: string;
}

