import React, {useEffect, useState, useRef} from 'react';
import { PanelProps, getColorFromHexRgbOrName } from '@grafana/data';
import { SimpleOptions, Weathermap } from 'types';
import { css, cx } from 'emotion';
import { measureText, stylesFactory, useTheme } from '@grafana/ui';
import settings from './weathermap.config.json';
import * as d3 from 'd3';
import Draggable from 'react-draggable';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = (props) => {
    // @ts-ignore
    const { options, data, width: width2, height: height2, onOptionsChange } = props;
    const theme = useTheme();
    const styles = getStyles();
    /** FIELDS */
    /** ----------------------------------------------------------------------------------- */
    // data.series
    //     .map(series => console.log(series))
        // .map(field => field?.values.get(field.values.length - 1));

    // Used to caclulate width of link text boxes.
    const averageTransitDataLength = 5;

    // Distance that the tips of arrows will be drawn from the center. (px)
    const distFromCenter = 6;

    // User defined constants.
    const width = parseInt(settings.WIDTH);
    const height = parseInt(settings.HEIGHT);
    // let backgroundColor: string = options.backgroundColor;

    useEffect(() => {
        console.log(options.backgroundColor);
        console.log(getColorFromHexRgbOrName(options.backgroundColor, theme.type))
    }, [options])

    // const setBackgroundWhite = () => {
    //     onOptionsChange({
    //         ...options,
    //         backgroundColor: "#fff"
    //     })
    // }

    /** ----------------------------------------------------------------------------------- */

    /** COLOR SCALES */
    /** ----------------------------------------------------------------------------------- */
    const colors:any = {};
    Object.keys(options.weathermap.SCALE).forEach((pct: string) => {
        colors[parseInt(pct)] = options.weathermap.SCALE[parseInt(pct)];
    });

    function getScaleColor(current: number, max: number) {
        const percent = Math.round((current / max) * 100);
        let actual: string = "";
        Object.keys(colors).forEach((amount: string) => {
            if (parseInt(amount) <= percent) {
                actual = amount;
            }
        })
        return colors[actual];
    }
    /** ----------------------------------------------------------------------------------- */

    /** LINK AND ARROW RENDERING */
    /** ----------------------------------------------------------------------------------- */
    // Find the middle point of a link.
    function getMiddlePoint(source: any, target: any, d: number) {
        const x = (source.x + target.x) / 2;
        const y = (source.y + target.y) / 2;
        const a = target.x - source.x;
        const b = target.y - source.y;
        const dist = Math.sqrt(a*a + b*b);
        const newX = x - (d*(target.x - source.x))/dist;
        const newY = y - (d*(target.y - source.y))/dist;
        return {x: newX, y: newY};
    }

    // Find the points that create the two other points of a triangle for the arrow's tip;
    function getArrowPolygon(_p1: any, _p2: any) {
        // let linkWidth = settings.LINK.DEFAULT.WIDTH; //TODO: Make arrow size actually have something to do with the link's specified width.
        let h = 5.5 * Math.sqrt(3);
        let w = 4;
        let vec1 = {x: (_p2.x - _p1.x), y: (_p2.y - _p1.y)}
        let length = Math.sqrt(vec1.x*vec1.x + vec1.y*vec1.y);
        vec1.x = vec1.x/length;
        vec1.y = vec1.y/length;
        let vec2 = {x: -vec1.y, y: vec1.x};
        let v1 = {x: _p2.x - h*vec1.x + w*vec2.x, y: _p2.y - h*vec1.y + w*vec2.y};
        let v2 = {x: _p2.x - h*vec1.x - w*vec2.x, y: _p2.y - h*vec1.y - w*vec2.y};
        return {p1: v1, p2: v2};
    }
    /** ----------------------------------------------------------------------------------- */

/** ICON AND TEXT OFFSET CALCULATIONS */
/** ----------------------------------------------------------------------------------- */
// TODO: Create functions that actually calculate width properly, for now they just assume square-ish icons.

    function getImageRectOffset(d: any, dir: string) {
        if (dir == "N") {
            return -parseInt(d.ICONHEIGHT)/2 - parseInt(settings.FONTDEFINE[2]) - 10;
        } else if (dir == "S") {
            return parseInt(d.ICONHEIGHT)/2;
        } else if (dir == "E") {
            return parseInt(d.ICONHEIGHT)/2 + 4;
        } else if (dir == "W") {
            return -parseInt(d.ICONHEIGHT)/2 - 4;
        } else {
            return 0;
        }
    }

    function getImageTextOffset(d: any, dir: string) {
        if (dir == "N") {
            return -parseInt(d.ICONHEIGHT)/2 - parseInt(settings.FONTDEFINE[2])/2;
        } else if (dir == "S") {
            return parseInt(d.ICONHEIGHT)/2 + parseInt(settings.FONTDEFINE[2]) + 4;
        } else if (dir == "E") {
            return parseInt(d.ICONHEIGHT)/2 + 4;
        } else if (dir == "W") {
            return -parseInt(d.ICONHEIGHT)/2 - 4;
        } else {
            return 0;
        }
    }

    const [links, setLinks] = useState(options.weathermap.LINKS.map((d, i) => {
        let toReturn = Object.create(d)
        toReturn.index = i;
        toReturn.source = toReturn.NODES[0].ID;
        toReturn.target = toReturn.NODES[1].ID;
        return toReturn;
    }));

    const [nodes, setNodes] = useState(options.weathermap.NODES.map((d, i) => {
        let toReturn = Object.create(d)
        toReturn.name = d.ID;
        toReturn.index = i;
        toReturn.x = parseInt(toReturn.POSITION[0]);
        toReturn.y = parseInt(toReturn.POSITION[1]);
        // toReturn.data = nodeData[0];
        return toReturn;
    }));

    function calculateRectX(d: any) {
        // This allows for NSEW offsets.
        let offset = (d.LABEL != undefined) ? -(measureText(d.LABEL, 14).width/2 + 40/2) : 0;
        if (d.LABELOFFSET == "W" ) {
            return 2*offset + getImageRectOffset(d, d.LABELOFFSET);
        } else if (d.LABELOFFSET == "E") {
            return getImageRectOffset(d, d.LABELOFFSET);
        }
        return offset;
    }

    function calculateRectY(d: any) {
        // This allows for NSEW offsets.
        if (d.ICON !== undefined && d.LABELOFFSET !== undefined && d.ICONHEIGHT !== undefined) {
            if (d.LABELOFFSET == "S" || d.LABELOFFSET == "N") {
                return getImageRectOffset(d, d.LABELOFFSET);
            }
        }
        return -16/2;
    }

    function calculateTextX(d: any) {
        let offset = (d.LABEL != undefined) ?  -(d.LABEL.length * (parseInt(settings.FONTDEFINE[2])))/2 : 0;
        if (d.ICON !== undefined && d.LABELOFFSET !== undefined && d.ICONHEIGHT !== undefined) {
            if (d.LABELOFFSET == "W" ) {
                return offset + getImageRectOffset(d, d.LABELOFFSET);
            } else if (d.LABELOFFSET == "E") {
                return -offset + getImageRectOffset(d, d.LABELOFFSET);
            }
        }
        return 0;
    }

    function calculateTextY(d: any) {
        // This allows for NSEW offsets.
        if (d.ICON !== undefined && d.LABELOFFSET !== undefined && d.ICONHEIGHT !== undefined) {
            if (d.LABELOFFSET == "S" || d.LABELOFFSET == "N") {
                return getImageTextOffset(d, d.LABELOFFSET);
            }
        }
        return parseInt(settings.FONTDEFINE[2]); 
    }


    d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => (d as any).ID).strength(0))
        
  
    function getScaleColorHeight(index: number) {
        const keys = Object.keys(colors);
        const current: number = parseInt(keys[index]);
        const next: number = keys[index+1] !== undefined ? parseInt(keys[index+1]) : 101;
        let height: number = (next - current)/100 * 200;
        return height.toString() + "px";
    }

    function nearestMultiple(i: number, j: number): number {
        return Math.ceil(i/j) * j;
    }

    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
        } else {
            setLinks(options.weathermap.LINKS.map((d, i) => {
                let toReturn = Object.create(d)
                toReturn.index = i;
                toReturn.source = toReturn.NODES[0].ID;
                toReturn.target = toReturn.NODES[1].ID;
                return toReturn;
            }))
            setNodes(options.weathermap.NODES.map((d, i) => {
                let toReturn = Object.create(d)
                toReturn.name = d.ID;
                toReturn.index = i;
                toReturn.x = parseInt(toReturn.POSITION[0]);
                toReturn.y = parseInt(toReturn.POSITION[1]);
                // toReturn.data = nodeData[0];
                return toReturn;
            }))
        }
        // console.log('simple panel updated')
    }, [props])

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
                    <span className={cx(styles.colorBox, css`background: ${colors[percent]}; height: ${getScaleColorHeight(i)}`)}></span>
                    <span className={styles.colorLabel}>
                        {
                            percent + "%" + (Object.keys(colors)[i+1] == undefined ? "" : " - " + Object.keys(colors)[i+1] + "%")
                        }
                    </span>
                </div>
            ))}
        </div>
      <svg
        className={cx(
            styles.svg,
            css`background-color: ${options.backgroundColor}`
        )}
        id="viz"
        width={width2}
        height={height2}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`0 0 ${width} ${height}`}
        shapeRendering="crispEdges"
        textRendering="geometricPrecision"
      >
          <g>
              {links.map((d, i) => (
            <g 
              className="line" 
              strokeOpacity={1}
              width={Math.abs(d.target.x - d.source.x)}
              height={Math.abs(d.target.y - d.source.y)}
              >
                <line strokeWidth={settings.LINK.DEFAULT.WIDTH + "px"}
                      stroke={getScaleColor(.75, 1.5)}
                      x1={d.source.x}
                      y1={d.source.y}
                      x2={getMiddlePoint(d.target, d.source, -distFromCenter - 4).x}
                      y2={getMiddlePoint(d.target, d.source, -distFromCenter - 4).y}
                ></line>
                <polygon
                      points={`${getMiddlePoint(d.target, d.source, -distFromCenter + 5).x} 
                      ${getMiddlePoint(d.target, d.source, -distFromCenter + 5).y} 
                      ${getArrowPolygon(d.source, getMiddlePoint(d.target, d.source, -distFromCenter + 5)).p1.x} 
                      ${getArrowPolygon(d.source, getMiddlePoint(d.target, d.source, -distFromCenter + 5)).p1.y} 
                      ${getArrowPolygon(d.source, getMiddlePoint(d.target, d.source, -distFromCenter + 5)).p2.x}
                      ${getArrowPolygon(d.source, getMiddlePoint(d.target, d.source, -distFromCenter + 5)).p2.y}
                      `}
                      fill={getScaleColor(.75, 1.5)}
                ></polygon>
                <line strokeWidth={settings.LINK.DEFAULT.WIDTH + "px"}
                      stroke={getScaleColor(.75, 1.5)}
                      x1={d.target.x}
                      y1={d.target.y}
                      x2={getMiddlePoint(d.target, d.source, distFromCenter + 4).x}
                      y2={getMiddlePoint(d.target, d.source, distFromCenter + 4).y}
                ></line>
                <polygon
                      points={`${getMiddlePoint(d.target, d.source, distFromCenter - 5).x} 
                      ${getMiddlePoint(d.target, d.source, distFromCenter - 5).y} 
                      ${getArrowPolygon(d.target, getMiddlePoint(d.target, d.source, distFromCenter - 5)).p1.x} 
                      ${getArrowPolygon(d.target, getMiddlePoint(d.target, d.source, distFromCenter - 5)).p1.y} 
                      ${getArrowPolygon(d.target, getMiddlePoint(d.target, d.source, distFromCenter - 5)).p2.x}
                      ${getArrowPolygon(d.target, getMiddlePoint(d.target, d.source, distFromCenter - 5)).p2.y}
                      `}
                      fill={getScaleColor(.75, 1.5)}
                ></polygon>
            </g>))}
          </g>
          <g>
              {nodes.map((d, i) => (
                  <Draggable position={{x: d.x, y: d.y}} onDrag={(e, position) => {
                        setNodes(prevState => prevState.map((val, index) => {
                            if(index == i) {
                                val.x = options.enableNodeGrid ? nearestMultiple(position.x, options.gridSizePx) : position.x;
                                val.y = options.enableNodeGrid ? nearestMultiple(position.y, options.gridSizePx) : position.y;
                            }
                            return val;
                        }))
                  }}
                  onStop={(e, position) => {
                    let current: Weathermap = options.weathermap;
                        current.NODES[i].POSITION = [options.enableNodeGrid ? nearestMultiple(position.x, options.gridSizePx) : position.x, options.enableNodeGrid ? nearestMultiple(position.y, options.gridSizePx) : position.y]
                        onOptionsChange({
                            ...options,
                            weathermap: current
                        })
                        console.log('dragged')
                  }}
                  
                   //TODO: Implement this fully!
                  >
                    <g  
                        display={d.LABEL != undefined ? "inline" : "none"}
                        cursor={"move"}
                        onDoubleClick={() => {console.log("double clicked")}}
                        transform={`translate(${d.x},${d.y})`}
                    >
                        {d.ICON !== undefined ?
                            <image
                                xlinkHref={d.ICON}
                                height={d.ICONHEIGHT !== undefined ? d.ICONHEIGHT : 0}
                                x={d.ICONHEIGHT !== undefined ? -parseInt(d.ICONHEIGHT)/2 : 0}
                                y={d.ICONHEIGHT !== undefined ? -parseInt(d.ICONHEIGHT)/2 : 0}
                            ></image>
                            :
                            null
                        }
                        <rect
                            x={calculateRectX(d)}
                            y={calculateRectY(d)}
                            width={(d.LABEL != undefined) ? measureText(d.LABEL, 14).width + 40 : 0}
                            height={parseInt(settings.FONTDEFINE[2]) + 16}
                            fill={"#E6E6E6"}
                            rx={15}
                            ry={20}
                        ></rect>
                        <text
                            x={calculateTextX(d)}
                            y={calculateTextY(d)}
                            textAnchor={"middle"}
                            // fontSize={settings.FONTDEFINE[2] + "px"}
                            alignmentBaseline={"central"}
                            color={"#2B2B2B"}
                            // stroke={"black"}
                            // strokeWidth={1}
                            // letterSpacing={".12em"}
                            className={styles.nodeText}
                        >
                            {(d.LABEL != undefined) ? d.LABEL : ""}
                        </text>
                    </g>
                </Draggable>
              ))}
          </g>
          <g>
              {links.map((d, i) => ( //TODO: FIX THIS!! This is doubling the links and adding the second stat card. Make sure this takes different data.
                  <g
                    fontStyle={"italic"}
                    fontWeight={"bold"}
                    transform={`translate(${(d.target.x + d.source.x)/2 - (d.target.x - d.source.x)/4},${(d.target.y + d.source.y)/2 - (d.target.y - d.source.y)/4})`}
                  >
                      <rect
                        x={-averageTransitDataLength * parseInt(settings.FONTDEFINE[2])/2}
                        y={-5}
                        width={averageTransitDataLength * (parseInt(settings.FONTDEFINE[2]))}
                        height={parseInt(settings.FONTDEFINE[2]) + 8}
                        fill={"white"}
                        stroke={"black"}
                        strokeWidth={1}
                        rx={4}
                      ></rect>
                      <text
                        x={0}
                        y={parseInt(settings.FONTDEFINE[2]) - 2}
                        textAnchor={"middle"}
                        fontSize={settings.FONTDEFINE[2] + "px"}
                        letterSpacing={".12em"}
                      >
                          1.5M
                      </text>
                  </g>
              ))}
          </g>
          <g>
              {links.map((d, i) => (
                  <g
                    fontStyle={"italic"}
                    fontWeight={"bold"}
                    transform={`translate(${(d.target.x + d.source.x)/2 + (d.target.x - d.source.x)/4},${(d.target.y + d.source.y)/2 + (d.target.y - d.source.y)/4})`}
                  >
                      <rect
                        x={-averageTransitDataLength * parseInt(settings.FONTDEFINE[2])/2}
                        y={-5}
                        width={averageTransitDataLength * (parseInt(settings.FONTDEFINE[2]))}
                        height={parseInt(settings.FONTDEFINE[2]) + 8}
                        fill={"white"}
                        stroke={"black"}
                        strokeWidth={1}
                        rx={4}
                      ></rect>
                      <text
                        x={0}
                        y={parseInt(settings.FONTDEFINE[2]) - 2}
                        textAnchor={"middle"}
                        fontSize={settings.FONTDEFINE[2] + "px"}
                        letterSpacing={".12em"}
                      >
                          1.5M
                      </text>
                  </g>
              ))}
          </g>
      </svg>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
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
        -webkit-user-select:none;
        -khtml-user-select:none;
        -moz-user-select:none;
        -ms-user-select:none;
        -o-user-select:none;
        user-select:none;
    `
  };
});
