import React, { createContext, useState } from 'react';
import * as Comp from '../../Components';
import { useGridConfig } from '../../Components/GridConfig';

const GridContext = createContext(null);
const MouseContext = createContext(null);
const ObjectsContext = createContext(null);
const EventsContext = createContext(null);

function AppWindow () {
  const [ g, resizeGrid ] = useGridConfig({ rows: 16, cols: 16, square: 40, tolerance: 10 });
  const [ objects, setObjects ] = useState({ });
  const events = useEventsManager();
  const mouse = useMouse();

  return (
    <GridContext.Provider value={{g, resizeGrid}}>
      <ObjectsContext.Provider value={{objects, setObjects}}>
        <EventsContext.Provider value={events}>
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
        </EventsContext.Provider>
      </ObjectsContext.Provider>
    </GridContext.Provider>
  )
}


function useMouse () {
  const mouse = {};

  [ mouse.target, mouse.setTarget ] = useState(null);
  [ mouse.killClick, mouse.setKillClick ] = useState(false);
  [ mouse.position, mouse.setPosition ] = useState({row: 0, col: 0, where: 'C'});
  [ mouse.restrict, mouse.setRestrict ] = useState(null);

  return mouse;
}


function useEventsManager () {
  const events = {};

  [ events.items, events.setItems ] = useState({});
  [ events.nextId, events.setNextId ] = useState(1);

  return events;
}

export default AppWindow;
export { GridContext, MouseContext, ObjectsContext, EventsContext };