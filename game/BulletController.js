(function (TomatoJS, $, undefined)
{

TomatoJS.BulletController = function(parent)
{
  this.parent = parent;
  this.moveSpeed = 100;
  this.direction = -1;
  this.team = 0;
}

TomatoJS.BulletController.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.BulletController.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.BulletController.prototype.OnFrameBegin = function(dt)
{
  if (TomatoJS.Core.editorEnabled)
    return;

  // Move
  this.parent.y += this.moveSpeed * this.direction * dt;

  // Destroy off screen
  if (this.parent.GetComponent("Renderable").IsOffScreen())
    this.parent.Destroy();
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));