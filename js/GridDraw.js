(function (TomatoJS, $, undefined)
{

TomatoJS.GridDraw = function(parent, image_url, scale)
{
  this.parent = parent;
  this.tileSize = 1;
  this.zdepth = 0;
}

TomatoJS.GridDraw.prototype.Initialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);
}

TomatoJS.GridDraw.prototype.Uninitialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(this);
}

TomatoJS.GridDraw.prototype.Draw = function(dt, context, camera)
{
  var graphics = TomatoJS.Core.GetSystem("Graphics");

  context.beginPath();
  context.strokeStyle = "rgba(200, 200, 200, .6)";

  var tileSize = this.tileSize * TomatoJS.CoreScale;

  var offsetX = (camera.x * TomatoJS.CoreScale) % tileSize;
  var offsetY = (camera.y * TomatoJS.CoreScale) % tileSize;

  var maxX = (Math.ceil(graphics.canvas.width / tileSize) + 1) * tileSize;
  var maxY = (Math.ceil(graphics.canvas.height / tileSize) + 1) * tileSize;

  for (var i = 0; i < graphics.canvas.width / tileSize + 1; ++i)
  {
    context.moveTo(i * tileSize - offsetX, -offsetY - tileSize);
    context.lineTo(i * tileSize - offsetX, maxY - offsetY);
  }

  for (var j = 0; j < graphics.canvas.height / tileSize + 1; ++j)
  {
    context.moveTo(-offsetX - tileSize, j * tileSize - offsetY);
    context.lineTo(maxX - offsetX, j * tileSize - offsetY);
  }

  context.stroke();
  context.closePath();
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));