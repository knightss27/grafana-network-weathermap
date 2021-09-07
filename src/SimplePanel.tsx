import React, { useEffect, useState, useRef } from 'react';
import { PanelProps, scaledUnits } from '@grafana/data';
import { Anchor, DrawnLink, DrawnNode, Link, LinkSide, Node, SimpleOptions, Weathermap } from 'types';
import { css, cx } from 'emotion';
import { measureText, stylesFactory } from '@grafana/ui';
import settings from './weathermap.config.json';
import Draggable from 'react-draggable';
import { v4 as uuidv4 } from 'uuid';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = (props) => {
  const { options, data, width: width2, height: height2, onOptionsChange } = props;
  const styles = getStyles();

  /** FIELDS */
  /** ----------------------------------------------------------------------------------- */

  // Distance that the tips of arrows will be drawn from the center. (px)
  const distFromCenter = 6;

  // Quick definition to be moved
  const linkSpacing = 15;
  const linkStrokeWidth = 8;

  // User defined constants.
  const width = parseInt(settings.WIDTH);
  const height = parseInt(settings.HEIGHT);
  // let backgroundColor: string = options.backgroundColor;

  if (!options || !options.panelOptions || !options.weathermap) {
    console.log('Initializing weathermap plugin.');

    onOptionsChange({
      panelOptions: {
        backgroundColor: '#ffffff',
        panelSize: {
          width: 600,
          height: 600,
        },
      },
      weathermap: {
        id: uuidv4(),
        nodes: [],
        links: [],
        scale: {},
      },
      enableNodeGrid: false,
      gridSizePx: 10,
    });
  }

  /** ----------------------------------------------------------------------------------- */

  /** COLOR SCALES */
  /** ----------------------------------------------------------------------------------- */
  const colors: any = {};
  Object.keys(options.weathermap ? options.weathermap.scale : {}).forEach((pct: string) => {
    colors[parseInt(pct)] = options.weathermap.scale[parseInt(pct)];
  });

  function getScaleColor(current: number, max: number) {
    if (max === 0) {
      return "#ddd"
    }

    const percent = Math.round((current / max) * 100);
    let actual: string = '';
    Object.keys(colors).forEach((amount: string) => {
      if (parseInt(amount) <= percent) {
        actual = amount;
      }
    });
    return colors[actual];
  }
  /** ----------------------------------------------------------------------------------- */

  /** LINK AND ARROW RENDERING */
  /** ----------------------------------------------------------------------------------- */
  // Find the middle point of a link.

  interface Position {
    x: number;
    y: number;
  }

  function getMiddlePoint(source: Position, target: Position, offset: number): Position {
    const x = (source.x + target.x) / 2;
    const y = (source.y + target.y) / 2;
    const a = target.x - source.x;
    const b = target.y - source.y;
    const dist = Math.sqrt(a * a + b * b);
    const newX = x - (offset * (target.x - source.x)) / dist;
    const newY = y - (offset * (target.y - source.y)) / dist;
    return { x: newX, y: newY };
  }

  function getPercentPoint(source: Position, target: Position, percent: number): Position {
    const newX = target.x + (source.x - target.x) * percent;
    const newY = target.y + (source.y - target.y) * percent;
    return { x: newX, y: newY };
  }

  // Find the points that create the two other points of a triangle for the arrow's tip;
  function getArrowPolygon(_p1: any, _p2: any) {
    // let linkWidth = settings.LINK.DEFAULT.WIDTH; //TODO: Make arrow size actually have something to do with the link's specified width.
    let h = 5.5 * Math.sqrt(3);
    let w = 4;
    let vec1 = { x: _p2.x - _p1.x, y: _p2.y - _p1.y };
    let length = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
    vec1.x = vec1.x / length;
    vec1.y = vec1.y / length;
    let vec2 = { x: -vec1.y, y: vec1.x };
    let v1 = { x: _p2.x - h * vec1.x + w * vec2.x, y: _p2.y - h * vec1.y + w * vec2.y };
    let v2 = { x: _p2.x - h * vec1.x - w * vec2.x, y: _p2.y - h * vec1.y - w * vec2.y };
    return { p1: v1, p2: v2 };
  }
  /** ----------------------------------------------------------------------------------- */

  /** ICON AND TEXT OFFSET CALCULATIONS */
  /** ----------------------------------------------------------------------------------- */
  // TODO: Create functions that actually calculate width properly, for now they just assume square-ish icons.

  function getImageRectOffset(d: any, dir: string) {
    return 0;
  }

  function getImageTextOffset(d: any, dir: string) {
    return 0;
  }

  const [nodes, setNodes] = useState(
    options.weathermap
      ? options.weathermap.nodes.map((d, i) => {
          return generateDrawnNode(d, i);
        })
      : []
  );

  let tempNodes = nodes.slice();

  const [links, setLinks] = useState(
    options.weathermap
      ? options.weathermap.links.map((d, i) => {
          return generateDrawnLink(d, i, true);
        })
      : []
  );

  function calculateRectX(d: any) {
    // This allows for NSEW offsets.
    let offset = d.label != undefined ? -(measureText(d.label, 10).width / 2 + 20 / 2) : 0;
    if (d.labelOFFSET == 'W') {
      return 2 * offset + getImageRectOffset(d, d.labelOFFSET);
    } else if (d.labelOFFSET == 'E') {
      return getImageRectOffset(d, d.labelOFFSET);
    }
    return offset;
  }

  function calculateRectY(d: any) {
    // This allows for NSEW offsets.
    if (d.ICON !== undefined && d.labelOFFSET !== undefined && d.ICONHEIGHT !== undefined) {
      if (d.labelOFFSET == 'S' || d.labelOFFSET == 'N') {
        return getImageRectOffset(d, d.labelOFFSET);
      }
    }
    return -8 / 2;
  }

  function calculateTextX(d: any) {
    let offset = d.label != undefined ? -(d.label.length * parseInt(settings.FONTDEFINE[2])) / 2 : 0;
    if (d.ICON !== undefined && d.labelOFFSET !== undefined && d.ICONHEIGHT !== undefined) {
      if (d.labelOFFSET == 'W') {
        return offset + getImageRectOffset(d, d.labelOFFSET);
      } else if (d.labelOFFSET == 'E') {
        return -offset + getImageRectOffset(d, d.labelOFFSET);
      }
    }
    return 0;
  }

  function calculateTextY(d: any) {
    // This allows for NSEW offsets.
    if (d.ICON !== undefined && d.labelOFFSET !== undefined && d.ICONHEIGHT !== undefined) {
      if (d.labelOFFSET == 'S' || d.labelOFFSET == 'N') {
        return getImageTextOffset(d, d.labelOFFSET);
      }
    }
    return parseInt(settings.FONTDEFINE[2]);
  }

  function getScaledMousePos(pos: { x: number; y: number }): { x: number; y: number } {
    // TODO
    return pos;
  }

  function getScaleColorHeight(index: number) {
    const keys = Object.keys(colors);
    const current: number = parseInt(keys[index]);
    const next: number = keys[index + 1] !== undefined ? parseInt(keys[index + 1]) : 101;
    let height: number = ((next - current) / 100) * 200;
    return height.toString() + 'px';
  }

  function nearestMultiple(i: number, j: number): number {
    return Math.ceil(i / j) * j;
  }

  function getMultiLinkPosition(d: DrawnNode, side: LinkSide): Position {
    // const rectXOffset = calculateRectX(d);
    // let toReturn = d.x + rectXOffset + (linkIndex + 1) * ((Math.abs(rectXOffset) * 2) / (d.numLinks + 1));
    let x = d.x;
    let y = d.y;
    if (side.anchor === Anchor.Left) {
      x -= d.labelWidth/2;
    } else if (side.anchor === Anchor.Right) {
      x += d.labelWidth/2;
    } else if (side.anchor !== Anchor.Center) {

      // To be used with constant-spacing
      const maxWidth = linkStrokeWidth * (d.anchors[side.anchor].numLinks) + linkSpacing * (d.anchors[side.anchor].numLinks)
      // console.log(maxWidth, side.anchor, d.anchors[side.anchor].numLinks)
      x = d.x - maxWidth/2 + (d.anchors[side.anchor].numFilledLinks) * (linkStrokeWidth + linkSpacing);

      // To be used with auto-spacing
      // x = d.x + -d.labelWidth/2 + (d.anchors[side.anchor].numFilledLinks + 1) * ((d.labelWidth) / (nodes[d.index].anchors[side.anchor].numLinks + 1));
      
      d.anchors[side.anchor].numFilledLinks++;
    }
    return {x, y};
  }

  // Calculate link positions / text / colors / etc.
  function generateDrawnLink(d: Link, i: number, isFirstPass: boolean): DrawnLink {
    let toReturn: DrawnLink = Object.create(d);
    toReturn.index = i;

    // Set the link's source and target Node
    toReturn.source = nodes.filter((n) => n.id == toReturn.nodes[0].id)[0];
    toReturn.target = nodes.filter((n) => n.id == toReturn.nodes[1].id)[0];

    // Check if we have a query to run for the A Side
    if (toReturn.sides.A.bandwidthQuery) {
      let dataFrame = data.series
        .filter((series) => series.name == toReturn.sides.A.bandwidthQuery)
        .map((frame) => frame.fields[1].values.get(0));

      toReturn.sides.A.bandwidth = dataFrame.length > 0 ? dataFrame[0] : 0;
    }

    // Check if we have a query to run for the B Side
    if (toReturn.sides.Z.bandwidthQuery) {
      let dataFrame = data.series
        .filter((series) => series.name == toReturn.sides.Z.bandwidthQuery)
        .map((frame) => frame.fields[1].values.get(0));

      toReturn.sides.A.bandwidth = dataFrame.length > 0 ? dataFrame[0] : 0;
    }

    // Set the display value to zero, just in case nothing exists
    toReturn.sides.A.currentValue = 0;
    toReturn.sides.Z.currentValue = 0;
    toReturn.sides.A.currentText = 'n/a';
    toReturn.sides.Z.currentText = 'n/a';

    if (toReturn.sides.A.query && toReturn.sides.Z.query) {
      let dataSourceA = toReturn.sides.A.query;
      let dataSourceZ = toReturn.sides.Z.query;

      let dataFrames = data.series.filter(
        (series) => (series.name == dataSourceA || series.name == dataSourceZ)
      );

      let dataValues = dataFrames.map((frame) => {
        return {
          value: frame.fields[1].values.get(frame.fields[1].values.length - 1),
          name: frame.name,
        };
      });

      let aValues = dataValues.filter((s) => s.name == dataSourceA);
      let zValues = dataValues.filter((s) => s.name == dataSourceZ);

      toReturn.sides.A.currentValue = aValues[0] ? aValues[0].value : 0;
      toReturn.sides.Z.currentValue = zValues[0] ? zValues[0].value : 0;

      let testFormat = scaledUnits(1000, ['b', 'Kb', 'Mb', 'Gb', 'Tb']);
      let scaledASideValue = testFormat(toReturn.sides.A.currentValue);
      let scaledZSideValue = testFormat(toReturn.sides.Z.currentValue);

      toReturn.sides.A.currentText = `${scaledASideValue.text} ${scaledASideValue.suffix}/s`;
      toReturn.sides.Z.currentText = `${scaledZSideValue.text} ${scaledZSideValue.suffix}/s`;
    }

    // console.log(toReturn);
    if (i == 0) {
      tempNodes = tempNodes.map(n => {
        n.anchors = {
          0: { numLinks: n.anchors[0].numLinks, numFilledLinks: 0 },
          1: { numLinks: n.anchors[1].numLinks, numFilledLinks: 0 },
          2: { numLinks: n.anchors[2].numLinks, numFilledLinks: 0 },
          3: { numLinks: n.anchors[3].numLinks, numFilledLinks: 0 },
          4: { numLinks: n.anchors[4].numLinks, numFilledLinks: 0 }
        }
        return n;
      });
    }
    toReturn.lineStartA = getMultiLinkPosition(tempNodes[toReturn.source.index], toReturn.sides.A);
    // tempNodes[toReturn.source.index].filledLinks++;
    toReturn.lineStartZ = getMultiLinkPosition(tempNodes[toReturn.target.index], toReturn.sides.Z);
    // tempNodes[toReturn.target.index].filledLinks++;

    toReturn.lineEndA = getMiddlePoint(toReturn.lineStartZ, toReturn.lineStartA, -distFromCenter - 4);
    toReturn.arrowCenterA = getMiddlePoint(toReturn.lineStartZ, toReturn.lineStartA, -distFromCenter + 5);
    toReturn.arrowPolygonA = getArrowPolygon(toReturn.lineStartA, toReturn.arrowCenterA);

    toReturn.lineEndZ = getMiddlePoint(toReturn.lineStartZ, toReturn.lineStartA, distFromCenter + 4);
    toReturn.arrowCenterZ = getMiddlePoint(toReturn.lineStartZ, toReturn.lineStartA, distFromCenter - 5);
    toReturn.arrowPolygonZ = getArrowPolygon(toReturn.lineStartZ, toReturn.arrowCenterZ);

    return toReturn;
  }

  function generateDrawnNode(d: Node, i: number): DrawnNode {
    let toReturn: DrawnNode = Object.create(d);
    toReturn.index = i;
    toReturn.x = toReturn.POSITION[0];
    toReturn.y = toReturn.POSITION[1];
    toReturn.labelWidth = measureText(d.label ? d.label : "", 10).width;
    toReturn.anchors = {
      0: { numLinks: toReturn.anchors[0].numLinks, numFilledLinks: 0 },
      1: { numLinks: toReturn.anchors[1].numLinks, numFilledLinks: 0 },
      2: { numLinks: toReturn.anchors[2].numLinks, numFilledLinks: 0 },
      3: { numLinks: toReturn.anchors[3].numLinks, numFilledLinks: 0 },
      4: { numLinks: toReturn.anchors[4].numLinks, numFilledLinks: 0 }
    }
    return toReturn;
}

  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    } else {
      setNodes(
        options.weathermap.nodes
          ? options.weathermap.nodes.map((d, i) => {
              return generateDrawnNode(d, i);
            })
          : []
      );
    }
  }, [props]);

  useEffect(() => {
      tempNodes = nodes.slice();
      setLinks(
        options.weathermap
          ? options.weathermap.links.map((d, i) => {
              return generateDrawnLink(d, i, false);
            })
          : []
      );
  }, [nodes]);

  if (options.weathermap && options.panelOptions) {
    return (
      <div
        className={cx(
          styles.wrapper,
          css`
            width: ${width}px;
            height: ${height}px;
          `
        )}
      >
        <div className={styles.colorScaleContainer}>
          <div className={styles.colorBoxTitle}>Traffic Load</div>
          {Object.keys(colors).map((percent, i) => (
            <div className={styles.colorScaleItem}>
              <span
                className={cx(
                  styles.colorBox,
                  css`
                    background: ${colors[percent]};
                    height: ${getScaleColorHeight(i)};
                  `
                )}
              ></span>
              <span className={styles.colorLabel}>
                {percent +
                  '%' +
                  (Object.keys(colors)[i + 1] == undefined ? '' : ' - ' + Object.keys(colors)[i + 1] + '%')}
              </span>
            </div>
          ))}
        </div>
        <svg
          className={cx(
            styles.svg,
            css`
              background-color: ${options.panelOptions.backgroundColor};
            `
          )}
          id={`nw-${options.weathermap.id}`}
          width={width2}
          height={height2}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox={`0 0 ${options.panelOptions.panelSize.width} ${options.panelOptions.panelSize.height}`}
          shapeRendering="crispEdges"
          textRendering="geometricPrecision"
          fontFamily="sans-serif"
        >
          <g>
            {links.map((d, i) => {
              return (
                <g
                  className="line"
                  strokeOpacity={1}
                  width={Math.abs(d.target.x - d.source.x)}
                  height={Math.abs(d.target.y - d.source.y)}
                >
                  <line
                    strokeWidth={linkStrokeWidth}
                    stroke={getScaleColor(d.sides.A.currentValue, d.sides.A.bandwidth)}
                    x1={d.lineStartA.x}
                    y1={d.source.y}
                    x2={d.lineEndA.x}
                    y2={d.lineEndA.y}
                  ></line>
                  <polygon
                    points={`
                                      ${d.arrowCenterA.x} 
                                      ${d.arrowCenterA.y} 
                                      ${d.arrowPolygonA.p1.x} 
                                      ${d.arrowPolygonA.p1.y}
                                      ${d.arrowPolygonA.p2.x}
                                      ${d.arrowPolygonA.p2.y}
                                  `}
                    fill={getScaleColor(d.sides.A.currentValue, d.sides.A.bandwidth)}
                  ></polygon>
                  <line
                    strokeWidth={settings.LINK.DEFAULT.WIDTH + 'px'}
                    stroke={getScaleColor(d.sides.Z.currentValue, d.sides.Z.bandwidth)}
                    x1={d.lineStartZ.x}
                    y1={d.target.y}
                    x2={d.lineEndZ.x}
                    y2={d.lineEndZ.y}
                  ></line>
                  <polygon
                    points={`
                                      ${d.arrowCenterZ.x} 
                                      ${d.arrowCenterZ.y} 
                                      ${d.arrowPolygonZ.p1.x} 
                                      ${d.arrowPolygonZ.p1.y}
                                      ${d.arrowPolygonZ.p2.x}
                                      ${d.arrowPolygonZ.p2.y}
                                  `}
                    fill={getScaleColor(d.sides.Z.currentValue, d.sides.Z.bandwidth)}
                  ></polygon>
                </g>
              );
            })}
          </g>
          <g>
            {links.map((d, i) => {
              const transform = getPercentPoint(d.lineStartZ, d.lineStartA, 0.5 * (d.sides.A.labelOffset / 100));
              return (
                <g fontStyle={'italic'} transform={`translate(${transform.x},${transform.y})`}>
                  <rect
                    x={-measureText(`${d.sides.A.currentText}`, 7).width / 2 - 12 / 2}
                    y={-5}
                    width={measureText(`${d.sides.A.currentText}`, 7).width + 12}
                    height={7 + 8}
                    fill={'#EFEFEF'}
                    stroke={'#DCDCDC'}
                    strokeWidth={2}
                    rx={(7 + 8) / 2}
                  ></rect>
                  <text x={0} y={7 - 2} textAnchor={'middle'} fontSize={'7px'}>
                    {`${d.sides.A.currentText}`}
                  </text>
                </g>
              );
            })}
          </g>
          <g>
            {links.map((d, i) => {
              const transform = getPercentPoint(d.lineStartA, d.lineStartZ, 0.5 * (d.sides.Z.labelOffset / 100));
              return (
                <g fontStyle={'italic'} transform={`translate(${transform.x},${transform.y})`}>
                  <rect
                    x={-measureText(`${d.sides.Z.currentText}`, 7).width / 2 - 12 / 2}
                    y={-5}
                    width={measureText(`${d.sides.Z.currentText}`, 7).width + 12}
                    height={7 + 8}
                    fill={'#EFEFEF'}
                    stroke={'#DCDCDC'}
                    strokeWidth={2}
                    rx={(7 + 8) / 2}
                  ></rect>
                  <text x={0} y={7 - 2} textAnchor={'middle'} fontSize={'7px'}>
                    {`${d.sides.Z.currentText}`}
                  </text>
                </g>
              );
            })}
          </g>
          <g>
            {nodes.map((d, i) => (
              <Draggable
                position={{ x: d.x, y: d.y }}
                onDrag={(e, position) => {
                  setNodes((prevState) =>
                    prevState.map((val, index) => {
                      if (index == i) {
                        const scaledPos = getScaledMousePos(position);
                        val.x = options.enableNodeGrid ? nearestMultiple(scaledPos.x, options.gridSizePx) : scaledPos.x;
                        val.y = options.enableNodeGrid ? nearestMultiple(scaledPos.y, options.gridSizePx) : scaledPos.y;
                      }
                      return val;
                    })
                  );
                  tempNodes = nodes.slice();
                  setLinks(
                    options.weathermap.links.map((d, i) => {
                      return generateDrawnLink(d, i, false);
                    })
                  );
                }}
                onStop={(e, position) => {
                  let current: Weathermap = options.weathermap;
                  const scaledPos = getScaledMousePos(position);
                  current.nodes[i].POSITION = [
                    options.enableNodeGrid ? nearestMultiple(scaledPos.x, options.gridSizePx) : scaledPos.x,
                    options.enableNodeGrid ? nearestMultiple(scaledPos.y, options.gridSizePx) : scaledPos.y,
                  ];
                  onOptionsChange({
                    ...options,
                    weathermap: current,
                  });
                }}

                //TODO: Implement this fully!
              >
                <g
                  display={d.label != undefined ? 'inline' : 'none'}
                  cursor={'move'}
                  onDoubleClick={() => {
                    console.log('double clicked');
                  }}
                  transform={`translate(${d.x},${d.y})`}
                >
                  <rect
                    x={calculateRectX(d)}
                    y={calculateRectY(d)}
                    width={d.label != undefined ? d.labelWidth + 20 : 0}
                    height={parseInt(settings.FONTDEFINE[2]) + 8}
                    fill={'#EFEFEF'}
                    stroke={'#DCDCDC'}
                    strokeWidth={2}
                    rx={6}
                    ry={7}
                  ></rect>
                  <text
                    x={calculateTextX(d)}
                    y={calculateTextY(d)}
                    textAnchor={'middle'}
                    alignmentBaseline={'central'}
                    color={'#2B2B2B'}
                    className={styles.nodeText}
                    fontSize="10px"
                  >
                    {d.label != undefined ? d.label : ''}
                  </text>
                </g>
              </Draggable>
            ))}
          </g>
        </svg>
      </div>
    );
  } else {
    return <React.Fragment />;
  }
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
      font-size: 10px;
      font-family: sans-serif;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
    colorScaleContainer: css`
      position: relative;
      bottom: 0;
      left: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      color: black;
      z-index: 2;
      width: 200px;
    `,
    colorBoxTitle: css`
      font-size: 16px;
      font-weight: bold;
      padding: 5px 0px;
    `,
    colorScaleItem: css`
      display: flex;
      align-items: center;
    `,
    colorBox: css`
      width: 50px;
      margin-right: 5px;
    `,
    colorLabel: css`
      line-height: 0px;
      font-size: 12px;
    `,
    nodeText: css`
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -o-user-select: none;
      user-select: none;
    `,
  };
});
