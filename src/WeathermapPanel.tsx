import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getValueFormat, PanelProps } from '@grafana/data';
import {
  Anchor,
  DrawnLink,
  DrawnNode,
  Link,
  LinkSide,
  Node,
  SimpleOptions,
  Position,
  Weathermap,
  HoveredLink,
} from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme2 } from '@grafana/ui';
import {
  measureText,
  getSolidFromAlphaColor,
  nearestMultiple,
  calculateRectangleAutoWidth,
  calculateRectangleAutoHeight,
  CURRENT_VERSION,
  handleVersionedStateUpdates,
} from 'utils';
import MapNode from './components/MapNode';
import ColorScale from 'components/ColorScale';

// Calculate node position, width, etc.
function generateDrawnNode(d: Node, i: number, wm: Weathermap): DrawnNode {
  let toReturn: DrawnNode = Object.create(d);
  toReturn.index = i;
  toReturn.x = toReturn.position[0];
  toReturn.y = toReturn.position[1];
  toReturn.labelWidth = measureText(d.label ? d.label : '', wm.settings.fontSizing.node).width;
  toReturn.anchors = {
    0: { numLinks: toReturn.anchors[0].numLinks, numFilledLinks: 0 },
    1: { numLinks: toReturn.anchors[1].numLinks, numFilledLinks: 0 },
    2: { numLinks: toReturn.anchors[2].numLinks, numFilledLinks: 0 },
    3: { numLinks: toReturn.anchors[3].numLinks, numFilledLinks: 0 },
    4: { numLinks: toReturn.anchors[4].numLinks, numFilledLinks: 0 },
  };
  return toReturn;
}

// Format link values as the proper prefix of bits
const getlinkValueFormatter = (fmt_id: string) => getValueFormat(fmt_id);

/**
 * Weathermap panel component.
 */
