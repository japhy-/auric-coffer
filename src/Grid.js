const Grid = (config) => {
  const G = {strokeWidth: 3, ...config};

  if (! SVG) {
    const js = document.createElement('script');
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.0.13/svg.min.js";
    document.body.appendChild(js);
  }

  const div = document.getElementById(G.id) || ((doc) => {
    const d = doc.createElement('div');
    d.id = G.id;
    doc.body.appendChild(d);
    return d;
  })(document);
  
  div.style = `width: ${(2+G.width) * G.square}px; height: ${(2+G.height) * G.square}px`; // ; border: ${2*G.strokeWidth}px solid silver`;

  const g = G.svg = SVG().addTo(`#${G.id}`).size('100%','100%').viewbox(`${-G.square} ${-G.square} ${(2+G.width) * G.square} ${(2+G.height) * G.square}`);

  G.defs = {};
  G.masks = {};

  G.defs.gridHorizontal = g.defs().line(0, 0, G.width*G.square, 0).stroke({color: 'gray', width: 1, dasharray: [1,3]});
  G.defs.gridVertical = g.defs().line(0, 0, 0, G.height*G.square).stroke({color: 'gray', width: 1, dasharray: [1,3]});

  G.defs.patternRubble = g.pattern(G.square, 2*G.strokeWidth, (a) => {
    a.line(0,0, G.square, 0).stroke({color: 'gray', width: G.strokeWidth});
  }).rotate(45);

  G.defs.rubbleVert = g.defs().rect(G.strokeWidth*2, G.square).fill('white'); // .fill(G.defs.patternRubble);
  G.defs.rubbleHoriz = g.defs().rect(G.square, G.strokeWidth*2).fill('white'); // fill(G.defs.patternRubble);

  G.defs.wall = g.defs().line(0, 0, G.square, 0);

  G.masks.arch = g.defs().line(0, 0, G.square, 0).stroke({width: G.strokeWidth, color: 'white'});

  G.defs.arch = g.defs().group()
    .add(g.defs()
      .path(`
        M 0             0 h ${G.square/4}
        m ${G.square/2} 0 h ${G.square/4}
      `)
      .stroke({width: G.strokeWidth})
    )
    .add(g.defs()
      .path(`
        M ${G.square/4} 0
        A ${G.square/4} ${G.square/4} 0 0 1 ${3*G.square/4} 0
        v ${G.square/6}
        h -${G.square/8}
        v -${G.square/6}
        A ${G.square/8} ${G.square/8} 0 0 0 ${3*G.square/8} 0
        v ${G.square/6}
        h -${G.square/8}
        z
      `)
      .stroke({width: G.strokeWidth/2}).fill('white')
    )

  G.defs.door = g.defs().group()
    .add(g.use(G.defs.wall).stroke({width: G.strokeWidth}))
    .add(g.defs()
      .rect(G.square/2, G.square/4)
      .move(G.square/4, -G.square/8)
      .stroke({width: G.strokeWidth/2})
      .fill('white')
    )

  G.defs.doorSecret = g.defs().group()
    .add(g.use(G.defs.wall).stroke({width: G.strokeWidth}))
    .add(g.defs()
      .plain("S")
      .font({family: 'verdana', size: G.square/2, anchor: 'middle'})
      .dmove(G.square/2, G.square/5.5)
    )

  G.defs.doorBlocked = g.defs().group()
    .add(g.use(G.defs.door))
    .add(g.defs()
      .path(`
        M ${G.square/4} -${G.square/8} L ${3*G.square/4}  ${G.square/8}
        M ${G.square/4}  ${G.square/8} L ${3*G.square/4} -${G.square/8}
      `)
      .stroke({width: G.strokeWidth/2})
    )

  G.defs.doorHalf = g.defs().group()
    .add(g.defs().rect(G.square/2, G.square/8).move(G.square/4, -G.square/7).stroke({width: G.strokeWidth/2}).fill('white'))
    .add(g.use(G.defs.wall).stroke({width: G.strokeWidth}))

  G.layers = {};

  G.layers.grid = g.group();
  G.layers.walls = g.group();

  G.masks.rubble = g.defs().group();
  G.layers.rubble = g.rect(G.width*G.square + 2*G.strokeWidth, G.height*G.square + 2*G.strokeWidth)
    .move(-G.strokeWidth, -G.strokeWidth)
    .fill(G.defs.patternRubble)
    .maskWith(G.masks.rubble);

  for (let y = 0; y <= G.height; y++) {
    G.layers.grid.use(G.defs.gridHorizontal).move(0, y*G.square);
    if (y < G.height) G.layers.grid.text(`${y}`).font({family:'garamond'}).move(0.75 * -G.square, (0.25 + y)*G.square);
  }

  for (let x = 0; x <= G.width; x++) {
    G.layers.grid.use(G.defs.gridVertical).move(x*G.square, 0);
    if (x < G.width) G.layers.grid.text(`${x}`).font({family:'garamond'}).move((0.25 + x)*G.square, 0.75 * -G.square);
  }

  G.lines = {};

  g.mouseout((ev) => {
    if (! ev.fromElement.contains(ev.toElement)) clearTarget(G);
  });

  g.mouseup((ev) => {
    G._restrict = null;
  })

  g.mousemove((ev) => {
    const t = mouseTarget(G, ev);
    clearTarget(G);

    console.log(t.ok, t.type);

    if (! t.ok) return;

    if (t.type == 'H' || t.type == 'V') {
      //if (G._restrict && t.type != G._restrict.dir) return; // && ((t.type == 'H' ? t.x : t.y) != G._restrict[t.type])) return;
      setTarget(G, macros.wall(G.svg, G, t.x1, t.y1, t.x2, t.y2, {color:'green', opacity: 0.5, dasharray:[3,1]}));
    }
    else if (t.type == 'C') {
      //setTarget(G, macros.corner(G.svg, G, t.x, t.y, {color:'red'}));
      return;
    }
    else if (t.type == 'S') {
      //setTarget(G, macros.square(G.svg, G, t.x, t.y, {color:'red'}));
      return;
    }

    if (ev.buttons == 1) {
      G._killClick = true;
      G._restrict = { dir: t.type, H: t.x, V: t.y };
      // console.log(G._restrict, t);
      placeObject(G, t);
    }
  
    else if (ev.buttons == 2) {
      G._killClick = true;
      clearObject(G, t);
    }
  });
  
  // left click
  g.click((ev) => {
    if (G._killClick) {
      G._killClick = false;
      return;
    }
  
    const t = mouseTarget(G, ev);
    if (! t.ok) return;
  
    //console.log('click');
    placeObject(G, t, true);
  });
  
  // right click
  g.on('contextmenu', (ev) => {
    if (G._killClick) {
      ev.preventDefault();
      G._killClick = false;
      return;
    }
  
    ev.preventDefault();
  
    const t = mouseTarget(G, ev);
    if (! t.ok) return;
  
    //console.log('click');
    clearObject(G, t);
  });  

};


