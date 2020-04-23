import React, { useRef, createContext, useEffect, useContext, useState } from "react";

const KeyboardMonitorContext = createContext({});

function KeyboardMonitor ({children, ...props}) {
  const mon = useKeyboardMonitor();

  useEffect(() => {
    mon.ref.current.focus();
    document.addEventListener('keydown', (ev) => {console.log(`doc ${ev.type} ${ev.key} ${ev.keyCode}`);0&&ev.preventDefault();});
    document.addEventListener('keyup', (ev) => {console.log(`doc ${ev.type} ${ev.key} ${ev.keyCode}`);0&&ev.preventDefault();});
  }, []);

  return (
    <KeyboardMonitorContext.Provider value={mon}>
      <style type="text/css">{`
      SPAN.KeyboardMonitorWrapper:focus { outline: none !important }
      `}</style>
      <span className="KeyboardMonitorWrapper" ref={mon.ref} tabIndex="-1" onKeyDown={mon.onKey} onKeyUp={mon.onKey}>
        {children}
      </span>
    </KeyboardMonitorContext.Provider>
  )
}

function useKeyboardMonitor () {
  const mon = {
    ref: useRef(),
  };

  const m = {};

  [ mon.triggers, mon.setTriggers ] = useState({});
  [ mon.event, mon.setEvent ] = useState(null);

  [ mon.keys, mon.setKeys ] = useState({});
  mon.pressed = { keyCodes: Object.keys(mon.keys).sort((a,b) => a-b), keys: Object.values(mon.keys).sort() };

  [ mon.lastKey, m._setLastKey ] = useState({});
  mon.setLastKey = (ev) => m._setLastKey({
    type: ev.type,
    ctrl: ev.ctrlKey && 'ctrl',
    shift: ev.shiftKey && 'shift',
    alt: ev.altKey && 'alt',
    key: ev.key,
    keyCode: ev.keyCode,
    realKeyCode: ev.realKeyCode,
  });          

  [ mon.queue, mon.setQueue ] = useState([]);

  mon.onKey = (ev) => {
    ev.realKeyCode = ev.keyCode; // (ev.shiftKey && ev.key !== 'Shift') ? ev.keyCode << 8: ev.keyCode;

    ev.persist();
    mon.setEvent(ev);

    if (ev.type === 'keydown') {
      // console.log(ev);
      mon.setKeys(k => {
        if (ev.realKeyCode !== mon.lastKey.realKeyCode) k = {...k, [ev.realKeyCode]: ev.key.toLowerCase()}
        mon.setLastKey(ev);
        return k;
      });
    }
    else if (ev.type === 'keyup') {
      mon.setKeys(k => {
        delete k[ev.realKeyCode];
        if (ev.realKeyCode === mon.lastKey.realKeyCode) {
          mon.setLastKey({});
        }
        return {...k};
      });
    }
  };

  useEffect(() => {
    const seq = Object.values(mon.keys).sort().join(" ");
    // if (seq.length > 0) console.log(seq);

    let stop = false;
    const triggers = mon.triggers[seq] || [];
    // console.log(mon.triggers);
    // console.log("checking triggers", mon.keys);
    for (let i = 0; i < triggers.length; i++) {
      const t = triggers[i];
      if (!stop && (t.override || !["INPUT","TEXTAREA","SELECT"].includes(mon.event.target.nodeName))) {
        stop = t.stop;
        t.handler(mon.event, mon.keys, t.element);
        if (!t.allowDefault) mon.event.preventDefault();
        // if (t.once) mon.setKeys({});
      }
    }
  }, [mon.keys, mon.triggers])

  mon.register = (t, ref) => {
    mon.setTriggers(trig => {
      let idx = {};
      const { children, noRepeat, stopPropagation, allowDefault, overrideInput, sequence=null, keys=[], ...cfg } = t;

      if (typeof keys === 'string') {
        keys.split(' ').forEach(k => cfg[k] = true);
      }

      if (sequence !== null) {

      }
      else if (typeof keys === 'array' && keys.length) {
        keys.forEach(k => {
          const seq = [...Object.keys(cfg), k].map(i => i.toLowerCase()).sort().join(" ");
          if (! trig[seq]) trig[seq] = [];
          if (! idx[seq]) idx[seq] = 0;
          // console.log(`inserting ${seq} @ ${idx[seq]} for ${ref.current}`)
          trig[seq].splice(idx[seq]++, 0, {element: ref.current, handler: children, stop: stopPropagation, once: noRepeat, override: overrideInput});
        })
      }
      else {
        const seq = Object.keys(cfg).map(i => i.toLowerCase()).sort().join(" ");
        if (! trig[seq]) trig[seq] = [];
        if (! idx[seq]) idx[seq] = 0;
        // console.log(`inserting ${seq} @ ${idx[seq]} for ${ref.current}`)
        trig[seq].splice(idx[seq]++, 0, {element: ref.current, handler: children, stop: stopPropagation, once: noRepeat, override: overrideInput});
      }
      return trig;
    })
  };

  mon.unregister = (t, ref) => {
    mon.setTriggers(trig => {
      const { children, noRepeat, stopPropagation, allowDefault, overrideInput, sequence=null, keys=[], ...cfg } = t;
      if (typeof keys === 'string') {
        keys.split(' ').forEach(k => cfg[k] = true);
      }

      if (sequence !== null) {

      }
      else if (typeof keys === 'array' && keys.length) {
        keys.forEach(k => {
          const seq = [...Object.keys(cfg), k].map(i => i.toLowerCase()).sort().join(" ");
          if (! trig[seq]) trig[seq] = [];
          trig[seq] = trig[seq].filter(i => i.element !== ref.current);
        })
      }
      else {
        const seq = Object.keys(cfg).map(i => i.toLowerCase()).sort().join(" ");
        if (! trig[seq]) trig[seq] = [];
        trig[seq] = trig[seq].filter(i => i.element !== ref.current);
      }
      return trig;
    })
  };

  return mon;
}

function KeyboardEvent (props) {
  const mon = useContext(KeyboardMonitorContext);
  const ref = useRef();

  useEffect(() => {
    mon.register(props, ref);

    return () => {
      mon.unregister(props, ref);
    }
  }, [])

  return (
    <span ref={ref} {...Object.fromEntries(Object.entries(props).map(([k, v]) => [`data-keyboard-event-${k}`, v]))}/>
  );
}

export default KeyboardMonitor;
export { KeyboardEvent, KeyboardMonitorContext };
