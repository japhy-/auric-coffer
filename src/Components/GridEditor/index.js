import React, { createContext, useState } from 'react';
import * as Comp from '../../Components';
import { useGridConfig } from '../../Components/GridConfig';

const GridContext = createContext(null);
const MouseContext = createContext(null);
const ObjectsContext = createContext(null);
const EventsContext = createContext(null);

function GridEditor () {
  const [ g, resizeGrid ] = useGridConfig({ rows: 16, cols: 16, square: 40, tolerance: 10 });
  const [ objects, setObjects ] = useState({ });
  const events = useEventsManager();
  const mouse = useMouse();

  return (
    <GridContext.Provider value={{g, resizeGrid}}>
      <ObjectsContext.Provider value={{objects, setObjects}}>
        <EventsContext.Provider value={events}>
          <MouseContext.Provider value={mouse}>
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
          </MouseContext.Provider>
        </EventsContext.Provider>
      </ObjectsContext.Provider>
    </GridContext.Provider>
  );
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
  [ events.usedIds, events.setUsedIds ] = useState([1]);
  events.nextId = events.usedIds[0];

  events.addEvent = ({key, item}) => {
    events.updateUsedIds({eventId: item.eventId, used: true});
    events.setItems({...events.items, [key]: item});
  };
  events.removeEvent = (key) => {
    events.updateUsedIds({eventId: events.items[key].eventId, used: false});
    delete events.items[key];
    events.setItems({...events.items});
  };
  
  events.getNextAvailableId = () => {
    const nextId = events.usedIds[0];
    events.updateUsedIds({eventId: nextId, used: true});
    return nextId;
  };

  events.updateUsedIds = ({eventId, used}) => {
    events.usedIds[eventId] = used;
    if (used) {
      if (eventId <= events.usedIds[0]) {
        for (let i = eventId+1; ; i++) {
          if (! events.usedIds[i]) {
            events.usedIds[0] = i;
            break;
          }
        }
      }
    }
    else {
      if (eventId < events.usedIds[0]) {
        events.usedIds[0] = eventId;
      }
    }
    events.setUsedIds([...events.usedIds]);
  };

  return events;
}

export default GridEditor;
export { GridContext, MouseContext, ObjectsContext, EventsContext };