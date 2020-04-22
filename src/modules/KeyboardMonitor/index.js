import React, { useRef, createContext, useEffect, useContext, useState } from "react";

const KeyboardMonitorContext = createContext({});

function KeyboardMonitor ({children, ...props}) {
  const mon = useKeyboardMonitor();

  useEffect(() => {
    mon.ref.current.focus();
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

  [ mon.triggers, mon.setTriggers ] = useState({});
  [ mon.event, mon.setEvent ] = useState(null);
  [ mon.keys, mon.setKeys ] = useState({});
  [ mon.lastKey, mon.setLastKey ] = useState({});

  mon.onKey = (ev) => {
    ev.persist();
    mon.setEvent(ev);

    if (ev.type === 'keydown') {
      mon.setKeys(k => {
        if (ev.keyCode !== mon.lastKey.keyCode) k = {...k, [ev.keyCode]: ev.key.toLowerCase()}
        mon.setLastKey(ev);
        return k;
      });
    }
    else if (ev.type === 'keyup') {
      mon.setKeys(k => {
        delete k[ev.keyCode];
        if (ev.keyCode === mon.lastKey.keyCode) mon.setLastKey({});
        return {...k};
      });
    }
  };

  useEffect(() => {
    const seq = Object.values(mon.keys).sort().join(" ");
    // if (seq.length > 0) console.log(seq);

    let stop = false;

    (mon.triggers[seq] || []).forEach(t => {
      if (! stop && !(t.pure && ["INPUT","TEXTAREA","SELECT"].includes(mon.event.target.nodeName))) {
        stop = t.stop;
        console.log("triggering");
        try { t.handler(t.element, mon.keys) } catch (err) { }
        console.log("triggered");
        // if (t.once) mon.setKeys({});
      }
    })
  }, [mon.keys, mon.triggers])

  mon.register = (t, ref) => {
    mon.setTriggers(trig => {
      let idx = {};
      const { children, noRepeat, stopPropagation, nonInput, keys=[], ...cfg } = t;
      if (keys.length) {
        keys.forEach(k => {
          const seq = [...Object.keys(cfg), k].map(i => i.toLowerCase()).sort().join(" ");
          if (! trig[seq]) trig[seq] = [];
          if (! idx[seq]) idx[seq] = 0;
          // console.log(`inserting ${seq} @ ${idx[seq]} for ${ref.current}`)
          trig[seq].splice(idx[seq]++, 0, {element: ref.current, handler: children, stop: stopPropagation, once: noRepeat, pure: nonInput});
        })
      }
      else {
        const seq = Object.keys(cfg).map(i => i.toLowerCase()).sort().join(" ");
        if (! trig[seq]) trig[seq] = [];
        if (! idx[seq]) idx[seq] = 0;
        // console.log(`inserting ${seq} @ ${idx[seq]} for ${ref.current}`)
        trig[seq].splice(idx[seq]++, 0, {element: ref.current, handler: children, stop: stopPropagation, once: noRepeat, pure: nonInput});
      }
      return trig;
    })
  };

  mon.unregister = (t, ref) => {
    mon.setTriggers(trig => {
      const { children, noRepeat, stopPropagation, nonInput, keys=[], ...cfg } = t;
      if (keys.length) {
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
