  /*
  const [ drawState, setDrawState ] = useState({state: null});
  const [ shapes, setShapes ] = useState([]);
  */

/*
    if (drawState.state !== null) {
      setDrawState(s => { return { ...s, legit: prox.onXY, tempPoint: prox.onXY ? prox.onXY.at : [ gx, gy ] } });
    }
*/

  /*
  attrs.onClick = ev => {
    ev.preventDefault();
    const n = ev.nativeEvent;
    if (events.onClick) return events.onClick(ev, mouse);

    if (! prox.onXY) return;

    if (drawState.state === null) {
      setDrawState({state: 'drawingPath'});
    }

    setDrawState(s => { return {...s, points: [ ...(s.points || []), prox.onXY.at ]} })
  };

  attrs.onContextMenu = ev => {
    ev.preventDefault();
    const n = ev.nativeEvent;

    if (drawState.state !== null) {
      setShapes(sh => [ ...sh, <Shape coords={[...drawState.points]}/> ]);
      setDrawState({ state: null });
    }
  }
  */

{/*
        <S.G>
          {shapes}
        </S.G>
        <S.G>
          {drawState.points && <PendingShape draw={drawState}/>}
        </S.G>
*/}



function Shape ({coords}) {
  const path = [];
  for (let i = 0; i < coords.length; i++) {
    let [ x, y ] = coords[i];
    if (i == 0) path.push(`M ${x} ${y}`);
    else path.push(`L ${x} ${y}`);
  }
  path.push('Z');
  return <S.Path d={path.join(" ")} strokeWidth="2" stroke="blue" fill="teal" opacity="0.5"/>;
}


function PendingShape ({draw}) {
  const path = [];
  for (let i = 0; i < draw.points.length + (draw.tempPoint ? 1 : 0); i++) {
    let [ x, y ] = (i == draw.points.length) ? draw.tempPoint : draw.points[i];
    if (i == 0) path.push(`M ${x} ${y}`);
    else path.push(`L ${x} ${y}`);
  }
  return <S.Path d={path.join(" ")} strokeWidth="2" stroke={draw.legit ? "red": "magenta"} fill="pink" opacity="0.5"/>;
}
