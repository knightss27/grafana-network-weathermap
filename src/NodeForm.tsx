import React, { useState } from 'react';
import { css } from 'emotion';
import {
  Button,
  Input,
  InlineField,
  InlineFieldRow,
  InlineSwitch,
  Select,
  stylesFactory,
  ControlledCollapse,
} from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';
import { Weathermap, Node } from 'types';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const NodeForm = ({ value, onChange }: Props) => {
  const styles = getStyles();

  const handleChange = (e: React.FormEvent<HTMLInputElement>, i: number) => {
    let weathermap: Weathermap = value;
    if (e.currentTarget.name === 'X') {
      weathermap.nodes[i].position[0] = e.currentTarget.valueAsNumber;
    } else if (e.currentTarget.name === 'Y') {
      weathermap.nodes[i].position[1] = e.currentTarget.valueAsNumber;
    } else if (e.currentTarget.name === 'label') {
      weathermap.nodes[i].label = e.currentTarget.value;
    } else if (e.currentTarget.name === 'paddingHorizontal') {
      weathermap.nodes[i].padding.horizontal = e.currentTarget.valueAsNumber;
    } else if (e.currentTarget.name === 'paddingVertical') {
      weathermap.nodes[i].padding.vertical = e.currentTarget.valueAsNumber;
    }
    onChange(weathermap);
  };

  const handleSpacingChange = (e: any, i: number) => {
    let weathermap: Weathermap = value;
    weathermap.nodes[i].useConstantSpacing = e.currentTarget.checked;
    onChange(weathermap);
  };

  const handleCompactChange = (e: any, i: number) => {
    let weathermap: Weathermap = value;
    weathermap.nodes[i].compactVerticalLinks = e.currentTarget.checked;
    onChange(weathermap);
  };

  const addNewNode = () => {
    let weathermap: Weathermap = value;
    const node: Node = {
      id: uuidv4(),
      // TODO: fix this position
      position: [
        (weathermap.settings.panel.panelSize.width * Math.pow(1.2, weathermap.settings.panel.zoomScale)) / 2,
        (weathermap.settings.panel.panelSize.height * Math.pow(1.2, weathermap.settings.panel.zoomScale)) / 2,
      ],
      label: 'Test Label',
      anchors: {
        0: { numLinks: 0, numFilledLinks: 0 },
        1: { numLinks: 0, numFilledLinks: 0 },
        2: { numLinks: 0, numFilledLinks: 0 },
        3: { numLinks: 0, numFilledLinks: 0 },
        4: { numLinks: 0, numFilledLinks: 0 },
      },
      useConstantSpacing: false,
      compactVerticalLinks: false,
      padding: {
        vertical: 4,
        horizontal: 10,
      },
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

  const [currentNode, setCurrentNode] = useState(value.nodes[0] ? value.nodes[0] : (('null' as unknown) as Node));

  return (
    <React.Fragment>
      <h6
        style={{
          padding: '10px 0px 5px 5px',
          marginTop: '10px',
          borderTop: '1px solid var(--in-content-button-background)',
        }}
      >
        Nodes
      </h6>
      <Select
        onChange={(v) => {
          setCurrentNode(v as Node);
        }}
        value={currentNode}
        options={value.nodes}
        getOptionLabel={(node) => node.label}
        getOptionValue={(node) => node.id}
        className={styles.nodeSelect}
        placeholder={'Select a node'}
      ></Select>

      {value.nodes.map((node, i) => {
        if (node.id === currentNode.id) {
          return (
            <React.Fragment>
              <InlineFieldRow>
                <InlineField label={'X'}>
                  <Input
                    value={node.position[0]}
                    onChange={(e) => handleChange(e, i)}
                    placeholder={'Position X'}
                    type={'number'}
                    css={''}
                    className={styles.nodeLabel}
                    name={'X'}
                  />
                </InlineField>
                <InlineField label={'Y'}>
                  <Input
                    value={node.position[1]}
                    onChange={(e) => handleChange(e, i)}
                    placeholder={'Position Y'}
                    type={'number'}
                    css={''}
                    className={styles.nodeLabel}
                    name={'Y'}
                  />
                </InlineField>
                <InlineField label={'Label'}>
                  <Input
                    value={node.label}
                    onChange={(e) => handleChange(e, i)}
                    placeholder={'Node Label'}
                    type={'text'}
                    css={''}
                    className={styles.nodeLabel}
                    name={'label'}
                  />
                </InlineField>
              </InlineFieldRow>
              <InlineFieldRow>
                <ControlledCollapse label="Padding">
                  <InlineFieldRow>
                    <InlineField label={'Horizontal'}>
                      <Input
                        value={node.padding.horizontal}
                        onChange={(e) => handleChange(e, i)}
                        placeholder={'Horizontal Padding'}
                        type={'number'}
                        css={''}
                        className={styles.nodeLabel}
                        name={'paddingHorizontal'}
                      />
                    </InlineField>
                    <InlineField label={'Vertical'}>
                      <Input
                        value={node.padding.vertical}
                        onChange={(e) => handleChange(e, i)}
                        placeholder={'Vertical Padding'}
                        type={'number'}
                        css={''}
                        className={styles.nodeLabel}
                        name={'paddingVertical'}
                      />
                    </InlineField>
                  </InlineFieldRow>
                </ControlledCollapse>
              </InlineFieldRow>
              <InlineFieldRow>
                <ControlledCollapse label="Advanced">
                  <InlineFieldRow>
                    <InlineField label={'Constant Spacing'}>
                      <InlineSwitch
                        value={node.useConstantSpacing}
                        onChange={(e) => handleSpacingChange(e, i)}
                        css={''}
                      />
                    </InlineField>
                    <InlineField label={'Compact Vertical Links'}>
                      <InlineSwitch
                        value={node.compactVerticalLinks}
                        onChange={(e) => handleCompactChange(e, i)}
                        css={''}
                      />
                    </InlineField>
                  </InlineFieldRow>
                </ControlledCollapse>
              </InlineFieldRow>
              <InlineFieldRow>
                <Button variant="destructive" icon="trash-alt" size="md" onClick={() => removeNode(i)} className={''}>
                  Remove Node
                </Button>
              </InlineFieldRow>
            </React.Fragment>
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
