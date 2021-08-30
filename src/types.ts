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
  BANDWIDTH: number | string;
  ASideQuery: string | undefined;
  BSideQuery: string | undefined;
  units: string | undefined;
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

