import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';
import { NodeForm } from './NodeForm';
import { LinkForm } from './LinkForm';
import { ColorForm } from './ColorForm';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const NodeBuilder = (props: Props) => {

  if (props.value) {
    return (
      <React.Fragment>
        <NodeForm {...props}></NodeForm>
        <LinkForm {...props}></LinkForm>
        <ColorForm {...props}></ColorForm>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment />
    )
  }
  
};