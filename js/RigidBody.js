(function (TomatoJS, $, undefined)
{

TomatoJS.RigidBody = function(parent)
{
  this.parent = parent;
  this.gravity = 1000;
  this.friction = 1.0;
  this.velocityX = 0;
  this.velocityY = 0;
}

TomatoJS.RigidBody.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.RigidBody.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin",  this);
}

TomatoJS.RigidBody.prototype.OnFrameBegin = function(dt)
{
  this.velocityX *= this.friction;
  this.velocityY *= this.friction;

  this.velocityY += this.gravity * dt;

  this.parent.x += this.velocityX * dt;
  this.parent.y += this.velocityY * dt;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));