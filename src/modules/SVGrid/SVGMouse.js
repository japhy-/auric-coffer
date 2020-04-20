import { createContext, useState, useContext } from 'react';
import { AuricContext } from '../../App';

const SVGMouseContext = createContext(null);

function useSVGMouse ({config, grid}) {
  const auric = useContext(AuricContext);
  const mouse = {};

  [ mouse.active, mouse.setActive ] = useState(false);
  [ mouse.winX, mouse.winY, mouse.x, mouse.y ] = mouse.active ? [ ...auric.mouse.XY, ...auric.mouse.offsetXY ] : [null, null, null, null];

  const [ cw, rh ] = [ config.cols.width, config.rows.height ];

  [ mouse.gx, mouse.gy ] = grid.xyToGridXY(mouse);
  mouse.gxy = [ mouse.gx, mouse.gy ];
  [ mouse.row, mouse.col, mouse.oob ] = grid.xyToCell(mouse);
  [ mouse.fx, mouse.fy ] = [ (mouse.gx+cw) % cw, (mouse.gy+rh) % rh ];
  mouse.prox = grid.proximateTo(mouse);

  return mouse;
}


export default useSVGMouse;
export { SVGMouseContext };