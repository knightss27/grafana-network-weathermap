import React, { useState } from 'react';
import { css } from 'emotion';
import { Button, InlineField, InlineFieldRow, Input, Select, Slider, stylesFactory, UnitPicker } from '@grafana/ui';
import { SelectableValue, StandardEditorProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';
import { Weathermap, Node, Link, Anchor, LinkSide } from 'types';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const LinkForm = (props: Props) => {
  const { value, onChange, context } = props;
  const styles = getStyles();

  const findNodeIndex = (n1: Node): number => {
    let nodeIndex = -1;
    value.nodes.forEach((node, i) => {
      if (node.id === n1.id) {
        nodeIndex = i;
      }
    });
    return nodeIndex;
  };

  const handleBandwidthChange = (amt: number, i: number, side: 'A' | 'Z') => {
    let weathermap: Weathermap = value;
    weathermap.links[i].sides[side].bandwidth = amt;
    weathermap.links[i].sides[side].bandwidthQuery = undefined;
    onChange(weathermap);
  };

  const handleBandwidthQueryChange = (frame: string, i: number, side: 'A' | 'Z') => {
    let weathermap: Weathermap = value;
    weathermap.links[i].sides[side].bandwidth = 0;
    weathermap.links[i].sides[side].bandwidthQuery = frame;
    onChange(weathermap);
  };

  const handleAnchorChange = (anchor: number, i: number, side: 'A' | 'Z') => {
    let weathermap: Weathermap = value;
    const nodeIndex = findNodeIndex(weathermap.links[i].nodes[side === 'A' ? 0 : 1]);

    // remove from old
    weathermap.nodes[nodeIndex].anchors[weathermap.links[i].sides[side].anchor].numLinks--;
    weathermap.links[i].sides[side].anchor = anchor;
    // add to new
    weathermap.nodes[nodeIndex].anchors[weathermap.links[i].sides[side].anchor].numLinks++;
    onChange(weathermap);
  };

  const handleNodeChange = (node: Node, side: 'A' | 'Z', i: number) => {
    let weathermap: Weathermap = value;
    const nodeIndex = findNodeIndex(node);

    weathermap.nodes[nodeIndex].anchors[weathermap.links[i].sides[side].anchor].numLinks++;
    if (side === 'A') {
      const n2 = findNodeIndex(weathermap.links[i].nodes[0]);
      weathermap.nodes[n2].anchors[weathermap.links[i].sides[side].anchor].numLinks--;
      weathermap.links[i].nodes[0] = weathermap.nodes[nodeIndex];
    } else if (side === 'Z') {
      const n2 = findNodeIndex(weathermap.links[i].nodes[1]);
      weathermap.nodes[n2].anchors[weathermap.links[i].sides[side].anchor].numLinks--;
      weathermap.links[i].nodes[1] = weathermap.nodes[nodeIndex];
    }
    onChange(weathermap);
  };

  const handleDataChange = (side: 'A' | 'Z', i: number, frameName: string) => {
    let weathermap: Weathermap = value;
    weathermap.links[i].sides[side].query = frameName;
    onChange(weathermap);
  };

  const handleLabelOffsetChange = (val: number, i: number, side: 'A' | 'Z') => {
    let weathermap: Weathermap = value;
    weathermap.links[i].sides[side].labelOffset = val;
    onChange(weathermap);
  };

  const handleDashboardLinkChange = (val: string, i: number, side: 'A' | 'Z') => {
    let weathermap: Weathermap = value;
    weathermap.links[i].sides[side].dashboardLink = val;
    onChange(weathermap);
  };

  const addNewLink = () => {
    if (value.nodes.length === 0) {
      throw new Error('There must be >= 1 Nodes to create a link.');
    }
    let weathermap: Weathermap = value;
    const link: Link = {
      id: uuidv4(),
      nodes: [value.nodes[0], value.nodes[0]],
      sides: {
        A: {
          bandwidth: 0,
          bandwidthQuery: undefined,
          query: undefined,
          labelOffset: 55,
          anchor: Anchor.Center,
          dashboardLink: '',
        },
        Z: {
          bandwidth: 0,
          bandwidthQuery: undefined,
          query: undefined,
          labelOffset: 55,
          anchor: Anchor.Center,
          dashboardLink: '',
        },
      },
      units: 'binbps',
    };
    weathermap.nodes[0].anchors[Anchor.Center].numLinks += 2;
    weathermap.links.push(link);
    onChange(weathermap);
    setCurrentLink(link);
  };

  const removeLink = (i: number) => {
    let weathermap: Weathermap = value;
    let toRemove = weathermap.links[i];
    for (let i = 0; i < weathermap.nodes.length; i++) {
      if (weathermap.nodes[i].id === toRemove.nodes[0].id) {
        weathermap.nodes[i].anchors[toRemove.sides.A.anchor].numLinks--;
      } else if (weathermap.nodes[i].id === toRemove.nodes[1].id) {
        weathermap.nodes[i].anchors[toRemove.sides.Z.anchor].numLinks--;
      }
    }
    weathermap.links.splice(i, 1);
    onChange(weathermap);
  };

  const clearLinks = () => {
    let weathermap: Weathermap = value;
    weathermap.links = [];
    props.onChange(weathermap);
  };

  const [currentLink, setCurrentLink] = useState('null' as unknown as Link);

  return (
    <React.Fragment>
      <h6
        style={{
          padding: '10px 0px 5px 5px',
          marginTop: '10px',
          borderTop: '1px solid var(--in-content-button-background)',
        }}
      >
        Links
      </h6>
      <Select
        onChange={(v) => {
          setCurrentLink(v as Link);
        }}
        value={currentLink}
        options={value.links}
        getOptionLabel={(link) => (link.nodes.length > 0 ? `${link.nodes[0]?.label} <> ${link.nodes[1]?.label}` : '')}
        getOptionValue={(link) => link.id}
        className={styles.nodeSelect}
        placeholder={'Select a link'}
      ></Select>

      {value.links.map((link: Link, i) => {
        if (link.id === currentLink.id) {
          return (
            <React.Fragment>
              {Object.values(link.sides).map((side: LinkSide, sideIndex) => {
                const sName: 'A' | 'Z' = sideIndex === 0 ? 'A' : 'Z';
                return (
                  <React.Fragment key={sideIndex}>
                    <InlineFieldRow className={styles.row}>
                      <InlineField label={`${sName} Side`} labelWidth={'auto'} style={{ maxWidth: '100%' }}>
                        <Select
                          onChange={(v) => {
                            handleNodeChange(v as unknown as Node, sName, i);
                          }}
                          value={link.nodes[sideIndex]?.label || 'No label'}
                          options={value.nodes as unknown as Array<SelectableValue<String>>}
                          getOptionLabel={(node) => node?.label || 'No label'}
                          getOptionValue={(node) => node.id}
                          className={styles.nodeSelect}
                          placeholder={`Select ${sName} Side`}
                          defaultValue={link.nodes[sideIndex]}
                        ></Select>
                      </InlineField>
                      <InlineField label={`${sName} Side Query`} labelWidth={'auto'} style={{ maxWidth: '100%' }}>
                        <Select
                          onChange={(v) => {
                            handleDataChange(sName, i, v.name);
                          }}
                          // TODO: Unable to just pass a data frame or string here?
                          // This is fairly unoptimized if you have loads of data frames
                          value={context.data.filter((p) => p.name === side.query)[0]}
                          options={context.data}
                          getOptionLabel={(data) => data?.name || 'No label'}
                          getOptionValue={(data) => data?.name}
                          className={styles.querySelect}
                          placeholder={`Select ${sName} Side Query`}
                        ></Select>
                      </InlineField>
                    </InlineFieldRow>
                    <InlineFieldRow className={styles.row2}>
                      <InlineField label={`${sName} Bandwidth #`}>
                        <Input
                          value={side.bandwidth}
                          onChange={(e) => handleBandwidthChange(e.currentTarget.valueAsNumber, i, sName)}
                          placeholder={'Custom max bandwidth'}
                          type={'number'}
                          className={styles.nodeLabel}
                          name={`${sName}bandwidth`}
                        />
                      </InlineField>
                      <InlineField label={`${sName} Bandwidth Query`} style={{ maxWidth: '100%' }}>
                        <Select
                          onChange={(v) => {
                            handleBandwidthQueryChange(v.name, i, sName);
                          }}
                          value={context.data.filter((p) => p.name === side.bandwidthQuery)[0]}
                          options={context.data}
                          getOptionLabel={(data) => data?.name || 'No label'}
                          getOptionValue={(data) => data?.name}
                          className={styles.bandwidthSelect}
                          placeholder={'Select Bandwidth'}
                        ></Select>
                      </InlineField>
                    </InlineFieldRow>
                    <InlineFieldRow className={styles.row2}>
                      <InlineField label={`${sName} Label Offset %`} style={{ width: '100%' }}>
                        <Slider
                          min={0}
                          max={100}
                          value={side.labelOffset}
                          onChange={(v) => {
                            handleLabelOffsetChange(v, i, sName);
                          }}
                        />
                      </InlineField>
                    </InlineFieldRow>
                    <InlineFieldRow className={styles.row2}>
                      <InlineField label={`${sName} Side Anchor Point`} style={{ width: '100%' }}>
                        <Select
                          onChange={(v) => {
                            handleAnchorChange(v.value ? v.value : 0, i, sName);
                          }}
                          value={{ label: Anchor[side.anchor], value: side.anchor }}
                          options={Object.keys(Anchor)
                            .slice(5)
                            .map((nt, i) => {
                              return { label: Anchor[i], value: i };
                            })}
                          className={styles.bandwidthSelect}
                          placeholder={'Select Anchor'}
                        ></Select>
                      </InlineField>
                    </InlineFieldRow>
                    <InlineFieldRow className={styles.row2}>
                      <InlineField label={`${sName} Dashboard Link`} style={{ width: '100%' }}>
                        <Input
                          value={side.dashboardLink}
                          onChange={(e) => handleDashboardLinkChange(e.currentTarget.value, i, sName)}
                          placeholder={'Link specific dashboard'}
                          type={'text'}
                          className={styles.nodeLabel}
                          name={`${sName}dashboardLink`}
                        />
                      </InlineField>
                    </InlineFieldRow>
                  </React.Fragment>
                );
              })}
              <InlineFieldRow className={styles.row2}>
                <InlineField label={`Link Units`} style={{ width: '100%' }}>
                  <UnitPicker
                    onChange={(val) => {
                      let wm = value;
                      wm.links[i].units = val;
                      onChange(wm);
                    }}
                    value={link.units}
                  />
                </InlineField>
              </InlineFieldRow>
              <InlineFieldRow className={styles.row}>
                <Button variant="destructive" icon="trash-alt" size="md" onClick={() => removeLink(i)} className={''}>
                  Remove Link
                </Button>
              </InlineFieldRow>
            </React.Fragment>
          );
        }
        return;
      })}

      <Button variant="secondary" icon="plus" size="md" onClick={addNewLink} className={styles.addNew}>
        Add Link
      </Button>
      <Button variant="secondary" icon="trash-alt" size="md" onClick={clearLinks} className={styles.clearAll}>
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
    `,
  };
});
