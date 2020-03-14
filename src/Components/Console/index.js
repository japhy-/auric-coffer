import React from 'react';

function Console ({children, ...props}) {
  return (
    <div className="Console">
      {children}
    </div>
  );
}

export default Console;
