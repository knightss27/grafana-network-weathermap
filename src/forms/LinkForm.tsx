import React, { useState } from 'react';
import { css } from 'emotion';
import {
  Button,
  ControlledCollapse,
  InlineField,
  InlineFieldRow,
  InlineSwitch,
  Input,
  Select,
  Slider,
  stylesFactory,
  UnitPicker,
} from '@grafana/ui';
import { SelectableValue, StandardEditorProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';
import { Weathermap, Node, Link, Anchor, LinkSide } from 'types';
import { FormDivider } from './FormDivider';
import { getDataFrameName } from 'utils';

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

  const handleBandwidthQueryChange = (frame: string | undefined, i: number, side: 'A' | 'Z') => {
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

  const handleDataChange = (side: 'A' | 'Z', i: number, frameName: string | undefined) => {
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
      stroke: 8,
      arrows: {
        width: 8,
        height: 10,
        offset: 2,
      },
      showThroughputPercentage: false,
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
    for (let i = 0; i < weathermap.nodes.length; i++) {
      weathermap.nodes[i].anchors = {
        0: { numLinks: 0, numFilledLinks: 0 },
        1: { numLinks: 0, numFilledLinks: 0 },
        2: { numLinks: 0, numFilledLinks: 0 },
        3: { numLinks: 0, numFilledLinks: 0 },
        4: { numLinks: 0, numFilledLinks: 0 },
      };
    }
    props.onChange(weathermap);
  };

  const [currentLink, setCurrentLink] = useState('null' as unknown as Link);

  // Logic for disallowing more than two links (one in, one out) from connection nodes.
  let usedConnectionSourceNodes: string[] = [];
  let usedConnectionTargetNodes: string[] = [];
  for (let link of value.links) {
    if (link.nodes[0].isConnection) {
      usedConnectionSourceNodes.push(link.nodes[0].id);
    }
    if (link.nodes[1].isConnection) {
      usedConnectionTargetNodes.push(link.nodes[1].id);
    }
  }

  let usedConnectionNodes = usedConnectionSourceNodes.filter((n) => usedConnectionTargetNodes.includes(n));
  let availableNodes = value.nodes.filter((n) => !usedConnectionNodes.includes(n.id));

  let dataWithIds: string[] = [];
  context.data.forEach((d, i) => {
    dataWithIds.push(getDataFrameName(d, context.data));
  });

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
        isClearable
      ></Select>

      {value.links.map((link: Link, i) => {
        if (currentLink && link.id === currentLink.id) {
          return (
            <React.Fragment>
              {Object.values(link.sides).map((side: LinkSide, sideIndex) => {
                const sName: 'A' | 'Z' = sideIndex === 0 ? 'A' : 'Z';
                return (
                  <React.Fragment key={sideIndex}>
                    <FormDivider title={sName + ' Side Options'} />
                    <InlineField grow label={`${sName} Side`} labelWidth={'auto'}>
                      <Select
                        onChange={(v) => {
                          handleNodeChange(v as unknown as Node, sName, i);
                        }}
                        value={link.nodes[sideIndex]?.label || 'No label'}
                        options={availableNodes as unknown as Array<SelectableValue<String>>}
                        getOptionLabel={(node) => node?.label || 'No label'}
                        getOptionValue={(node) => node.id}
                        className={styles.nodeSelect}
                        placeholder={`Select ${sName} Side`}
                        defaultValue={link.nodes[sideIndex]}
                      ></Select>
                    </InlineField>
                    {(link.nodes[1].isConnection && sName === 'Z') ||
                    (link.nodes[0].isConnection && sName === 'A') ||
                    (link.nodes[0].isConnection && link.nodes[1].isConnection) ? (
                      ''
                    ) : (
                      <InlineField grow label={`${sName} Side Query`} labelWidth={'auto'}>
                        <Select
                          onChange={(v) => {
                            handleDataChange(sName, i, v ? v.value : undefined);
                          }}
                          // TODO: Unable to just pass a data frame or string here?
                          // This is fairly unoptimized if you have loads of data frames
                          value={dataWithIds.filter((p) => p === side.query)[0]}
                          options={dataWithIds.map((d) => {
                            return { value: d, label: d };
                          })}
                          className={styles.querySelect}
                          placeholder={`Select ${sName} Side Query`}
                          isClearable
                        ></Select>
                      </InlineField>
                    )}
                    {(link.nodes[1].isConnection && sName === 'Z') ||
                    (link.nodes[0].isConnection && sName === 'A') ||
                    (link.nodes[0].isConnection && link.nodes[1].isConnection) ? (
                      ''
                    ) : (
                      <React.Fragment>
                        <InlineField grow label={`${sName} Bandwidth #`} style={{ width: '100%' }}>
                          <Input
                            value={side.bandwidth}
                            onChange={(e) => handleBandwidthChange(e.currentTarget.valueAsNumber, i, sName)}
                            placeholder={'Custom max bandwidth'}
                            type={'number'}
                            className={styles.nodeLabel}
                            name={`${sName}bandwidth`}
                          />
                        </InlineField>
                        <InlineField
                          grow
                          label={`${sName} Bandwidth Query`}
                          style={{ width: '100%' }}
                          labelWidth={'auto'}
                        >
                          <Select
                            onChange={(v) => {
                              handleBandwidthQueryChange(v ? v.value : undefined, i, sName);
                            }}
                            value={dataWithIds.filter((p) => p === side.bandwidthQuery)[0]}
                            options={dataWithIds.map((d) => {
                              return { value: d, label: d };
                            })}
                            className={styles.bandwidthSelect}
                            placeholder={'Select Bandwidth'}
                            isClearable
                          ></Select>
                        </InlineField>
                        <InlineField grow label={`${sName} Label Offset %`} style={{ width: '100%' }}>
                          <Slider
                            min={0}
                            max={100}
                            value={side.labelOffset}
                            onChange={(v) => {
                              handleLabelOffsetChange(v, i, sName);
                            }}
                          />
                        </InlineField>
                        <InlineField grow label={`${sName} Side Anchor Point`} style={{ width: '100%' }}>
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
                        <InlineField grow label={`${sName} Dashboard Link`} style={{ width: '100%' }}>
                          <Input
                            value={side.dashboardLink}
                            onChange={(e) => handleDashboardLinkChange(e.currentTarget.value, i, sName)}
                            placeholder={'Link specific dashboard'}
                            type={'text'}
                            className={styles.nodeLabel}
                            name={`${sName}dashboardLink`}
                          />
                        </InlineField>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                );
              })}
              <FormDivider title="Link Options" />
              <InlineFieldRow className={styles.row2}>
                <InlineField grow label={`Link Units`} style={{ width: '100%' }}>
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
              <InlineField grow label={'Show Throughput as Percentage'}>
                <InlineSwitch
                  value={link.showThroughputPercentage}
                  onChange={(e) => {
                    let wm = value;
                    wm.links[i].showThroughputPercentage = e.currentTarget.checked;
                    onChange(wm);
                  }}
                />
              </InlineField>
              <ControlledCollapse label="Stroke and Arrow">
                <InlineField grow label="Link Stroke Width" className={styles.inlineField}>
                  <Slider
                    min={1}
                    max={30}
                    value={link.stroke}
                    step={1}
                    onChange={(num) => {
                      let options = value;
                      options.links[i].stroke = num;
                      onChange(options);
                    }}
                  />
                </InlineField>
                {link.nodes[1].isConnection ? (
                  ''
                ) : (
                  <React.Fragment>
                    <InlineField grow label="Arrow Width" className={styles.inlineField}>
                      <Slider
                        min={0}
                        max={30}
                        value={link.arrows.width}
                        step={1}
                        onChange={(num) => {
                          let options = value;
                          options.links[i].arrows.width = num;
                          onChange(options);
                        }}
                      />
                    </InlineField>
                    <InlineField grow label="Arrow Height" className={styles.inlineField}>
                      <Slider
                        min={0}
                        max={30}
                        value={link.arrows.height}
                        step={1}
                        onChange={(num) => {
                          let options = value;
                          options.links[i].arrows.height = num;
                          onChange(options);
                        }}
                      />
                    </InlineField>
                    <InlineField grow label="Arrow Offset" className={styles.inlineField}>
                      <Slider
                        min={0}
                        max={10}
                        value={link.arrows.offset}
                        step={1}
                        onChange={(num) => {
                          let options = value;
                          options.links[i].arrows.offset = num;
                          onChange(options);
                        }}
                      />
                    </InlineField>
                  </React.Fragment>
                )}
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    let weathermap: Weathermap = value;
                    for (let link of weathermap.links) {
                      link.arrows = { ...currentLink.arrows };
                      link.stroke = currentLink.stroke;
                    }
                    onChange(weathermap);
                  }}
                  style={{ marginTop: '10px' }}
                >
                  Apply to All?
                </Button>
              </ControlledCollapse>
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
    `,
    querySelect: css`
      margin: 0px 0px;
    `,
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
    inlineField: css``,
  };
});
