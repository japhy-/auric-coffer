import React, { useContext } from 'react';
import { MouseContext } from '../AppWindow';

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
  
  return (
    <>
      <div>mouse @ row {mouse.position.row}, col {mouse.position.col} [{mouse.position.where}]</div>
      <div>killClick = {mouse.killClick ? 'true' : 'false'}</div>
    </>
  )
}


export default MouseDetails;