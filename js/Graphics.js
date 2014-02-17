(function (TomatoJS, $, undefined)
{

TomatoJS.Graphics = function()
{
  // Canvas
  this.canvas = TomatoJS.Core.canvas;

  // Context
  this.context = this.canvas.getContext('2d');

  // Camera position
  this.camera = {};
  this.camera.x = 0;
  this.camera.y = 0;

  // Clear color
  this.clear_color = [50, 50, 50];

  // Enable debug drawing
  this.debugDrawEnabled = false;

  // Renderables
  this.renderables = [];
  this.sorted_renderables = [];
  this.debugLines = [];
}

TomatoJS.Graphics.prototype.AddRenderable = function(obj)
{
  this.renderables.push(obj);
  this.SortEverything();
}

TomatoJS.Graphics.prototype.RemoveRenderable = function(obj)
{
  for (var i = 0; i < this.renderables.length; ++i)
    if (this.renderables[i] == obj)
      this.renderables.splice(i, 1);

  this.SortEverything();
}

TomatoJS.Graphics.prototype.AddDebugLine = function(x1, y1, x2, y2, color)
{
  if (!this.debugDrawEnabled)
    return;

  this.debugLines.push({"x1": x1, "y1": y1, "x2": x2, "y2": y2, "color": color});
}

TomatoJS.Graphics.prototype.AddDebugVector = function(x, y, angle, length, color)
{
  if (!this.debugDrawEnabled)
    return;

  this.AddDebugLine(x, y, x + Math.cos(angle) * length, y + Math.sin(angle) * length, color);
}

TomatoJS.Graphics.prototype.AddDebugBox = function(x, y, width, height, color)
{
  if (!this.debugDrawEnabled)
    return;

  this.AddDebugLine(x, y, x + width, y, color);
  this.AddDebugLine(x + width, y, x + width, y + height, color);
  this.AddDebugLine(x + width, y + height, x, y + height, color);
  this.AddDebugLine(x, y + height, x, y, color);
}

TomatoJS.Graphics.prototype.Update = function(dt)
{
  // Clear
  this.context.fillStyle = 'rgb(' + this.clear_color[0] + ',' + this.clear_color[1] + ',' + this.clear_color[2] + ')';
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // Draw components
  for (var i in this.sorted_renderables)
  {
    var component = this.sorted_renderables[i];
    component.Draw(dt, this.context, this.camera);
  }

  // Draw debug
  this.context.lineWidth = 2;
  var lineFrom = [];
  var lineTo = [];
  for (var i in this.debugLines)
  {
    var line = this.debugLines[i];
    lineFrom = [(line.x1 - this.camera.x) * TomatoJS.CoreScale, (line.y1 - this.camera.y) * TomatoJS.CoreScale];
    lineTo = [(line.x2 - this.camera.x) * TomatoJS.CoreScale, (line.y2 - this.camera.y) * TomatoJS.CoreScale];

    // Cull lines off screen
    if (lineFrom[0] < 0 && lineTo[0] < 0)
      continue;
    if (lineFrom[1] < 0 && lineTo[1] < 0)
      continue;
    if (lineFrom[0] > TomatoJS.Core.canvas.width && lineTo[0] > TomatoJS.Core.canvas.width)
      continue;
    if (lineFrom[1] > TomatoJS.Core.canvas.height && lineTo[1] > TomatoJS.Core.canvas.height)
      continue;

    if (line.color)
      this.context.strokeStyle = line.color;
    else
      this.context.strokeStyle = "rgb(255, 255, 255)";
    this.context.beginPath();
    this.context.moveTo(lineFrom[0], lineFrom[1]);
    this.context.lineTo(lineTo[0], lineTo[1]);
    this.context.closePath();
    this.context.stroke();
  }
  this.debugLines = [];
}

TomatoJS.Graphics.prototype.SortEverything = function()
{
  // Sort objects
  this.sorted_renderables = [];
  for (var i in this.renderables)
    this.sorted_renderables.push(this.renderables[i]);
  this.sorted_renderables.sort(function(a, b)
  {
    return a.zdepth - b.zdepth;
  });
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));