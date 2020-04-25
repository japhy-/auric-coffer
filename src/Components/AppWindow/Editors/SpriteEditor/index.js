import React, { useContext, useState, createContext, useEffect } from 'react';
import { SVGMouseContext } from '../../../../modules/SVGrid/SVGMouse';
import SVGrid, { SVGridContainer } from '../../../../modules/SVGrid';
import * as S from '../../../../modules/SVGrid/SVG';
import useNextId, { setPrefix } from '../../../../modules/Counter';
import { AuricContext } from '../../../../App';
import { KeyboardMonitorContext, KeyboardEvent } from '../../../../modules/KeyboardMonitor';

const SpriteDrawingContext = createContext(null);

function SpriteEditor () {
  const gridConfig = {
    width: 512,
    height: 512,
    tolerance: 15,
    rows: {
      count: 16,
      height: 32,
      style: { stroke: 'red', strokeWidth: 2, strokeDasharray: [1,3] },
      start: 0,
      header: {
        font: 'Courier',
      }
    },
    cols: {
      count: 16,
      width: 32,
      style: { stroke: 'blue', strokeWidth: 2, strokeDasharray: [1,3] },
      start: 0,
      header: {
        font: 'Garamond',
      }
    }
  };

  return (
    <SVGridContainer config={gridConfig}>
      <SpriteDrawingContainer>
        <SpriteEditorPanes/>
      </SpriteDrawingContainer>
    </SVGridContainer>
  );
}


function SpriteDrawingContainer ({children}) {
  const drawing = useSpriteDrawing();

  return (
    <SpriteDrawingContext.Provider value={drawing}>
      {children}
    </SpriteDrawingContext.Provider>
  );
}


function useSpriteDrawing () {
  const mon = useContext(KeyboardMonitorContext);
  const drawing = {};
  const d = {};

  d._distanceBetweenPoints = (p1, p2) => Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));

  d._closestTwoPoints = (o, p) => {
    let pts = [ null, null ];
    let idx = [ null, null ];
    let min = Infinity;

    for (let i = 0; i < o.points.length; i++) {
      let j = (i+1) % o.points.length;
      const a = o.points[i];
      const b = o.points[j];
      const d1 = d._distanceBetweenPoints(p, a);
      const d2 = d._distanceBetweenPoints(p, b);
      
      if (d1 + d2 < min) {
        min = d1 + d2;
        pts = [ a, b ];
        idx = [ i, j ];
      }
    }

    return { points: pts, indices: idx };
  }

  drawing.key = mon;
  drawing.colors = [ 'yellow', 'red', 'blue', 'green', 'purple', 'brown', 'cyan', 'lime', 'magenta', 'orange' ];
  [ drawing.lastColor, drawing.setLastColor ] = useState(-1);

  [ drawing.mode, drawing.setMode ] = useState('draw');
  [ drawing.active, drawing.setActive ] = useState(false);
  [ drawing.objects, d._setObjects ] = useState([]);
  [ drawing.hover, drawing.setHover ] = useState(null);
  [ drawing.dragObject, drawing.setDragObject ] = useState(null);

  [ drawing.lastPoint, drawing.setLastPoint ] = useState([]);
  [ drawing.points, d._setPoints ] = useState([]);
  [ drawing.dragPoint, drawing.setDragPoint ] = useState(null);
  [ drawing.wasDragging, drawing.setWasDragging ] = useState(false);

  drawing.addObject = (obj) => {
    drawing.setLastColor(c => {
      c = (c+1) % drawing.colors.length;
      d._setObjects(objs => objs.push({ ...obj, transform: [0, 0], n: objs.length, color: c }) && objs);
      return c;
    })
  };
  drawing.removeObject = (obj) => {
    if (obj === drawing.hover) drawing.setHover(null);
    d._setObjects(objs => objs.filter(o => o !== obj));
  };
  drawing.moveObject = (obj, t) => {
    d._setObjects(objs => objs.map(o => o === obj ? ((o.points = o.origPoints.map(p => [p[0] + t[0], p[1] + t[1]])) && o) : o))
  };
  drawing.bringObjectBackward = (obj) => {
    d._setObjects(objs => {
      for (let i = 1; i < objs.length; i++) {
        if (objs[i] === obj) {
          [ objs[i], objs[i-1] ] = [ objs[i-1], objs[i] ];
          break;
        }
      }
      return objs;
    })
  };
  drawing.bringObjectForward = (obj) => {
    d._setObjects(objs => {
      for (let i = 0; i < objs.length-1; i++) {
        if (objs[i] === obj) {
          [ objs[i], objs[i+1] ] = [ objs[i+1], objs[i] ];
          break;
        }
      }
      return objs;
    })
  };
  drawing.bringObjectToBack = (obj) => {
    d._setObjects(objs => {
      for (let i = 1; i < objs.length; i++) {
        if (objs[i] === obj) {
          objs = [obj, ...objs.slice(0, i), ...objs.slice(i+1)];
          break;
        }
      }
      return objs;
    })
  };
  drawing.bringObjectToFront = (obj) => {
    d._setObjects(objs => {
      for (let i = 0; i < objs.length-1; i++) {
        if (objs[i] === obj) {
          objs = [...objs.slice(0, i), ...objs.slice(i+1), obj];
          break;
        }
      }
      return objs;
    })
  };
  drawing.changeObjectColor = (obj, i=null) => {
    obj.color = (i === null ? (obj.color + 1) : i) % drawing.colors.length;
    drawing.setLastColor(obj.color);
  };
  drawing.addPointToObject = (obj, pt) => d._setObjects(objs => objs.map(o => o === obj ? (o.points.push(pt) && o) : o));
  drawing.addIntermediatePointToObject = (obj, pt) => {
    const { indices: [ i ] } = d._closestTwoPoints(obj, pt);
    d._setObjects(objs => objs.map(o => o === obj ? (o.points.splice(i+1, 0, pt) && o) : o));
  };
  drawing.movePointInObject = (obj, i, pt) => d._setObjects(objs => objs.map(o => o === obj ? ((o.points[i] = pt) && o) : o));
  drawing.removePointFromObject = (obj, idx) => d._setObjects(objs => objs.map(o => o === obj ? (o.points.splice(idx, 1) && o) : o));

  drawing.clearPoints = () => d._setPoints([]);
  drawing.addPoint = (pt) => d._setPoints(pts => [ ...pts, pt]);

  drawing.dragPointId = drawing.dragPoint ? `obj-${drawing.dragPoint.object.n}-point-${drawing.dragPoint.ptIdx}` : null;
  drawing.moveDragPoint = (pt) => drawing.movePointInObject(drawing.dragPoint.object, drawing.dragPoint.ptIdx, pt);
  
  return drawing;
}


