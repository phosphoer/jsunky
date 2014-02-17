(function (TomatoJS, $, undefined)
{

TomatoJS.EditorController = function(parent)
{
  this.parent = parent;
  this.speed = 120;
}

TomatoJS.EditorController.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.EditorController.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.EditorController.prototype.OnFrameBegin = function(dt)
{
  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.W))
    this.parent.y -= this.speed * dt;

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.S))
    this.parent.y += this.speed * dt;

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.A))
    this.parent.x -= this.speed * dt;

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.D))
    this.parent.x += this.speed * dt;

  var camera = TomatoJS.Core.GetSystem("Graphics").camera;
  var canvas = TomatoJS.Core.GetSystem("Graphics").canvas;
  var screenWidth = canvas.width / TomatoJS.CoreScale;
  var screenHeight = canvas.height / TomatoJS.CoreScale;

  camera.x = this.parent.x;
  camera.y = this.parent.y;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));