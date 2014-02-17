(function (TomatoJS, $, undefined)
{

TomatoJS.AmbientLight = function()
{
  this.red = 0.1;
  this.green = 0.1;
  this.blue = 0.12;
  this.level = 0.1;
  this.zdepth = 100;
}

TomatoJS.AmbientLight.prototype.Initialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);
}

TomatoJS.AmbientLight.prototype.Uninitialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(this);
}

TomatoJS.AmbientLight.prototype.Draw = function(dt, context, camera)
{
  var r = Math.floor(this.red * 255);
  var g = Math.floor(this.green * 255);
  var b = Math.floor(this.blue * 255);

  context = TomatoJS.Core.GetSystem("Lighting").context;
  context.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
  context.fillRect(0, 0, TomatoJS.Core.canvas.width, TomatoJS.Core.canvas.height);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));