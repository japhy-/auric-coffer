import React, { useState, useContext } from 'react';
import { GridContext } from '../../GridEditor';


function GridConfig () {
  const { g, resizeGrid } = useContext(GridContext);

  return (
    <div>
      <form>
        <div>Rows: <input name="rows" type="text" size="3" maxLength="3" defaultValue={g.rows} onBlur={(e) => resizeGrid({rows: parseInt(e.currentTarget.value)})}/></div>
        <div>Columns: <input name="cols" type="text" size="3" maxLength="3" defaultValue={g.cols} onBlur={(e) => resizeGrid({cols: parseInt(e.currentTarget.value)})}/></div>
        <div>Square Size: <input name="square" type="text" size="2" maxLength="2" defaultValue={g.square} onBlur={(e) => resizeGrid({square: parseInt(e.currentTarget.value)})}/></div>
        <div>Tolerance: <input name="tolerance" type="text" size="2" maxLength="2" defaultValue={g.tolerance} onBlur={(e) => resizeGrid({tolerance: parseInt(e.currentTarget.value)})}/></div>
        <hr/>
        <div>Width: {g.width}</div>
        <div>Height: {g.height}</div>
        <div>Stroke: {g.strokeWidth}</div>
      </form>
    </div>
  )
}


function useGridConfig (g) {
    // base values
  const [ cols, setCols ] = useState(g.cols);
  const [ rows, setRows ] = useState(g.rows);
  const [ square, setSquare ] = useState(g.square);
  const [ tolerance, setTolerance ] = useState(g.tolerance);

  // derivative values
  const strokeWidth = square/10 - 1;
  const width = square * (cols + 2);
  const height = square * (rows + 2);

  const updateGrid = (g) => {
    for (let x in g) {
      let func;
      switch (x) {
        case 'rows': func = setRows; break;
        case 'cols': func = setCols; break;
        case 'square': func = setSquare; break;
        case 'tolerance': func = setTolerance; break;
        default: func = null;
      }
      if (func !== null) func(g[x]);
    }
  };

  return [ { rows, cols, square, tolerance, width, height, strokeWidth }, updateGrid ];
}

export default GridConfig;
export { useGridConfig };