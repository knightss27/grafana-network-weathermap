import React, {useState} from 'react';
import { css } from 'emotion';
import { Select, stylesFactory, UnitPicker } from '@grafana/ui';
import { Button, InlineField, InlineFieldRow} from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';
import {Weathermap, Node, Link} from 'types';

interface Settings {
    placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {};

export const LinkForm = (props: Props) => {

    const { value, onChange, context } = props;
    // const theme = useTheme();
    const styles = getStyles();

    // const dataOptions: DataFrame[] | undefined = ;

    const handleChange = (frame: string, i: number) => {
        let weathermap: Weathermap = value; 
        weathermap.LINKS[i].BANDWIDTH = frame;
        onChange(weathermap);
    }

    const handleNodeChange = (node: Node, name: string, i: number) => {
        let weathermap: Weathermap = value;
        if (name == 'node1') {
            weathermap.LINKS[i].NODES[0] = node;
        } else if (name == 'node2') {
            weathermap.LINKS[i].NODES[1] = node;
        }
        onChange(weathermap);
    }

    const handleDataChange = (name: string, i: number, frameName: string) => {
        let weathermap: Weathermap = value;
        // console.log(dataFrame);
        if (name == 'node1') {
            weathermap.LINKS[i].ASideQuery = frameName;
        } else if (name == 'node2') {
            weathermap.LINKS[i].BSideQuery = frameName;
        }
        onChange(weathermap);
    }

    const addNewLink = () => {
        if (value.NODES.length == 0) {
            throw new Error('There must be >= 1 Nodes to create a link.');
        }
        let weathermap: Weathermap = value;
        const link: Link = {ID: uuidv4(), NODES: [value.NODES[0], value.NODES[0]], BANDWIDTH: 50, ASideQuery: undefined, BSideQuery: undefined, units: undefined};
        weathermap.LINKS.push(link);
        onChange(weathermap);
        setCurrentLink(link);
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

    const [currentLink, setCurrentLink] = useState('null' as unknown as Link);

    return(
        <React.Fragment>
            <Select
                onChange={(v) => {setCurrentLink(v as Link)}}
                value={currentLink}
                options={value.LINKS}
                getOptionLabel={link => link.NODES.length > 0 ? `${link.NODES[0]?.LABEL} <> ${link.NODES[1]?.LABEL}` : ''}
                getOptionValue={link => link.ID}
                className={styles.nodeSelect}
                placeholder={"Select a link"}
            ></Select>

            {value.LINKS.map((link, i) => {
                if (link.ID == currentLink.ID) {
                    return (
                        <React.Fragment>
                        <InlineFieldRow className={styles.row}>
                            <InlineField label={"A Side"} labelWidth={"auto"}>
                                <Select
                                    onChange={(v) => {handleNodeChange(v as Node, 'node1', i)}}
                                    value={link.NODES[0]?.LABEL || 'No label'}
                                    options={value.NODES}
                                    getOptionLabel={node => node?.LABEL || 'No label'}
                                    getOptionValue={node => node.ID}
                                    className={styles.nodeSelect}
                                    placeholder={"Select A Side"}
                                    defaultValue={link.NODES[0]}
                                ></Select>
                            </InlineField>
                            <InlineField label={"A Side Query"} labelWidth={"auto"}>
                                <Select
                                    onChange={(v) => {handleDataChange('node1', i, v.name)}}
                                    value={link.ASideQuery}
                                    options={context.data}
                                    getOptionLabel={data => data?.name || 'No label'}
                                    getOptionValue={data => data.name}
                                    className={styles.nodeSelect}
                                    placeholder={"Select A Side Query"}
                                ></Select>
                            </InlineField>
                        </InlineFieldRow>
                        <InlineFieldRow className={styles.row}>
                            <InlineField label={"Z Side"} labelWidth={"auto"}>
                                <Select
                                    onChange={(v) => {handleNodeChange(v as Node, 'node2', i)}}
                                    value={link.NODES[0]?.LABEL || 'No label'}
                                    options={value.NODES}
                                    getOptionLabel={node => node?.LABEL || 'No label'}
                                    getOptionValue={node => node.ID}
                                    className={styles.nodeSelect}
                                    placeholder={"Select Z Side"}
                                    defaultValue={link.NODES[1]}
                                ></Select>
                            </InlineField>
                            <InlineField label={"Z Side Query"} labelWidth={"auto"}>
                                <Select
                                    onChange={(v) => {handleDataChange('node2', i, v.name)}}
                                    value={link.BSideQuery}
                                    options={context.data}
                                    getOptionLabel={data => data?.name || 'No label'}
                                    getOptionValue={data => data?.name}
                                    className={styles.nodeSelect}
                                    placeholder={"Select Z Side Query"}
                                ></Select>
                            </InlineField>
                        </InlineFieldRow>
                        <InlineFieldRow className={styles.row}>
                            <InlineField label={"Bandwidth"}>
                                {/* <Input
                                    value={link.BANDWIDTH}
                                    onChange={e => handleChange(e, i)}
                                    placeholder={'LINK MAX BANDWIDTH'}
                                    type={"number"}
                                    css={""}
                                    className={styles.nodeLabel}
                                    name={"BANDWIDTH"}
                                /> */}
                                <Select
                                    onChange={(v) => {handleChange(v.name, i)}}
                                    value={link.BANDWIDTH}
                                    options={context.data}
                                    getOptionLabel={data => data?.name || 'No label'}
                                    getOptionValue={data => data?.name}
                                    className={styles.nodeSelect}
                                    placeholder={"Select Bandwidth"}
                                ></Select>
                            </InlineField>
                            <InlineField label="Units">
                                <UnitPicker 
                                    onChange={(val) => {
                                        let wm: Weathermap = value;
                                        wm.LINKS[i].units = val;
                                        onChange(wm);
                                    }}
                                    value={link.units}
                                />
                            </InlineField>
                        </InlineFieldRow>
                        <Button
                                variant="destructive"
                                icon="trash-alt"
                                size="md"
                                onClick={() => removeLink(i)}
                                className={""}
                            >
                                Remove Link
                        </Button>
                    </React.Fragment>
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
                className={styles.clearAll}
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
        margin: 0px 0px;
      `,
      row: css`
        margin-top: 5px;
      `
    };
  });
