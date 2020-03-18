import React, { useContext } from 'react';
import * as S from '../../SVG';
import { GridContext, MouseContext, ObjectsContext, EventsContext } from '../GridEditor';
import { GridObject } from '../Grid';


function GridLayer (props) {
  return (    
    <S.G id="layerGrid">
      <GridLines/>
    </S.G>
  );
}


function GridLines () {
  const { g } = useContext(GridContext);
  const lines = [];

  for (let y = 0; y <= g.rows; y++) {
    lines.push(<S.Line key={`gridH${y}`} from={[0,g.square*y]} to={[g.square*g.cols,g.square*y]} strokeDasharray="1 3" strokeWidth="1" stroke="gray"/>)
    if (y < g.rows) lines.push(<S.Text key={`gridHN${y}`} fontFamily="garamond" textAnchor="middle" at={[0.5 * -g.square, (0.6 + y) * g.square]}>{y}</S.Text>);
  }  
  for (let x = 0; x <= g.cols; x++) {
    lines.push(<S.Line key={`gridV${x}`} from={[g.square*x,0]} to={[g.square*x,g.square*g.rows]} strokeDasharray="1 3" strokeWidth="1" stroke="gray"/>)
    if (x < g.cols) lines.push(<S.Text key={`gridVN${x}`} fontFamily="garamond" textAnchor="middle" at={[(0.5 + x) * g.square, 0.4 * -g.square]}>{x}</S.Text>);
  }  

  return (
    lines
  );
}


function WallLayer () {
  const { g } = useContext(GridContext);

  return (
    <S.G id="layerWall">
      <WallDefs/>
      <S.Rect id="layerRubble" size={[g.square * g.cols + g.tolerance,g.square * g.rows + g.tolerance]} at={[-g.tolerance/2, -g.tolerance/2]} fill="url(#patternRubble)" mask="url(#maskRubble)"/>
      <RubbleObjects/>
      <WallObjects/>
    </S.G>
  )
}


function RubbleObjects () {
  const { g } = useContext(GridContext);
  const { objects } = useContext(ObjectsContext);

  return (
    <>
      {Object.values(objects).filter((v) => v && v.attr.type === 'rubble' && v.attr.col < g.cols && v.attr.row < g.rows).map((v) => v.object)}
    </>
  )  
}


function WallObjects () {
  const { g } = useContext(GridContext);
  const { objects } = useContext(ObjectsContext);

  return (
    <>
      {Object.values(objects).filter((v) => v && v.attr.type !== 'rubble' && v.attr.col < g.cols && v.attr.row < g.rows).map((v) => v.object)}
    </>
  )  
}


