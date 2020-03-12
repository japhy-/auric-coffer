import React, { useContext } from 'react';

import GridContext from '../Components/Grid/Context';

import * as S from '../SVG';


export default function MouseLayer ({target}) {
  return (
    <S.G id="layerMouse">
      <MouseTargetDefs/>
      <MouseTarget target={target}/>
    </S.G>
  )
}


function MouseTargetDefs () {
  const g = useContext(GridContext);

  return (
    <S.Defs>
      <S.Circle id="circleCorner" r={g.tolerance}/>
      <S.Rect id="squareCell" size={[g.square - g.tolerance, g.square - g.tolerance]} r={g.tolerance}/>
    </S.Defs>
  )
}


function MouseTarget ({target: t}) {
  const g = useContext(GridContext);
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