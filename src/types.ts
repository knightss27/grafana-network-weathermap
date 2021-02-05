type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  backgroundColor: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
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
  TARGET?: string;
  WIDTH?: string;
  [propName: string]: any;
}

export interface Weathermap {
  NODES: Node[];
  LINKS: Link[];
  SCALE: {[propName: number]: string};
}
