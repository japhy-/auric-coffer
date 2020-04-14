import React, { useContext, useState } from 'react';

import * as S from '../../../../../SVG';
import * as Layers from '../Layers';
import { GridContext, MouseContext, ObjectsContext, EventsContext } from '../../GridEditor';

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
  const { objects, setObjects } = useContext(ObjectsContext);
  const events = useContext(EventsContext);

  const onMouseOut = (ev) => {
    const elFrom = ev.nativeEvent.fromElement;
    const elTo = ev.nativeEvent.toElement;
    const contains = elFrom.contains(elTo);

    // hack to stop the rubble layer from clearing the target
    if (! contains && elFrom.id !== 'layerRubble') mouse.setTarget(null);
  }

  const onMouseUp = (ev) => {
    ev.preventDefault();
    mouse.setRestrict(null);
  }

  const onMouseMove = (ev) => {
    ev.preventDefault();

    const target = determineMouseTarget(ev, g, mouse);
    mouse.setTarget(target);
    if (! target) return;

    if (ev.buttons === 1) {
      mouse.setKillClick(true);
      if (! mouse.restrict) mouse.setRestrict({...target});
      else if (! (target.where === mouse.restrict.where && target[mouse.restrict.where === 'L' ? 'col' : 'row'] === mouse.restrict[mouse.restrict.where === 'L' ? 'col' : 'row'])) {
        mouse.setTarget(null);
        return false;
      }
      placeItem({target, cycle: false, objects, setObjects, events});
    }
    else if (ev.buttons === 2) {
      mouse.setKillClick(true);
      clearItem({target, objects, setObjects, events});
    }
  }

  const onClick = (ev) => {
    ev.preventDefault();

    if (mouse.killClick) {
      mouse.setKillClick(false);
      return;
    }

    const target = determineMouseTarget(ev, g, mouse);
    if (target) placeItem({target, cycle: true, objects, setObjects, events});
  }

  const onContextMenu = (ev) => {
    ev.preventDefault();

    if (mouse.killClick) {
      mouse.setKillClick(false);
      return;
    }

    const target = determineMouseTarget(ev, g, mouse);
    if (target) clearItem({target, objects, setObjects, events});
  }

  return (
    <div id="grid-svg" style={{width: g.width + 'px', height: g.height + 'px', border: '1px solid black'}}>
      <S.SVG
        viewBox={`${-g.square} ${-g.square} ${g.width} ${g.height}`}
        {...{onMouseOut, onMouseUp, onMouseMove, onClick, onContextMenu}}
      >
        <Layers.GridLayer/>
        <Layers.MouseLayer/>
        <Layers.WallLayer/>
        <Layers.EventLayer/>
      </S.SVG>
    </div>
  );
}


function GridObject ({type, row, col, where, ...props}) {
  const { g } = useContext(GridContext);
  const coords = [col*g.square, row*g.square];

  const [ hovered, setHovered ] = useState(false);

  const attrs = { href: `#object-${type}`, at: coords, stroke: hovered ? 'red' : 'black', ...props };
  if (where === 'L') attrs.transform = `rotate(90, ${coords[0]}, ${coords[1]})`;
  if (type === 'doorSecret') attrs.fill = hovered ? 'red' : 'black';
  
  return <S.Use {...attrs} onMouseEnter={(ev) => setHovered(true)} onMouseLeave={(ev) => setHovered(false)} cursor="pointer" />;
}


function GridEvent ({eid, row, col, ...props}) {
  const { g } = useContext(GridContext);
  const coords = [col*g.square + g.square/2, row*g.square + g.square/1.5];

  const [ hovered, setHovered ] = useState(false);

  const attrs = { at: coords, stroke: hovered ? 'red' : 'black', ...props };
  
  return <S.Text {...attrs} fontFamily="verdana" fontSize={g.square/2.5} textAnchor="middle"
    onMouseEnter={(ev) => setHovered(true)} onMouseLeave={(ev) => setHovered(false)} cursor="pointer"
  >{eid}</S.Text>;
}


function placeItem ({target: t, objects, setObjects, events, cycle=false, ...props}) {
  if (! t) return;
  
  const loc = `${t.col},${t.row},${t.where}`;

  if (t.where === 'C') {
    if (events.items[loc]) {
      console.log(`already an event in cell ${t.col}, ${t.row}`);
      return;
    }
    console.log(`placing event in cell ${t.col}, ${t.row}`);
    const item = { eventId: events.getNextAvailableId(), attr: { key: loc, row: t.row, col: t.col } };
    item.object = <GridEvent eid={item.eventId} {...item.attr}/>
    events.addEvent({key: loc, item});
  }
  else if (t.where === 'L' || t.where === 'T') {
    let type = props.item || 'wall';
    const existing = objects[loc];

    if (existing) {
      if (cycle) type = item_cycle[existing.type];
      clearItem({loc, objects, setObjects});
      if (! type) return;
    }

    const item = { attr: { type, key: loc, row: t.row, col: t.col, where: t.where } };
    item.object = <GridObject {...item.attr}/>

    setObjects({...objects, [loc]: item});
  }
}


function clearItem ({loc=null, target=null, objects, setObjects, events}) {
  if (loc === null && target !== null) loc = `${target.col},${target.row},${target.where}`;
  if (loc && objects[loc]) {
    delete objects[loc];
    setObjects({...objects});
  }
  else if (loc && events.items[loc]) {
    events.removeEvent(loc);
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
export { GridObject };