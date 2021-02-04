

import React, {useState} from 'react';
import { css } from 'emotion';
import { Select, stylesFactory } from '@grafana/ui';
import { Button, Input, InlineField, InlineFieldRow} from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';
import {Weathermap, Node, Link} from 'types';

interface Settings {
    placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {};

export const LinkForm = (props: Props) => {

    const { value, onChange } = props;
    // const theme = useTheme();
    const styles = getStyles();

    const handleChange = (e: any, i: number, node1?: Node, node2?: Node) => {
        let weathermap: Weathermap = value; 
        if (e.currentTarget.name == 'BANDWIDTH') {
            weathermap.LINKS[i].BANDWIDTH = parseInt(e.currentTarget.value)
        } else {
            weathermap.LINKS[i][e.currentTarget.name] = e.currentTarget.value;
        }
        onChange(weathermap);
    }

    const handleNodeChange = (node: Node, name: string, i: number) => {
        console.log('node change', node)
        let weathermap: Weathermap = value;
        if (name == 'node1') {
            weathermap.LINKS[i].NODES[0] = node;
        } else if (name == 'node2') {
            weathermap.LINKS[i].NODES[1] = node;
        }
        onChange(weathermap);
    }

    const addNewLink = () => {
        let weathermap: Weathermap = value;
        const link: Link = {ID: uuidv4(), NODES: [value.NODES[0], value.NODES[0]], BANDWIDTH: 50};
        weathermap.LINKS.push(link);
        onChange(weathermap);
        setCurrentLink(link.ID);
    }

    const removeLink = (i: number) => {
        let weathermap: Weathermap = value;
        weathermap.LINKS.splice(i, 1);
        onChange(weathermap);
    }

    const clearLinks = () => {
        let weathermap: Weathermap = value;
        weathermap.LINKS = [];
        props.onChange(weathermap);
    }

    const [currentLink, setCurrentLink] = useState('null');

    return(
        <React.Fragment>
            <Select
                onChange={(v) => {setCurrentLink(v.ID)}}
                value={currentLink}
                options={value.LINKS}
                getOptionLabel={link => `${link.NODES[0].LABEL} --> ${link.NODES[1].LABEL}`}
                getOptionValue={link => link.ID}
                className={styles.nodeSelect}
                placeholder={"Select a link"}
            ></Select>

            {value.LINKS.map((link, i) => {
                if (link.ID == currentLink) {
                    return (
                        <InlineFieldRow>
                            <InlineField label={"NODE 1"} labelWidth={"auto"}>
                                <Select
                                    onChange={(v) => {handleNodeChange(v as Node, 'node1', i)}}
                                    value={link.NODES[0]?.LABEL || 'No label'}
                                    options={value.NODES}
                                    getOptionLabel={node => node?.LABEL || 'No label'}
                                    getOptionValue={node => node.ID}
                                    className={styles.nodeSelect}
                                    placeholder={"Select Node 1"}
                                    defaultValue={link.NODES[0]}
                                ></Select>
                            </InlineField>
                            <InlineField label={"NODE 2"} labelWidth={"auto"}>
                                <Select
                                    onChange={(v) => {handleNodeChange(v as Node, 'node2', i)}}
                                    value={link.NODES[0]?.LABEL || 'No label'}
                                    options={value.NODES}
                                    getOptionLabel={node => node?.LABEL || 'No label'}
                                    getOptionValue={node => node.ID}
                                    className={styles.nodeSelect}
                                    placeholder={"Select Node 2"}
                                    defaultValue={link.NODES[1]}
                                ></Select>
                            </InlineField>
                            <InlineField label={"BANDWIDTH"}>
                                <Input
                                    value={link.BANDWIDTH}
                                    onChange={e => handleChange(e, i)}
                                    placeholder={'LINK MAX BANDWIDTH'}
                                    type={"number"}
                                    css={""}
                                    className={styles.nodeLabel}
                                    name={"BANDWIDTH"}
                                />
                            </InlineField>
                            <Button
                                variant="destructive"
                                icon="trash-alt"
                                size="md"
                                onClick={() => removeLink(i)}
                                className={""}
                            >
                                Remove Link
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
                onClick={addNewLink}
                className={styles.addNew}
            >
                Add Link
            </Button>
            <Button
                variant="secondary"
                icon="trash-alt"
                size="md"
                onClick={clearLinks}
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