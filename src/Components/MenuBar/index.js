import React from 'react';
// import './style.css';

function MenuBar () {
  return (
    <div className="MenuBar">
      <MenuLogo/>
      <MenuItems/>
    </div>
  );
}


function MenuLogo () {
  return (
    <div className="MenuLogo">
      <img src="logo.svg" alt="Auric Coffer Logo"/>
    </div>
  )
}


function MenuItems () {
  const items = [ 'File', 'Edit', 'Help' ];

  return items.map((label, i) => (
    <div className="MenuItem" key={`MenuItem${i}`}>{label}</div>
  ))
}

export default MenuBar;
