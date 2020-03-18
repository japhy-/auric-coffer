import React, { createContext, useState } from 'react';
import * as Comp from '../../Components';

function SpriteEditor () {

  return (
    <>
              <div className="LeftPane">
                <div className="WorkSpace">
                  Sprites!
                </div>
              </div>
              <div className="RightPane">
                <div className="Console">
                  Console!
                </div>
              </div>
    </>
  );
}


export default SpriteEditor;
