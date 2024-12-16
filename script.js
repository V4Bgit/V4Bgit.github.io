const scene = new vg.Scene(
  {
    element: document.getElementById("grid"),
    light: new THREE.DirectionalLight(0x16dfaa, 0.2),
    lightPosition: {
      x: 0,
      y: 0,
      z: 0
    },
    cameraPosition: {
      x: 0,
      y: 10,
      z: 0
    }
  },
  false
); // false to OrbitControls

const tweenCameraY = new TWEEN.Tween(scene.camera.position)
  .to({ y: 500 }, 3000)
  .start();

// this constructs the cells in grid coordinate space
const grid = new vg.HexGrid({
  cellSize: 18 // size of individual cells
});

grid.generate({
  size: 36 // size of the board
});

const mouse = new vg.MouseCaster(scene.container, scene.camera);
const board = new vg.Board(grid);

// this will generate extruded hexagonal tiles
board.generateTilemap({
  tileScale: 0.945,
  material: new THREE.MeshPhongMaterial({
    color: 0x080808
  })
});

scene.add(board.group);
scene.focusOn(board.group);
mouse.signal.add(function (evt, tile) {
  if (evt === vg.MouseCaster.OVER) {
    let cell = board.grid.pixelToCell(mouse.position);
    if (cell) {
      (function (cell) {
        let cells = board.grid.getNeighbors(cell, false);
        cells.forEach((item, index) => {
          let t = board.getTileAtCell(item);
          let tween = new TWEEN.Tween(t.position)
            .easing(TWEEN.Easing.Quadratic.Out)
            .to({ y: [10, 0] }, 500 + index * 80)
            .start();
        });
      })(cell);
    }
  }
}, this);

function bumpCells(cell) {
  let cells = [];

  let l = board.grid._directions.length;
  let f = Math.floor(Math.random() * l); // from
  let t = Math.floor(Math.random() * (l - 2)) + 3; // total

  for (let i = 0; i < t; i++) {
    let c = new vg.Cell();

    let j = i + f;
    if (j >= l) {
      j -= l;
    }

    c.copy(cell);
    c.add(board.grid._directions[j]);
    let n = board.grid.cells[board.grid.cellToHash(c)] || null;
    if (n) {
      cells.push(n);
    }
  }

  // add central cell
  cells.push(cell);

  cells.forEach((item, index) => {
    let t = board.getTileAtCell(item);
    if (t) {
      let tween = new TWEEN.Tween(t.position)
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ y: [20, 0] }, 600 + index * 80)
        .start();
    }
  });
}

let _time = 0;

update();

function update(time) {
  if (time - _time > 2000) {
    for (let i = 0; i < 2; i++) {
      let cell = board.grid.getRandomCell();
      (function (cell) {
        bumpCells(cell);
      })(cell);
    }

    _time = time;
  }

  mouse.update();
  scene.render();
  TWEEN.update();
  requestAnimationFrame(update);
}
