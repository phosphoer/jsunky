(function (TomatoJS, $, undefined)
{

TomatoJS.Game = function()
{
  this.numEnemies = 0;
  this.zdepth = 100;

  this.reloadTimes =
  [
    2,
    1.5,
    1.5,
    1,
    1,
    0.8,
    0.8,
    0.5,
    0.3
  ];

  this.spawnTypes =
  [
    1,
    1,
    1,
    2,
    2,
    2,
    3,
    3,
    3
  ];

  this.spawnTimes =
  [
    0.5,
    0.4,
    0.3,
    0.5,
    0.4,
    0.3,
    0.5,
    0.4,
    0.3
  ];

  this.behaviors =
  [
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    3
  ];

  this.spawnCounts =
  [
    10,
    15,
    20,
    22,
    25,
    26,
    30,
    35,
    42
  ];
}

TomatoJS.Game.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnTouchDown", this);

  TomatoJS.Core.GetSystem("Graphics").clear_color = [20, 20, 30];
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);

  TomatoJS.Core.audio.AddSound("res/sounds/overheat.wav", "Overheat", 1);
  TomatoJS.Core.audio.AddSound("res/sounds/death.wav", "Death", 1);
  TomatoJS.Core.audio.AddSound("res/sounds/explosion.wav", "Explosion", 3);
  TomatoJS.Core.audio.AddSound("res/sounds/shoot.wav", "Shoot", 3);
  TomatoJS.Core.audio.AddSound("res/sounds/wave.wav", "Wave", 1);
  TomatoJS.Core.audio.AddSound("res/sounds/gameover.wav", "Game Over", 1);
  TomatoJS.Core.audio.AddSound("res/sounds/jsunky2.mp3", "Music", 1);

  this.StartGame();
}

TomatoJS.Game.prototype.OnTouchDown = function(event)
{
  if (this.gameover && this.gameoverTimer > this.gameoverTime)
  {
    this.StartGame();
  }
}

TomatoJS.Game.prototype.Update = function(dt)
{
  if (TomatoJS.Core.editorEnabled)
    return;

  // Timers
  this.spawnTimer += dt;

  if (this.gameover)
  {
    this.gameoverTimer += dt;
    if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.SPACE) && this.gameoverTimer > this.gameoverTime)
    {
      this.StartGame();
    }
    return;
  }

  // Check if wave complete
  if (this.numEnemies == 0 && !this.spawning)
  {
    this.waveTimer += dt;

    if (this.waveTimer > this.waveTime)
    {
      ++this.wave;
      this.waveTimer = 0;
      this.spawning = true;
      this.spawnCounter = 0;
      this.spawnType = Math.round(Math.random() * 2 + 1);
      this.score += 500;
      TomatoJS.Core.audio.PlaySound("Wave");
    }
  }

  // Spawn enemies
  if (this.spawning && this.spawnTimer > this.spawnTimes[this.wave])
  {
    this.spawnTimer = 0;

    var enemy = TomatoJS.Core.LoadGameObject("Enemy.json", true);
    enemy.x = this.spawnX;
    enemy.y = this.spawnY;
    enemy.GetComponent("Renderable").imageURL = "enemy-" + this.spawnTypes[this.wave] + ".png";
    var controller = enemy.GetComponent("EnemyController");
    controller.reloadTime = this.reloadTimes[this.wave];
    controller.behavior = this.behaviors[this.wave];
    enemy.Initialize();

    ++this.spawnCounter;
    if (this.spawnCounter >= this.spawnCounts[this.wave])
    {
      this.spawnCounter = 0;
      this.spawning = false;
    }
  }
}

TomatoJS.Game.prototype.Draw = function(dt, context, camera)
{
  context.save();
  context.font = "16px Space";
  context.fillStyle = "rgb(200, 200, 250)";
  context.fillText("Score: " + this.score, 10, 20);
  context.fillText("High Score: " + this.highScore, 10, 40);

  context.font = "80px Space";
  if (this.gameover)
    context.fillText("Game Over", 100, 300);
  else if (this.spawning)
    context.fillText("Wave " + this.wave, 200, 300);

  context.restore();
}

TomatoJS.Game.prototype.StartGame = function()
{
  TomatoJS.Core.DestroyAllGameObjects();

  this.wave = -1;
  this.spawning = false;
  this.spawnTimer = 0;
  this.spawnCounter = 0;
  this.spawnX = TomatoJS.Core.canvas.width / 2 / TomatoJS.CoreScale;
  this.spawnY = -15;
  this.waveTime = 2;
  this.waveTimer = 0;
  this.highScore = localStorage["JSunky Score"] ? localStorage["JSunky Score"] : 0;
  this.score = 0;
  this.gameover = false;
  this.gameoverTime = 2;
  this.gameoverTimer = 0;

  TomatoJS.Core.LoadGameObject("StarField.json");

  var player = TomatoJS.Core.LoadGameObject("Player.json");
  player.x = (TomatoJS.Core.canvas.width / 2) / TomatoJS.CoreScale;
  player.y = (TomatoJS.Core.canvas.height / TomatoJS.CoreScale) - 20;

  TomatoJS.Core.audio.PlaySound("Music", true);
}

TomatoJS.Game.prototype.Lose = function()
{
  if (this.gameover)
    return;

  this.gameover = true;
  if (!localStorage["JSunky Score"] || localStorage["JSunky Score"] < this.score)
    localStorage["JSunky Score"] = this.score;

  TomatoJS.Core.audio.StopSound("Music", true);
  TomatoJS.Core.audio.PlaySound("Game Over");
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));