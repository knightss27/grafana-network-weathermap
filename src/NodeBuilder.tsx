import React, {useEffect, useState} from 'react';
import { css } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import { Button, Input} from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';

interface Settings {
    placeholder: string;
}

interface Node {
    ID: string;
    POSITION: [number, number];
    LABEL?: string;
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
        weathermap.NODES[i].LABEL = e.currentTarget.value;
        onChange(weathermap);
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
                Object.keys(node as Object).map(key => {
                    return (
                        <Input
                            value={node[key] !== undefined ? node[key] : ''}
                            onChange={e => handleChange(e, i)}
                            placeholder={item.settings?.placeholder || ''}
                            type={"text"}
                            css={""}
                            className={styles.nodeLabel}
                        />
                    )
                })
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
        margin: 10px 0px;
      `,
      addNew: css`
        width: 100%;
        justify-content: center;
      `

    };
  });