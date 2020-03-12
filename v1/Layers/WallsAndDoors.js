import React, { useContext } from 'react';

import * as S from '../SVG';

import GridContext from '../Components/Grid/Context';


export default function WallLayer () {
  return (
    <S.G id="layerWall">
      <WallDefs/>
    </S.G>
  )
}


function WallDefs () {
  const g = useContext(GridContext);

  return (
    <S.Defs>
      <S.Line id="lineWall" to={[g.square, 0]}/>

      <S.Mask id="maskArch">
        <S.Line to={[g.square, 0]} strokeWidth={g.strokeWidth} stroke="white"/>
      </S.Mask>

      <S.G id="groupArch">
        <S.Path d={`
          M 0             0 h ${g.square/4}
          m ${g.square/2} 0 h ${g.square/4}
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
