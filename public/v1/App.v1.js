import React, { useState } from 'react';

import Grid, { GridContext } from './Components/Grid';

import WallLayer from './Layers/WallsAndDoors';

import { determineMouseTarget, MouseCells } from './Components/Mouse';
import MouseLayer from './Layers/Mouse';

import * as S from '../../src/SVG';

import './App.css';


function App () {
  const [ g, updateGrid ] = useGrid({ rows: 16, cols: 16, square: 40, tolerance: 8 });
  const [ objects, setObjects ] = useState({});
  const [ mouseTarget, setMouseTarget ] = useState(null);
  const [ mouseKillClick, setMouseKillClick ] = useState(false);

  const onMouseOut = (ev) => {
    if (! ev.nativeEvent.fromElement.contains(ev.nativeEvent.toElement)) setMouseTarget(null);
  }

  const onMouseUp = (ev) => {
  }

  const onMouseMove = (ev) => {
    setMouseTarget(determineMouseTarget(ev, g));

    if (ev.buttons === 1) {
      setMouseKillClick(true);
      placeObject();
    }
    else if (ev.buttons === 2) {
      setMouseKillClick(true);
      clearObject();
    }
  }

  const onClick = (ev) => {
    if (mouseKillClick) {
      setMouseKillClick(false);
      return;
    }

    const t = determineMouseTarget(ev, g);
    if (t) placeObject({grid: g, target: t, cycle: true, objects, setObjects});
  }

  const onContextMenu = (ev) => {

  }

  return (
    <div className="App">
      <GridContext.Provider value={g}>
        <Grid/>
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




function placeObject ({grid: g, target: t, cycle=false, objects: o, setObjects}) {

}


function clearObject ({}) {

}


export default App;

