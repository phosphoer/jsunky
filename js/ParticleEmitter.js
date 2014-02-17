(function (TomatoJS, $, undefined)
{

TomatoJS.Particle = function(x, y, dir, speed, speedDecay, life)
{
  this.x = x;
  this.y = y;
  this.dir = dir;
  this.speed = speed;
  this.speedDecay = speedDecay;
  this.life = life;
  this.startLife = life;
  this.alpha = 1;
}

TomatoJS.ParticleEmitter = function(parent)
{
  this.parent = parent;
  this.zdepth = 0;

  this.particles = [];
  this.elapsedTime = 0;
  this.spawnTimer = 0;

  this.life = 10;
  this.loop = true;
  this.imageURL = "";
  this.particleImage = null;
  this.maxParticles = 30;
  this.spawnPerSecond = 10;
  this.spawnOffsetX = 0;
  this.spawnOffsetY = 0;
  this.spawnOffsetXSpread = 0;
  this.spawnOffsetYSpread = 0;
  this.spawnDirection = 0;
  this.spawnDirectionSpread = Math.PI / 4;
  this.spawnSpeed = 5;
  this.spawnSpeedSpread = 2;
  this.speedDecay = 1;
  this.speedDecaySpread = 0;
  this.alphaKeys = [];
  this.particleLife = 5;
  this.particleLifeSpread = 3;
  this.collisionEnabled = true;
  this.tileLayer = 0;
}

TomatoJS.ParticleEmitter.prototype.Initialize = function()
{
  this.particleImage = TomatoJS.Core.resourceManager.GetImage(this.imageURL);

  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.ParticleEmitter.prototype.Uninitialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(this);
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.ParticleEmitter.prototype.OnFrameBegin = function(dt)
{
  // Subtract life
  this.life -= dt;

  // Calculate number to spawn this frame
  this.elapsedTime += dt;
  this.spawnTimer += dt;
  var secondsPerSpawn = 1 / this.spawnPerSecond;
  var numParticles = Math.floor(this.spawnTimer / secondsPerSpawn);

  // Spawn particles
  for (var i = 0; i < numParticles; ++i)
  {
    // Configure
    var x = this.parent.x + this.spawnOffsetX + Math.random() * this.spawnOffsetXSpread - this.spawnOffsetXSpread / 2;
    var y = this.parent.y + this.spawnOffsetY + Math.random() * this.spawnOffsetYSpread - this.spawnOffsetYSpread / 2;
    var dir = this.spawnDirection + Math.random() * this.spawnDirectionSpread - this.spawnDirectionSpread / 2;
    var speed = this.spawnSpeed + Math.random() * this.spawnSpeedSpread - this.spawnSpeedSpread / 2;
    var speedDecay = this.speedDecay + Math.random() * this.speedDecaySpread - this.speedDecaySpread / 2;
    var life = this.particleLife + Math.random() * this.particleLifeSpread - this.particleLifeSpread / 2;

    // Spawn a new particle if we aren't at max
    if (this.particles.length < this.maxParticles)
    {
      var particle = new TomatoJS.Particle(x, y, dir, speed, speedDecay, life);
      particle.alpha = this.startAlpha;
      this.particles.push(particle);
    }
    // Otherwise, just modify an old particle
    else if (this.loop)
    {
      // Find a free particle
      var free = 0;
      while (free < this.particles.length && this.particles[free].life > 0)
        ++free;
      if (free < this.particles.length)
      {
        var p = this.particles[free];
        p.x = x;
        p.y = y;
        p.dir = dir;
        p.speed = speed;
        p.speedDecay = speedDecay;
        p.life = life;
        p.starLife = life;
        p.alpha = this.startAlpha;
      }
    }

    this.spawnTimer = 0;
  }

  // Update particles
  var allDead = true;
  for (var i in this.particles)
  {
    var p = this.particles[i];
    if (p.life <= 0)
      continue;

    allDead = false;

    // Move
    p.x += Math.cos(p.dir) * p.speed * dt;
    p.y += Math.sin(p.dir) * p.speed * dt;

    p.speed *= p.speedDecay;

    // Get normalized life
    var lifeNorm = TomatoJS.NormalizeInRange(0, p.startLife, p.startLife - p.life);

    // Find what 2 keyframes we are between
    if (this.alphaKeys.length > 0)
    {
      var key1 = 0;
      var key2 = 0;
      for (key1 = 0; key1 < this.alphaKeys.length; ++key1)
      {
        if (lifeNorm < this.alphaKeys[key1]["time"])
        {
          break;
        }
      }

      --key1;
      if (this.alphaKeys.length > 1)
        key2 = key1 + 1;

      // Lerp between the two keyframes
      lifeNorm = TomatoJS.NormalizeInRange(this.alphaKeys[key1]["time"], this.alphaKeys[key2]["time"], lifeNorm);
      p.alpha = TomatoJS.Lerp(this.alphaKeys[key1]["val"], this.alphaKeys[key2]["val"], lifeNorm);
    }

    // Check collision against tilemap
    if (this.collisionEnabled)
    {
      var tilemap = TomatoJS.Core.GetSystem("TileSystem").GetTileMap(this.tileLayer);
      if (tilemap.GetTileInWorld(p.x, p.y, tilemap.CollisionAttr) == tilemap.SolidTile)
        p.speed = 0;
    }

    // Life
    p.life -= dt;
  }

  // Destroy
  if (this.life <= 0 && allDead)
    this.parent.Destroy();
}

TomatoJS.ParticleEmitter.prototype.Draw = function(dt, context, camera)
{
  context.save();

  // Draw particles
  for (var i in this.particles)
  {
    var p = this.particles[i];
    if (p.life <= 0)
      continue;

    // Don't draw if off screen
    var x = p.x - camera.x;
    var y = p.y - camera.y;
    if (x < 0 || y < 0 || x > TomatoJS.Core.canvas.width || y > TomatoJS.Core.canvas.height)
      continue;

    context.globalAlpha = p.alpha;
    this.particleImage.Draw(context, p.x - camera.x - this.particleImage.width / 2, p.y - camera.y - this.particleImage.height / 2);
  }

  context.restore();
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));