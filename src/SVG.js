import React from 'react';

function Defs ({children, ...props}) {
  return <defs {...props}>
    {children}
  </defs>
}


function G ({children, ...props}) {
  return <g {...props}>
    {children}
  </g>;
}


function Use ({href, at=[0,0], ...props}) {
  return <use href={href} x={at[0]} y={at[1]} {...props}/>
}


function Pattern ({at=[0,0], size, children, ...props}) {
  return <pattern x={at[0]} y={at[1]} width={size[0]} height={size[1]} {...props}>
    {children}
  </pattern>
}


function Line ({from=[0,0], to, ...props}) {
  return <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} {...props}/>
}


function Rect ({at=[0,0], size, ...props}) {
  if (props.r) {
    props.rx = props.r;
    delete props.r;
  }
  return <rect x={at[0]} y={at[1]} width={size[0]} height={size[1]} {...props}/>
}


function Circle ({at=[0,0], r, ...props}) {
  return <circle x={at[0]} y={at[1]} r={r} {...props}/>
}


function Mask ({children, ...props}) {
  return <mask {...props}>
    {children}
  </mask>
}


function Path ({...props}) {
  return <path {...props}/>
}


function Text ({at = [0,0], children, ...props}) {
  return <text x={at[0]} y={at[1]} {...props}>
    {children}
  </text>
}


export { Defs, G, Use, Pattern, Line, Rect, Circle, Mask, Path, Text };