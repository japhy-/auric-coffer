import React, { useContext } from 'react';
import * as S from '../../SVG';
import { GridContext, MouseContext } from '../AppWindow';


function GridLayer (props) {
  return (    
    <S.G id="layerGrid">
      <S.Defs>
        <GridLineDef type="H"/>
        <GridLineDef type="V"/>
      </S.Defs>

      <GridLines/>
    </S.G>
  );
}


function GridLineDef ({type}) {
  const { g } = useContext(GridContext);
  
  return (
    <S.Line id={`grid${type}`} to={type === 'H' ? [g.square*g.cols,0] : [0,g.square*g.rows]} strokeDasharray="1 3" strokeWidth="1" stroke="gray"/>
  )
}


function GridLines (props) {
  const { g } = useContext(GridContext);
  const lines = [];

  for (let y = 0; y <= g.rows; y++) {
    lines.push(<S.Use href="#gridH" at={[0,g.square*y]} key={`gridH${y}`}/>);
    if (y < g.rows) lines.push(<S.Text key={`gridHN${y}`} fontFamily="garamond" textAnchor="middle" at={[0.5 * -g.square, (0.6 + y) * g.square]}>{y}</S.Text>);
  }  
  for (let x = 0; x <= g.cols; x++) {
    lines.push(<S.Use href="#gridV" at={[g.square*x,0]} key={`gridV${x}`}/>);
    if (x < g.cols) lines.push(<S.Text key={`gridVN${x}`} fontFamily="garamond" textAnchor="middle" at={[(0.5 + x) * g.square, 0.4 * -g.square]}>{x}</S.Text>);
  }  

  return (
    <>
      {lines}
    </>
  );
}


function WallLayer ({walls}) {
  const { g } = useContext(GridContext);

  return (
    <S.G id="layerWall">
      <WallDefs rubble={Object.values(walls).filter((v) => v.type === 'rubble').map((v) => v.object)}/>
      <S.Rect id="layerRubble" size={[g.square * g.cols,g.square * g.rows]} fill="url(#patternRubble)" mask="url(#maskRubble)"/>
      {Object.values(walls).filter((v) => v && v.type !== 'rubble').map((v) => v.object)}
    </S.G>
  )
}


function WallDefs ({rubble}) {
  const { g } = useContext(GridContext);

  return (
    <S.Defs>
      <S.Line id="lineWall" to={[g.square+g.strokeWidth, 0]} transform={`translate(-${g.strokeWidth/2},0)`}/>

      <S.Pattern id="patternRubble" patternUnits="userSpaceOnUse" size={[g.square,g.strokeWidth*2]} patternTransform={`rotate(45,${g.square/2},${g.strokeWidth})`}>
        <S.Line to={[g.square, 0]} stroke="gray" strokeWidth={g.strokeWidth}/>
      </S.Pattern>

      <S.Mask id="maskRubble">
        {rubble}
      </S.Mask>

      <S.G id="groupRubble">
        <S.Rect size={[g.square,g.strokeWidth*2]} transform={`translate(0,-${g.strokeWidth})`} strokeWidth="0" fill="white"/>
      </S.G>

      <S.Mask id="maskArch">
        <S.Line to={[g.square, 0]} strokeWidth={g.strokeWidth} stroke="white"/>
      </S.Mask>

      <S.G id="groupArch">
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

      <S.G id="groupDoor">
        <S.Use href="#lineWall" strokeWidth={g.strokeWidth}/>
        <S.Rect size={[g.square/2, g.square/4]} at={[g.square/4, -g.square/8]} strokeWidth={g.strokeWidth/2} fill="white"/>
      </S.G>

      <S.G id="groupDoorSecret">
        <S.Use href="#lineWall" strokeWidth={g.strokeWidth}/>
        <S.Text fontFamily="verdana" fontSize={g.square/2} textAnchor="middle" transform={`translate(${g.square/2}, ${g.square/5.5})`}>S</S.Text>
      </S.G>

      <S.G id="groupDoorBlocked">
        <S.Use href="#groupDoor"/>
        <S.Path d={`
          M ${g.square/4} -${g.square/8} L ${3*g.square/4}  ${g.square/8}
          M ${g.square/4}  ${g.square/8} L ${3*g.square/4} -${g.square/8}
        `} strokeWidth={g.strokeWidth/2}/>
      </S.G>

      <S.G id="groupDoorHalf">
        <S.Rect size={[g.square/2, g.square/8]} at={[g.square/4, -g.square/7]} strokeWidth={g.strokeWidth/2} fill="white"/>
        <S.Use href="#lineWall" strokeWidth={g.strokeWidth}/>
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
      <S.Circle id="circleCorner" r={g.tolerance}/>
      <S.Rect id="squareCell" size={[g.square - g.tolerance, g.square - g.tolerance]} r={g.tolerance}/>
    </S.Defs>
  )
}


function MouseTarget () {
  const { g } = useContext(GridContext);
  const { target: t } = useContext(MouseContext);
  if (! t) return null;

  const props = { stroke: 'red', opacity: 0.5, strokeDasharray: [3,1], fill: 'transparent' };

  if (t.type === 'horizontal' || t.type === 'vertical') {
    if (t.type === 'vertical') props.transform = `rotate(90, ${t.x}, ${t.y})`;
    return <S.Use
      href="#lineWall"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth, stroke: 'black', ...props}}
    />
  }

  else if (t.type === 'corner') {
    return <S.Use
      href="#circleCorner"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth/2, fill: 'transparent', stroke: 'black', ...props}}
    />
  }

  else if (t.type === 'square') {
    return <S.Use
      href="#squareCell"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth/2, fill: 'transparent', stroke: 'black', ...props}}
    />
  }

  else return null;
}


export { GridLayer, WallLayer, MouseLayer };