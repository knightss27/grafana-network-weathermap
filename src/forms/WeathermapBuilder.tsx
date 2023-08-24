import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Anchor, Weathermap } from 'types';
import { NodeForm } from './NodeForm';
import { LinkForm } from './LinkForm';
import { ColorForm } from './ColorForm';
import { PanelForm } from './PanelForm';
import { v4 as uuidv4 } from 'uuid';
import { useTheme2 } from '@grafana/ui';
import { generateBasicNode, CURRENT_VERSION, generateBasicLink, handleVersionedStateUpdates } from 'utils';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const WeathermapBuilder = (props: Props) => {
  const theme = useTheme2();

  const defaultNodes = [generateBasicNode('Node A', [200, 300], theme), generateBasicNode('Node B', [400, 300], theme)];

  const defaultValue: Weathermap = {
    version: CURRENT_VERSION,
    id: uuidv4(),
    nodes: defaultNodes.map((d, i) => {
      let v = d;
      v.anchors[i === 0 ? Anchor.Right : Anchor.Left].numLinks = 1;
      return v;
    }),
    links: [generateBasicLink([defaultNodes[0], defaultNodes[1]])],
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
        fontSize: 9,
        textColor: 'white',
        backgroundColor: theme.colors.background.canvas,
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

  if (!props.value) {
    console.log('Initializing weathermap plugin.');
    props.onChange(defaultValue);
  } else if (!props.value.version || props.value.version !== CURRENT_VERSION) {
    // State versioning and merging to deal with missing properties.
    let wm = props.value;
    props.onChange(handleVersionedStateUpdates(wm, theme));
  }

  if (props.value) {
    return (
      <React.Fragment>
        <NodeForm {...props}></NodeForm>
        <LinkForm {...props}></LinkForm>
        <ColorForm {...props}></ColorForm>
        <PanelForm {...props}></PanelForm>
      </React.Fragment>
    );
  } else {
    return <React.Fragment />;
  }
};