function WallDefs ({rubble}) {
  const { g } = useContext(GridContext);
  const { objects } = useContext(ObjectsContext);

  return (
    <S.Defs>
      <S.Line id="object-wall" to={[g.square+g.strokeWidth, 0]} strokeWidth={g.strokeWidth} transform={`translate(-${g.strokeWidth/2},0)`}/>

      <S.Pattern id="patternRubble" patternUnits="userSpaceOnUse" size={[g.square,g.strokeWidth*2]} patternTransform={`rotate(45,${g.square/2},${g.strokeWidth})`}>
        <S.Line to={[g.square, 0]} stroke="black" strokeWidth={g.strokeWidth}/>
      </S.Pattern>

      <S.Mask id="maskRubble">
        {Object.values(objects).filter((v) => v.attr.type === 'rubble' && v.attr.col < g.cols && v.attr.row < g.rows).map((v) => v.object)}
      </S.Mask>

      <S.G id="object-rubble">
        <S.Rect size={[g.square,g.strokeWidth*2]} transform={`translate(0,-${g.strokeWidth})`} strokeWidth="0" fill="white" opacity="0.5"/>
      </S.G>

      <S.G id="object-arch">
        <S.Path d={`
          M ${-g.strokeWidth/2} 0 h ${g.square/4+g.strokeWidth/2}
          m ${g.square/2}       0 h ${g.square/4+g.strokeWidth/2}
        `} strokeWidth={g.strokeWidth}/>
        <S.Path d={`
          M ${g.square/4} 0
          A ${g.square/4} ${g.square/4} 0 0 1 ${3*g.square/4} 0
          v ${g.square/6}
          h -${g.square/8}
          v -${g.square/6}
          A ${g.square/8} ${g.square/8} 0 0 0 ${3*g.square/8} 0
          v ${g.square/6}
          h -${g.square/8}
          z
        `} strokeWidth={g.strokeWidth/2} fill="white"/>
      </S.G>

      <S.G id="object-door">
        <S.Use href="#object-wall" strokeWidth={g.strokeWidth}/>
        <S.Rect size={[g.square/2, g.square/4]} at={[g.square/4, -g.square/8]} strokeWidth={g.strokeWidth/2} fill="white"/>
      </S.G>

      <S.ClipPath id="path-s">
        <S.Rect at={[-g.square*0.15,-g.square*0.4]} size={[g.square*0.3,g.square*0.45]}/>
      </S.ClipPath>

      <S.G id="object-doorSecret">
        <S.Use href="#object-wall" strokeWidth={g.strokeWidth}/>
        <S.Text fontFamily="verdana" clipPath="url(#path-s)" fontSize={g.square/2} textAnchor="middle" transform={`translate(${g.square/2}, ${g.square/5.5})`}>S</S.Text>
      </S.G>

      <S.G id="object-doorBlocked">
        <S.Use href="#object-door"/>
        <S.Path d={`
          M ${g.square/4} -${g.square/8} L ${3*g.square/4}  ${g.square/8}
          M ${g.square/4}  ${g.square/8} L ${3*g.square/4} -${g.square/8}
        `} strokeWidth={g.strokeWidth/2}/>
      </S.G>

      <S.G id="object-doorHalf">
        <S.Rect size={[g.square/2, g.square/8]} at={[g.square/4, -g.square/7]} strokeWidth={g.strokeWidth/2} fill="white"/>
        <S.Use href="#object-wall" strokeWidth={g.strokeWidth}/>
      </S.G>

      <S.G id="object-doorNE">
        <S.Rect size={[g.square/2, g.square/8]} at={[g.square/4, -g.square/7]} strokeWidth={g.strokeWidth/2} fill="white"/>
        <S.Use href="#object-wall" strokeWidth={g.strokeWidth}/>
      </S.G>

      <S.G id="object-doorSW">
        <S.Use href="#object-doorNE" transform={`rotate(180, ${g.square/2}, 0)`}/>
      </S.G>
    </S.Defs>
  )
}


function MouseLayer () {
  return (
    <S.G id="layerMouse">
      <MouseTargetDefs/>
      <MouseTarget/>
    </S.G>
  )
}


function MouseTargetDefs () {
  const { g } = useContext(GridContext);

  return (
    <S.Defs>
      <S.Circle id="object-corner" r={g.tolerance}/>
      <S.Rect id="object-cell" size={[g.square - g.tolerance, g.square - g.tolerance]} r={g.tolerance} at={[g.tolerance/2,g.tolerance/2]} />
    </S.Defs>
  )
}


function MouseTarget () {
  const { g } = useContext(GridContext);
  const { target: t } = useContext(MouseContext);
  const { objects } = useContext(ObjectsContext);

  if (! t) return null;

  const props = { stroke: 'red', strokeDasharray: [3,1], fill: 'transparent' };
  const loc = `${t.col},${t.row},${t.where}`;
  const existing = objects[loc];

  if (existing) {
    // console.log("an object already exists here");
    return null;
  }

  else if (t.where === 'L' || t.where === 'T') {
    return <GridObject type="wall" {...t} {...props}/>
  }

  else if (t.where === 'C') {
    return <S.Use
      href="#object-cell"
      at={[t.col*g.square, t.row*g.square]}
      {...{strokeWidth: g.strokeWidth/2, fill: 'transparent', stroke: 'black', ...props}}
    />
  }

  else return null;
}


function EventLayer () {
  return (
    <S.G id="layerEvent">
      <EventDefs/>
      <Events/>
    </S.G>
  )
}


function EventDefs () {
  return (
    <S.Defs>
    </S.Defs>
  )
}


function Events () {
  const { g } = useContext(GridContext);
  const events = useContext(EventsContext);

  return (
    <>
    {Object.values(events.items).map((v) => v.object)}
    </>
  )
}


export { GridLayer, WallLayer, MouseLayer, EventLayer };