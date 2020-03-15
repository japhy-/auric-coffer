import React, { createContext, useState } from 'react';
import * as Comp from '../../Components';
import { useGridConfig } from '../../Components/GridConfig';

const GridContext = createContext(null);
const MouseContext = createContext(null);

function AppWindow () {
  const [ g, resizeGrid ] = useGridConfig({ rows: 16, cols: 16, square: 40, tolerance: 8 });
  const mouse = { };

  [ mouse.target, mouse.setTarget ] = useState(null);
  [ mouse.killClick, mouse.setKillClick ] = useState(false);
  [ mouse.position, mouse.setPosition ] = useState({row: 0, col: 0});

  return (
    <GridContext.Provider value={{g, resizeGrid}}>
      <MouseContext.Provider value={mouse}>
        <div className="AppWindow">
          <div className="LeftPane">
            <div className="WorkSpace">
              <Comp.Grid/>
            </div>
          </div>
          <div className="RightPane">
            <div className="Console">
              <Comp.GridConfig/>
              <Comp.MouseDetails/>
            </div>
          </div>
        </div>
      </MouseContext.Provider>
    </GridContext.Provider>
  )
}

export default AppWindow;
export { GridContext, MouseContext };