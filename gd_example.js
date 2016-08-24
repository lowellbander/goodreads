var gd = require('node-gd');

var canvasWidth = 150;
var canvasHeight = 100;
var deltaX = canvasWidth / 6;

var img = gd.createSync(150, 100);

var white = img.colorAllocate(255,255,255);
var grey = img.colorAllocate(125, 125, 125);

var log = _ => console.log(_);

function dot (x, y) {
  var d = 5;
  img.filledEllipse(x, y, d, d, grey);
}

function drawTick(x) {
  var length = 5;
  var y = 10;
  img.line(x, y, x, y + length, grey);
}

function drawTicks({howMany, x}) {
  var spacing = 3;
  var offset = -5;
  for (var i = 0; i < howMany; ++i) {
    drawTick(x + (i * spacing) + offset);
  }
}

function draw() {

  for (var i = 1; i <= 5; ++i) {
    drawTicks({howMany: i, x: i * deltaX});
  }

  var l = [1, 2, 3, 4, 5];

  for (var i = 1; i <= 5; ++i) {
    dot(i * deltaX, 75);
  }

  
  img.saveFile('./test.png');
  img.destroy();
}

draw()
