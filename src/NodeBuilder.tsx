import React, {useEffect, useState} from 'react';
import { css } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import { Button, Input, InlineField, InlineFieldRow} from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';

interface Settings {
    placeholder: string;
}

interface Node {
    ID: string;
    LABEL?: string;
    POSITION: [number, number];
    INFOURL?: string;
    ICON?: string;
    ICONHEIGHT?: string;
    LABELOFFSET?: 'N' | 'S' | 'E' | 'W';
    [propName: string]: any;
}

interface Link {
    ID: string;
    NODES: [Node, Node] | [string, string];
    BANDWIDTH: string;
    TARGET?: string;
    WIDTH?: string;
    [propName: string]: any;
}

interface Weathermap {
    NODES: Node[];
    LINKS: Link[];
    SCALE: {[propName: number]: string};
}

interface Props extends StandardEditorProps<Weathermap, Settings> {};

export const NodeBuilder = ({ item, value, onChange }: Props) => {

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
        // console.log(e.currentTarget, i);
    }

    const addNewNode = () => {
        let weathermap: Weathermap = value;
        const node: Node = {ID: 'test', POSITION: [400, 400], LABEL: 'Test Label'};
        weathermap.NODES.push(node);
        onChange(weathermap);
    }

    useEffect(() => {
        console.log('done')
        if (typeof value == 'string') {
            let weathermap: Weathermap = {NODES: [], LINKS: [], SCALE: {}};
            const node: Node = {ID: 'test', POSITION: [400, 400], LABEL: 'Test Label'};
            weathermap.NODES.push(node);
            onChange(weathermap);
        }
        setReady(true);
    })

    const [ready, setReady] = useState(false);

    return(
        <React.Fragment>
            
            {ready ? value.NODES.map((node, i) => {
                return (
                    <InlineFieldRow>
                    {Object.keys(node as Object).map(key => {
                        if (key == 'POSITION') {
                            return (
                                <React.Fragment>
                                    <InlineField label={"X"}>
                                        <Input
                                            value={node[key][0] !== undefined ? node[key][0] : ''}
                                            onChange={e => handleChange(e, i)}
                                            placeholder={item.settings?.placeholder || ''}
                                            type={"number"}
                                            css={""}
                                            className={styles.nodeLabel}
                                            name={"X"}
                                        />
                                    </InlineField>
                                    <InlineField label={"Y"}>
                                        <Input
                                            value={node[key][1] !== undefined ? node[key][1] : ''}
                                            onChange={e => handleChange(e, i)}
                                            placeholder={item.settings?.placeholder || ''}
                                            type={"number"}
                                            css={""}
                                            className={styles.nodeLabel}
                                            name={"Y"}
                                        />
                                    </InlineField>
                                </React.Fragment>
                            )
                        }
                        return (
                            <InlineField label={key}>
                                <Input
                                    value={node[key] !== undefined ? node[key] : ''}
                                    onChange={e => handleChange(e, i)}
                                    placeholder={item.settings?.placeholder || ''}
                                    type={"text"}
                                    css={""}
                                    className={styles.nodeLabel}
                                    name={key}
                                />
                            </InlineField>
                        )
                    })}
                    </InlineFieldRow>
                )
            }): ''}
            
            
            <Button
                variant="secondary"
                icon="plus"
                size="md"
                onClick={addNewNode}
                className={styles.addNew}
            >
                Add Node
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
      `
    };
  });