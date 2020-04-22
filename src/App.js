import React, { createContext, useState, useContext } from 'react';
import AuricCoffer from './AuricCoffer';
import KeyMon, { KeyboardMonitorContext } from './modules/KeyboardMonitor';
import Playground from './Playground';

import './App.css';

const AuricContext = createContext(null);

function App () {
  if (0) return (
    <Playground/>
  );

  return (
    <KeyMon>
      <AuricWrapper>
        <AuricCoffer/>
        <AuricDiagnostics/>
      </AuricWrapper>
    </KeyMon>
  )
}


function AuricWrapper ({children}) {
  const auric = useAuric();

  return (
    <AuricContext.Provider value={auric}>
      <div id="AuricCofferApp" className="App" {...auric.events}>
        {children}
      </div>
    </AuricContext.Provider>
  );
}


function AuricDiagnostics () {
  const auric = useContext(AuricContext);
  const mon = useContext(KeyboardMonitorContext);

  return (
    <div>
      <div>
        {auric.mouse.X},{auric.mouse.Y} | {auric.mouse.offsetX},{auric.mouse.offsetY} | {auric.mouse.buttons}
      </div>
      <div>
        {mon.lastKey.shift} | {mon.lastKey.alt} | {mon.lastKey.ctrl} | {mon.lastKey.key} ({mon.lastKey.keyCode}) | {mon.lastKey.type}
      </div>
    </div>
  );
}


function useAuric () {
  const auric = {};

  auric.mouse = useAuricMouse();
  
  auric.events = {
    onMouseMove: auric.mouse.update,
  }

  return auric;
}


function useAuricMouse () {
  const mouse = {};
  const m = {};

  [ mouse.XY, m.setXY ] = useState([null, null]);
  [ mouse.X, mouse.Y ] = mouse.XY;

  [ mouse.offsetXY, m.setOffsetXY ] = useState([null, null]);
  [ mouse.offsetX, mouse.offsetY ] = mouse.offsetXY;
    
  [ mouse.buttons, m.setButtons ] = useState(0);
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