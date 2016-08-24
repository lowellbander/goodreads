var gd = require('node-gd');

var canvasWidth = 150;
var canvasHeight = 120;
var deltaX = canvasWidth / 6;

var log = _ => console.log(_);

function drawDot ({x, y, color, img}) {
  var d = 4;
  img.filledEllipse(x, y, d, d, color);
}

function drawTick({x, color, img}) {
  var length = 5;
  var y = 110;
  img.line(x, y, x, y + length, color);
}

function drawTicks({howMany, x, img, color}) {
  var offset = howMany === 1 ? 0 : howMany;
  var spacing = 3;
  for (var i = 0; i < howMany; ++i) {
    drawTick({
      x: x + (i * spacing) - offset,
      color: color,
      img: img,
    });
  }
}

function drawHist({values, filename}) {
  var img = gd.createSync(canvasWidth, canvasHeight);
  var white = img.colorAllocate(255,255,255);
  var grey = img.colorAllocate(125, 125, 125);

  for (var i = 0; i < values.length; ++i) {
    var x = (i + 1) * deltaX;
    drawTicks({
      howMany: i + 1,
      x: x,
      img: img,
      color: grey,
    });
    drawDot({
      x: x,
      y: 105 - values[i],
      img: img,
      color: grey,
    });
  }

  img.saveFile(filename);
  img.destroy();
}

module.exports = drawHist;

