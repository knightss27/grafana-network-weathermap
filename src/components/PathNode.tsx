import React from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { PathNode } from 'types';

interface PathNodeRendererProps {
    node: PathNode;
    onDrag: DraggableEventHandler;
    onStop: DraggableEventHandler;
}

const PathNodeRenderer: React.FC<PathNodeRendererProps> = (props: PathNodeRendererProps) => {
    const { node } = props;
    

    return (
        <DraggableCore>
            <g
                transform={`translate(${
                    node.position.x
                }, ${
                    node.position.y
                })`}
            >
                <rect
                    width={20}
                    height={10}
                    fill={'transparent'}
                    stroke={'#ffffff'}
                    strokeWidth={2}
                ></rect>
            </g>
        </DraggableCore>
    )
}

export default PathNodeRenderer;