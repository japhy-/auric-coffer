import React, { useContext, createContext } from 'react';
import useSVGMouse, { SVGMouseContext } from './SVGMouse';
import useNextId, { setPrefix } from '../Counter';
import * as S from './SVG';

const SVGridContext = createContext();


function SVGridContainer ({children, config}) {
  setPrefix('SVGrid');
  const default_svg_id = useNextId();

  if (! config.id) config.id = default_svg_id;
  const grid = {};

  const [ cw, rh ] = [ config.cols.width, config.rows.height ];
  const [ cc, rc ] = [ config.cols.count, config.rows.count ];
  if (config.tolerance === undefined) config.tolerance = (rh + cw) / 8;

  grid.spacer = { row: 4 * config.rows.style.strokeWidth, col: 4 * config.cols.style.strokeWidth };
  grid.viewBox = [-grid.spacer.col, -grid.spacer.row, cc*cw + 2*grid.spacer.col, rc*rh + 2*grid.spacer.row];
  if (config.rows.header) { grid.viewBox[0] -= cw; grid.viewBox[2] += cw; }
  if (config.cols.header) { grid.viewBox[1] -= rh; grid.viewBox[3] += rh; }
  const ratio = grid.viewBox[2] > grid.viewBox[3] ? (grid.viewBox[2] / config.width) : (grid.viewBox[3] / config.height);
  // const ratioX = (grid.viewBox[2] / config.width);
  // const ratioY = (grid.viewBox[3] / config.height);
  grid.xRatio = x => x * ratio + grid.viewBox[0];
  grid.yRatio = y => y * ratio + grid.viewBox[1];

  /*
  useEffect(() => {
    console.log(config.width, config.height, grid.viewBox[3]/grid.viewBox[2], grid.viewBox);
  }, [])
  */
 
  grid.xyToGridXY = ({x, y}) => {
    return (x !== null && y !== null) ? [ grid.xRatio(x), grid.yRatio(y) ] : [ null, null ];
  }

  grid.xyToCell = ({x, y}) => {
    const cell = { row: null, col: null, oob: true };
  
    if (x !== null && y !== null) {
      const [ gx, gy ] = grid.xyToGridXY({x, y});
      const col = Math.floor(gx / cw);
      const row = Math.floor(gy / rh);

      cell.col = col + config.cols.start;
      cell.row = row + config.rows.start;

      if (col >= 0 && col < cc && row >= 0 && row < rc) cell.oob = false;
    }  
  
    return [ cell.row, cell.col, cell.oob ];
  }  

  grid.proximateTo = ({x, y, tolerance=config.tolerance}) => {
    const prox = {};
    const [ gx, gy ] = grid.xyToGridXY({x, y});
    const [ , , oob ] = grid.xyToCell({x, y});
    
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
        if (r >= 0 && r <= rc && c >= 0 && c < cc) {
          prox.onX = { zone: { row: r }, elem: 'line', from: [cw*c, rh*r], to: [cw*(c+1), rh*r] };
        }
      }

      // near column line
      if (on_y) {
        const [ c, r ] = [ Math.round(gx / cw), Math.floor(gy / rh) ];
        if (r >= 0 && r < rc && c >= 0 && c <= cc) {
          prox.onY = { zone: { col: c }, elem: 'line', from: [cw*c, rh*r], to: [cw*c, rh*(r+1)] };
        }
      }

      // near intersection
      if (on_x && on_y) {
        const [ c, r ] = [ Math.round(gx / cw), Math.round(gy / rh) ];
        if (r >= 0 && r <= rc && c >= 0 && c <= cc) {
          prox.onXY = { zone: { col: c, row: r }, elem: 'circle', at: [cw*c, rh*r], r: tolerance, fill: 'white' };
        }
      }
    }

    return prox;
  }

  const mouse = useSVGMouse({config, grid});
  
  return (
    <SVGridContext.Provider value={{config, grid}}>
      <SVGMouseContext.Provider value={mouse}>
        {children}
      </SVGMouseContext.Provider>
    </SVGridContext.Provider>
  )
}


function SVGrid ({children, ...params}) {
  setPrefix('SVGrid');
  const glr = useNextId();
  const glc = useNextId();
  const mask = useNextId();

  const { grid, config } = useContext(SVGridContext);
  const mouse = useContext(SVGMouseContext);
  
  const [ cw, rh ] = [ config.cols.width, config.rows.height ];
  const [ cc, rc ] = [ config.cols.count, config.rows.count ];

  const gridlines = [];
  for (let i = 0; i <= rc; i++) gridlines.push(<S.Use href={`#${glr}`} key={`${glr}-n${i}`} at={[0,i*rh]}/>)
  for (let i = 0; i <= cc; i++) gridlines.push(<S.Use href={`#${glc}`} key={`${glc}-n${i}`} at={[i*cw,0]}/>)
  
  const headers = [];
  if (config.rows.header) for (let i = 0; i < rc; i++) headers.push(<S.Text key={`${glr}-h${i}`} fontFamily={config.rows.header.font || 'garamond'} fontSize={config.rows.header.size || rh/2.5} fill={config.rows.header.color || config.rows.style.stroke || 'black'} textAnchor="middle" at={[0.5 * -cw, (0.6 + i) * rh]}>{config.rows.start + i}</S.Text>);
  if (config.cols.header) for (let i = 0; i < cc; i++) headers.push(<S.Text key={`${glc}-h${i}`} fontFamily={config.cols.header.font || 'garamond'} fontSize={config.cols.header.size || cw/2.5} fill={config.cols.header.color || config.cols.style.stroke || 'black'} textAnchor="middle" at={[(0.5 + i) * cw, 0.4 * -rh]}>{config.cols.start + i}</S.Text>);

  const onMouseOut = ev => {
    if (!document.getElementById(config.id).contains(ev.nativeEvent.toElement)) mouse.setActive(false);
  };

  const onMouseOver = ev => {
    mouse.setActive(true);
  };

  return (
    <div {...{onMouseOver, onMouseOut}}>
      <S.SVG id={config.id} width={config.width} height={config.height} viewBox={grid.viewBox} {...params} preserveAspectRatio="xMinYMin meet">
        <S.Defs>
          <S.Line id={glr} from={[0,0]} to={[cc*cw,0]} {...config.rows.style}/>
          <S.Line id={glc} from={[0,0]} to={[0,rc*rh]} {...config.cols.style}/>
          <S.Mask id={mask}>
            <S.Rect at={[-grid.spacer.col, -grid.spacer.row]} size={[cc*cw + 2*grid.spacer.col, rc*rh + 2*grid.spacer.row]} fill="white"/>
          </S.Mask>
        </S.Defs>
        <S.G>
          {gridlines}
          {headers}
          {0 && <S.Line from={[0,0]} to={[cw,rh]} {...config.rows.style}/>}
        </S.G>
        <S.G mask={`url(#${mask})`}>
          {children}
        </S.G>
      </S.SVG>
    </div>
  )
}


export default SVGrid;
export { SVGridContainer };