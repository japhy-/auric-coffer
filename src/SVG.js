import React from 'react';


export function SVG ({children, width="100%", height="100%", ...props}) {
  return <svg
    xmlns="http://www.w3.org/2000/svg" version="1.1"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={width} height={height}
    {...props}
  >
    {children}
  </svg>
}


export function Defs ({children, ...props}) {
  return <defs {...props}>
    {children}
  </defs>
}


export function G ({children, ...props}) {
  return <g {...props}>
    {children}
  </g>;
}


export function Use ({href, at=[0,0], ...props}) {
  return <use href={href} x={at[0]} y={at[1]} {...props}/>
}


export function Pattern ({at=[0,0], size, children, ...props}) {
  return <pattern x={at[0]} y={at[1]} width={size[0]} height={size[1]} {...props}>
    {children}
  </pattern>
}


export function Line ({from=[0,0], to, ...props}) {
  return <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} {...props}/>
}


export function Rect ({at=[0,0], size, ...props}) {
  if (props.r) {
    props.rx = props.r;
    delete props.r;
  }
  return <rect x={at[0]} y={at[1]} width={size[0]} height={size[1]} {...props}/>
}


export function Circle ({at=[0,0], r, ...props}) {
  return <circle x={at[0]} y={at[1]} r={r} {...props}/>
}


export function Mask ({children, ...props}) {
  return <mask {...props}>
    {children}
  </mask>
}


export function Path ({...props}) {
  return <path {...props}/>
}


export function Text ({at = [0,0], children, ...props}) {
  return <text x={at[0]} y={at[1]} {...props}>
    {children}
  </text>
}


// export { Defs, G, Use, Pattern, Line, Rect, Circle, Mask, Path, Text };