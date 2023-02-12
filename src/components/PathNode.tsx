import React from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { PathNode } from 'types';

interface PathNodeRendererProps {
  node: PathNode;
  onDrag: DraggableEventHandler;
  onStop: DraggableEventHandler;
  index: number;
}

const PathNodeRenderer: React.FC<PathNodeRendererProps> = (props: PathNodeRendererProps) => {
  const { node, onDrag, index } = props;

  return (
    <DraggableCore onDrag={onDrag}>
      <g transform={`translate(${node.position.x}, ${node.position.y})`} cursor={'move'}>
        <rect
          width={20}
          height={10}
          fill={'transparent'}
          stroke={'#ffffff'}
          strokeWidth={1}
          rx={6}
          ry={7}
          x={-10}
          y={-5}
        ></rect>
        <text x={-5} y={5}>
          {'P' + index}
        </text>
      </g>
    </DraggableCore>
  );
};

export default PathNodeRenderer;
