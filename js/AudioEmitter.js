(function (TomatoJS, $, undefined)
{

TomatoJS.AudioEmitter = function(parent)
{
  this.parent = parent;

  this.soundBank = {};
}

TomatoJS.AudioEmitter.prototype.PlayBank = function(name, volumeMod)
{
  var sound = this.soundBank[name];
  if (!sound)
    return false;

  var i = Math.floor(Math.random() * (sound.sounds.length));
  if (sound.lastPlayedSound && i == sound.lastPlayedSound && sound.sounds.length > 1)
    i = (i + 1) % sound.sounds.length;
  sound.lastPlayedSound = i;

  this.PlaySound(sound.sounds[i], sound.radius, volumeMod);
}

TomatoJS.AudioEmitter.prototype.PlaySound = function(soundName, radius, volumeMod)
{
  // Get distance to ear
  var tileSystem = TomatoJS.Core.GetSystem("TileSystem");
  var graphics = TomatoJS.Core.GetSystem("Graphics");
  var camera = graphics.camera;
  var dist = TomatoJS.Vec2DistancePoint([this.parent.x, this.parent.y], [camera.x, camera.y]);

  // Set volume
  var volume = 1;
  if (radius)
  {
    if (dist > radius)
      volume = 0;
    else
      volume = 1 - dist / radius;
  }

  if (volumeMod)
    volume *= volumeMod;

  // Play
  if (volume > 0)
    TomatoJS.Core.audio.PlaySound(soundName, false, volume);

  // Make objects notice the sound
  var origin = [this.parent.x, this.parent.y];
  var nearby = tileSystem.GetCollidersInRadius(origin[0], origin[1], radius);
  for (var i in nearby)
    nearby[i].parent.Invoke("OnHearSound", origin[0], origin[1], volume);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));