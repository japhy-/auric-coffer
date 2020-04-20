import React, { createContext, useState } from 'react';
import AuricCoffer from './AuricCoffer';

import './App.css';

const AuricContext = createContext(null);

function App () {
  const auric = useAuricContext();

  return (
    <AuricContext.Provider value={auric}>
      <div className="App" tabIndex="-1" onMouseMove={auric.updateMouse} onMouseDown={ev => ev.preventDefault()} onKeyDown={auric.updateKey} onKeyUp={auric.updateKey}>
        <AuricCoffer/>
        <div>
          {auric.mouse.X},{auric.mouse.Y} | {auric.mouse.offsetX},{auric.mouse.offsetY} | {auric.mouse.buttons}
        </div>
        <div>
          {auric.key.shift} | {auric.key.alt} | {auric.key.ctrl} | {auric.key.key} ({auric.key.code}) | {auric.key.type}
        </div>
      </div>
    </AuricContext.Provider>
  )
}


function useAuricContext () {
  const auric = {};

  auric.mouse = useAuricMouse();
  auric.key = useAuricKeyboard();
  auric.updateMouse = auric.mouse.update;
  auric.updateKey = auric.key.update;

  return auric;
}


function useAuricMouse () {
  const mouse = {};
  const m = {};

  [ [ mouse.X, mouse.Y ], m.setXY ] = useState([null, null]);
  [ [ mouse.offsetX, mouse.offsetY ], m.setOffsetXY ] = useState([null, null]);
  [ mouse.buttons, m.setButtons ] = useState(0);

  mouse.XY = [ mouse.X, mouse.Y ];
  mouse.offsetXY = [ mouse.offsetX, mouse.offsetY ];
  mouse.buttonLeft = mouse.buttons & 1;
  mouse.buttonRight = mouse.buttons & 2;

  mouse.update = (ev) => {
    m.setXY([ev.pageX, ev.pageY]);
    m.setOffsetXY([ev.nativeEvent.offsetX, ev.nativeEvent.offsetY]);
    m.setButtons(ev.buttons);
  };

  return mouse;
}


function useAuricKeyboard () {
  const keyboard = {};
  const k = {};

  [ keyboard.event, k.setEvent ] = useState({});
  keyboard.type = keyboard.event.type;
  keyboard.ctrl = keyboard.event.ctrlKey && 'ctrl';
  keyboard.shift = keyboard.event.shiftKey && 'shift';
  keyboard.alt = keyboard.event.altKey && 'alt';
  keyboard.key = keyboard.event.key;
  keyboard.code = keyboard.event.keyCode;

  keyboard.update = (ev) => {
    ev.preventDefault();
    ev.persist();
    k.setEvent(ev);
  };

  return keyboard;
}


export default App;
export { AuricContext };