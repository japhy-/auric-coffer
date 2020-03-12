import React from 'react';


export function MouseCells ({target}) {
  const cells = [];

  if (! target) return null;

  for (let c in target.cells) {
    if (target.cells[c]) cells.push(<div key={`MouseCell${c}`}>{target.cells[c].row}, {target.cells[c].col}</div>)
  }

  return (
    <>
    {cells}
    </>
  )
}


export function determineMouseTarget (ev, g) {
  const mx = ev.nativeEvent.offsetX - g.square;
  const my = ev.nativeEvent.offsetY - g.square;

  if (mx < -g.tolerance || mx > g.cols * g.square + g.tolerance) return null;
  if (my < -g.tolerance || my > g.rows * g.square + g.tolerance) return null;

  let x, y;
  const on_x = (mx % g.square >= (g.square - g.tolerance) || mx % g.square < g.tolerance);
  const on_y = (my % g.square >= (g.square - g.tolerance) || my % g.square < g.tolerance);

  let cells, type;

  if (on_x && on_y) {
    x = Math.round(mx/g.square) * g.square;
    y = Math.round(my/g.square) * g.square;

    cells = [ [x/g.square-1,y/g.square-1], [x/g.square,y/g.square-1], [x/g.square-1,y/g.square], [x/g.square,y/g.square] ];
    type = 'corner';
  }
  else if (on_x || on_y) {
    if (on_x) {
      x = Math.round(mx/g.square) * g.square;
      y = Math.floor(my/g.square) * g.square;
    }
    else if (on_y) {
      x = Math.floor(mx/g.square) * g.square;
      y = Math.round(my/g.square) * g.square;
    }
    cells = [ [x/g.square-(on_x?1:0),y/g.square-(on_x?0:1)], [x/g.square,y/g.square] ];
    type = on_x ? 'vertical' : 'horizontal';
  }
  else {
    x = Math.floor(mx/g.square) * g.square + g.tolerance/2;
    y = Math.floor(my/g.square) * g.square + g.tolerance/2;

    cells = [ [(x - g.tolerance/2)/g.square, (y - g.tolerance/2)/g.square] ];
    type = 'square';
  }

  return { x, y, cells: cells.map((c) => (c[0] >= 0 && c[0] < g.cols && c[1] >= 0 && c[1] < g.rows) ? {col: c[0], row: c[1]} : null), type };
}
