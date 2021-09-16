import React, { useEffect, useState, useRef } from 'react';
import { PanelProps, scaledUnits } from '@grafana/data';
import { Anchor, DrawnLink, DrawnNode, Link, LinkSide, Node, SimpleOptions, Position, Weathermap } from 'types';
import { css, cx } from 'emotion';
import { measureText, stylesFactory } from '@grafana/ui';
import settings from './weathermap.config.json';
import Draggable from 'react-draggable';
import svgPanZoom from 'svg-pan-zoom';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = (props) => {
  const { options, data, width: width2, height: height2, onOptionsChange } = props;
  const styles = getStyles();

  // Better variable name
  const wm = options.weathermap;

  // Get edit mode
  // const isEditMode = window.location.search.includes('editPanel');

  /** FIELDS */

  // User defined constants.
  const width = parseInt(settings.WIDTH, 10);
  const height = parseInt(settings.HEIGHT, 10);

  // Things to use multiple times
  const linkValueFormatter = scaledUnits(1000, ['b', 'Kb', 'Mb', 'Gb', 'Tb']);

  /** COLOR SCALES */
  const colors: any = {};
  Object.keys(options.weathermap ? options.weathermap.scale : {}).forEach((pct: string) => {
    colors[parseInt(pct, 10)] = options.weathermap.scale[parseInt(pct, 10)];
  });

  function getScaleColor(current: number, max: number) {
    if (max === 0) {
      return '#ddd';
    }

    const percent = Math.round((current / max) * 100);
    let actual = '';
    Object.keys(colors).forEach((amount: string) => {
      if (parseInt(amount, 10) <= percent) {
        actual = amount;
      }
    });
    return colors[actual];
  }

  // Calculate the height of a scale's sub-rectangle
  function getScaleColorHeight(index: number) {
    const keys = Object.keys(colors);
    const current: number = parseInt(keys[index], 10);
    const next: number = keys[index + 1] !== undefined ? parseInt(keys[index + 1], 10) : 101;
    let height: number = ((next - current) / 100) * 200;
    return height.toString() + 'px';
  }

  /** LINK AND ARROW RENDERING */

  // Get the middle point between two nodes
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

  // Get a point a percentage of the way between two nodes
  function getPercentPoint(source: Position, target: Position, percent: number): Position {
    const newX = target.x + (source.x - target.x) * percent;
    const newY = target.y + (source.y - target.y) * percent;
    return { x: newX, y: newY };
  }

  // Find the points that create the two other points of a triangle for the arrow's tip
  function getArrowPolygon(_p1: any, _p2: any) {
    let h = wm.settings.linkArrow.height;
    let w = wm.settings.linkArrow.width / 2;
    let vec1 = { x: _p2.x - _p1.x, y: _p2.y - _p1.y };
    let length = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
    vec1.x = vec1.x / length;
    vec1.y = vec1.y / length;
    let vec2 = { x: -vec1.y, y: vec1.x };
    let v1 = { x: _p2.x - h * vec1.x + w * vec2.x, y: _p2.y - h * vec1.y + w * vec2.y };
    let v2 = { x: _p2.x - h * vec1.x - w * vec2.x, y: _p2.y - h * vec1.y - w * vec2.y };
    return { p1: v1, p2: v2 };
  }

  /* STATE */

  // Nodes
  const [nodes, setNodes] = useState(
    options.weathermap
      ? options.weathermap.nodes.map((d, i) => {
          return generateDrawnNode(d, i);
        })
      : []
  );

  // To be used to calculate how many links we've drawn
  let tempNodes = nodes.slice();

  // Links
  const [links, setLinks] = useState(
    options.weathermap
      ? options.weathermap.links.map((d, i) => {
          return generateDrawnLink(d, i);
        })
      : []
  );

  // Find where to draw the rectangle for the node (top left x)
  function calculateRectX(d: DrawnNode) {
    // TODO: font-size replacement
    const offset = d.label !== undefined ? -(measureText(d.label, 10).width / 2 + d.padding.horizontal) : 0;
    return offset;
  }

  // Find where to draw the rectangle for the node (top left y)
  function calculateRectY(d: DrawnNode) {
    // TODO: font-size replacement
    return -10 / 2;
  }

  // Calculate the middle of the rectangle for text centering
  function calculateTextY(d: any) {
    // TODO: font-size replacement
    return calculateRectangleAutoHeight(d) / 2 - 10 / 2;
  }

  function getScaledMousePos(pos: { x: number; y: number }): { x: number; y: number } {
    // TODO add functionality
    return pos;
  }

  // For use with nodeGrid
  function nearestMultiple(i: number, j: number): number {
    return Math.ceil(i / j) * j;
  }

  // Calculate the auto-determined height of a node's rectangle
  function calculateRectangleAutoHeight(d: DrawnNode): number {
    const numLinks = Math.max(1, Math.max(d.anchors[Anchor.Left].numLinks, d.anchors[Anchor.Right].numLinks));
    // TODO: font-size replacement
    const minHeight = 10 + 2 * d.padding.vertical; // fontSize + padding
    const linkHeight = wm.settings.linkStrokeWidth + wm.settings.linkSpacingVertical + 2 * d.padding.vertical;
    const fullHeight = linkHeight * numLinks - wm.settings.linkSpacingVertical;
    const final = !d.compactVerticalLinks && numLinks > 1 ? fullHeight : minHeight;
    return final;
  }

  // Calculate the position of a link given the node and side information
  function getMultiLinkPosition(d: DrawnNode, side: LinkSide): Position {
    // Set initial x and y values for links. Defaults to center x of the node, and the middle y.
    let x = d.x;
    let y = d.y + calculateRectangleAutoHeight(d) / 2 - 10 / 2;

    // Change x values for left/right anchors
    if (side.anchor === Anchor.Left || side.anchor === Anchor.Right) {
      // Align left/right
      if (side.anchor === Anchor.Left) {
        x -= d.labelWidth / 2 + d.padding.horizontal - wm.settings.linkStrokeWidth / 2;
      } else {
        x += d.labelWidth / 2 + d.padding.horizontal;
      }
      // Calculate vertical alignments given # of links
      if (!d.compactVerticalLinks && d.anchors[side.anchor].numLinks > 1) {
        const linkHeight = wm.settings.linkStrokeWidth + wm.settings.linkSpacingVertical;
        const fullHeight =
          linkHeight * d.anchors[side.anchor].numLinks - wm.settings.linkSpacingVertical - wm.settings.linkStrokeWidth;
        y -= fullHeight / 2;
        y +=
          (d.anchors[side.anchor].numFilledLinks + 1) * wm.settings.linkStrokeWidth +
          d.anchors[side.anchor].numFilledLinks * wm.settings.linkSpacingVertical -
          wm.settings.linkStrokeWidth;
      }
    } else if (side.anchor !== Anchor.Center) {
      if (d.useConstantSpacing) {
        // To be used with constant-spacing
        const maxWidth =
          wm.settings.linkStrokeWidth * (d.anchors[side.anchor].numLinks - 1) +
          wm.settings.linkSpacingHorizontal * (d.anchors[side.anchor].numLinks - 1);
        x =
          d.x -
          maxWidth / 2 +
          d.anchors[side.anchor].numFilledLinks * (wm.settings.linkStrokeWidth + wm.settings.linkSpacingHorizontal);
      } else {
        // To be used with auto-spacing
        const paddedWidth = d.labelWidth + d.padding.horizontal * 2;
        x =
          d.x +
          -paddedWidth / 2 +
          (d.anchors[side.anchor].numFilledLinks + 1) *
            (paddedWidth / (nodes[d.index].anchors[side.anchor].numLinks + 1));
      }
      // Add height if we are at the bottom;
      if (side.anchor === Anchor.Bottom) {
        y += calculateRectangleAutoHeight(d) / 2 - wm.settings.linkStrokeWidth / 2;
      } else if (side.anchor === Anchor.Top) {
        y -= calculateRectangleAutoHeight(d) / 2;
        y += wm.settings.linkStrokeWidth / 2;
      }
    }
    // Mark that we've drawn another link
    d.anchors[side.anchor].numFilledLinks++;
    return { x, y };
  }

  // Calculate link positions / text / colors / etc.
  function generateDrawnLink(d: Link, i: number): DrawnLink {
    let toReturn: DrawnLink = Object.create(d);
    toReturn.index = i;

    // Set the link's source and target Node
    // TODO: optimize this
    toReturn.source = nodes.filter((n) => n.id === toReturn.nodes[0].id)[0];
    toReturn.target = nodes.filter((n) => n.id === toReturn.nodes[1].id)[0];

    let dataFrames = data.series.filter(
      (series) => series.name === toReturn.sides.A.query || series.name === toReturn.sides.Z.query
    );

    let dataValues = dataFrames.map((frame) => {
      return {
        value: frame.fields[1].values.get(frame.fields[1].values.length - 1),
        name: frame.name,
      };
    });

    // For each of our A/Z sides
    for (let s = 0; s < 2; s++) {
      const side: 'A' | 'Z' = s === 0 ? 'A' : 'Z';

      // Check if we have a query to run for this side
      if (toReturn.sides[side].bandwidthQuery) {
        let dataFrame = data.series
          .filter((series) => series.name === toReturn.sides[side].bandwidthQuery)
          .map((frame) => frame.fields[1].values.get(0));

        toReturn.sides[side].bandwidth = dataFrame.length > 0 ? dataFrame[0] : 0;
      }

      // Set the display value to zero, just in case nothing exists
      toReturn.sides[side].currentValue = 0;
      toReturn.sides[side].currentText = 'n/a';

      // Set the text if we have a query
      if (toReturn.sides[side].query) {
        let dataSource = toReturn.sides[side].query;
        let values = dataValues.filter((s) => s.name === dataSource);

        toReturn.sides[side].currentValue = values[0] ? values[0].value : 0;

        let scaledSideValue = linkValueFormatter(toReturn.sides[side].currentValue);
        toReturn.sides[side].currentText = `${scaledSideValue.text} ${scaledSideValue.suffix}/s`;
      }
    }

    // Calculate positions for links and arrow polygons. Not included above to help with typing.
    // TODO: type this properly, using the DrawnLinkSide interface

    if (i === 0) {
      tempNodes = tempNodes.map((n) => {
        n.anchors = {
          0: { numLinks: n.anchors[0].numLinks, numFilledLinks: 0 },
          1: { numLinks: n.anchors[1].numLinks, numFilledLinks: 0 },
          2: { numLinks: n.anchors[2].numLinks, numFilledLinks: 0 },
          3: { numLinks: n.anchors[3].numLinks, numFilledLinks: 0 },
          4: { numLinks: n.anchors[4].numLinks, numFilledLinks: 0 },
        };
        return n;
      });
    }

    toReturn.lineStartA = getMultiLinkPosition(tempNodes[toReturn.source.index], toReturn.sides.A);
    toReturn.lineStartZ = getMultiLinkPosition(tempNodes[toReturn.target.index], toReturn.sides.Z);

    toReturn.lineEndA = getMiddlePoint(
      toReturn.lineStartZ,
      toReturn.lineStartA,
      -wm.settings.linkArrow.offset - wm.settings.linkArrow.height
    );
    toReturn.arrowCenterA = getMiddlePoint(toReturn.lineStartZ, toReturn.lineStartA, -wm.settings.linkArrow.offset);
    toReturn.arrowPolygonA = getArrowPolygon(toReturn.lineStartA, toReturn.arrowCenterA);

    toReturn.lineEndZ = getMiddlePoint(
      toReturn.lineStartZ,
      toReturn.lineStartA,
      wm.settings.linkArrow.offset + wm.settings.linkArrow.height
    );
    toReturn.arrowCenterZ = getMiddlePoint(toReturn.lineStartZ, toReturn.lineStartA, wm.settings.linkArrow.offset);
    toReturn.arrowPolygonZ = getArrowPolygon(toReturn.lineStartZ, toReturn.arrowCenterZ);

    return toReturn;
  }

  // Calculate node position, width, etc.
  function generateDrawnNode(d: Node, i: number): DrawnNode {
    let toReturn: DrawnNode = Object.create(d);
    toReturn.index = i;
    toReturn.x = toReturn.position[0];
    toReturn.y = toReturn.position[1];
    toReturn.labelWidth = measureText(d.label ? d.label : '', 10).width;
    toReturn.anchors = {
      0: { numLinks: toReturn.anchors[0].numLinks, numFilledLinks: 0 },
      1: { numLinks: toReturn.anchors[1].numLinks, numFilledLinks: 0 },
      2: { numLinks: toReturn.anchors[2].numLinks, numFilledLinks: 0 },
      3: { numLinks: toReturn.anchors[3].numLinks, numFilledLinks: 0 },
      4: { numLinks: toReturn.anchors[4].numLinks, numFilledLinks: 0 },
    };
    return toReturn;
  }

  // Minimize uneeded state changes
  const mounted = useRef(false);

  // Update nodes on props change
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

  // Update links on nodes change
  useEffect(() => {
    tempNodes = nodes.slice();
    setLinks(
      options.weathermap
        ? options.weathermap.links.map((d, i) => {
            return generateDrawnLink(d, i);
          })
        : []
    );
  }, [nodes]);

  let isAltPressed = false;

  document.onkeydown = (e: KeyboardEvent) => {
    // console.log(e)
    if (e.ctrlKey) {
      isAltPressed = true;
    }
  }

  document.onkeyup = (e: KeyboardEvent) => {
    // console.log(e)
    if (!e.ctrlKey) {
      isAltPressed = false;
    }
  }

  // TODO: optimize this? also should it be an edit mode only thing?
  let zoomer: any = null;
  useEffect(() => {
    if (zoomer) {
      zoomer.destroy();
    }
    zoomer = svgPanZoom(`#nw-${options.weathermap.id}`, {
      beforePan: (oldPan, newPan) => {
        if (isAltPressed) {
          return true;
        } else {
          return false;
        }
      }
    });
  }, [])

  if (options.weathermap) {
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
            <div className={styles.colorScaleItem} key={i}>
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
                  (Object.keys(colors)[i + 1] === undefined ? '' : ' - ' + Object.keys(colors)[i + 1] + '%')}
              </span>
            </div>
          ))}
        </div>
        <svg
          className={cx(
            styles.svg,
            css`
              background-color: ${options.weathermap.settings.panel.backgroundColor};
            `
          )}
          id={`nw-${options.weathermap.id}`}
          width={width2}
          height={height2}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox={`0 0 ${options.weathermap.settings.panel.panelSize.width} ${options.weathermap.settings.panel.panelSize.height}`}
          shapeRendering="crispEdges"
          textRendering="geometricPrecision"
          fontFamily="sans-serif"
        >
          <g>
            {links.map((d, i) => {
              return (
                <g
                  key={i}
                  className="line"
                  strokeOpacity={1}
                  width={Math.abs(d.target.x - d.source.x)}
                  height={Math.abs(d.target.y - d.source.y)}
                >
                  <line
                    strokeWidth={wm.settings.linkStrokeWidth}
                    stroke={getScaleColor(d.sides.A.currentValue, d.sides.A.bandwidth)}
                    x1={d.lineStartA.x}
                    y1={d.lineStartA.y}
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
                    strokeWidth={wm.settings.linkStrokeWidth}
                    stroke={getScaleColor(d.sides.Z.currentValue, d.sides.Z.bandwidth)}
                    x1={d.lineStartZ.x}
                    y1={d.lineStartZ.y}
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
                <g fontStyle={'italic'} transform={`translate(${transform.x},${transform.y})`} key={i}>
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
                <g key={i} fontStyle={'italic'} transform={`translate(${transform.x},${transform.y})`}>
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
                key={i}
                position={{ x: d.x, y: d.y }}
                onDrag={(e, position) => {
                  setNodes((prevState) =>
                    prevState.map((val, index) => {
                      if (index === i) {
                        const scaledPos = getScaledMousePos(position);
                        val.x = options.weathermap.settings.enableNodeGrid
                          ? nearestMultiple(scaledPos.x, options.weathermap.settings.gridSizePx)
                          : scaledPos.x;
                        val.y = options.weathermap.settings.enableNodeGrid
                          ? nearestMultiple(scaledPos.y, options.weathermap.settings.gridSizePx)
                          : scaledPos.y;
                      }
                      return val;
                    })
                  );
                  tempNodes = nodes.slice();
                  setLinks(
                    options.weathermap.links.map((d, i) => {
                      return generateDrawnLink(d, i);
                    })
                  );
                }}
                onStop={(e, position) => {
                  let current: Weathermap = options.weathermap;
                  const scaledPos = getScaledMousePos(position);
                  current.nodes[i].position = [
                    options.weathermap.settings.enableNodeGrid
                      ? nearestMultiple(scaledPos.x, options.weathermap.settings.gridSizePx)
                      : scaledPos.x,
                    options.weathermap.settings.enableNodeGrid
                      ? nearestMultiple(scaledPos.y, options.weathermap.settings.gridSizePx)
                      : scaledPos.y,
                  ];
                  onOptionsChange({
                    ...options,
                    weathermap: current,
                  });
                }}
              >
                <g
                  display={d.label !== undefined ? 'inline' : 'none'}
                  cursor={'move'}
                  transform={`translate(${d.x},${d.y})`}
                >
                  <rect
                    x={calculateRectX(d)}
                    y={calculateRectY(d)}
                    width={d.label !== undefined ? d.labelWidth + d.padding.horizontal * 2 : 0}
                    height={calculateRectangleAutoHeight(d)}
                    fill={'#EFEFEF'}
                    stroke={'#DCDCDC'}
                    strokeWidth={2}
                    rx={6}
                    ry={7}
                  ></rect>
                  <text
                    x={0}
                    y={calculateTextY(d)}
                    textAnchor={'middle'}
                    alignmentBaseline={'central'}
                    dominantBaseline={'central'}
                    color={'#2B2B2B'}
                    className={styles.nodeText}
                    fontSize="10px"
                  >
                    {d.label !== undefined ? d.label : ''}
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
