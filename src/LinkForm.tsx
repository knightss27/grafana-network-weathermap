import React, {useState} from 'react';
import { css } from 'emotion';
import { Input, Select, Slider, stylesFactory } from '@grafana/ui';
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

    const handleBandwidthChange = (amt: number, i: number, side: 'A' | 'Z') => {
        let weathermap: Weathermap = value;
        weathermap.LINKS[i][`${side}SideBandwidth`] = amt;
        weathermap.LINKS[i][`${side}SideBandwidthQuery`] = undefined;
        onChange(weathermap);
    }

    const handleBandwidthQueryChange = (frame: string, i: number, side: 'A' | 'Z') => {
        let weathermap: Weathermap = value;
        weathermap.LINKS[i][`${side}SideBandwidth`] = 0;
        weathermap.LINKS[i][`${side}SideBandwidthQuery`] = frame;
        onChange(weathermap);
    }

    const handleNodeChange = (node: Node, name: string, i: number) => {
        let weathermap: Weathermap = value;
        node.numLinks++;
        if (name == 'node1') {
            weathermap.LINKS[i].NODES[0].numLinks--;
            weathermap.LINKS[i].NODES[0] = node;
        } else if (name == 'node2') {
            weathermap.LINKS[i].NODES[1].numLinks--;
            weathermap.LINKS[i].NODES[1] = node;
        }
        onChange(weathermap);
    }

    const handleDataChange = (name: string, i: number, frameName: string) => {
        let weathermap: Weathermap = value;
        if (name == 'node1') {
            weathermap.LINKS[i].ASideQuery = frameName;
        } else if (name == 'node2') {
            weathermap.LINKS[i].ZSideQuery = frameName;
        }
        onChange(weathermap);
    }

    const handleLabelOffsetChange = (val: number, i: number, side: 'A' | 'Z') => {
        let weathermap: Weathermap = value;
        weathermap.LINKS[i][`${side}SideLabelOffset`] = val;
        onChange(weathermap);
    }

    const addNewLink = () => {
        if (value.NODES.length == 0) {
            throw new Error('There must be >= 1 Nodes to create a link.');
        }
        let weathermap: Weathermap = value;
        const link: Link = {
            ID: uuidv4(), 
            NODES: [value.NODES[0], 
            value.NODES[0]], 
            ZSideBandwidth: 0, 
            ZSideBandwidthQuery: undefined, 
            ASideBandwidth: 0, 
            ASideBandwidthQuery: undefined, 
            ASideQuery: undefined, 
            ZSideQuery: undefined,
            ASideLabelOffset: 50,
            ZSideLabelOffset: 50,
            units: undefined
        };
        value.NODES[0].numLinks += 2;
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
                        <InlineFieldRow className={styles.row} style={{"marginTop": "10px"}}>
                            <InlineField label={"A Side"} labelWidth={"auto"} style={{"maxWidth": "100%"}}>
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
                            <InlineField label={"A Side Query"} labelWidth={"auto"} style={{"maxWidth": "100%"}}>
                                <Select
                                    onChange={(v) => {handleDataChange('node1', i, v.name)}}
                                    value={link.ASideQuery}
                                    options={context.data}
                                    getOptionLabel={data => data?.name || 'No label'}
                                    getOptionValue={data => data.name}
                                    className={styles.querySelect}
                                    placeholder={"Select A Side Query"}
                                ></Select>
                            </InlineField>
                        </InlineFieldRow>
                        <InlineFieldRow className={styles.row2}>
                            <InlineField label={"A Bandwidth #"}>
                                <Input
                                    value={link.ASideBandwidth}
                                    onChange={e => handleBandwidthChange(e.currentTarget.valueAsNumber, i, 'A')}
                                    placeholder={'Custom max bandwidth'}
                                    type={"number"}
                                    css={""}
                                    className={styles.nodeLabel}
                                    name={"bandwidth"}
                                />
                            </InlineField>
                            <InlineField label={"A Bandwidth Query"} style={{"maxWidth": "100%"}}>
                                <Select
                                    onChange={(v) => {handleBandwidthQueryChange(v.name, i, 'A')}}
                                    value={link.ASideBandwidthQuery}
                                    options={context.data}
                                    getOptionLabel={data => data?.name || 'No label'}
                                    getOptionValue={data => data?.name}
                                    className={styles.bandwidthSelect}
                                    placeholder={"Select Bandwidth"}
                                ></Select>
                            </InlineField>
                        </InlineFieldRow>
                        <InlineFieldRow className={styles.row2}>
                            <InlineField label={"A Label Offset %"} style={{"width": "100%"}}>
                                <Slider
                                    min={0}
                                    max={100}
                                    value={link.ASideLabelOffset}
                                    onChange={(v) => {handleLabelOffsetChange(v, i, 'A')}}
                                />
                            </InlineField>
                        </InlineFieldRow>
                        <InlineFieldRow className={styles.row}>
                            <InlineField label={"Z Side"} labelWidth={"auto"} style={{"maxWidth": "100%"}}>
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
                            <InlineField label={"Z Side Query"} labelWidth={"auto"} style={{"maxWidth": "100%"}}>
                                <Select
                                    onChange={(v) => {handleDataChange('node2', i, v.name)}}
                                    value={link.ZSideQuery}
                                    options={context.data}
                                    getOptionLabel={data => data?.name || 'No label'}
                                    getOptionValue={data => data?.name}
                                    className={styles.querySelect}
                                    placeholder={"Select Z Side Query"}
                                ></Select>
                            </InlineField>
                        </InlineFieldRow>
                        <InlineFieldRow className={styles.row2}>
                            <InlineField label={"Z Bandwidth #"}>
                                <Input
                                    value={link.ZSideBandwidth}
                                    onChange={e => handleBandwidthChange(e.currentTarget.valueAsNumber, i, 'Z')}
                                    placeholder={'Custom max bandwidth'}
                                    type={"number"}
                                    css={""}
                                    className={styles.nodeLabel}
                                    name={"zbandwidth"}
                                />
                            </InlineField>
                            <InlineField label={"Z Bandwidth Query"} style={{"maxWidth": "100%"}}>
                                <Select
                                    onChange={(v) => {handleBandwidthQueryChange(v.name, i, 'Z')}}
                                    value={link.ZSideBandwidthQuery}
                                    options={context.data}
                                    getOptionLabel={data => data?.name || 'No label'}
                                    getOptionValue={data => data?.name}
                                    className={styles.bandwidthSelect}
                                    placeholder={"Select Bandwidth"}
                                ></Select>
                            </InlineField>
                        </InlineFieldRow>
                        <InlineFieldRow className={styles.row2}>
                            <InlineField label={"Z Label Offset %"} style={{"width": "100%"}}>
                                <Slider
                                    min={0}
                                    max={100}
                                    value={link.ZSideLabelOffset}
                                    onChange={(v) => {handleLabelOffsetChange(v, i, 'Z')}}
                                />
                            </InlineField>
                        </InlineFieldRow>
                        <InlineFieldRow className={styles.row}>
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
      bandwidthSelect: css`
        margin: 0px 0px;
        max-width: calc(100% - 112px); 
      `,
      querySelect: css`
        margin: 0px 0px;
        max-width: calc(100% - 88px); 
      `, // TODO: find a better way to do this calc above
      row: css`
        margin-top: 5px;
        max-width: 100%;
        padding-top: 10px;
        border-top: 1px solid var(--in-content-button-background);
      `,
      row2: css`
        margin-top: 5px;
        max-width: 100%;
      `
    };
  });
