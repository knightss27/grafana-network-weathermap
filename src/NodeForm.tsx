// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { css } from 'emotion';
import { Select, stylesFactory } from '@grafana/ui';
import { Button, Input, InlineField, InlineFieldRow } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';
import { Weathermap, Node } from 'types';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const NodeForm = ({ value, onChange }: Props) => {
  // const  = props;
  // const theme = useTheme();
  const styles = getStyles();

  const handleChange = (e: any, i: number) => {
    let weathermap: Weathermap = value;
    if (e.currentTarget.name == 'X') {
      weathermap.nodes[i].POSITION[0] = parseInt(e.currentTarget.value);
    } else if (e.currentTarget.name == 'Y') {
      weathermap.nodes[i].POSITION[1] = parseInt(e.currentTarget.value);
    } else {
      weathermap.nodes[i][e.currentTarget.name] = e.currentTarget.value;
    }
    onChange(weathermap);
  };

  const addNewNode = () => {
    let weathermap: Weathermap = value;
    const node: Node = {
      id: uuidv4(),
      POSITION: [400, 400],
      label: 'Test Label',
      anchors: {
        0: {}, 1: {}, 2: {}, 3: {}, 4: {}
      }
    };
    weathermap.nodes.push(node);
    onChange(weathermap);
    setCurrentNode(node);
  };

  const removeNode = (i: number) => {
    let weathermap: Weathermap = value;
    weathermap.nodes.splice(i, 1);
    onChange(weathermap);
  };

  const clearNodes = () => {
    let weathermap: Weathermap = value;
    weathermap.nodes = [];
    weathermap.links = [];
    onChange(weathermap);
  };

  const [currentNode, setCurrentNode] = useState('null');

  return (
    <React.Fragment>
      <Select
        onChange={(v) => {
          setCurrentNode(v);
        }}
        value={currentNode}
        options={value.nodes}
        getOptionLabel={(node) => node.label}
        getOptionValue={(node) => node.id}
        className={styles.nodeSelect}
        placeholder={'Select a node'}
      ></Select>

      {value.nodes.map((node, i) => {
        if (node.id == currentNode.id) {
          return (
            <InlineFieldRow>
              <InlineField label={'X'}>
                <Input
                  value={node.POSITION[0]}
                  onChange={(e) => handleChange(e, i)}
                  placeholder={'POSITION X'}
                  type={'number'}
                  css={''}
                  className={styles.nodeLabel}
                  name={'X'}
                />
              </InlineField>
              <InlineField label={'Y'}>
                <Input
                  value={node.POSITION[1]}
                  onChange={(e) => handleChange(e, i)}
                  placeholder={'POSITION Y'}
                  type={'number'}
                  css={''}
                  className={styles.nodeLabel}
                  name={'Y'}
                />
              </InlineField>
              <InlineField label={'label'}>
                <Input
                  value={node.label}
                  onChange={(e) => handleChange(e, i)}
                  placeholder={'NODE label'}
                  type={'text'}
                  css={''}
                  className={styles.nodeLabel}
                  name={'label'}
                />
              </InlineField>
              <Button variant="destructive" icon="trash-alt" size="md" onClick={() => removeNode(i)} className={''}>
                Remove Node
              </Button>
            </InlineFieldRow>
          );
        }
        return;
      })}

      <Button variant="secondary" icon="plus" size="md" onClick={addNewNode} className={styles.addNew}>
        Add Node
      </Button>
      <Button variant="secondary" icon="trash-alt" size="md" onClick={clearNodes} className={styles.clearAll}>
        Clear All
      </Button>
    </React.Fragment>
  );
};

const getStyles = stylesFactory(() => {
  return {
    nodeLabel: css`
      margin: 0px 0px;
    `,
    addNew: css`
      width: calc(50% - 10px);
      justify-content: center;
      margin: 10px 0px;
      margin-right: 5px;
    `,
    clearAll: css`
      width: calc(50% - 10px);
      justify-content: center;
      margin: 10px 0px;
      margin-left: 5px;
    `,
    nodeSelect: css`
      margin: 5px 0px;
    `,
  };
});
