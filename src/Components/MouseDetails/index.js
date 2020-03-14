import React, { useContext } from 'react';
import { MouseContext } from '../AppWindow';

function MouseDetails () {
  return (
    <div className="MouseDetails">
      <MousePosition/>
      <MouseCells/>
    </div>
  )
}


function MousePosition () {
  const mouse = useContext(MouseContext);
  
  return null && (
    <div>{mouse.position.x}, {mouse.position.y}</div>
  )
}


function MouseCells () {
  const cells = [];
  const { target } = useContext(MouseContext);

  if (! target) return null;

  for (let c in target.cells) {
    if (target.cells[c]) cells.push(<div key={`MouseCell${c}`}>Cell {target.cells[c].row}, {target.cells[c].col}</div>)
  }

  return (
    <div>{cells}</div>
  )
}


export default MouseDetails;