// @ts-nocheck

import React, {useEffect, useState} from 'react';
import { css } from 'emotion';
import { Select, stylesFactory } from '@grafana/ui';
import { Button, Input, InlineField, InlineFieldRow} from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';
import {Weathermap, Node} from 'types';

interface Settings {
    placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {};

export const NodeForm = (props: Props) => {

    const { value, onChange } = props;
    // const theme = useTheme();
    const styles = getStyles();

    const handleChange = (e: any, i: number) => {
        let weathermap: Weathermap = value;
        if (e.currentTarget.name == 'X') {
            weathermap.NODES[i].POSITION[0] = parseInt(e.currentTarget.value);
        } else if (e.currentTarget.name == 'Y') {
            weathermap.NODES[i].POSITION[1] = parseInt(e.currentTarget.value);
        } else {
            weathermap.NODES[i][e.currentTarget.name] = e.currentTarget.value;
        }
        onChange(weathermap);
    }

    const addNewNode = () => {
        let weathermap: Weathermap = value;
        const node: Node = {ID: uuidv4(), POSITION: [400, 400], LABEL: 'Test Label'};
        weathermap.NODES.push(node);
        onChange(weathermap);
        setCurrentNode(node.ID);
    }

    const removeNode = (i: number) => {
        let weathermap: Weathermap = value;
        weathermap.NODES.splice(i, 1);
        onChange(weathermap);
    }

    const clearWeathermap = () => {
        let weathermap: Weathermap = value;
        weathermap.NODES = [];
        props.onChange(weathermap);
    }

    // useEffect(() => {
    //     onChange({NODES: [], LINKS: [], SCALE: []})
    // }, [])

    const [currentNode, setCurrentNode] = useState(value.NODES[0]?.ID || 'null');

    return(
        <React.Fragment>
            <Select
                onChange={(v) => {setCurrentNode(v.ID)}}
                value={currentNode}
                options={value.NODES}
                getOptionLabel={node => node.LABEL}
                getOptionValue={node => node.ID}
                className={styles.nodeSelect}
                placeholder={"Select a node"}
            ></Select>

            {value.NODES.map((node, i) => {
                if (node.ID == currentNode) {
                    return (
                        <InlineFieldRow>
                            <InlineField label={"X"}>
                                <Input
                                    value={node.POSITION[0]}
                                    onChange={e => handleChange(e, i)}
                                    placeholder={'POSITION X'}
                                    type={"number"}
                                    css={""}
                                    className={styles.nodeLabel}
                                    name={"X"}
                                />
                            </InlineField>
                            <InlineField label={"Y"}>
                                <Input
                                    value={node.POSITION[1]}
                                    onChange={e => handleChange(e, i)}
                                    placeholder={'POSITION Y'}
                                    type={"number"}
                                    css={""}
                                    className={styles.nodeLabel}
                                    name={"Y"}
                                />
                            </InlineField>
                            <InlineField label={"LABEL"}>
                                <Input
                                    value={node.LABEL}
                                    onChange={e => handleChange(e, i)}
                                    placeholder={'NODE LABEL'}
                                    type={"text"}
                                    css={""}
                                    className={styles.nodeLabel}
                                    name={"LABEL"}
                                />
                            </InlineField>
                            <Button
                                variant="destructive"
                                icon="trash-alt"
                                size="md"
                                onClick={() => removeNode(i)}
                                className={""}
                            >
                                Remove Node
                            </Button>
                    </InlineFieldRow>
                    )
                }
                return;
            })}

            <Button
                variant="secondary"
                icon="plus"
                size="md"
                onClick={addNewNode}
                className={styles.addNew}
            >
                Add Node
            </Button>
            <Button
                variant="secondary"
                icon="plus"
                size="md"
                onClick={clearWeathermap}
                className={styles.addNew}
            >
                Clear All
            </Button>
        </React.Fragment>
    )
}

const getStyles = stylesFactory(() => {
    return {
      nodeLabel: css`
        margin: 0px 0px;
      `,
      addNew: css`
        width: 100%;
        justify-content: center;
        margin: 10px 0px 0px;
      `,
      nodeSelect: css`
        margin: 5px 0px;
      `
    };
  });