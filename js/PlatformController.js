(function (TomatoJS, $, undefined)
{

TomatoJS.PlatformController = function(parent)
{
  this.parent = parent;
  this.speed = 80;
  this.jumpPower = 270;
  this.editorEnabled = false;
}

TomatoJS.PlatformController.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.PlatformController.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.PlatformController.prototype.OnFrameBegin = function(dt)
{
  if (TomatoJS.Core.editorEnabled)
    return;

  var collider = this.parent.GetComponent("TileCollider");
  var body = this.parent.GetComponent("RigidBody");

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.W) && collider && body && collider.grounded == true)
    body.velocityY = -this.jumpPower;

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.A))
    this.parent.x -= this.speed * dt;

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.D))
    this.parent.x += this.speed * dt;

  var graphics = TomatoJS.Core.GetSystem("Graphics");
  var camera = graphics.camera;
  var canvas = graphics.canvas;
  var screenWidth = canvas.width / TomatoJS.CoreScale;
  var screenHeight = canvas.height / TomatoJS.CoreScale;

  if (this.parent.x - camera.x > screenWidth - 50)
    camera.x += (this.parent.x - camera.x) - (screenWidth - 50);
  else if (this.parent.x - camera.x < 50)
    camera.x -= 50 - (this.parent.x - camera.x);

  if (this.parent.y - camera.y > screenHeight - 50)
    camera.y += (this.parent.y - camera.y) - (screenHeight - 50);
  else if (this.parent.y - camera.y < 50)
    camera.y -= 50 - (this.parent.y - camera.y);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));