const clearTarget = (G) => {
  if (G._target) {
    G._target.remove();
    G._target = null;
  }
};


const setTarget = (G, target) => {
  G._target = target;
};


const mouseTarget = (G, ev) => {
  let x = ev.offsetX - G.square;
  let y = ev.offsetY - G.square;

  if (x < -G.tolerance || x > G.width * G.square + G.tolerance) return { ok: false };
  if (y < -G.tolerance || y > G.height * G.square + G.tolerance) return { ok: false };

  let x1, x2, y1, y2;
  const on_x = (x % G.square >= (G.square-G.tolerance) || x % G.square < G.tolerance);
  const on_y = (y % G.square >= (G.square-G.tolerance) || y % G.square < G.tolerance);

  // console.log(`${x},${y}`)

  if (on_x && on_y) {
    x1 = Math.round(x/G.square) * G.square - G.tolerance*1.5;
    y1 = Math.round(y/G.square) * G.square - G.tolerance*1.5;
    return { ok: false && true, x: x1, y: y1, type: 'C' };
  }
  else if (on_x) {
    y1 = Math.floor(y/G.square) * G.square;
    y2 = Math.ceil(y/G.square) * G.square;
    x1 = x2 = Math.round(x/G.square) * G.square;
    return { ok: true, x1, x2, y1, y2, x: x1/G.square, y: y1/G.square, type: 'V' };
  }
  else if (on_y) {
    x1 = Math.floor(x/G.square) * G.square;
    x2 = Math.ceil(x/G.square) * G.square;
    y1 = y2 = Math.round(y/G.square) * G.square;
    return { ok: true, x1, x2, y1, y2, x: x1/G.square, y: y1/G.square, type: 'H' };
  }
  else {
    x1 = Math.floor(x/G.square) * G.square + G.tolerance/2;
    y1 = Math.floor(y/G.square) * G.square + G.tolerance/2;

    return { ok: false && true, x: x1, y: y1, type: 'S' };
  }
};

const objectCycle = {
  wall: 'rubble',
  rubble: 'door',
  door: 'doorBlocked',
  doorBlocked: 'doorSecret',
  doorSecret: 'doorNE',
  doorNE: 'doorSW',
  doorSW: 'arch',
  arch: null
};