function SpriteEditorPanes () {
  const mouse = useContext(SVGMouseContext);
  const drawing = useContext(SpriteDrawingContext);

  const events = {
    onMouseDown: (ev) => {
      ev.preventDefault();
    },
    onMouseMove: (ev) => {
      // console.log('onMouseMove', ev);

      if (drawing.active && (drawing.key.lastKey.ctrl ? mouse.gx !== null : mouse.prox.onXY)) {
        if (! (ev.buttons & 1)) {
        }
        drawing.setLastPoint(drawing.key.lastKey.ctrl ? mouse.gxy : mouse.prox.onXY.at);
      }
      else if (drawing.dragPoint && (drawing.key.lastKey.ctrl ? mouse.gx !== null : mouse.prox.onXY)) {
        if (! (ev.buttons & 1)) {
          drawing.dragPoint.object.editing = false;
          drawing.setDragPoint(null);
          drawing.setWasDragging(true);
          return;
        }
        console.log(`adjusting ${drawing.dragPointId}`);
        drawing.moveDragPoint(drawing.key.lastKey.ctrl ? mouse.gxy : mouse.prox.onXY.at);
      }
      else if (drawing.dragObject && drawing.dragObject.dragging) {
        if (! (ev.buttons & 1)) {
          drawing.dragObject.dragging = null;
          drawing.setDragObject(null);
          return;
        }
        const pos = drawing.key.lastKey.ctrl ? mouse.gxy : (mouse.prox.onXY && mouse.prox.onXY.at);
        if (pos) drawing.moveObject(drawing.dragObject, [ pos[0] - drawing.dragObject.dragging[0], pos[1] - drawing.dragObject.dragging[1] ]);
      }
    },

    onMouseUp: (ev) => {
      if (drawing.dragPoint) {
        ev.preventDefault();
        ev.stopPropagation();
        console.log(`fixing ${drawing.dragPointId}`);
        drawing.dragPoint.object.editing = false;
        drawing.setDragPoint(null);
        drawing.setWasDragging(true);
      }
    },

    onClick: (ev) => {
      ev.preventDefault();
      if (drawing.dragPoint) return;
      if (drawing.wasDragging) {
        console.log(`WAS dragging, stopping`);
        drawing.setWasDragging(false);
        return;
      }

      //console.log(`mouse @ ${mouse.gx}, ${mouse.gy} -- ${ev.button}`);
      if (drawing.key.lastKey.ctrl ? mouse.gx === null : !mouse.prox.onXY) return;
      if (! drawing.active) {
        drawing.setActive('polyline');
      }
      drawing.addPoint(drawing.key.lastKey.ctrl ? mouse.gxy : mouse.prox.onXY.at);
      drawing.setLastPoint([]);
    },

    onContextMenu: (ev) => {
      ev.preventDefault();
      // console.log(`mouse @ ${mouse.gx}, ${mouse.gy} -- ${ev.button}`);
      if (drawing.active) {
        drawing.addObject({ shape: drawing.active, points: drawing.points });
        drawing.clearPoints();
        drawing.setActive(false);
      }
    },

/*
    onKeyDown: (ev) => {
      ev.preventDefault();
      ev.persist();
      console.log(`keyDown`, ev)

      if (ev.key === 'Escape') {
        if (drawing.active) {
          drawing.clearPoints();
          drawing.setActive(false);
        }
      }
    },

    onKeyUp: (ev) => {
      ev.preventDefault();
      ev.persist();
      // console.log(`keyUp`, ev)
    },
*/
  }

  return (
    <>
      <div className="LeftPane">
        {false && <div className="WorkSpace">
          <style type="text/css">{`
            SVG:focus { outline: none !important }
          `}</style>
          <SVGrid {...events}>
            {!drawing.key.lastKey.ctrl && !drawing.hover && !drawing.dragPoint && <Proximity elements={mouse.prox}/>}
            <S.Defs>
              <filter id="glow">
                <feDropShadow dx={0} dy={0} stdDeviation={5} floodColor="red"/>
              </filter>
            </S.Defs>
            <S.G opacity="0.75">
              <DrawnObjects/>
              {drawing.points && <S.Polyline points={drawing.points.map(p => p.join(" ")).join(" ") + " " + drawing.lastPoint.join(" ")} stroke="red" fill="none" vectorEffect="non-scaling-stroke"/>}
            </S.G>
          </SVGrid>
          {drawing.active && (
            <KeyboardEvent escape>{() => {
              drawing.clearPoints();
              drawing.setActive(false);
            }}</KeyboardEvent>
          )}
          {drawing.hover && (<>
            <KeyboardEvent d>{() => {
              drawing.removeObject(drawing.hover);
            }}</KeyboardEvent>
            <KeyboardEvent f>{() => {
              drawing.bringObjectForward(drawing.hover);
            }}</KeyboardEvent>
            <KeyboardEvent b>{() => {
              drawing.bringObjectBackward(drawing.hover);
            }}</KeyboardEvent>
            <KeyboardEvent shift f>{() => {
              drawing.bringObjectToFront(drawing.hover);
            }}</KeyboardEvent>
            <KeyboardEvent shift b>{() => {
              drawing.bringObjectToBack(drawing.hover);
            }}</KeyboardEvent>
            <KeyboardEvent c>{() => {
              drawing.changeObjectColor(drawing.hover);
            }}</KeyboardEvent>
          </>)}
        </div>}
      </div>
      <div className="RightPane">
        <div className="Console">
          <KeyDetails/>
          <hr/>
          <Details/>
          <hr/>
          <input type="text" defaultValue=""/>

          <KeyboardEvent ctrl shift handler={() => console.log("Ctrl-Shift...")}>
            <KeyboardEvent keys={['a', 'b', 'c']}>{({queue}) => console.log(queue)}</KeyboardEvent>
          </KeyboardEvent>

          <KeyboardEvent ctrl alt keys={['a', 'b', 'c']}>{({queue}) => console.log(`Ctrl-Alt-`, queue)}</KeyboardEvent>

          <KeyboardEvent ctrl m handler={() => console.log("saw Ctrl-M...")}>
            <KeyboardEvent ctrl b>{() => console.log("Ctrl-M Ctrl-B")}</KeyboardEvent>
            <KeyboardEvent sequence="ctrl-i ctrl-y">{() => console.log("Ctrl-M Ctrl-I Ctrl-Y")}</KeyboardEvent>
          </KeyboardEvent>

          <KeyboardEvent overrideInput ctrl x>{() => console.log("Ctrl-X")}</KeyboardEvent>
          <KeyboardEvent sequence="c a t">{({queue}) => console.log(`cat`, queue)}</KeyboardEvent>

          <KeyboardEvent ctrl keys="+">{() => console.log("Ctrl-(Shift)-Plus")}</KeyboardEvent>
          <KeyboardEvent sequence="ctrl--">{() => console.log("Ctrl+-")}</KeyboardEvent>
        </div>
      </div>
      <MouseHover/>
    </>
  );
}


