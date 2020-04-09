import React, { createContext, useState } from 'react';

const SVGMouseContext = createContext(null);

function useSVGMouse ({config, grid}) {
  const mouse = {};
  const m = {};

  [ mouse.lastEvent, m.setLastEvent ] = useState(null);
  mouse.setLastEvent = (ev) => { ev.persist(); m.setLastEvent(ev) };

  [ mouse.ctrl, mouse.setCtrl ] = useState(false);

  [ [ mouse.winX, mouse.winY ], mouse.setWinXY ] = useState([null, null]);
  [ [ mouse.x, mouse.y ], mouse.setXY ] = useState([null, null]);
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