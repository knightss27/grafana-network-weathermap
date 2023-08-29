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
  const { node, onDrag, onStop, index } = props;

  return (
    <DraggableCore onDrag={onDrag} onStop={onStop}>
      <g transform={`translate(${node.position.x}, ${node.position.y})`} cursor={'move'}>
        <rect
          width={30}
          height={20}
          fill={'transparent'}
          stroke={'#ffffff'}
          strokeWidth={1}
          rx={6}
          ry={7}
          x={-15}
          y={-10}
        ></rect>
        <text x={-5} y={5}>
          {/* {'P' + index} */}
        </text>
      </g>
    </DraggableCore>
  );
};

export default PathNodeRenderer;
