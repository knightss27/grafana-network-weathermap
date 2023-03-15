import { GrafanaTheme2, StandardEditorProps } from '@grafana/data';
import { Button, ButtonGroup, Icon, InlineField, InlineFieldRow, Input, Select, useStyles2 } from '@grafana/ui';
import React, { useState } from 'react';
import { Path, PathNode, Weathermap, Position } from 'types';
import { FormDivider } from './FormDivider';
import { v4 as uuidv4 } from 'uuid';
import { css } from 'emotion';

interface Props extends StandardEditorProps<Weathermap, {}> {}

export const PathForm = ({ value, onChange }: Props) => {
  const styles = useStyles2(getStyles);

  const addPath = () => {
    let wm = value;
    wm.paths.push({ id: uuidv4(), name: `Path ${wm.paths.length}`, nodes: [], numLinks: 0 });
    onChange(wm);
  };

  const removePath = (i: number) => {
    let wm = value;
    wm.paths.splice(i, 1);
    onChange(wm);
  };

  const addPathNode = (path: number) => {
    let wm = value;
    wm.paths[path].nodes.push({ id: uuidv4(), position: { x: 0, y: 0 } });
    onChange(wm);
    console.log(wm.paths);
  };

  const removePathNode = (path: number, i1: number) => {
    let wm = value;
    wm.paths[path].nodes.splice(i1, 1);
    onChange(wm);
  };

  // @ts-ignore
  const updateNodeOrder = (path: number, i1: number, i2: number) => {
    if (i2 < 0 || i2 >= value.paths[path].nodes.length) {
      return;
    }

    let wm = value;
    let temp = wm.paths[path].nodes[i1];
    wm.paths[path].nodes[i1] = wm.paths[path].nodes[i2];
    wm.paths[path].nodes[i2] = temp;
    onChange(wm);
  };

  const updateNodePosition = (path: number, i1: number, position: Position) => {
    let wm = value;
    wm.paths[path].nodes[i1].position = position;
    onChange(wm);
  };

  const clearPaths = () => {
    let wm = value;
    wm.paths = [];
    onChange(wm);
  };

  const updatePathName = (path: number, name: string) => {
    let wm = value;
    wm.paths[path].name = name;
    onChange(wm);
  };

  const [currentPath, setCurrentPath] = useState('null' as unknown as Path);

  return (
    <React.Fragment>
      <FormDivider title="Paths" />
      <Select
        onChange={(v) => {
          setCurrentPath(v as Path);
        }}
        value={currentPath}
        options={value.paths}
        getOptionValue={(p) => (p.id ? p.id : 'Unknown option value')}
        getOptionLabel={(p) => (p.name ? p.name : 'Unknown option name')}
        placeholder={'Select a Path'}
        isClearable
      ></Select>
      {value.paths.map((path: Path, i: number) => {
        if (currentPath && path.id == currentPath.id) {
          return (
            <React.Fragment>
              <InlineField grow label="Name" style={{ marginTop: '4px' }}>
                <Input onChange={(v) => updatePathName(i, v.currentTarget.value)} value={path.name} />
              </InlineField>
              {currentPath.nodes.length > 0 ? (
                currentPath.nodes.map((node: PathNode, ni: number) => {
                  return (
                    <React.Fragment>
                      <InlineFieldRow style={{ marginTop: '4px' }}>
                        <Button
                          size="md"
                          variant="secondary"
                          icon="arrow-up"
                          onClick={() => updateNodeOrder(i, ni, ni - 1)}
                          disabled={ni == 0}
                        ></Button>
                        <Button
                          size="md"
                          variant="secondary"
                          icon="arrow-down"
                          onClick={() => updateNodeOrder(i, ni, ni + 1)}
                          disabled={ni == path.nodes.length - 1}
                          style={{ marginRight: '4px', marginLeft: '4px' }}
                        ></Button>
                        <InlineField grow label="X">
                          <Input
                            type="number"
                            onChange={(v) =>
                              updateNodePosition(i, ni, { x: v.currentTarget.valueAsNumber, y: node.position.y })
                            }
                            value={node.position.x}
                          />
                        </InlineField>
                        <InlineField grow label="Y">
                          <Input
                            type="number"
                            onChange={(v) =>
                              updateNodePosition(i, ni, { x: node.position.x, y: v.currentTarget.valueAsNumber })
                            }
                            value={node.position.y}
                          />
                        </InlineField>
                        <Button
                          size="md"
                          variant="destructive"
                          icon="trash-alt"
                          onClick={() => removePathNode(i, ni)}
                        ></Button>
                      </InlineFieldRow>
                    </React.Fragment>
                  );
                })
              ) : (
                <h6>No path nodes.</h6>
              )}
              <InlineField>
                <React.Fragment>
                  <Button size="md" icon="plus" onClick={() => addPathNode(i)} className={styles.addNew}>
                    Add Node
                  </Button>
                  <Button
                    size="md"
                    variant="destructive"
                    icon="trash-alt"
                    onClick={() => removePath(i)}
                    className={styles.clearAll}
                  >
                    Remove Path
                  </Button>
                </React.Fragment>
              </InlineField>
            </React.Fragment>
          );
        }
        return '';
      })}

      <Button variant="secondary" icon="plus" size="md" onClick={addPath} className={styles.addNew}>
        Add Path
      </Button>
      <Button variant="secondary" icon="trash-alt" size="md" onClick={clearPaths} className={styles.clearAll}>
        Clear All
      </Button>
    </React.Fragment>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
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
  };
};
