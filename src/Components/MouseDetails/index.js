import React, { useContext } from 'react';
import { MouseContext, EventsContext } from '../AppWindow';

function MouseDetails () {
  return (
    <div className="MouseDetails">
      <hr/>
      <MousePosition/>
    </div>
  )
}


function MousePosition () {
  const mouse = useContext(MouseContext);
  const events = useContext(EventsContext);
  
  return (
    <>
      <div>mouse @ row {mouse.position.row}, col {mouse.position.col} [{mouse.position.where}]</div>
      <div>nextEventId={events.usedIds[0]} :: EventIdState={events.usedIds.join(" ")}</div>
    </>
  )
}


export default MouseDetails;