import React, { createContext, useState } from 'react';

const SVGMouseContext = createContext(null);

function useSVGMouse () {
  const [ xy, setXY ] = useState([null, null]);

  return { x: xy[0], y: xy[1], setXY };
}


export default useSVGMouse;
export { SVGMouseContext };