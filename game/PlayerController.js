(function (TomatoJS, $, undefined)
{

TomatoJS.PlayerController = function(parent)
{
  this.parent = parent;
  this.zdepth = 30;
  this.moveSpeed = 50;

  this.shootHeat = 0.6;
  this.maxHeat = 5;
  this.heat = 0;
  this.overheated = false;
}

TomatoJS.PlayerController.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
  TomatoJS.Core.AddEventListener("OnKeyDown", this);
  TomatoJS.Core.AddEventListener("OnTouchMove", this);
  TomatoJS.Core.AddEventListener("OnTouchDown", this);
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);
}

TomatoJS.PlayerController.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
  TomatoJS.Core.RemoveEventListener("OnKeyDown", this);
  TomatoJS.Core.RemoveEventListener("OnTouchMove", this);
  TomatoJS.Core.RemoveEventListener("OnTouchDown", this);
  TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(this);
}

TomatoJS.PlayerController.prototype.OnCollide = function(obj)
{
  if (obj.GetComponent("BulletController") && obj.GetComponent("BulletController").team == 1)
  {
    this.parent.GetComponent("AudioEmitter").PlayBank("Death", 0.6);
    this.parent.Destroy();
    obj.Destroy();
    TomatoJS.Core.GetSystem("Game").Lose();
  }
}

TomatoJS.PlayerController.prototype.OnKeyDown = function(keyCode)
{
  if (keyCode == TomatoJS.Core.input.SPACE)
    this.Shoot();
}

TomatoJS.PlayerController.prototype.OnTouchMove = function(event)
{
  if (event.moveX < 0)
    this.parent.x -= this.moveSpeed * this.dt;
  else if (event.moveX > 0)
    this.parent.x += this.moveSpeed * this.dt;
}

TomatoJS.PlayerController.prototype.OnTouchDown = function(event)
{
  if (event.canvasY < 2 * TomatoJS.Core.canvas.height / 3)
  {
    this.Shoot();
  }
}

TomatoJS.PlayerController.prototype.OnFrameBegin = function(dt)
{
  if (TomatoJS.Core.editorEnabled)
    return;

  // Timers
  this.dt = dt;
  this.reloadTimer += dt;

  // Heat
  this.heat -= dt;

  if (this.heat > this.maxHeat && !this.overheated)
  {
    this.overheated = true;
    this.parent.GetComponent("AudioEmitter").PlayBank("Overheat", 0.6);
  }

  if (this.heat <= 0)
  {
    this.heat = 0;
    this.overheated = false;
  }

  // Move controls
  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.A))
    this.parent.x -= this.moveSpeed * dt;

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.D))
    this.parent.x += this.moveSpeed * dt;

  // Keep on screen
  var renderable = this.parent.GetComponent("Renderable");
  if (this.parent.x - renderable.image.width / 2 < 0)
    this.parent.x = renderable.image.width / 2;

  if (this.parent.x + renderable.image.width / 2 > TomatoJS.Core.canvas.width / TomatoJS.CoreScale)
    this.parent.x = TomatoJS.Core.canvas.width / TomatoJS.CoreScale - renderable.image.width / 2;
}

TomatoJS.PlayerController.prototype.Draw = function(dt, context, camera)
{
  var heatPercent = this.heat / this.maxHeat;
  context.fillStyle = "rgb(50, 50, 50)";
  context.fillRect(10, TomatoJS.Core.canvas.height - 35, 105, 30);
  context.fillStyle = "rgb(255, 50, 50)";
  context.fillRect(15, TomatoJS.Core.canvas.height - 30, 100 * heatPercent, 20);
}

TomatoJS.PlayerController.prototype.Shoot = function()
{
  var renderable = this.parent.GetComponent("Renderable");

  if (this.overheated)
    return;

  // Spawn bullet
  var bullet = TomatoJS.Core.LoadGameObject("Bullet.json");
  bullet.x = this.parent.x;
  bullet.y = this.parent.y - renderable.image.height / 2;

  // Reset timer
  this.reloadTimer = 0;
  this.heat += this.shootHeat;

  this.parent.GetComponent("AudioEmitter").PlayBank("Shoot", 0.6);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));