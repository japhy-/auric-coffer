import React, { useRef, createContext, useEffect, useContext, useState, useMemo } from "react";

const KeyboardMonitorContext = createContext({});
const KeyboardEventContext = createContext([]);

// https://stackoverflow.com/questions/4331092/finding-all-combinations-cartesian-product-of-javascript-array-values/4331713#4331713
function* cartesian (head, ...tail) {
  let remainder = tail.length ? cartesian(...tail) : [[]];
  for (let r of remainder) for (let h of head) yield [h, ...r];
};

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
      <span className="KeyboardMonitorWrapper" ref={mon.ref} tabIndex="-1" onKeyDown={mon.onKey}>
        {children}
      </span>
    </KeyboardMonitorContext.Provider>
  )
}

function useKeyboardMonitor () {
  const shiftedKeys = [
    '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?',
    'insert', 'delete', 'pageup', 'pagedown',
  ];

  const mon = {
    ref: useRef(),
    _lastKey: useRef({}),
  };

  [ mon.triggers, mon.setTriggers ] = useState({1: {}});
  [ mon.event, mon.setEvent ] = useState(null);

  [ mon.lastKey, mon.setLastKey ] = useState({});
  [ mon.queue, mon.setQueue ] = useState([]);
  [ mon.queueSize, mon.setQueueSize ] = useState(1);

  mon.eventToKey = (ev) => {
    const k = {
      meta: ev.metaKey && 'meta',
      ctrl: ev.ctrlKey && 'ctrl',
      alt: ev.altKey && 'alt',
      shift: ev.shiftKey && 'shift',
      key: ev.key.toLowerCase(),
      keyCode: ev.keyCode,
    };
    k.nonSpecialKey = !['shift','control','alt','meta'].includes(k.key) && k.key;
    k.id = [
      k.meta, k.ctrl, k.alt,
      !shiftedKeys.includes(k.key) && k.shift,
      k.nonSpecialKey,
    ].filter(i => i !== false).sort().join(' ');
    return k;
  };

  mon.keyBuildsOn = (k1, k2) => {
    if (k1.nonSpecialKey === false && k2.nonSpecialKey !== false) return false;
    for (let _ of ['meta', 'ctrl', 'alt', 'shift', 'nonSpecialKey']) {
      if (k1[_] !== false && k2[_] === false) return true;
      if (k1[_] === false && k2[_] !== false) return false;
    }
    return false;
  }

  mon.onKey = (ev) => {
    ev.persist();
    const k = mon.eventToKey(ev);
    let queue = mon.queue;
    if (k.id !== mon._lastKey.current.id) {
      if (mon.keyBuildsOn(k, mon._lastKey.current)) {
        mon.setLastKey(mon._lastKey.current = k);
        queue[queue.length-1] = k;
        mon.setQueue(queue);
      }
      else {
        mon.setLastKey(mon._lastKey.current = k);
        mon.setQueue(queue = [...mon.queue, k].slice(-mon.queueSize));
      }
    }

    let stop = false;

    for (let j = mon.queueSize; !stop && j >= 1; j--) {
      if (! mon.triggers[j]) continue;
      const seq = queue.slice(-j).map(i => i.id).join("   ");
      (mon.triggers[j][seq] || []).forEach(t => {
        if (!stop && (t.overrideInput || !["INPUT","TEXTAREA","SELECT"].includes(ev.target.nodeName))) {
          stop = t.stopPropagation;
          if (t.handler) t.handler({event: ev, queue: queue.slice(-j), element: t.ref});
          if (! t.subEvents.length) mon.setQueue([]);
          if (t.preventDefault) ev.preventDefault();
        }
      })
    }
  };

  mon.parseEvent = ({ children, stopPropagation=false, preventDefault=true, overrideInput=false, sequence=null, keys=[], handler=null, ...cfg }, ref, evs) => {
    const kev = {
      subEvents: [],
      sequences: [],
      parents: [...evs], // because we might push() to it, and don't want to mess with evs for real
      ref,
      stopPropagation,
      preventDefault,
      overrideInput,
      handler,
    };

    if (typeof children === 'function') kev.handler = children;
    else React.Children.forEach(children, c => React.isValidElement(c) && c.type.name === 'KeyboardEvent' && kev.subEvents.push(c));

    if (typeof keys === 'string') keys.split(' ').forEach(k => cfg[k] = true);
    const pressed = Object.keys(cfg).map(i => i.toLowerCase());
    const sequences = [];

    if (sequence !== null) {
      const seqs = sequence.toLowerCase().split(/\s+/).map(p => p.split(/(?:(?<!-)|(?<=--))-/).sort().join(" "));
      mon.setQueueSize(s => seqs.length > s ? seqs.length : s);

      const seq = seqs.pop();
      kev.parents.push(...seqs.map(i => [i]));
      sequences.push(seq);
    }
    else if (Array.isArray(keys) && keys.length) {
      keys.forEach(k => sequences.push([...pressed, k.toLowerCase()].sort().join(" ")));
    }
    else {
      sequences.push(pressed.sort().join(" "));
    }

    sequences.forEach(seq => kev.sequences.push(seq));

    return kev;
  };

  mon.register = (kev) => {
    mon.setTriggers(trigs => {
      const sequences = cartesian(...kev.parents, kev.sequences);
      const idx = {};
      [...sequences].forEach(seq => {
        const len = seq.length;
        mon.setQueueSize(s => len > s ? len : s);
        const s = seq.join("   ");
        if (! idx[s]) idx[s] = 0;
        if (! trigs[len]) trigs[len] = {};
        if (! trigs[len][s]) trigs[len][s] = [];

        trigs[len][s].splice(idx[s]++, 0, kev);
      })
      return trigs;
    })
  };

  mon.unregister = (kev) => {
    mon.setTriggers(trigs => {
      const sequences = cartesian(...kev.parents, kev.sequences);
      [...sequences].forEach(seq => {
        const len = seq.length;
        const s = seq.join("   ");
        if (trigs[len] && trigs[len][s]) trigs[len][s] = trigs[len][s].filter(i => i.ref !== kev.ref);
      })

      return trigs;
    })
  };

  return mon;
}


function KeyboardEvent (props) {
  const evs = useContext(KeyboardEventContext);
  const mon = useContext(KeyboardMonitorContext);
  const ref = useRef();
  const [ self, setSelf ] = useState({});
  
  useEffect(() => {
    setSelf(mon.parseEvent(props, ref, evs));

    return () => {
      mon.unregister(self);
    }
  }, [])

  useEffect(() => {
    if (self.ref) mon.register(self);
  }, [self]);

  return (
    <KeyboardEventContext.Provider value={[...evs, self.sequences]}>
      <span ref={ref} {...Object.fromEntries(Object.entries(props).map(([k, v]) => [`data-keyboard-event-${k}`, v]))}>
        {self.subEvents}
      </span>
    </KeyboardEventContext.Provider>
  );
}

export default KeyboardMonitor;
export { KeyboardEvent, KeyboardMonitorContext };