function KeyDetails () {
  const drawing = useContext(SpriteDrawingContext);
  const mon = useContext(KeyboardMonitorContext);
  return (
    <div>
      <div>{mon.queueSize} : {mon.queue.map(q => `${q.id} (${q.keyCode})`).join("; ")}</div>
    </div>
  )
}


function DrawnObjects () {
  const drawing = useContext(SpriteDrawingContext);
  return (<>
    {drawing.objects.map((obj, objIdx) => <DrawnObject key={`obj-${obj.n}`} object={obj} index={objIdx}/>)}
  </>);
}


function DrawnObject ({object, index}) {
  setPrefix('SVGrid');
  const mouse = useContext(SVGMouseContext);
  const drawing = useContext(SpriteDrawingContext);
  const g_id = useNextId();

  return object && object.points && (
    <S.G
      id={g_id}
      onMouseOver={(ev) => {
        if (! drawing.hover && ! drawing.dragPoint) {
          object.hover = true;
          drawing.setHover(object);
        }
      }}
      onMouseOut={(ev) => {
        if (drawing.dragObject) return;
        if (! document.getElementById(g_id).contains(ev.nativeEvent.toElement)) {
          object.hover = false;
          drawing.setHover(null);
        }
      }}
    >
      <S.Polygon
        points={object.points.map(p => (p || [p[0] + (object.transform[0] || 0), p[1] + (object.transform[1] || 0)]).join(" ")).join(" ")}
        stroke="black"
        strokeWidth={2}
        fill={drawing.colors[object.color]}
        filter={(object.editing || object.hover) ? "url(#glow)" : null}
        opacity={(object.editing || object.hover) ? 1 : 0.5}
        vectorEffect="non-scaling-stroke"
        onClick={(ev) => {
          ev.preventDefault();
          if (drawing.active) return;
          ev.stopPropagation();
          // console.log(`clicked obj-${object.n}`);
        }}
        onMouseDown={(ev) => {
          ev.preventDefault();
          object.origPoints = object.points;
          object.dragging = (drawing.key.lastKey.ctrl ? mouse.gxy : (mouse.prox.onXY ? mouse.prox.onXY.at : null));
          drawing.setDragObject(object);
        }}
        onMouseUp={(ev) => {
          ev.preventDefault();
          object.dragging = null;
          drawing.setDragObject(null);
        }}
        onContextMenu={(ev) => {
          ev.preventDefault();
          if (drawing.active) return;
          ev.stopPropagation();
          // console.log(`right-clicked obj-${object.n}`);
          if (mouse.prox.onXY) drawing.addIntermediatePointToObject(object, drawing.key.lastKey.ctrl ? mouse.gxy : mouse.prox.onXY.at);
        }}
      />
      <DrawnObjectPoints object={object} index={index}/>
    </S.G>
  );
}


