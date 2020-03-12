import React, { useState, useEffect, useContext, createContext } from 'react';
import * as S from './SVG';
import './App.css';

const GridContext = createContext({});

function App () {
  const [ g, updateGrid ] = useGrid({ rows: 16, cols: 16, square: 40, tolerance: 8 });
  const [ mouseTarget, setMouseTarget ] = useState(null);

  const onMouseOut = (ev) => {
    if (! ev.nativeEvent.fromElement.contains(ev.nativeEvent.toElement)) setMouseTarget(null);
  }

  const onMouseUp = (ev) => {
    
  }

  const onMouseMove = (ev) => {
    setMouseTarget(determineMouseTarget(g, ev));
  }

  const onClick = (ev) => {

  }

  const onContextMenu = (ev) => {

  }

  return (
    <div className="App">
      <GridContext.Provider value={g}>
        <div id="grid-svg" style={{width: g.width + 'px', height: g.height + 'px', border: '1px solid black'}}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="100%" height="100%"
            viewBox={`${-g.square} ${-g.square} ${g.width} ${g.height}`}
            {...{onMouseOut, onMouseUp, onMouseMove, onClick, onContextMenu}}
          >
            <S.Defs>
              <GridLine type="h"/>
              <GridLine type="v"/>
              <MouseTargetDefs/>
              <RubbleDefs/>
              <WallDefs/>
            </S.Defs>
            <GridLayer/>
            <WallLayer/>
            {0 && (<RubbleLayer/>)}
            <MouseTarget target={mouseTarget}/>
          </svg>
        </div>
        <form>
          <div>Rows: <input name="rows" type="text" size="3" maxLength="3" defaultValue={g.rows} onBlur={(e) => updateGrid({rows: parseInt(e.currentTarget.value)})}/></div>
          <div>Columns: <input name="cols" type="text" size="3" maxLength="3" defaultValue={g.cols} onBlur={(e) => updateGrid({cols: parseInt(e.currentTarget.value)})}/></div>
        </form>
        <div>
          Grid is {g.rows} rows by {g.cols} columns
        </div>
        <div>
          <MouseCells target={mouseTarget}/>
        </div>
      </GridContext.Provider>
    </div>
  );
}


function determineMouseTarget (ev, g) {
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


function useGrid (g) {
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


function RubbleDefs () {
  const g = useContext(GridContext);

  return (
    <>
      <S.Pattern id="patternRubble" size={[g.square, 2*g.strokeWidth]} transform="rotate(45)">
        <S.Line to={[g.square,0]} stroke="gray" strokeWidth={g.strokeWidth}/>
      </S.Pattern>

      <S.G id="maskRubble"/>

      <S.Rect id="rectRubbleV" size={[g.strokeWidth*2, g.square]} fill="white"/>
      <S.Rect id="rectRubbleH" size={[g.square, g.strokeWidth*2]} fill="white"/>
    </>
  )
}


function WallDefs () {
  const g = useContext(GridContext);

  return (
    <>
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
    </>
  )
}


function GridLayer (props) {
  return (
    <S.G id="layerGrid">
      <GridLines/>
    </S.G>
  );
}


function GridLines () {
  const g = useContext(GridContext);
  const lines = [];

  for (let y = 0; y <= g.rows; y++) {
    lines.push(<S.Use href="#gridH" at={[0,g.square*y]} key={`gridH${y}`}/>);
    if (y < g.rows) lines.push(<S.Text key={`gridHN${y}`} fontFamily="garamond" textAnchor="middle" at={[0.5 * -g.square, (0.6 + y) * g.square]}>{y}</S.Text>);
  }  
  for (let x = 0; x <= g.cols; x++) {
    lines.push(<S.Use href="#gridV" at={[g.square*x,0]} key={`gridV${x}`}/>);
    if (x < g.cols) lines.push(<S.Text key={`gridVN${x}`} fontFamily="garamond" textAnchor="middle" at={[(0.5 + x) * g.square, 0.4 * -g.square]}>{x}</S.Text>);
  }  

  return (
    <>{lines}</>
  );
}  


function GridLine ({type}) {
  const g = useContext(GridContext);

  return (
    <S.Line id={`grid${type.toUpperCase()}`} to={type === 'h' ? [g.square*g.cols,0] : [0,g.square*g.rows]} strokeDasharray="1 3" strokeWidth="1" stroke="gray"/>
  )
}


function WallLayer () {
  // const g = useContext(GridContext);

  return (
    <S.G id="layerWall"/>
  )
}


function RubbleLayer () {
  const g = useContext(GridContext);

  return (
    <S.Rect id="layerRubble" size={[g.cols*g.square + 2*g.strokeWidth, g.rows*g.square + 2*g.strokeWidth]} at={[-g.strokeWidth, -g.strokeWidth]} mask="#maskRubble"/>
  )
}


function MouseTargetDefs () {
  const g = useContext(GridContext);

  return (
    <>
      <S.Circle id="circleCorner" r={g.tolerance}/>
      <S.Rect id="squareCell" size={[g.square - g.tolerance, g.square - g.tolerance]} r={g.tolerance}/>
    </>
  )
}


function MouseTarget ({target: t}) {
  const g = useContext(GridContext);
  if (! t) return null;

  const props = { stroke: 'red', opacity: 0.5, strokeDasharray: [3,1], fill: 'transparent' };

  if (t.type === 'horizontal' || t.type === 'vertical') {
    if (t.type === 'vertical') props.transform = `rotate(90, ${t.x}, ${t.y})`;
    return <S.Use
      href="#lineWall"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth, stroke: 'black', ...props}}
    />
  }

  else if (t.type === 'corner') {
    return <S.Use
      href="#circleCorner"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth/2, fill: 'transparent', stroke: 'black', ...props}}
    />
  }

  else if (t.type === 'square') {
    return <S.Use
      href="#squareCell"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth/2, fill: 'transparent', stroke: 'black', ...props}}
    />
  }

  else return null;
}


function MouseCells ({target}) {
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


export default App;

