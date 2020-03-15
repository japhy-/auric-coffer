import React, { useContext, useState } from 'react';

import * as S from '../../SVG';
import * as Layers from '../Layers';
import { GridContext, MouseContext } from '../AppWindow';

const item_cycle = {
  wall: 'rubble',
  rubble: 'door',
  door: 'doorBlocked',
  doorBlocked: 'doorSecret',
  doorSecret: 'doorNE',
  doorNE: 'doorSW',
  doorSW: 'arch',
  arch: null,
};

function Grid () {
  const { g } = useContext(GridContext);
  const mouse = useContext(MouseContext);
  const [ objects, setObjects ] = useState({});

  const onMouseOut = (ev) => {
    const elFrom = ev.nativeEvent.fromElement;
    const elTo = ev.nativeEvent.toElement;
    const contains = elFrom.contains(elTo);

    // hack to stop the rubble layer from clearing the target
    if (! contains && elFrom.id !== 'layerRubble') mouse.setTarget(null);
  }

  const onMouseUp = (ev) => {
    ev.preventDefault();
  }

  const onMouseMove = (ev) => {
    ev.preventDefault();

    const target = determineMouseTarget(ev, g, mouse);
    mouse.setTarget(target);
    if (! target) return;

    if (ev.buttons === 1) {
      mouse.setKillClick(true);
      placeObject({target, cycle: false, objects, setObjects});
    }
    else if (ev.buttons === 2) {
      mouse.setKillClick(true);
      clearObject({target, objects, setObjects});
    }
  }

  const onClick = (ev) => {
    ev.preventDefault();

    if (mouse.killClick) {
      mouse.setKillClick(false);
      return;
    }

    const target = determineMouseTarget(ev, g, mouse);
    if (target) placeObject({target, cycle: true, objects, setObjects});
  }

  const onContextMenu = (ev) => {
    ev.preventDefault();

    if (mouse.killClick) {
      mouse.setKillClick(false);
      return;
    }

    const target = determineMouseTarget(ev, g, mouse);
    if (target) clearObject({target, objects, setObjects});
  }

  return (
    <div id="grid-svg" style={{width: g.width + 'px', height: g.height + 'px', border: '1px solid black'}}>
      <S.SVG
        viewBox={`${-g.square} ${-g.square} ${g.width} ${g.height}`}
        {...{onMouseOut, onMouseUp, onMouseMove, onClick, onContextMenu}}
      >
        <Layers.GridLayer/>
        <Layers.WallLayer objects={objects}/>
        <Layers.MouseLayer/>
      </S.SVG>
    </div>
  );
}


function GridObject ({type, row, col, where}) {
  const { g } = useContext(GridContext);
  const coords = [col*g.square, row*g.square];
 
  const props = { href: `#object-${type}`, at: coords, stroke: 'black' };
  if (where === 'L') props.transform = `rotate(90, ${coords[0]}, ${coords[1]})`;
  
  return <S.Use {...props}/>;
}


function placeObject ({target: t, objects, setObjects, cycle=false, ...props}) {
  if (! t) return;
  const loc = `${t.col},${t.row},${t.where}`;

  if (t.where === 'C') {
    // console.log(`placing event in cell ${t.col}, ${t.row}`);
  }
  else if (t.where === 'L' || t.where === 'T') {
    const item = { type: props.item || 'wall', object: null };
    const existing = objects[loc];

    if (existing) {
      if (cycle) item.type = item_cycle[existing.type];
      clearObject({loc, objects, setObjects});
      if (! item.type) return;
    }

    item.object = <GridObject key={loc} type={item.type} row={t.row} col={t.col} where={t.where}/>

    setObjects({...objects, [loc]: item});
  }
}


function clearObject ({loc=null, target=null, objects, setObjects}) {
  if (loc === null && target !== null) loc = `${target.col},${target.row},${target.where}`;
  if (loc && objects[loc]) {
    delete objects[loc];
    setObjects({...objects});
  }
}


function determineMouseTarget (ev, g, mouse) {
  let mx = ev.nativeEvent.offsetX - g.square;
  let my = ev.nativeEvent.offsetY - g.square;

  if (mx < -g.tolerance || mx > g.cols * g.square + g.tolerance-1) return null;
  if (my < -g.tolerance || my > g.rows * g.square + g.tolerance-1) return null;

  if (mx < 0) mx = 0;
  else if (mx > g.cols * g.square) mx = g.cols * g.square - 1;

  if (my < 0) my = 0;
  else if (my > g.rows * g.square) my = g.rows * g.square - 1;

  const on_x = (mx % g.square >= (g.square - g.tolerance) || mx % g.square < g.tolerance);
  const on_y = (my % g.square >= (g.square - g.tolerance) || my % g.square < g.tolerance);
  
  let x, y, col, row, where;

  // intersection not needed
  if (0 && on_x && on_y) {
    x = Math.round(mx/g.square) * g.square;
    y = Math.round(my/g.square) * g.square;

    where = 'I'; // I = intersection
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

    where = on_x ? 'L' : 'T';
  }

  else {
    x = Math.floor(mx/g.square) * g.square + g.tolerance/2;
    y = Math.floor(my/g.square) * g.square + g.tolerance/2;

    where = 'C';
  }

  col = Math.floor(x/g.square);
  row = Math.floor(y/g.square);
  mouse.setPosition({col, row, where});

  return { col, row, where, x, y };
}


export default Grid;
