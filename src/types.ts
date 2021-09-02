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
  width: number;
  height: number;
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

export interface LinkSide {
  bandwidth: number;
  bandwidthQuery: string | undefined;
  query: string | undefined;
  labelOffset: number;
}

export interface Link {
  ID: string;
  NODES: [Node, Node];
  sides: {
    A: LinkSide;
    Z: LinkSide;
  };
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
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface DrawnLinkSide extends LinkSide {
  currentValue: number;
  currentText: string;
}
export interface DrawnLink {
  ID: string;
  NODES: [Node, Node];
  sides: {
    A: DrawnLinkSide;
    Z: DrawnLinkSide;
  };
  units: string | undefined;
  TARGET?: string;
  WIDTH?: string;
  index: number;
  source: DrawnNode;
  target: DrawnNode;
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
  SCALE: { [propName: number]: string };
  BG_COLOR: string;
}
