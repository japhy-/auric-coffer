import React, { useState } from 'react';
import useNextId, { setPrefix } from '../Counter';
import * as S from './SVG';


function SVGrid (params) {
  setPrefix('SVGrid');
  const svg = useNextId();
  const glr = useNextId();
  const glc = useNextId();

  const defs = [];
  defs.push(<S.Line id={glr} key={glr} from={[0,0]} to={[params.cols*params.colWidth,0]} {...params.rowStyle}/>);
  defs.push(<S.Line id={glc} key={glc} from={[0,0]} to={[0,params.rows*params.rowHeight]} {...params.colStyle}/>);
  
  const gridlines = [];
  for (let i = 0; i <= params.rows; i++) gridlines.push(<S.Use href={`#${glr}`} key={`${glr}-n${i}`} at={[0,i*params.colWidth]}/>)
  for (let i = 0; i <= params.cols; i++) gridlines.push(<S.Use href={`#${glc}`} key={`${glc}-n${i}`} at={[i*params.rowHeight,0]}/>)
  
  const headers = [];
  if (params.rowHeader) for (let i = 0; i < params.rows; i++) headers.push(<S.Text key={`${glr}-h${i}`} fontFamily="garamond" textAnchor="middle" at={[0.5 * -params.colWidth, (0.6 + i) * params.rowHeight]}>{params.rowStart + i}</S.Text>);
  if (params.colHeader) for (let i = 0; i < params.cols; i++) headers.push(<S.Text key={`${glc}-h${i}`} fontFamily="garamond" textAnchor="middle" at={[(0.5 + i) * params.colWidth, 0.4 * -params.rowHeight]}>{params.colStart + i}</S.Text>);

  const spacer = { row: 3 * params.rowStyle.strokeWidth, col: 3 * params.colStyle.strokeWidth };

  const attrs = {
    width: params.width,
    height: params.height,
    viewBox: [-spacer.col, -spacer.row, params.cols*params.colWidth + 2*spacer.col, params.rows*params.rowHeight + 2*spacer.row]
  };

  if (params.rowHeader) {
    attrs.viewBox[0] -= params.colWidth;
    attrs.viewBox[2] += params.colWidth;
  }

  if (params.colHeader) {
    attrs.viewBox[1] -= params.rowHeight;
    attrs.viewBox[3] += params.rowHeight;
  }

  attrs.onMouseOut = ev => {
    ev.preventDefault();
    const n = ev.nativeEvent;

    const elFrom = n.fromElement;
    const elTo = n.toElement;
    const contains = document.getElementById(svg).contains(elTo);

    if (!contains) { 
      setMouse({...mouse, x: null, y: null});
    }
  };

  attrs.onMouseMove = ev => {
    ev.preventDefault();
    const n = ev.nativeEvent;
    setMouse({...mouse, x: n.offsetX, y: n.offsetY});
  };

  const rx = attrs.viewBox[2] / params.width;
  const ry = attrs.viewBox[3] / params.height;

  const xyToGrid = ({x, y}) => {
    return (x !== null && y !== null) ? { gx: x * rx + attrs.viewBox[0], gy: y * ry + attrs.viewBox[1] } : { gx: null, gy: null };
  }

  const xyToCell = ({x, y}) => {
    const cell = { row: null, col: null };
  
    if (x !== null && y !== null) {
      const { gx, gy } = xyToGrid({x, y});
      const col = Math.floor(gx / params.colWidth);
      const row = Math.floor(gy / params.rowHeight);
      
      if (col >= 0 && col < params.cols && row >= 0 && row < params.rows) {
        cell.col = col + params.colStart;
        cell.row = row + params.rowStart;
      }
    }
  
    return cell;
  }

  const proximateTo = ({x, y, row, col, tolerance}) => {
    const near = [];
    const { gx, gy } = xyToGrid({x, y});
    
    if (row !== null && col !== null) {
      near.push(
        <S.Rect key="proximate-cell" at={[(col-params.colStart)*params.colWidth,(row-params.rowStart)*params.rowHeight]} size={[params.colWidth, params.rowHeight]} stroke="black" strokeWidth={2} fill="silver" opacity="0.25"/>
      );

      const fx = gx % params.colWidth;
      const fy = gy % params.rowHeight;

      const on_x = (fy >= (params.rowHeight - tolerance) || fy < tolerance);
      const on_y = (fx >= (params.colWidth - tolerance) || fx < tolerance);
    
      // square quadrant
      if (fx < params.colWidth/2 && fy < params.rowHeight/2) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        near.push(
          <S.Rect key="proximate-tl" at={[params.colWidth*c, params.rowHeight*r]} size={[params.colWidth/2, params.rowHeight/2]} fill="yellow" opacity="0.25"/>
        )
      }
      else if (fx > params.colWidth/2 && fy < params.rowHeight/2) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        near.push(
          <S.Rect key="proximate-tr" at={[params.colWidth*(c-0.5), params.rowHeight*r]} size={[params.colWidth/2, params.rowHeight/2]} fill="red" opacity="0.25"/>
        )
      }
      else if (fx < params.colWidth/2 && fy > params.rowHeight/2) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        near.push(
          <S.Rect key="proximate-bl" at={[params.colWidth*c, params.rowHeight*(r-0.5)]} size={[params.colWidth/2, params.rowHeight/2]} fill="orange" opacity="0.25"/>
        )
      }
      else if (fx > params.colWidth/2 && fy > params.rowHeight/2) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        near.push(
          <S.Rect key="proximate-br" at={[params.colWidth*(c-0.5), params.rowHeight*(r-0.5)]} size={[params.colWidth/2, params.rowHeight/2]} fill="magenta" opacity="0.25"/>
        )
      }

      // square half (top/bottom)
      if (fy < params.rowHeight/2) {
        const c = Math.floor(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        near.push(
          <S.Rect key="proximate-tb" at={[params.colWidth*c, params.rowHeight*r]} size={[params.colWidth, params.rowHeight/2]} fill="teal" opacity="0.25"/>
        )
      }
      else if (fy > params.rowHeight/2) {
        const c = Math.floor(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        near.push(
          <S.Rect key="proximate-tb" at={[params.colWidth*c, params.rowHeight*(r-0.5)]} size={[params.colWidth, params.rowHeight/2]} fill="teal" opacity="0.25"/>
        )
      }

      // square half (left/right)
      if (fx < params.colWidth/2) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.floor(gy / params.rowHeight);
        near.push(
          <S.Rect key="proximate-lr" at={[params.colWidth*c, params.rowHeight*r]} size={[params.colWidth/2, params.rowHeight]} fill="brown" opacity="0.25"/>
        )
      }
      else if (fx > params.colWidth/2) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.floor(gy / params.rowHeight);
        near.push(
          <S.Rect key="proximate-lr" at={[params.colWidth*(c-0.5), params.rowHeight*r]} size={[params.colWidth/2, params.rowHeight]} fill="brown" opacity="0.25"/>
        )
      }

      // near row line
      if (on_x) {
        const c = Math.floor(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        near.push(
          <S.Line key="proximate-x" from={[params.colWidth*c, params.rowHeight*r]} to={[params.colWidth*(c+1), params.rowHeight*r]} stroke="blue" strokeWidth={2}/>
        )
      }

      // near column line
      if (on_y) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.floor(gy / params.rowHeight);
        near.push(
          <S.Line key="proximate-y" from={[params.colWidth*c, params.rowHeight*r]} to={[params.colWidth*c, params.rowHeight*(r+1)]} stroke="purple" strokeWidth={2}/>
        )
      }

      // near intersection
      if (on_x && on_y) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        near.push(
          <S.Circle key="proximate-xy" at={[params.colWidth*c, params.rowHeight*r]} r={tolerance} stroke="red" strokeWidth={2} fill="transparent"/>
        )
      }
    }

    return near;
  }

  const [ mouse, setMouse ] = useState({x: null, y: null});
  const { gx, gy } = xyToGrid({x: mouse.x, y: mouse.y });
  const { row, col } = xyToCell({x: mouse.x, y: mouse.y});
  const proximity = proximateTo({x: mouse.x, y: mouse.y, row, col, tolerance: (params.rowHeight + params.colWidth)/8});

  return (
    <div>
      <S.SVG id={svg} {...attrs}>
        <S.Defs>{defs}</S.Defs>
        <S.G>
          {gridlines}
          {headers}
          {proximity}
        </S.G>
      </S.SVG>
      <div>(x, y) = ({mouse.x}, {mouse.y})<br/>(gx, gy) = ({gx}, {gy})<br/>(col, row) = ({col}, {row})</div>

    </div>
  )
}


export default SVGrid;