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
