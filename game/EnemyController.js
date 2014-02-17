(function (TomatoJS, $, undefined)
{

TomatoJS.EnemyController = function(parent)
{
  this.parent = parent;

  this.reloadTime = 2;
  this.reloadTimer = 0;

  this.behaviors =
  [
    this.BehaviorInvader,
    this.BehaviorSine,
    this.BehaviorEllipse,
    this.BehaviorCircles
  ];
  this.behavior = 0;

  this.direction = [1, 1];
  this.position = [0, 0];
  this.time = 0;
}

TomatoJS.EnemyController.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
  ++TomatoJS.Core.GetSystem("Game").numEnemies;
}

TomatoJS.EnemyController.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
  --TomatoJS.Core.GetSystem("Game").numEnemies;
}

TomatoJS.EnemyController.prototype.OnCollide = function(obj)
{
  if (obj.GetComponent("BulletController") && obj.GetComponent("BulletController").team == 0)
  {
    TomatoJS.Core.GetSystem("Game").score += 100;
    this.parent.GetComponent("AudioEmitter").PlayBank("Death", 0.6);
    this.parent.Destroy();
    obj.Destroy();

    var explosion = TomatoJS.Core.LoadGameObject("Explosion.json");
    explosion.x = this.parent.x;
    explosion.y= this.parent.y;
  }
}

TomatoJS.EnemyController.prototype.OnFrameBegin = function(dt)
{
  if (TomatoJS.Core.editorEnabled)
    return;

  // Timers
  this.reloadTimer += dt;
  this.time += dt;

  // Move
  this.behavior = Math.min(this.behavior, this.behaviors.length - 1);
  if (this.behaviors[this.behavior])
  {
    var func = this.behaviors[this.behavior];
    func.apply(this, [dt]);
  }

  // Shoot
  if (this.reloadTimer > this.reloadTime)
  {
    this.Shoot();
  }

  // End if hit bottom
  if (this.parent.y > TomatoJS.Core.canvas.height / TomatoJS.CoreScale)
    TomatoJS.Core.GetSystem("Game").Lose();
}

TomatoJS.EnemyController.prototype.Shoot = function()
{
  var renderable = this.parent.GetComponent("Renderable");

  // Spawn bullet
  var bullet = TomatoJS.Core.LoadGameObject("Bullet.json", true);
  bullet.x = this.parent.x;
  bullet.y = this.parent.y + renderable.image.height / 2;
  bullet.GetComponent("BulletController").direction = 1;
  bullet.GetComponent("BulletController").team = 1;
  bullet.GetComponent("Renderable").imageURL = "part-4.png";
  bullet.Initialize();

  // Reset timer
  this.reloadTimer = 0;
}

TomatoJS.EnemyController.prototype.BehaviorInvader = function(dt)
{
  this.parent.x += this.direction[0] * 60 * dt;

  var renderable = this.parent.GetComponent("Renderable");
  if (this.parent.x - renderable.image.width / 2 < 0 && this.direction[0] == -1)
  {
    this.direction[0] = 1;
    this.parent.y += renderable.image.height;
  }

  if (this.parent.x + renderable.image.width / 2 > TomatoJS.Core.canvas.width / TomatoJS.CoreScale && this.direction[0] == 1)
  {
    this.direction[0] = -1;
    this.parent.y += renderable.image.height;
  }
}

TomatoJS.EnemyController.prototype.BehaviorSine = function(dt)
{
  this.parent.x = (Math.sin(this.parent.y / 5) + 1) * TomatoJS.Core.canvas.width / TomatoJS.CoreScale / 2;
  this.parent.y += 5 * dt;
}

TomatoJS.EnemyController.prototype.BehaviorEllipse = function(dt)
{
  this.parent.x = Math.cos(this.time) * 50 + TomatoJS.Core.canvas.width / TomatoJS.CoreScale / 2;
  this.parent.y = Math.sin(this.time) * 30 + TomatoJS.Core.canvas.height / TomatoJS.CoreScale / 2 - 30;
}

TomatoJS.EnemyController.prototype.BehaviorCircles = function(dt)
{
  this.position[0] += this.direction[0] * 10 * dt;
  this.position[1] = TomatoJS.Core.canvas.height / TomatoJS.CoreScale / 2 - 30;

  var renderable = this.parent.GetComponent("Renderable");
  if (this.parent.x - renderable.image.width / 2 < 0 && this.direction[0] == -1)
  {
    this.direction[0] = 1;
  }

  if (this.parent.x + renderable.image.width / 2 > TomatoJS.Core.canvas.width / TomatoJS.CoreScale && this.direction[0] == 1)
  {
    this.direction[0] = -1;
  }

  this.parent.x = Math.cos(this.time) * 40 + this.position[0];
  this.parent.y = Math.sin(this.time) * 40 + this.position[1];
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));