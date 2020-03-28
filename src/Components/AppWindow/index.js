import React, { useState } from 'react';
import useSVGMouse, { SVGMouseContext } from '../../modules/SVGrid/SVGMouse';
import SVGrid from '../../modules/SVGrid';
import * as Comp from '../../Components';

function AppWindow () {
  const [ widget, setWidget ] = useState('gridEditor');
  const mouse = useSVGMouse();

  if (true) return (
    <SVGMouseContext.Provider value={mouse}>
      <SVGrid
        width={512} height={512}
        rows={6} rowHeight={40} rowStyle={{stroke: 'green', strokeWidth: 2, strokeDasharray: [1,3]}} rowStart={0} rowHeader={true}
        cols={6} colWidth={40} colStyle={{stroke: 'red', strokeWidth: 2, strokeDasharray: [1,3]}} colStart={0} colHeader={true}
        onClick={(ev) => console.log(mouse.x, mouse.y)}
      >
        
      </SVGrid>
    </SVGMouseContext.Provider>
  );

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