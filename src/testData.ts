import { GrafanaTheme2 } from '@grafana/data';
import { Weathermap, Anchor, Node } from 'types';
import { generateBasicLink, generateBasicNode } from 'utils';

export const theme: GrafanaTheme2 = {
  colors: {
    secondary: {
      main: '#000000',
      border: '#CCCCCC',
      contrastText: '#FFFFFF',
    },
    background: {
      primary: '#FFFFFF',
    },
  },
} as unknown as GrafanaTheme2;

export const defaultNodes = [
  generateBasicNode('Node A', [200, 300], theme),
  generateBasicNode('Node B', [400, 300], theme),
];

export const getData = (theme: any): Weathermap => {
  return {
    version: 1,
    id: 'testing',
    nodes: defaultNodes.map((d, i) => {
      let v: Node = d;
      v.anchors[i === 0 ? Anchor.Right : Anchor.Left].numLinks = 1;
      return v;
    }),
    links: [generateBasicLink([defaultNodes[0], defaultNodes[1]])].map((l, i) => {
      l.id = `nw-link-${i}`;
      l.sides.A.dashboardLink = 'https://example.com/';
      l.sides.Z.dashboardLink = 'https://example.com/';
      return l;
    }),
    scale: [],
    settings: {
      link: {
        spacing: {
          horizontal: 10,
          vertical: 5,
        },
        stroke: {
          color: theme.colors.secondary.main,
        },
        label: {
          background: theme.colors.secondary.main,
          border: theme.colors.secondary.border,
          font: theme.colors.secondary.contrastText,
        },
        showAllWithPercentage: false,
      },
      fontSizing: {
        node: 10,
        link: 7,
      },
      panel: {
        backgroundColor: theme.colors.background.primary,
        showTimestamp: true,
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
        inboundColor: '#00cf00',
        outboundColor: '#fade2a',
        scaleToBandwidth: false,
      },
      scale: {
        position: {
          x: 0,
          y: 0,
        },
        size: {
          width: 50,
          height: 200,
        },
        title: 'Traffic Load',
        fontSizing: {
          title: 16,
          threshold: 12,
        },
      },
    },
  };
};

export const getData2 = (theme: GrafanaTheme2): Weathermap => {
  let data = getData(theme);
  data.links.push(generateBasicLink([data.nodes[0], data.nodes[1]]));
  data.nodes = data.nodes.map((d, i) => {
    let v: Node = d;
    v.anchors[i === 0 ? Anchor.Right : Anchor.Left].numLinks = 2;
    return v;
  });
  return data;
};

export const getConnectedLinkData = (theme: GrafanaTheme2): Weathermap => {
  let data = getData(theme);
  data.nodes.push({
    ...generateBasicNode('C0', [300, 300], theme),
    isConnection: true,
    anchors: {
      '0': {
        numFilledLinks: 0,
        numLinks: 2,
      },
      '1': {
        numFilledLinks: 0,
        numLinks: 0,
      },
      '2': {
        numFilledLinks: 0,
        numLinks: 0,
      },
      '3': {
        numFilledLinks: 0,
        numLinks: 0,
      },
      '4': {
        numFilledLinks: 0,
        numLinks: 0,
      },
    },
  });

  data.links = [];
  data.links.push(generateBasicLink([data.nodes[0], data.nodes[2]]));
  data.links.push(generateBasicLink([data.nodes[2], data.nodes[1]]));
  data.links[0].sides.Z.anchor = Anchor.Center;
  data.links[1].sides.A.anchor = Anchor.Center;
  data.id = 'testing';
  return data;
};
