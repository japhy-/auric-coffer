import React, { useContext } from 'react';

import GridContext from './Context';
import * as S from '../../SVG';


export default function GridLayer (props) {
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
  const g = useContext(GridContext);

  return (
    <S.Line id={`grid${type}`} to={type === 'H' ? [g.square*g.cols,0] : [0,g.square*g.rows]} strokeDasharray="1 3" strokeWidth="1" stroke="gray"/>
  )
}


function GridLines (props) {
  const g = useContext(GridContext);
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
    <>{lines}</>
  );
}  

