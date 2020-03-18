import React, { useState } from 'react';
import * as Comp from '../../Components';

function AppWindow () {
  const [ widget, setWidget ] = useState('gridEditor');

  if (widget === 'gridEditor') return (
    <div className="AppWindow">
      <Comp.GridEditor/>
    </div>
  );

  if (widget === 'spriteEditor') return (
    <div className="AppWindow">
      <Comp.SpriteEditor/>
    </div>
  );

  return null;
}


export default AppWindow;