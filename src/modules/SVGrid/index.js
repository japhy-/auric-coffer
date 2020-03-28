import React, { useContext } from 'react';
import { SVGMouseContext } from './SVGMouse';
import useNextId, { setPrefix } from '../Counter';
import * as S from './SVG';

function SVGrid ({children, onMouseMove=null, onMouseOut=null, ...params}) {
  setPrefix('SVGrid');
  const svg = useNextId();
  const glr = useNextId();
  const glc = useNextId();

  const [ cw, rh ] = [ params.colWidth, params.rowHeight ];
  const spacer = { row: 4 * params.rowStyle.strokeWidth, col: 4 * params.colStyle.strokeWidth };

  const attrs = {
    width: params.width,
    height: params.height,
    viewBox: [-spacer.col, -spacer.row, params.cols*cw + 2*spacer.col, params.rows*rh + 2*spacer.row]
  };

  // copy event handlers
  for (let x in params) if (x.substr(0,2) === 'on') attrs[x] = params[x];

  if (params.rowHeader) { attrs.viewBox[0] -= cw; attrs.viewBox[2] += cw; }
  if (params.colHeader) { attrs.viewBox[1] -= rh; attrs.viewBox[3] += rh; }

  const [ rx, ry ] = [ attrs.viewBox[2] / params.width, attrs.viewBox[3] / params.height ];

  const mouse = useContext(SVGMouseContext);

  const xyToGridXY = ({x, y}) => {
    return (x !== null && y !== null) ? { gx: x * rx + attrs.viewBox[0], gy: y * ry + attrs.viewBox[1] } : { gx: null, gy: null };
  }

  const xyToCell = ({x, y}) => {
    const cell = { row: null, col: null, oob: true };
  
    if (x !== null && y !== null) {
      const { gx, gy } = xyToGridXY({x, y});
      const col = Math.floor(gx / cw);
      const row = Math.floor(gy / rh);
      
      cell.col = col + params.colStart;
      cell.row = row + params.rowStart;

      if (col >= 0 && col < params.cols && row >= 0 && row < params.rows) cell.oob = false;
    }  
  
    return cell;
  }  

  const proximateTo = ({x, y, tolerance}) => {
    const prox = {};
    const { gx, gy } = xyToGridXY({x, y});
    
    if (gx !== null && gy !== null) {
      const [ fx, fy ] = [ (gx+cw) % cw, (gy+rh) % rh ];

      if (!oob) {
        const [ c, r ] = [ Math.floor(gx / cw), Math.floor(gy / rh) ];
        const edge = { L: fx, T: fy, R: cw-fx, B: rh-fy };

        prox.cell = { col: c, row: r, elem: 'rect', at: [c*cw,r*rh], size: [cw, rh], fill: 'silver' };
        prox.edge = { zone: null, elem: 'path', path: null };
        let path = '';

        if (edge.L < edge.T && edge.L < edge.R && edge.L < edge.B) {
          prox.edge.zone = 'L';
          path = `${-cw/2} ${rh/2}  v ${-rh}`;
        }  
        else if (edge.T < edge.R && edge.T < edge.B) {
          prox.edge.zone = 'T';
          path = `${-cw/2} ${-rh/2} h ${cw}`;
        }  
        else if (edge.R < edge.B) {
          prox.edge.zone = 'R';
          path = `${cw/2}  ${rh/2}  v ${-rh}`;
        }  
        else {
          prox.edge.zone = 'B';
          path = `${-cw/2} ${rh/2}  h ${cw}`;
        }

        prox.edge.path = `M ${cw*(c+0.5)} ${rh*(r+0.5)} l ${path} Z`

        // square quadrant
        prox.corner = { zone: null, elem: 'rect', at: [], size: [cw/2, rh/2], fill: 'pink' }
        if (edge.L < edge.R && edge.T < edge.B) {
          prox.corner.zone = 'TL';
          prox.corner.at = [cw*c, rh*r];
        }
        else if (edge.R < edge.L && edge.T < edge.B) {
          prox.corner.zone = 'TR';
          prox.corner.at = [cw*(c+0.5), rh*r];
        }
        else if (edge.L < edge.R && edge.B < edge.T) {
          prox.corner.zone = 'BL';
          prox.corner.at = [cw*c, rh*(r+0.5)];
        }
        else {
          prox.corner.zone = 'BR';
          prox.corner.at = [cw*(c+0.5), rh*(r+0.5)];
        }


        // square half (top/bottom)
        prox.halfV = { zone: null, elem: 'rect', at: [], size: [cw, rh/2], fill: 'purple' };

        if (edge.T < edge.B) {
          prox.halfV.zone = 'T';
          prox.halfV.at = [cw*c, rh*r]
        }
        else {
          prox.halfV.zone = 'B';
          prox.halfV.at = [cw*c, rh*(r+0.5)]
        }


        // square half (left/right)
        prox.halfH = { zone: null, elem: 'rect', at: [], size: [cw/2, rh], fill: 'cyan' };

        if (edge.L < edge.R) {
          prox.halfH.zone = 'L';
          prox.halfH.at = [cw*c, rh*r];
        }
        else {
          prox.halfH.zone = 'R';
          prox.halfH.at = [cw*(c+0.5), rh*r];
        }
      }

      const [ on_x, on_y ] = [ (fy >= (rh - tolerance) || fy < tolerance), (fx >= (cw - tolerance) || fx < tolerance) ];

      // near row line
      if (on_x) {
        const [ c, r ] = [ Math.floor(gx / cw), Math.round(gy / rh) ];
        if (r >= 0 && r < params.rows && c >= 0 && c < params.cols) {
          prox.onX = { zone: { row: r }, elem: 'line', from: [cw*c, rh*r], to: [cw*(c+1), rh*r] };
        }
      }

      // near column line
      if (on_y) {
        const [ c, r ] = [ Math.round(gx / cw), Math.floor(gy / rh) ];
        if (r >= 0 && r < params.rows && c >= 0 && c < params.cols) {
          prox.onY = { zone: { col: c }, elem: 'line', from: [cw*c, rh*r], to: [cw*c, rh*(r+1)] };
        }
      }

      // near intersection
      if (on_x && on_y) {
        const [ c, r ] = [ Math.round(gx / cw), Math.round(gy / rh) ];
        if (r >= 0 && r < params.rows && c >= 0 && c < params.cols) {
          prox.onXY = { zone: { col: c, row: r }, elem: 'circle', at: [cw*c, rh*r], r: tolerance, fill: 'white' };
        }
      }
    }

    return prox;
  }

  const { gx, gy } = xyToGridXY({ x: mouse.x, y: mouse.y });
  const { row, col, oob } = xyToCell({ x: mouse.x, y: mouse.y });
  const [ fx, fy ] = [ (gx+cw) % cw, (gy+rh) % rh ];
  const prox = proximateTo({ x: mouse.x, y: mouse.y, tolerance: (rh + cw)/8 });

  attrs.onMouseOut = ev => {
    ev.preventDefault();
    const n = ev.nativeEvent;
    const contains = document.getElementById(svg).contains(n.toElement);

    if (!contains) mouse.setXY([null,null]);
    if (onMouseOut) return onMouseOut(ev);
  };

  attrs.onMouseMove = ev => {
    ev.preventDefault();
    const n = ev.nativeEvent;

    mouse.setXY([n.offsetX, n.offsetY]);
    if (onMouseMove) return onMouseMove(ev);
  };

  const gridlines = [];
  for (let i = 0; i <= params.rows; i++) gridlines.push(<S.Use href={`#${glr}`} key={`${glr}-n${i}`} at={[0,i*cw]}/>)
  for (let i = 0; i <= params.cols; i++) gridlines.push(<S.Use href={`#${glc}`} key={`${glc}-n${i}`} at={[i*rh,0]}/>)
  
  const headers = [];
  if (params.rowHeader) for (let i = 0; i < params.rows; i++) headers.push(<S.Text key={`${glr}-h${i}`} fontFamily="garamond" textAnchor="middle" at={[0.5 * -cw, (0.6 + i) * rh]}>{params.rowStart + i}</S.Text>);
  if (params.colHeader) for (let i = 0; i < params.cols; i++) headers.push(<S.Text key={`${glc}-h${i}`} fontFamily="garamond" textAnchor="middle" at={[(0.5 + i) * cw, 0.4 * -rh]}>{params.colStart + i}</S.Text>);

  return (
    <div>
      <S.SVG id={svg} {...attrs}>
        <S.Defs>
          <S.Line id={glr} from={[0,0]} to={[params.cols*cw,0]} {...params.rowStyle}/>
          <S.Line id={glc} from={[0,0]} to={[0,params.rows*rh]} {...params.colStyle}/>
        </S.Defs>
        <S.G>
          {gridlines}
          {headers}
        </S.G>
        <S.G>
          {children}
          {0 && <Proximity elements={prox}/>}
        </S.G>
      </S.SVG>
      <div>(x, y) = ({mouse.x}, {mouse.y})<br/>(gx, gy) = ({gx}, {gy})<br/>(fx, fy) = ({fx}, {fy})<br/>(col, row) = ({col}, {row}) [oob={oob ? 'Y' : 'N'}]</div>
      <div>{JSON.stringify(prox)}</div>
    </div>
  )
}


function Proximity ({elements}) {
  const elem = [];
  for (let key in elements) {
    const cfg = elements[key];
    let el = null;
    switch (elements[key].elem) {
      case 'rect':
        el = <S.Rect key={key} at={cfg.at} size={cfg.size} strokeWidth="1" stroke="black" fill={cfg.fill} opacity="0.25"/>;
        break;
      case 'path':
        el = <S.Path key={key} d={cfg.path} strokeWidth="1" stroke="blue" fill={cfg.fill} opacity="0.25"/>;
        break;
      case 'circle':
        el = <S.Circle key={key} at={cfg.at} r={cfg.r} strokeWidth="1" stroke="red" fill={cfg.fill} opacity="0.25"/>;
        break;
      case 'line':
        el = <S.Line key={key} from={cfg.from} to={cfg.to} strokeWidth="2" stroke="green"/>;
        break;
    }
    if (el) elem.push(el);
  }

  return <S.G>{elem}</S.G>;
}


export default SVGrid;