export const WeathermapPanel: React.FC<PanelProps<SimpleOptions>> = (props: PanelProps<SimpleOptions>) => {
  const { options, data, width: width2, height: height2, onOptionsChange, timeRange } = props;
  const styles = getStyles();
  const theme = useTheme2();
  const wm = options.weathermap;

  if (wm && (!wm.version || wm.version !== CURRENT_VERSION)) {
    onOptionsChange({ weathermap: handleVersionedStateUpdates(wm, theme) });
  }

  const isEditMode = window.location.search.includes('editPanel');

  // Color scales
  const colors: any = useMemo(() => {
    const c: any = {};
    Object.keys(wm.scale).forEach((pct: string) => {
      c[parseInt(pct, 10)] = options.weathermap.scale[parseInt(pct, 10)];
    });
    return c;
  }, [wm.scale, options]);

  function getScaleColor(current: number, max: number) {
    if (max === 0) {
      return getSolidFromAlphaColor(wm.settings.link.stroke.color, wm.settings.panel.backgroundColor);
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

  const [nodes, setNodes] = useState(
    wm.nodes.map((d, i) => {
      return generateDrawnNode(d, i, wm);
    })
  );

  // To be used to calculate how many links we've drawn
  let tempNodes = nodes.slice();

  const [links, setLinks] = useState(
    wm
      ? wm.links.map((d, i) => {
          return generateDrawnLink(d, i);
        })
      : []
  );

  // Calculate aspect-ratio corrected drag positions
  function getScaledMousePos(pos: { x: number; y: number }): { x: number; y: number } {
    const zoomAmt = Math.pow(1.2, wm.settings.panel.zoomScale);
    return {
      x: pos.x * zoomAmt * aspectMultiplier,
      y: pos.y * zoomAmt * aspectMultiplier,
    };
  }

  // Calculate the position of a link given the node and side information
  function getMultiLinkPosition(d: DrawnNode, side: LinkSide): Position {
    // Set initial x and y values for links. Defaults to center x of the node, and the middle y.
    let x = d.x;
    let y = d.y;

    // Set x and y to the rounded value if we are using the grid
    x =
      wm.settings.panel.grid.enabled && draggedNode && draggedNode.index === d.index
        ? nearestMultiple(d.x, wm.settings.panel.grid.size)
        : x;
    y =
      wm.settings.panel.grid.enabled && draggedNode && draggedNode.index === d.index
        ? nearestMultiple(d.y, wm.settings.panel.grid.size)
        : y;

    // Change x values for left/right anchors
    if (side.anchor === Anchor.Left || side.anchor === Anchor.Right) {
      // Align left/right
      if (side.anchor === Anchor.Left) {
        x -= calculateRectangleAutoWidth(d, wm) / 2 - wm.settings.link.stroke.width / 2;
      } else {
        x += calculateRectangleAutoWidth(d, wm) / 2 - wm.settings.link.stroke.width / 2;
      }
      // Calculate vertical alignments given # of links
      if (!d.compactVerticalLinks && d.anchors[side.anchor].numLinks > 1) {
        const linkHeight = wm.settings.link.stroke.width + wm.settings.link.spacing.vertical;
        const fullHeight =
          linkHeight * d.anchors[side.anchor].numLinks -
          wm.settings.link.spacing.vertical -
          wm.settings.link.stroke.width;
        y -= fullHeight / 2;
        y +=
          (d.anchors[side.anchor].numFilledLinks + 1) * wm.settings.link.stroke.width +
          d.anchors[side.anchor].numFilledLinks * wm.settings.link.spacing.vertical -
          wm.settings.link.stroke.width;
      }
    } else if (side.anchor !== Anchor.Center) {
      if (d.useConstantSpacing) {
        // To be used with constant-spacing
        const maxWidth =
          wm.settings.link.stroke.width * (d.anchors[side.anchor].numLinks - 1) +
          wm.settings.link.spacing.horizontal * (d.anchors[side.anchor].numLinks - 1);
        x +=
          -maxWidth / 2 +
          d.anchors[side.anchor].numFilledLinks * (wm.settings.link.stroke.width + wm.settings.link.spacing.horizontal);
      } else {
        // To be used with auto-spacing
        const paddedWidth = d.labelWidth + d.padding.horizontal * 2;
        x +=
          -paddedWidth / 2 +
          (d.anchors[side.anchor].numFilledLinks + 1) *
            (paddedWidth / (nodes[d.index].anchors[side.anchor].numLinks + 1));
      }
      // Add height if we are at the bottom;
      if (side.anchor === Anchor.Bottom) {
        y += calculateRectangleAutoHeight(d, wm) / 2 - wm.settings.link.stroke.width / 2;
      } else if (side.anchor === Anchor.Top) {
        y -= calculateRectangleAutoHeight(d, wm) / 2;
        y += wm.settings.link.stroke.width / 2;
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
    const linkValueFormatter = getlinkValueFormatter(d.units ? d.units : 'binbps');

    // Set the link's source and target node
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
        toReturn.sides[side].currentText = `${scaledSideValue.text} ${scaledSideValue.suffix}`;
      }

      let scaledBandwidth = linkValueFormatter(toReturn.sides[side].bandwidth);
      toReturn.sides[side].currentBandwidthText = `${scaledBandwidth.text} ${scaledBandwidth.suffix}`;
    }

    // Calculate positions for links and arrow polygons. Not included above to help with typing.
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

  // Minimize uneeded state changes
  const mounted = useRef(false);

  // Update nodes on props change
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    } else {
      setNodes(
        options.weathermap.nodes.map((d, i) => {
          return generateDrawnNode(d, i, options.weathermap);
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  tempNodes = nodes.slice();

  // Update links on nodes change
  useEffect(() => {
    setLinks(
      options.weathermap.links.map((d, i) => {
        return generateDrawnLink(d, i);
      })
    );
    // Yes, technically this allows for stale states if it were to updated in any way other than being passed down. But it's not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  const zoom = (e: WheelEvent) => {
    // Just don't allow zooming when not in edit mode
    if (!isEditMode) {
      return;
    }

    let zoomed: Weathermap = wm;

    if (e.deltaY > 0) {
      zoomed.settings.panel.zoomScale += 1;
    } else {
      zoomed.settings.panel.zoomScale -= 1;
    }
    onOptionsChange({
      weathermap: zoomed,
    });
  };

  const [isDragging, setDragging] = useState(false);

  let aspectX = wm.settings.panel.panelSize.width / width2;
  let aspectY = wm.settings.panel.panelSize.height / height2;
  let aspectMultiplier = Math.max(aspectX, aspectY);

  const updateAspects = () => {
    aspectX = wm.settings.panel.panelSize.width / width2;
    aspectY = wm.settings.panel.panelSize.height / height2;
    aspectMultiplier = Math.max(aspectX, aspectY);
  };

  const [offset, setOffset] = useState(wm.settings.panel.offset);

  const drag = (e: any) => {
    if (e.ctrlKey || e.buttons === 4) {
      e.nativeEvent.preventDefault();
      const zoomAmt = Math.pow(1.2, wm.settings.panel.zoomScale);

      setOffset((prev) => {
        return {
          x: prev.x + e.nativeEvent.movementX * zoomAmt * aspectMultiplier,
          y: prev.y + e.nativeEvent.movementY * zoomAmt * aspectMultiplier,
        };
      });
    }
  };

  const [hoveredLink, setHoveredLink] = useState(null as unknown as HoveredLink);

  const handleLinkHover = (d: DrawnLink, side: 'A' | 'Z', e: any) => {
    setHoveredLink({ link: d, side, mouseEvent: e });
  };

  const handleLinkHoverLoss = () => {
    setHoveredLink(null as unknown as HoveredLink);
  };

  const [draggedNode, setDraggedNode] = useState(null as unknown as DrawnNode);

  // const extraWidthOffset = ((width2/height2) * wm.settings.panel.panelSize.height - wm.settings.panel.panelSize.width) / 2;

  if (wm) {
    return (
      <div
        className={cx(
          styles.wrapper,
          css`
            width: ${width2}px;
            height: ${height2}px;
            position: relative;
          `
        )}
      >
        {hoveredLink ? (
          <div
            className={css`
              position: absolute;
              top: ${hoveredLink.mouseEvent.nativeEvent.layerY}px;
              left: ${hoveredLink.mouseEvent.nativeEvent.layerX}px;
              transform: translate(0%, -100%);
              background-color: ${wm.settings.tooltip.backgroundColor};
              color: ${wm.settings.tooltip.textColor} !important;
              font-size: ${wm.settings.tooltip.fontSize} !important;
              z-index: 1000;
              display: ${hoveredLink ? 'flex' : 'none'};
              flex-direction: column;
              cursor: none;
              padding: 5px;
              border-radius: 4px;
            `}
          >
            <div style={{ fontSize: wm.settings.tooltip.fontSize }}>
              Usage: {hoveredLink.link.sides[hoveredLink.side].currentText}
            </div>
            <div style={{ fontSize: wm.settings.tooltip.fontSize }}>
              Bandwidth: {hoveredLink.link.sides[hoveredLink.side].currentBandwidthText}
            </div>
            <div style={{ fontSize: wm.settings.tooltip.fontSize }}>
              {hoveredLink.link.sides[hoveredLink.side].dashboardLink.length > 0 ? 'Click to see more.' : ''}
            </div>
          </div>
        ) : (
          ''
        )}
        <ColorScale colors={colors} settings={wm.settings} />
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundImage: wm.settings.panel.backgroundColor.startsWith('image')
              ? `url(${wm.settings.panel.backgroundColor.split('|', 3)[2]})`
              : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: wm.settings.panel.backgroundColor.startsWith('image')
              ? 'none'
              : wm.settings.panel.backgroundColor,
          }}
          id={`nw-${wm.id}${isEditMode ? '_' : ''}`}
          width={width2}
          height={height2}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox={`0 0 ${wm.settings.panel.panelSize.width * Math.pow(1.2, wm.settings.panel.zoomScale)} ${
            wm.settings.panel.panelSize.height * Math.pow(1.2, wm.settings.panel.zoomScale)
          }`}
          shapeRendering="crispEdges"
          textRendering="geometricPrecision"
          fontFamily="sans-serif"
          // @ts-ignore
          onWheel={zoom}
          onMouseDown={(e) => {
            e.preventDefault();
            updateAspects();
            setDragging(true);
          }}
          onMouseMove={(e) => {
            if (isDragging && (e.ctrlKey || e.buttons === 4)) {
              drag(e);
            }
          }}
          onMouseUp={() => {
            setDragging(false);
            let panned = wm;
            panned.settings.panel.offset = offset;
            onOptionsChange({ weathermap: panned });
          }}
        >
          {wm.settings.panel.grid.enabled ? (
            <defs>
              <pattern
                id="smallGrid"
                width={wm.settings.panel.grid.size}
                height={wm.settings.panel.grid.size}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${wm.settings.panel.grid.size} 0 L 0 0 0 ${wm.settings.panel.grid.size}`}
                  fill="none"
                  stroke="gray"
                  strokeWidth="2"
                  opacity={1}
                />
              </pattern>
            </defs>
          ) : (
            ''
          )}
          <g
            transform={`translate(${
              (wm.settings.panel.panelSize.width * Math.pow(1.2, wm.settings.panel.zoomScale) -
                wm.settings.panel.panelSize.width) /
                2 +
              offset.x
            }, ${
              (wm.settings.panel.panelSize.height * Math.pow(1.2, wm.settings.panel.zoomScale) -
                wm.settings.panel.panelSize.height) /
                2 +
              offset.y
            })`}
            overflow="visible"
          >
            {wm.settings.panel.grid.guidesEnabled ? (
              <>
                <rect
                  x={
                    wm.nodes.length > 0
                      ? wm.nodes[0].position[0] -
                        wm.settings.panel.panelSize.width * Math.pow(1.2, wm.settings.panel.zoomScale) * 2
                      : 0
                  }
                  y={
                    wm.nodes.length > 0
                      ? wm.nodes[0].position[1] -
                        wm.settings.panel.panelSize.height * Math.pow(1.2, wm.settings.panel.zoomScale) * 2
                      : 0
                  }
                  width={wm.settings.panel.panelSize.width * Math.pow(1.2, wm.settings.panel.zoomScale) * 4}
                  height={wm.settings.panel.panelSize.height * Math.pow(1.2, wm.settings.panel.zoomScale) * 4}
                  fill="url(#smallGrid)"
                />
              </>
            ) : (
              ''
            )}
          </g>
          <g
            transform={`translate(${
              (wm.settings.panel.panelSize.width * Math.pow(1.2, wm.settings.panel.zoomScale) -
                wm.settings.panel.panelSize.width) /
                2 +
              offset.x
            }, ${
              (wm.settings.panel.panelSize.height * Math.pow(1.2, wm.settings.panel.zoomScale) -
                wm.settings.panel.panelSize.height) /
                2 +
              offset.y
            })`}
          >
            <g>
              {links.map((d, i) => {
                if (d.nodes[0].id === d.nodes[1].id) {
                  return;
                }
                return (
                  <g
                    key={i}
                    className="line"
                    strokeOpacity={1}
                    width={Math.abs(d.target.x - d.source.x)}
                    height={Math.abs(d.target.y - d.source.y)}
                  >
                    <line
                      strokeWidth={wm.settings.link.stroke.width}
                      stroke={getScaleColor(d.sides.A.currentValue, d.sides.A.bandwidth)}
                      x1={d.lineStartA.x}
                      y1={d.lineStartA.y}
                      x2={d.lineEndA.x}
                      y2={d.lineEndA.y}
                      onMouseMove={(e) => {
                        handleLinkHover(d, 'A', e);
                      }}
                      onMouseOut={handleLinkHoverLoss}
                      onClick={() => {
                        if (d.sides.A.dashboardLink.length > 0) {
                          window.location.href = d.sides.A.dashboardLink;
                        }
                      }}
                      style={d.sides.A.dashboardLink.length > 0 ? { cursor: 'pointer' } : {}}
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
                      onMouseMove={(e) => {
                        handleLinkHover(d, 'A', e);
                      }}
                      onMouseOut={handleLinkHoverLoss}
                      onClick={() => {
                        if (d.sides.A.dashboardLink.length > 0) {
                          window.location.href = d.sides.A.dashboardLink;
                        }
                      }}
                      style={d.sides.A.dashboardLink.length > 0 ? { cursor: 'pointer' } : {}}
                    ></polygon>
                    <line
                      strokeWidth={wm.settings.link.stroke.width}
                      stroke={getScaleColor(d.sides.Z.currentValue, d.sides.Z.bandwidth)}
                      x1={d.lineStartZ.x}
                      y1={d.lineStartZ.y}
                      x2={d.lineEndZ.x}
                      y2={d.lineEndZ.y}
                      onMouseMove={(e) => {
                        handleLinkHover(d, 'Z', e);
                      }}
                      onMouseOut={handleLinkHoverLoss}
                      onClick={() => {
                        if (d.sides.Z.dashboardLink.length > 0) {
                          window.location.href = d.sides.Z.dashboardLink;
                        }
                      }}
                      style={d.sides.Z.dashboardLink.length > 0 ? { cursor: 'pointer' } : {}}
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
                      onMouseMove={(e) => {
                        handleLinkHover(d, 'Z', e);
                      }}
                      onMouseOut={handleLinkHoverLoss}
                      onClick={() => {
                        if (d.sides.Z.dashboardLink.length > 0) {
                          window.location.href = d.sides.Z.dashboardLink;
                        }
                      }}
                      style={d.sides.Z.dashboardLink.length > 0 ? { cursor: 'pointer' } : {}}
                    ></polygon>
                  </g>
                );
              })}
            </g>
            <g>
              {links.map((d, i) => {
                if (d.nodes[0].id === d.nodes[1].id) {
                  return;
                }
                const transform = getPercentPoint(d.lineStartZ, d.lineStartA, 0.5 * (d.sides.A.labelOffset / 100));
                return (
                  <g fontStyle={'italic'} transform={`translate(${transform.x},${transform.y})`} key={i}>
                    <rect
                      x={
                        -measureText(`${d.sides.A.currentText}`, wm.settings.fontSizing.link).width / 2 -
                        (wm.settings.fontSizing.link * 1.5) / 2
                      }
                      y={-wm.settings.fontSizing.link}
                      width={
                        measureText(`${d.sides.A.currentText}`, wm.settings.fontSizing.link).width +
                        wm.settings.fontSizing.link * 1.5
                      }
                      height={wm.settings.fontSizing.link * 2}
                      fill={getSolidFromAlphaColor(
                        wm.settings.link.label.background,
                        wm.settings.panel.backgroundColor
                      )}
                      stroke={getSolidFromAlphaColor(wm.settings.link.label.border, wm.settings.panel.backgroundColor)}
                      strokeWidth={2}
                      rx={(wm.settings.fontSizing.link + 8) / 2}
                    ></rect>
                    <text
                      x={0}
                      y={
                        measureText(`${d.sides.A.currentText}`, wm.settings.fontSizing.link).actualBoundingBoxAscent / 2
                      }
                      textAnchor={'middle'}
                      fontSize={`${wm.settings.fontSizing.link}px`}
                      fill={wm.settings.link.label.font}
                    >
                      {`${d.sides.A.currentText}`}
                    </text>
                  </g>
                );
              })}
            </g>
            <g>
              {links.map((d, i) => {
                if (d.nodes[0].id === d.nodes[1].id) {
                  return;
                }
                const transform = getPercentPoint(d.lineStartA, d.lineStartZ, 0.5 * (d.sides.Z.labelOffset / 100));
                return (
                  <g key={i} fontStyle={'italic'} transform={`translate(${transform.x},${transform.y})`}>
                    <rect
                      x={
                        -measureText(`${d.sides.Z.currentText}`, wm.settings.fontSizing.link).width / 2 -
                        (wm.settings.fontSizing.link * 1.5) / 2
                      }
                      y={-wm.settings.fontSizing.link}
                      width={
                        measureText(`${d.sides.Z.currentText}`, wm.settings.fontSizing.link).width +
                        wm.settings.fontSizing.link * 1.5
                      }
                      height={wm.settings.fontSizing.link * 2}
                      fill={getSolidFromAlphaColor(
                        wm.settings.link.label.background,
                        wm.settings.panel.backgroundColor
                      )}
                      stroke={getSolidFromAlphaColor(wm.settings.link.label.border, wm.settings.panel.backgroundColor)}
                      strokeWidth={2}
                      rx={(wm.settings.fontSizing.link + 8) / 2}
                    ></rect>
                    <text
                      x={0}
                      y={
                        measureText(`${d.sides.Z.currentText}`, wm.settings.fontSizing.link).actualBoundingBoxAscent / 2
                      }
                      textAnchor={'middle'}
                      fontSize={`${wm.settings.fontSizing.link}px`}
                      fill={wm.settings.link.label.font}
                    >
                      {`${d.sides.Z.currentText}`}
                    </text>
                  </g>
                );
              })}
            </g>
            <g>
              {nodes.map((d, i) => (
                <MapNode
                  key={d.id}
                  {...{
                    node: d,
                    draggedNode: draggedNode,
                    wm: wm,
                    onDrag: (e, position) => {
                      // Return early if we actually want to just pan the whole weathermap.
                      if (e.ctrlKey) {
                        return;
                      }

                      // Otherwise set our currently dragged node and manage scaling and grid settings.
                      setDraggedNode(d);
                      setNodes((prevState) =>
                        prevState.map((val, index) => {
                          if (index === i) {
                            const scaledPos = getScaledMousePos({ x: position.deltaX, y: position.deltaY });
                            val.x = Math.round(
                              wm.settings.panel.grid.enabled
                                ? wm.nodes[i].position[0] + (val.x + scaledPos.x - wm.nodes[i].position[0])
                                : val.x + scaledPos.x
                            );
                            val.y = Math.round(
                              wm.settings.panel.grid.enabled
                                ? wm.nodes[i].position[1] + (val.y + scaledPos.y - wm.nodes[i].position[1])
                                : val.y + scaledPos.y
                            );
                          }
                          return val;
                        })
                      );
                      tempNodes = nodes.slice();
                      setLinks(
                        wm.links.map((d, i) => {
                          return generateDrawnLink(d, i);
                        })
                      );
                    },
                    onStop: (e, position) => {
                      // setDraggedNode(null as unknown as DrawnNode);
                      setDraggedNode(null as unknown as DrawnNode);
                      let current: Weathermap = wm;
                      current.nodes[i].position = [
                        wm.settings.panel.grid.enabled
                          ? nearestMultiple(nodes[i].x, wm.settings.panel.grid.size)
                          : nodes[i].x,
                        wm.settings.panel.grid.enabled
                          ? nearestMultiple(nodes[i].y, wm.settings.panel.grid.size)
                          : nodes[i].y,
                      ];
                      onOptionsChange({
                        ...options,
                        weathermap: current,
                      });
                    },
                    disabled: !isEditMode,
                  }}
                />
              ))}
            </g>
          </g>
        </svg>
        <div
          className={cx(
            styles.timeText,
            css`
              color: ${theme.colors.getContrastText(
                wm.settings.panel.backgroundColor.startsWith('image')
                  ? wm.settings.panel.backgroundColor.split('|', 3)[1]
                  : wm.settings.panel.backgroundColor
              )};
            `
          )}
        >
          {timeRange.from.toLocaleString()}
        </div>
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
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
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
    timeText: css`
      position: absolute;
      bottom: 0;
      right: 0;
      color: black;
      padding: 5px 10px;
      font-size: 12px;
    `,
  };
});
