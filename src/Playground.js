import React, { useState } from "react";
import KeyMonitor, { KeyboardEvent as KeyEvent } from "./modules/KeyboardMonitor";

function Playground () {
  const [ show1, setShow1 ] = useState(false);
  const [ show2, setShow2 ] = useState(false);
  const [ show3, setShow3 ] = useState(false);
  
  return (
    <KeyMonitor>
      <div>
        <button onClick={() => setShow1(v => !v)}>{show1 ? "Hide" : "Show"} Element A</button>
        <button onClick={() => setShow2(v => !v)}>{show2 ? "Hide" : "Show"} Element B</button>
        <button onClick={() => setShow3(v => !v)}>{show3 ? "Hide" : "Show"} Element C</button>
      </div>        
      {show1 && (
      <div>
        <h1>Element A</h1>
        <KeyEvent shift control a>{(el, keys) => console.log("A shift control a!", el, keys)}</KeyEvent>
        <KeyEvent keys={['q', 'z']} stopPropagation>{(el, keys) => console.log("A q/z", el, keys)}</KeyEvent>
      </div>
      )}
      {show2 && (
      <div>
        <h1>Element B</h1>
        <KeyEvent shift control a>{(el, keys) => console.log("B shift control a!", el, keys)}</KeyEvent>
        <KeyEvent keys={['q', 'x']} stopPropagation>{(el, keys) => console.log("B q/x", el, keys)}</KeyEvent>
      </div>
      )}
      {show3 && (
      <div>
        <h1>Element C</h1>
        <KeyEvent shift control a>{(el, keys) => console.log("C shift control a!", el, keys)}</KeyEvent>
        <KeyEvent keys={['x', 'z']} stopPropagation>{(el, keys) => console.log("C x/z", el, keys)}</KeyEvent>
      </div>
      )}
    </KeyMonitor>
  )
}



export default Playground;