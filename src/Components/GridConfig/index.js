import { useState, useEffect } from 'react';


function GridConfig () {
  return null;
}


function useGridConfig (g) {
    // base values
  const [ cols, setCols ] = useState(g.cols);
  const [ rows, setRows ] = useState(g.rows);
  const [ square, setSquare ] = useState(g.square);
  const [ tolerance, setTolerance ] = useState(g.tolerance);

  // derivative values
  const [ strokeWidth, setStrokeWidth ] = useState(g.square/10);
  const [ width, setWidth ] = useState(square * (cols+2));
  const [ height, setHeight ] = useState(square * (rows+2));

  useEffect(() => {
    setHeight(square * (rows+2))
  }, [rows, square]);

  useEffect(() => {
    setWidth(square * (cols+2))
  }, [cols, square]);

  useEffect(() => {
    setStrokeWidth(square/10);
  }, [square]);

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