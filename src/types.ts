export interface SimpleOptions {
  backgroundColor: string;
  weathermap: Weathermap;
  enableNodeGrid: boolean;
  gridSizePx: number;
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
  BANDWIDTH: number;
  TX: string | undefined;
  RX: string | undefined;
  TARGET?: string;
  WIDTH?: string;
  [propName: string]: any;
}

export interface Weathermap {
  NODES: Node[];
  LINKS: Link[];
  SCALE: {[propName: number]: string};
  BG_COLOR: string;
}
