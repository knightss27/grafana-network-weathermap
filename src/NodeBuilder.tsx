import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';
import { NodeForm } from './NodeForm';
import { LinkForm } from './LinkForm';
import { ColorForm } from './ColorForm';
import { PanelForm } from './PanelForm';
import { v4 as uuidv4 } from 'uuid';
import { useTheme2 } from '@grafana/ui';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const NodeBuilder = (props: Props) => {
  const theme = useTheme2();


  const defaultValue: Weathermap = {
    id: uuidv4(),
    nodes: [],
    links: [],
    scale: {},
    settings: {
      linkSpacingHorizontal: 10,
      linkSpacingVertical: 5,
      linkStrokeWidth: 8,
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
    },
  };

  if (!props.value) {
    console.log('Initializing weathermap plugin.');
    props.onChange(defaultValue);
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