function DrawnObjectPoints ({object, index}) {
  const drawing = useContext(SpriteDrawingContext);

  if (! object.hover) return null;

  return (
    <S.G>
    {object.points.map((pt, ptIdx) =>
      <S.Circle
        key={`obj-${object.n}-point-${ptIdx}`}
        at={pt || [pt[0] + object.transform[0], pt[1] + object.transform[1]]}
        r={5}
        fill={object.pointHover === ptIdx ? 'green' : 'black'}
        onClick={ev => { ev.preventDefault(); ev.stopPropagation(); }}
        onMouseOver={ev => { object.pointHover = ptIdx }}
        onMouseOut={ev => { object.pointHover = null }}
        onMouseDown={ev => {
          ev.preventDefault();
          if (ev.buttons & 2) return;
          ev.stopPropagation();
          console.log(`moving obj-${object.n}-point-${ptIdx}`);
          drawing.setDragPoint({object, ptIdx})
          object.editing = true;
        }}
        onContextMenu={ev => {
          ev.preventDefault(); ev.stopPropagation();
          // console.log(`removing obj-${object.n}-point-${ptIdx}`);
          drawing.removePointFromObject(object, ptIdx);
        }}
      />
    )}
    </S.G>
  )
}

/*
function DrawMode ({ drawMode, setDrawMode }) {
  return (
    <div>
      <div><label><input type="radio" name="mode" value="draw" defaultChecked={drawMode==='draw'} onClick={() => setDrawMode('draw')}/> Draw</label></div>
      <div><label><input type="radio" name="mode" value="select" defaultChecked={drawMode==='select'} onClick={() => setDrawMode('select')}/> Select</label></div>
    </div>
  )
}


function DrawMenu () {
  return (
    <div class="context-menu" style={{border: '1px solid gray', fontSize: 'small', width: '120px'}}>
      <MenuItem item="Line"/>
      <MenuItem item="Polyline"/>
      <MenuItem item="Polygon"/>
      <MenuItem item="Circle"/>
      <MenuDivider/>
      <MenuItem item="Draw"/>
      <MenuItem item="Remove"/>
    </div>
  )
}
*/

