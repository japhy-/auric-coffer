import React, { useState } from 'react';

import * as Comp from '../../Components';


function AppWindow () {
  const [ widget ] = useState('spriteEditor');

  return (
    <div className="AppWindow">
      <Switch variable={widget}>
        <Case value="spriteEditor">
          <Comp.SpriteEditor/>
        </Case>
        <Case value="gridEditor">
          <Comp.GridEditor/>
        </Case>
      </Switch>
    </div>
  )
}


function Switch ({variable, children}) {
  let match = null, usingDefault;

  React.Children.forEach(children, child => {
    if ((!match || usingDefault) && React.isValidElement(child) && child.type.name === 'Case') {
      if ((usingDefault = child.props.default) || child.props.value === variable) match = child.props.children;
    }
  });

  if (!usingDefault && match === null) console.log("<Switch> without a <Case default> rendering null");

  return match;
}


function Case () {
}

export default AppWindow;

// https://casesandberg.github.io/react-color/