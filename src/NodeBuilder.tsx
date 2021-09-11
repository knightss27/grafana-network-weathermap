import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';
import { NodeForm } from './NodeForm';
import { LinkForm } from './LinkForm';
import { ColorForm } from './ColorForm';
import { PanelForm } from './PanelForm';
import { v4 as uuidv4 } from 'uuid';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const NodeBuilder = (props: Props) => {
  const defaultValue: Weathermap = {
    id: uuidv4(),
    nodes: [],
    links: [],
    scale: {},
    settings: {
      linkSpacing: 10,
      linkStrokeWidth: 8,
      linkArrow: {
        width: 8,
        height: 10,
        offset: 5,
      },
      panel: {
        backgroundColor: '#ffffff',
        panelSize: {
          width: 600,
          height: 600,
        },
      },
      enableNodeGrid: false,
      gridSizePx: 10,
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