const placeObject = (G, t, cycle=false) => {
  if (! t.ok) return;

  const { x, y, x1, y1, x2, y2, type } = t;
  let macro = 'wall';
  
  if (G.lines[x1 + ',' + y1 + ',' + x2 + ',' + y2]) {
    if (! cycle) return;

    let [ mac, obj ] = G.lines[x1 + ',' + y1 + ',' + x2 + ',' + y2];

    clearObject(G, t);
    macro = objectCycle[mac];
    if (macro === null) return;
  }

  console.log(`add ${macro} ${type} @ ${x}, ${y}`);
  G.lines[x1 + ',' + y1 + ',' + x2 + ',' + y2] = [macro, macros[macro](G.svg, G, x1,y1, x2,y2)];
};

const clearObject = (G, t) => {
  if (! t.ok) return;

  const { x, y, x1, y1, x2, y2, type } = t;

  if (G.lines[x1 + ',' + y1 + ',' + x2 + ',' + y2]) {
    //console.log(`del ${type} @ ${x}, ${y}`);
    G.lines[x1 + ',' + y1 + ',' + x2 + ',' + y2][1].remove();
    G.lines[x1 + ',' + y1 + ',' + x2 + ',' + y2] = null;
  }
}

const macros = {
  corner: (g, G, x, y, opts={}) => {
    return g
      .circle(G.tolerance*3)
      .stroke({width:G.strokeWidth/2, dasharray: [2,2], color: 'black', ...opts})
      .fill({opacity: 0})
      .move(x,y);
  },
  square: (g, G, x, y, opts={}) => {
    return g
      .rect(G.square - G.tolerance, G.square - G.tolerance)
      .stroke({width:G.strokeWidth/2, dasharray: [2,2], color: 'black', ...opts})
      .fill({opacity: 0})
      .move(x,y);
  },

  wall: (g, G, x1, y1, x2, y2, opts={}) => {
    const vert = (x1 == x2);

    return g
      .use(G.defs.wall)
      .stroke({width: G.strokeWidth, color: 'black', ...opts})
      .move(x1,y1)
      .rotate(vert ? 90 : 0, x1, y1);
  },
  rubble: (g, G, x1, y1, x2, y2, opts={}) => {
    const vert = (x1 == x2);

    return G.masks.rubble
      .use(vert ? G.defs.rubbleVert : G.defs.rubbleHoriz)
      .move(x1 - G.strokeWidth * vert, y1 - G.strokeWidth * !vert)
    ;
  },

  arch: (g, G, x1, y1, x2, y2, opts={}) => {
    const vert = (x1 == x2);

    return g
      .use(G.defs.arch)
      .stroke({color: 'black', ...opts})
      .move(x1, y1)
      .rotate(vert ? 90 : 0, x1, y1);
  },
  door: (g, G, x1, y1, x2, y2, opts={}) => {
    const vert = (x1 == x2);

    return g
      .use(G.defs.door)
      .stroke({color: 'black', ...opts})
      .move(x1, y1)
      .rotate(vert ? 90 : 0, x1, y1);
  },
  doorSecret: (g, G, x1, y1, x2, y2, opts={}) => {
    const vert = (x1 == x2);

    return g
      .use(G.defs.doorSecret)
      .stroke({color: 'black', ...opts})
      .move(x1, y1)
      .rotate(vert ? 90 : 0, x1, y1);
  },
  doorBlocked: (g, G, x1, y1, x2, y2, opts={}) => {
    const vert = (x1 == x2);

    return g
      .use(G.defs.doorBlocked)
      .stroke({color: 'black', ...opts})
      .move(x1, y1)
      .rotate(vert ? 90 : 0, x1, y1);
  },
  doorNE: (g, G, x1, y1, x2, y2, opts={}) => {
    const vert = (x1 == x2);

    return g
      .use(G.defs.doorHalf)
      .stroke({color: 'black', ...opts})
      .move(x1, y1)
      .rotate(vert ? 90 : 0, x1, y1);
  },
  doorSW: (g, G, x1, y1, x2, y2, opts={}) => {
    const vert = (x1 == x2);
    const h = G.defs.doorHalf.height();
    if (vert) x1 -= h, x2 -= h;
    else y1 += h, y2 += h;

    return macros.doorNE(g, G, x1,y1, x2,y2, opts).rotate(180);
  },
};

/*

secret door S
stairs =

https://code.sololearn.com/WxC4pyrQahu9/#html
https://www.w3.org/Graphics/SVG/IG/resources/svgprimer.html
https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial
https://svgjs.com/docs/3.0/

*/