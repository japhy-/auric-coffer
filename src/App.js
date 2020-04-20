import React, { createContext, useState } from 'react';
import AuricCoffer from './AuricCoffer';

import './App.css';

const AuricContext = createContext(null);

function App () {
  const auric = useAuricContext();

  return (
    <AuricContext.Provider value={auric}>
      <div id="AuricCofferApp" className="App" tabIndex="-1" {...auric.events}>
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
  
  auric.focused = null;
  auric.findFocus = (ev) => {
    let el = ev.target;
    while (el && ! el.hasAttribute('tabindex')) el = el.parentNode;
    return el && el !== auric.focused && (auric.focused = el).focus();
  }

  auric.events = {
    onMouseOver: auric.findFocus,
    onMouseDown: ev => ev.preventDefault(),
    onMouseMove: auric.mouse.update,
    onKeyDown: auric.key.update,
    onKeyUp: auric.key.update,
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