/*
function MenuItem ({...params}) {
  return (
    <div class="menu-item" style={{padding: '1px'}}>{params.item}</div>
  )
}


function MenuDivider () {
  return (
    <hr/>
  )
}
*/


function Proximity ({elements}) {
  // const mouse = useContext(SVGMouseContext);

  const elem = [];
  for (let key in elements) {
    const cfg = elements[key];
    let el = null;

    if (key === 'onXY') {
      el = <S.Circle key={key} at={cfg.at} r={cfg.r/2} strokeWidth={2} stroke="red" fill="transparent"/>;
    }
    else if (key === 'cell') {
      // el = <S.Rect key={key} at={cfg.at} size={cfg.size} strokeWidth={0} fill="silver" opacity="0.5"/>;
    }
/*
    switch (elements[key].elem) {
      case 'rect':
        //el = <S.Rect key={key} at={cfg.at} size={cfg.size} strokeWidth="1" stroke="black" fill={cfg.fill} opacity="0.25"/>;
        break;
      case 'path':
        //el = <S.Path key={key} d={cfg.path} strokeWidth="1" stroke="blue" fill={cfg.fill} opacity="0.25"/>;
        break;
      case 'circle':
        el = <S.Circle key={key} at={cfg.at} r={cfg.r} strokeWidth="2" stroke="red" fill={cfg.fill}/>;
        break;
      case 'line':
        //el = <S.Line key={key} from={cfg.from} to={cfg.to} strokeWidth="2" stroke="green"/>;
        break;
    }
*/
    if (el) elem.push(el);
  }

  return <S.G>{elem}</S.G>;
}


function MouseHover () {
  const mouse = useContext(SVGMouseContext);

  return !mouse.oob ? (
    <div style={{position: 'absolute', top: mouse.winY+16, left: mouse.winX+16, backgroundColor: 'white', fontSize: '67%', padding: '2px', border: '1px solid black', borderRadius: '6px'}}>
      {Math.round(mouse.gx)}, {Math.round(mouse.gy)}
    </div>
  ) : null;
}


function Details () {
  const mouse = useContext(SVGMouseContext);

  return (
    <div>
      <div>
        (x, y) = ({mouse.x}, {mouse.y})<br/>
        (gx, gy) = ({mouse.gx}, {mouse.gy})<br/>
        (fx, fy) = ({mouse.fx}, {mouse.fy})<br/>
        (col, row) = ({mouse.col}, {mouse.row}) [oob={mouse.oob ? 'Y' : 'N'}]<br/>
      </div>
      <div>{"" && JSON.stringify(mouse.prox)}</div>
    </div>
  );
}

export default SpriteEditor;
