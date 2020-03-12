import React, { createContext } from 'react';
import * as Comp from '../../Components';
import { useGridConfig } from '../../Components/GridConfig';

const GridContext = createContext(null);
const MouseContext = createContext(null);

function AppWindow () {
  const [ g, resizeGrid ] = useGridConfig({ rows: 16, cols: 16, square: 40, tolerance: 8 });
  const mouse = {};

  return (
    <GridContext.Provider value={{g, resizeGrid}}>
      <div class="AppWindow">
        <div class="LeftPane">
          <Comp.WorkSpace>
            <MouseContext.Provider value={mouse}>
              <Comp.Grid/>
            </MouseContext.Provider>
          </Comp.WorkSpace>
        </div>
        <div class="RightPane">
          <Comp.Console>
            <Comp.GridConfig/>
            <Comp.MouseDetails/>
          </Comp.Console>
        </div>
      </div>
    </GridContext.Provider>
  )
}

export default AppWindow;
