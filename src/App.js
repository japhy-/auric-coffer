import React, { useState, useEffect, useContext, createContext } from 'react';
import * as S from './SVG';
import './App.css';

const GridContext = createContext({});

function App () {
  const [ grid, updateGrid ] = useGrid({ width: 16, height: 16, square: 40, tolerance: 8 });
  const [ mouseTarget, setMouseTarget ] = useState(null);

  const determineMouseTarget = (ev) => {
    const g = grid;

    const mx = ev.nativeEvent.offsetX - g.square;
    const my = ev.nativeEvent.offsetY - g.square;

    if (mx < -g.tolerance || mx > g.width * g.square + g.tolerance) return null;
    if (my < -g.tolerance || my > g.height * g.square + g.tolerance) return null;

    let x, y;
    const on_x = (mx % g.square >= (g.square - g.tolerance) || mx % g.square < g.tolerance);
    const on_y = (my % g.square >= (g.square - g.tolerance) || my % g.square < g.tolerance);

    if (on_x && on_y) {
      x = Math.round(mx/g.square) * g.square;
      y = Math.round(my/g.square) * g.square;

      return { x, y, type: 'corner' };
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
      return { x: x, y: y, type: on_x ? 'vertical' : 'horizontal' };
    }
    else {
      x = Math.floor(mx/g.square) * g.square + g.tolerance/2;
      y = Math.floor(my/g.square) * g.square + g.tolerance/2;
  
      return { x, y, cell: [x/g.square, y/g.square], type: 'square' };
    }
  }

  const onMouseOut = (ev) => {
    if (! ev.nativeEvent.fromElement.contains(ev.nativeEvent.toElement)) setMouseTarget(null);
  }

  const onMouseUp = (ev) => {
  }

  const onMouseMove = (ev) => {
    const t = determineMouseTarget(ev);
    setMouseTarget(t);
  }

  const onClick = (ev) => {

  }

  const onContextMenu = (ev) => {

  }

  return (
    <div className="App">
      <GridContext.Provider value={grid}>
        <div id="grid-svg" style={{width: grid.style.width + 'px', height: grid.style.height + 'px', border: '1px solid black'}}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="100%" height="100%"
            viewBox={`${-grid.square} ${-grid.square} ${grid.style.width} ${grid.style.height}`}
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
          <div>Width: <input name="width" type="text" size="3" maxLength="3" defaultValue={grid.width} onBlur={(e) => updateGrid({width: parseInt(e.currentTarget.value)})}/></div>
          <div>Height: <input name="height" type="text" size="3" maxLength="3" defaultValue={grid.height} onBlur={(e) => updateGrid({height: parseInt(e.currentTarget.value)})}/></div>
        </form>
        <div>
          {grid.width} x {grid.height}
        </div>
      </GridContext.Provider>
    </div>
  );
}

function useGrid (g) {
  // base values
  const [ width, setWidth ] = useState(g.width);
  const [ height, setHeight ] = useState(g.height);
  const [ square, setSquare ] = useState(g.square);
  const [ tolerance, setTolerance ] = useState(g.tolerance);

  // derivative values
  const [ strokeWidth, setStrokeWidth ] = useState(g.square/10);
  const [ style, setStyle ] = useState({width: square * (width+2), height: square * (height+2)});

  useEffect(() => {
    setStyle({width: square * (width+2), height: square * (height+2)});
  }, [width, height, square]);

  useEffect(() => {
    setStrokeWidth(square/10);
  }, [square]);

  const updateGrid = (g) => {
    for (let x in g) {
      let func;
      switch (x) {
        case 'width': func = setWidth; break;
        case 'height': func = setHeight; break;
        case 'square': func = setSquare; break;
        case 'tolerance': func = setTolerance; break;
        default: func = null;
      }
      if (func !== null) func(g[x]);
    }
  };

  return [ { width, height, square, tolerance, style, strokeWidth }, updateGrid ];
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

  for (let y = 0; y <= g.height; y++) {
    lines.push(<S.Use href="#gridH" at={[0,g.square*y]} key={`gridH${y}`}/>);
    if (y < g.height) lines.push(<S.Text key={`gridHN${y}`} fontFamily="garamond" textAnchor="middle" at={[0.5 * -g.square, (0.6 + y) * g.square]}>{y}</S.Text>);
  }  
  for (let x = 0; x <= g.width; x++) {
    lines.push(<S.Use href="#gridV" at={[g.square*x,0]} key={`gridV${x}`}/>);
    if (x < g.width) lines.push(<S.Text key={`gridVN${x}`} fontFamily="garamond" textAnchor="middle" at={[(0.5 + x) * g.square, 0.4 * -g.square]}>{x}</S.Text>);
  }  

  return (
    <>{lines}</>
  );
}  


function GridLine ({type}) {
  const g = useContext(GridContext);

  return (
    <S.Line id={`grid${type.toUpperCase()}`} to={type === 'h' ? [g.square*g.width,0] : [0,g.square*g.height]} strokeDasharray="1 3" strokeWidth="1" stroke="gray"/>
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
    <S.Rect id="layerRubble" size={[g.width*g.square + 2*g.strokeWidth, g.height*g.square + 2*g.strokeWidth]} at={[-g.strokeWidth, -g.strokeWidth]} mask="#maskRubble"/>
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

  /*
    else if (t.type === 'corner') {
      setMouseTarget({...t, macro: 'circle', props: { stroke: 'red', opacity: 0.5, strokeDasharray: [3,1] }});
    }
    else if (t.type === 'square') {
      setMouseTarget({...t, macro: 'squareRounded', props: { stroke: 'red', opacity: 0.5, strokeDasharray: [3,1] }});
    }
*/

  if (t.macro === 'wall') {
    if (t.type === 'vertical') t.props.transform = `rotate(90, ${t.x}, ${t.y})`;
    return <S.Use
      href="#lineWall"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth, stroke: 'black', ...t.props}}
    />
  }

  else if (t.macro === 'circle') {
    return <S.Use
      href="#circleCorner"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth, fill: 'transparent', stroke: 'black', ...t.props}}
    />
  }

  else if (t.macro === 'squareRounded') {
    return <S.Use
      href="#squareCell"
      at={[t.x, t.y]}
      {...{strokeWidth: g.strokeWidth, fill: 'transparent', stroke: 'black', ...t.props}}
    />
  }

  return (
    <>
    </>
  )
}


export default App;

