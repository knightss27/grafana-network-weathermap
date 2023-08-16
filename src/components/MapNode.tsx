import React, { useMemo } from 'react';
import { DrawnNode, Weathermap } from '../types';
import {
  nearestMultiple,
  measureText,
  getSolidFromAlphaColor,
  calculateRectangleAutoWidth,
  calculateRectangleAutoHeight,
  getDataFrameName,
} from '../utils';
import { css } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { PanelData } from '@grafana/data';

interface NodeProps {
  node: DrawnNode;
  draggedNode: DrawnNode;
  selectedNodes: DrawnNode[];
  wm: Weathermap;
  onDrag: DraggableEventHandler;
  onStop: DraggableEventHandler;
  onClick: React.MouseEventHandler<SVGGElement>;
  disabled: boolean;
  data: PanelData;
}

// Calculate the middle of the rectangle for text centering
function calculateTextY(d: DrawnNode) {
  return d.nodeIcon?.drawInside ? d.nodeIcon.size.height / 2 + d.nodeIcon.padding.vertical : 0;
}

// Find where to draw the rectangle for the node (top left x)
function calculateRectX(d: DrawnNode, wm: Weathermap) {
  const offset = Math.min(
    -calculateRectangleAutoWidth(d, wm) / 2,
    d.label !== undefined ? -(measureText(d.label, wm.settings.fontSizing.node).width / 2 + d.padding.horizontal) : 0
  );
  return offset;
}

// Find where to draw the rectangle for the node (top left y)
function calculateRectY(d: DrawnNode, wm: Weathermap) {
  return -calculateRectangleAutoHeight(d, wm) / 2;
}

const MapNode: React.FC<NodeProps> = (props: NodeProps) => {
  const { node, draggedNode, selectedNodes, wm, onDrag, onStop, onClick, disabled, data } = props;
  const styles = getStyles();

  const rectX = useMemo(() => calculateRectX(node, wm), [node, wm]);
  const rectY = useMemo(() => calculateRectY(node, wm), [node, wm]);
  const rectWidth = useMemo(() => calculateRectangleAutoWidth(node, wm), [node, wm]);
  const rectHeight = useMemo(() => calculateRectangleAutoHeight(node, wm), [node, wm]);
  const textY = useMemo(() => calculateTextY(node), [node]);

  let nodeIsDown = false;
  if (node.statusQuery) {
    let recentFrame = data.series
      .filter((series) => getDataFrameName(series, data.series) === node.statusQuery)
      .map((frame) => frame.fields[1].values.get(frame.fields[1].values.length - 1));

    // Check if the node is down (data returns 0 or below, or doesn't exist)
    nodeIsDown = recentFrame.length === 0 || (recentFrame.length > 0 && recentFrame[0] < 1);
  }

  // Check if this node is selected for dragging
  let nodeIsSelected = selectedNodes.find((n) => n.index === node.index);

  return (
    <DraggableCore disabled={disabled} onDrag={onDrag} onStop={onStop}>
      <g
        cursor={disabled ? (node.dashboardLink ? 'pointer' : '') : 'move'}
        display={node.label !== undefined ? 'inline' : 'none'}
        onClick={onClick}
        transform={`translate(${
          wm.settings.panel.grid.enabled &&
          draggedNode &&
          (draggedNode.index === node.index || selectedNodes.find((n) => n.index === node.index))
            ? nearestMultiple(node.x, wm.settings.panel.grid.size)
            : node.x
        },
                    ${
                      wm.settings.panel.grid.enabled &&
                      draggedNode &&
                      (draggedNode.index === node.index || selectedNodes.find((n) => n.index === node.index))
                        ? nearestMultiple(node.y, wm.settings.panel.grid.size)
                        : node.y
                    })`}
      >
        {node.label !== '' || node.nodeIcon?.drawInside ? (
          <React.Fragment>
            <rect
              x={rectX}
              y={rectY}
              width={rectWidth}
              height={rectHeight}
              fill={
                node.isConnection
                  ? 'transparent'
                  : getSolidFromAlphaColor(node.colors.background, wm.settings.panel.backgroundColor)
              }
              stroke={
                nodeIsSelected
                  ? getSolidFromAlphaColor(node.colors.font, wm.settings.panel.backgroundColor)
                  : node.isConnection
                  ? disabled
                    ? 'transparent'
                    : getSolidFromAlphaColor(node.colors.background, wm.settings.panel.backgroundColor)
                  : getSolidFromAlphaColor(
                      nodeIsDown ? node.colors.statusDown : node.colors.border,
                      wm.settings.panel.backgroundColor
                    )
              }
              strokeWidth={node.isConnection ? 2 : 4}
              rx={6}
              ry={7}
              style={{ paintOrder: 'stroke' }}
            ></rect>
            <text
              x={0}
              y={textY}
              textAnchor={'middle'}
              alignmentBaseline={'central'}
              dominantBaseline={'central'}
              fill={node.colors.font}
              className={styles.nodeText}
              fontSize={node.isConnection ? '6px' : `${wm.settings.fontSizing.node}px`}
            >
              {node.label !== undefined && !(node.isConnection && disabled) ? node.label : ''}
            </text>
          </React.Fragment>
        ) : (
          ''
        )}
        {node.nodeIcon && node.nodeIcon.src !== '' ? (
          <image
            x={-node.nodeIcon.size.width / 2}
            y={
              node.nodeIcon.drawInside
                ? node.label!.length > 0
                  ? -(
                      node.nodeIcon.size.height +
                      node.nodeIcon.padding.vertical +
                      measureText(node.label!, wm.settings.fontSizing.node).actualBoundingBoxAscent
                    ) / 2
                  : -node.nodeIcon.size.height / 2
                : node.label!.length > 0
                ? textY - node.nodeIcon.size.height - rectHeight / 2 - 1 - node.nodeIcon.padding.vertical
                : -node.nodeIcon.size.height / 2
            }
            width={node.nodeIcon.size.width}
            height={node.nodeIcon.size.height}
            href={node.nodeIcon.src}
          />
        ) : (
          ''
        )}
      </g>
    </DraggableCore>
  );
};

const getStyles = stylesFactory(() => {
  return {
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

export default MapNode;
