import React, { createContext } from 'react';
import * as Comp from './Components';

const Auric = createContext(null);

function AuricCoffer () {
  const auric = null;

  return (
    <Auric.Provider value={auric}>
      <Comp.MenuBar/>
      <Comp.AppWindow/>
    </Auric.Provider>
  )
}

export default AuricCoffer;