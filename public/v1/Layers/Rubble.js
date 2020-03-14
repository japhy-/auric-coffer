import React, { useContext } from 'react';

import * as S from '../SVG';

export default function RubbleLayer () {
  const g = useContext(GridContext);

  return (
    <S.G>
      <RubbleDefs/>

      <S.Rect id="layerRubble" size={[g.cols*g.square + 2*g.strokeWidth, g.rows*g.square + 2*g.strokeWidth]} at={[-g.strokeWidth, -g.strokeWidth]} mask="#maskRubble"/>
    </S.G>
  )
}

function RubbleDefs () {
  const g = useContext(GridContext);

  return (
    <S.Defs>
      <S.Pattern id="patternRubble" size={[g.square, 2*g.strokeWidth]} transform="rotate(45)">
        <S.Line to={[g.square,0]} stroke="gray" strokeWidth={g.strokeWidth}/>
      </S.Pattern>

      <S.G id="maskRubble"/>

      <S.Rect id="rectRubbleV" size={[g.strokeWidth*2, g.square]} fill="white"/>
      <S.Rect id="rectRubbleH" size={[g.square, g.strokeWidth*2]} fill="white"/>
    </S.Defs>
  )
}
