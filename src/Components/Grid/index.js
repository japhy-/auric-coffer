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
  const [ walls, setWalls ] = useState({});
  const [ events, setEvents ] = useState({});

  const onMouseOut = (ev) => {
    const elFrom = ev.nativeEvent.fromElement;
    const elTo = ev.nativeEvent.toElement;
    const contains = elFrom.contains(elTo);

    // hack to stop the rubble layer from clearing the target
    if (! contains && elFrom.id !== 'layerRubble') mouse.setTarget(null);
  }

  const onMouseUp = (ev) => {
  }

  const onMouseMove = (ev) => {
    // console.log(ev.target.id);
    const target = determineMouseTarget(ev, g);
    // console.log(target);
    // mouse.setPosition({x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY});
    mouse.setTarget(target); // determineMouseTarget(ev, g));

    /*
    if (ev.buttons === 1) {
      mouse.setKillClick(true);
      placeObject();
    }
    else if (ev.buttons === 2) {
      mouse.setKillClick(true);
      clearObject();
    }
    */
  }

  const onClick = (ev) => {
    if (mouse.KillClick) {
      mouse.setKillClick(false);
      return;
    }

    const t = determineMouseTarget(ev, g);
    if (t) placeObject({grid: g, target: t, cycle: true, objects: { walls, setWalls, events, setEvents }});
  }

  const onContextMenu = (ev) => {

  }

  return (
    <div id="grid-svg" style={{width: g.width + 'px', height: g.height + 'px', border: '1px solid black'}}>
      <S.SVG
        viewBox={`${-g.square} ${-g.square} ${g.width} ${g.height}`}
        {...{onMouseOut, onMouseUp, onMouseMove, onClick, onContextMenu}}
      >
        <Layers.GridLayer/>
        <Layers.WallLayer walls={walls}/>
        <Layers.MouseLayer/>
      </S.SVG>
    </div>
  );
}


function placeObject ({grid: g, target: t, objects: obj, cycle=false, ...props}) {
  if (! t) return;

  if (t.type === 'horizontal' || t.type === 'vertical') {
    const item = { type: props.item || 'wall', object: null };
    const existing = obj.walls[`${t.type},${t.x},${t.y}`];

    if (existing) {
      if (cycle) item.type = item_cycle[existing.type];
      clearObject({target: t, objects: obj});
      if (! item.type) return;
    }

    const key = `${item.type}-${t.type}-${t.x},${t.y}`;

    if (item.type === 'wall') {
      item.object = <S.Use key={key} href="#lineWall" at={[t.x,t.y]} stroke="black" strokeWidth={g.strokeWidth} transform={t.type === 'vertical' ? `rotate(90,${t.x},${t.y})` : ""}/>;
    }
    else if (item.type === 'rubble') {
      item.object = <S.Use key={key} href="#groupRubble" at={[t.x,t.y]} transform={t.type === 'vertical' ? `rotate(90,${t.x},${t.y})` : ""}/>;
    }
    else if (item.type === 'door') {
      item.object = <S.Use key={key} href="#groupDoor" at={[t.x,t.y]} stroke="black" transform={t.type === 'vertical' ? `rotate(90,${t.x},${t.y})` : ""}/>;
    }
    else if (item.type === 'doorBlocked') {
      item.object = <S.Use key={key} href="#groupDoorBlocked" at={[t.x,t.y]} stroke="black" transform={t.type === 'vertical' ? `rotate(90,${t.x},${t.y})` : ""}/>;
    }
    else if (item.type === 'doorSecret') {
      item.object = <S.Use key={key} href="#groupDoorSecret" at={[t.x,t.y]} stroke="black" transform={t.type === 'vertical' ? `rotate(90,${t.x},${t.y})` : ""}/>;
    }
    else if (item.type === 'doorNE') {
      item.object = <S.Use key={key} href="#groupDoorHalf" at={[t.x,t.y]} stroke="black" transform={t.type === 'vertical' ? `rotate(90,${t.x},${t.y})` : ""}/>;
    }
    else if (item.type === 'doorSW') {
      item.object = <S.Use key={key} href="#groupDoorHalf" at={[t.x,t.y]} stroke="black" transform={(t.type === 'vertical' ? `rotate(90,${t.x},${t.y})` : "") + ` rotate(180,${t.x+g.square/2},${t.y})`}/>;
    }
    else if (item.type === 'arch') {
      item.object = <S.Use key={key} href="#groupArch" at={[t.x,t.y]} stroke="black" transform={t.type === 'vertical' ? `rotate(90,${t.x},${t.y})` : ""}/>;
    }

    obj.setWalls({...obj.walls, [`${t.type},${t.x},${t.y}`]: item});
  }
  else if (t.type === 'corner' || t.type === 'square') {
    console.log("placing event");
  }
}


function clearObject ({target: t, objects: obj}) {
  if (! t) return;

  if (t.type === 'horizontal' || t.type === 'vertical') {
    // obj.setWalls({...obj.walls, [`${t.type},${t.x},${t.y}`]: null});

    delete obj.walls[`${t.type},${t.x},${t.y}`]
    obj.setWalls({...obj.walls});
  }
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



export default Grid;
