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
    const cell = { row: null, col: null, oob: true };
  
    if (x !== null && y !== null) {
      const { gx, gy } = xyToGrid({x, y});
      const col = Math.floor(gx / params.colWidth);
      const row = Math.floor(gy / params.rowHeight);
      
      cell.col = col + params.colStart;
      cell.row = row + params.rowStart;

      if (col >= 0 && col < params.cols && row >= 0 && row < params.rows) {
        cell.oob = false;
      }
    }
  
    return cell;
  }

  const proximateTo = ({x, y, row, col, tolerance}) => {
    const prox = {};
    const near = [];
    const { gx, gy } = xyToGrid({x, y});
    
    if (gx !== null && gy !== null) {
      const fx = gx % params.colWidth;
      const fy = gy % params.rowHeight;

      const on_x = (fy >= (params.rowHeight - tolerance) || fy < tolerance);
      const on_y = (fx >= (params.colWidth - tolerance) || fx < tolerance);

      if (!oob) {
        const c = Math.floor(gx / params.colWidth);
        const r = Math.floor(gy / params.rowHeight);

        prox.cell = { col: c, row: r };
        near.push(
          <S.Rect key="proximate-cell" at={[c*params.colWidth,r*params.rowHeight]} size={[params.colWidth, params.rowHeight]} stroke="black" strokeWidth={2} fill="silver" opacity="0.25"/>
        );

        const tri = { L: fx, T: fy, R: params.colWidth-fx, B: params.rowHeight-fy };

        if (tri.L < tri.T && tri.L < tri.R && tri.L < tri.B) {
          prox.tri = 'L';
          near.push(
            <S.Path key="proximate-tri" d={`M ${params.colWidth*c} ${params.rowHeight*r} l ${params.colWidth/2} ${params.rowHeight/2} l ${-params.colWidth/2} ${params.rowHeight/2} Z`} fill="cyan"/>
          )  
        }  
        else if (tri.T < tri.R && tri.T < tri.B) {
          prox.tri = 'T';
          near.push(
            <S.Path key="proximate-tri" d={`M ${params.colWidth*c} ${params.rowHeight*r} l ${params.colWidth/2} ${params.rowHeight/2} l ${params.colWidth/2} ${-params.rowHeight/2} Z`} fill="green"/>
          )  
        }  
        else if (tri.R < tri.B) {
          prox.tri = 'R';
          near.push(
            <S.Path key="proximate-tri" d={`M ${params.colWidth*(c+1)} ${params.rowHeight*r} l ${-params.colWidth/2} ${params.rowHeight/2} l ${params.colWidth/2} ${params.rowHeight/2} Z`} fill="pink"/>
          )  
        }  
        else {
          prox.tri = 'B';
          near.push(
            <S.Path key="proximate-tri" d={`M ${params.colWidth*c} ${params.rowHeight*(r+1)} l ${params.colWidth/2} ${-params.rowHeight/2} l ${params.colWidth/2} ${params.rowHeight/2} Z`} fill="purple"/>
          )  
        }  

        // square quadrant
        if (fx < params.colWidth/2 && fy < params.rowHeight/2) {
          const c = Math.round(gx / params.colWidth);
          const r = Math.round(gy / params.rowHeight);
          prox.quad = 'TL';
          near.push(
            <S.Rect key="proximate-quad" at={[params.colWidth*c, params.rowHeight*r]} size={[params.colWidth/2, params.rowHeight/2]} fill="yellow" opacity="0.25"/>
          )
        }
        else if (fx > params.colWidth/2 && fy < params.rowHeight/2) {
          const c = Math.round(gx / params.colWidth);
          const r = Math.round(gy / params.rowHeight);
          prox.quad = 'TR';
          near.push(
            <S.Rect key="proximate-quad" at={[params.colWidth*(c-0.5), params.rowHeight*r]} size={[params.colWidth/2, params.rowHeight/2]} fill="red" opacity="0.25"/>
          )
        }
        else if (fx < params.colWidth/2 && fy > params.rowHeight/2) {
          const c = Math.round(gx / params.colWidth);
          const r = Math.round(gy / params.rowHeight);
          prox.quad = 'BL';
          near.push(
            <S.Rect key="proximate-quad" at={[params.colWidth*c, params.rowHeight*(r-0.5)]} size={[params.colWidth/2, params.rowHeight/2]} fill="orange" opacity="0.25"/>
          )
        }
        else if (fx > params.colWidth/2 && fy > params.rowHeight/2) {
          const c = Math.round(gx / params.colWidth);
          const r = Math.round(gy / params.rowHeight);
          prox.quad = 'BR';
          near.push(
            <S.Rect key="proximate-quad" at={[params.colWidth*(c-0.5), params.rowHeight*(r-0.5)]} size={[params.colWidth/2, params.rowHeight/2]} fill="magenta" opacity="0.25"/>
          )
        }

        // square half (top/bottom)
        if (fy < params.rowHeight/2) {
          const c = Math.floor(gx / params.colWidth);
          const r = Math.round(gy / params.rowHeight);
          prox.vhalf = 'T';
          near.push(
            <S.Rect key="proximate-tb" at={[params.colWidth*c, params.rowHeight*r]} size={[params.colWidth, params.rowHeight/2]} fill="teal" opacity="0.25"/>
          )
        }
        else if (fy > params.rowHeight/2) {
          const c = Math.floor(gx / params.colWidth);
          const r = Math.round(gy / params.rowHeight);
          prox.vhalf = 'B';
          near.push(
            <S.Rect key="proximate-tb" at={[params.colWidth*c, params.rowHeight*(r-0.5)]} size={[params.colWidth, params.rowHeight/2]} fill="teal" opacity="0.25"/>
          )
        }

        // square half (left/right)
        if (fx < params.colWidth/2) {
          const c = Math.round(gx / params.colWidth);
          const r = Math.floor(gy / params.rowHeight);
          prox.hhalf = 'L';
          near.push(
            <S.Rect key="proximate-lr" at={[params.colWidth*c, params.rowHeight*r]} size={[params.colWidth/2, params.rowHeight]} fill="brown" opacity="0.25"/>
          )
        }
        else if (fx > params.colWidth/2) {
          const c = Math.round(gx / params.colWidth);
          const r = Math.floor(gy / params.rowHeight);
          prox.hhalf = 'R';
          near.push(
            <S.Rect key="proximate-lr" at={[params.colWidth*(c-0.5), params.rowHeight*r]} size={[params.colWidth/2, params.rowHeight]} fill="brown" opacity="0.25"/>
          )
        }
      }

      // near row line
      if (on_x) {
        const c = Math.floor(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        prox.on_x = r;
        if (c >= 0 && c < params.cols) near.push(
          <S.Line key="proximate-x" from={[params.colWidth*c, params.rowHeight*r]} to={[params.colWidth*(c+1), params.rowHeight*r]} stroke="blue" strokeWidth={2}/>
        )
      }

      // near column line
      if (on_y) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.floor(gy / params.rowHeight);
        prox.on_y = c;
        if (r >= 0 && r < params.rows) near.push(
          <S.Line key="proximate-y" from={[params.colWidth*c, params.rowHeight*r]} to={[params.colWidth*c, params.rowHeight*(r+1)]} stroke="purple" strokeWidth={2}/>
        )
      }

      // near intersection
      if (on_x && on_y) {
        const c = Math.round(gx / params.colWidth);
        const r = Math.round(gy / params.rowHeight);
        prox.on_xy = { col: c, row: r };
        near.push(
          <S.Circle key="proximate-xy" at={[params.colWidth*c, params.rowHeight*r]} r={tolerance} stroke="red" strokeWidth={2} fill="transparent"/>
        )
      }
    }

    return { near, prox };
  }

  const [ mouse, setMouse ] = useState({x: null, y: null});
  const { gx, gy } = xyToGrid({x: mouse.x, y: mouse.y });
  const [ fx, fy ] = [ gx % params.colWidth, gy % params.rowHeight ];

  const { row, col, oob } = xyToCell({x: mouse.x, y: mouse.y});
  const { near, prox } = proximateTo({x: mouse.x, y: mouse.y, row, col, tolerance: (params.rowHeight + params.colWidth)/8});

  return (
    <div>
      <S.SVG id={svg} {...attrs}>
        <S.Defs>{defs}</S.Defs>
        <S.G>
          {gridlines}
          {headers}
          {near}
        </S.G>
      </S.SVG>
      <div>(x, y) = ({mouse.x}, {mouse.y})<br/>(gx, gy) = ({gx}, {gy})<br/>(fx, fy) = ({fx}, {fy})<br/>(col, row) = ({col}, {row}) [oob={oob ? 'Y' : 'N'}]</div>
      <div>{JSON.stringify(prox)}</div>
    </div>
  )
}


export default SVGrid;