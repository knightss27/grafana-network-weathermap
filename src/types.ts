import { DataFrame } from '@grafana/data';

export interface PanelOptions {
  backgroundColor: string;
  backgroundImage?: BGImageOptions;
  panelSize: AreaSize;
  zoomScale: number;
  offset: Position;
  showTimestamp: boolean;
  grid: {
    enabled: boolean;
    size: number;
    guidesEnabled: boolean;
  };
}

export interface BGImageOptions {
  url: string;
  fit: string;
}

export interface TooltipOptions {
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  inboundColor: string;
  outboundColor: string;
  scaleToBandwidth: boolean;
}

export interface AreaSize {
  width: number;
  height: number;
}

export enum Anchor {
  Center = 0,
  Top,
  Bottom,
  Left,
  Right,
}

export interface NodeAnchor {
  numLinks: number;
  numFilledLinks: number;
}

export interface Icon {
  src: string;
  name: string;
  size: AreaSize;
  padding: {
    vertical: number;
    horizontal: number;
  };
  drawInside: boolean;
}

export interface Node {
  id: string;
  position: [number, number];
  label?: string;
  dashboardLink?: string;
  anchors: {
    [Anchor.Center]: NodeAnchor;
    [Anchor.Top]: NodeAnchor;
    [Anchor.Bottom]: NodeAnchor;
    [Anchor.Left]: NodeAnchor;
    [Anchor.Right]: NodeAnchor;
  };
  useConstantSpacing: boolean;
  compactVerticalLinks: boolean;
  padding: {
    horizontal: number;
    vertical: number;
  };
  colors: {
    font: string;
    background: string;
    border: string;
    statusDown: string;
  };
  nodeIcon: Icon | null;
  isConnection: boolean;
  statusQuery?: string;
}

export interface LinkSide {
  bandwidth: number;
  bandwidthQuery: string | undefined;
  query: string | undefined;
  labelOffset: number;
  anchor: Anchor;
  dashboardLink: string;
}

export interface Link {
  id: string;
  nodes: [Node, Node];
  sides: {
    A: LinkSide;
    Z: LinkSide;
  };
  units: string | undefined;
  arrows: ArrowOptions;
  stroke: number;
  showThroughputPercentage: boolean;
}

export interface DrawnNode extends Node {
  filledLinks: number;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  labelWidth: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface DrawnLinkSide extends LinkSide {
  currentValue: number;
  currentText: string;
  currentBandwidthText: string;
  currentValueText: string;
  currentPercentageText: string;
}
export interface DrawnLink extends Link {
  sides: {
    A: DrawnLinkSide;
    Z: DrawnLinkSide;
  };
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

export interface HoveredLink {
  link: DrawnLink;
  side: 'A' | 'Z';
  mouseEvent: any;
}

export interface ArrowOptions {
  width: number;
  height: number;
  offset: number;
}

export interface WeathermapSettings {
  link: {
    spacing: {
      horizontal: number;
      vertical: number;
    };
    stroke: {
      color: string;
    };
    label: {
      background: string;
      border: string;
      font: string;
    };
    showAllWithPercentage: boolean;
    defaultUnits?: string;
  };
  fontSizing: {
    node: number;
    link: number;
  };
  panel: PanelOptions;
  tooltip: TooltipOptions;
  scale: TrafficPanelSettings;
}

export interface Threshold {
  percent: number;
  color: string;
}

export interface TrafficPanelSettings {
  position: Position;
  size: AreaSize;
  title: string;
  fontSizing: {
    title: number;
    threshold: number;
  };
}

export interface Weathermap {
  version: number;
  id: string;
  nodes: Node[];
  links: Link[];
  scale: Threshold[];
  settings: WeathermapSettings;
}

export interface SimpleOptions {
  weathermap: Weathermap;
}

export interface DataFrameWithId extends DataFrame {
  id: string;
}
