(function (TomatoJS, $, undefined)
{

TomatoJS.AudioBank = function()
{
  // Create the audio context
  this.context = null;
  if (window.AudioContext)
    this.context = new AudioContext();
  else if (window.webkitAudioContext)
    this.context = new webkitAudioContext();
  else
    console.log("TomatoJS.Core: Web Audio is not supported by this browser, audio experience will be subpar");

  // Map of loaded sounds (only for html5 audio object)
  this.sounds = {};

  // Apple prevents audio from being played until enacted by a user touch event, so we secretly
  // play a silent file once on the first touch to enable audio
  this.AddSound("res/sounds/shoot.wav", "_EnableMobileAudio");
  document.addEventListener("touchstart", EnableMobileAudio);
  var that = this;
  function EnableMobileAudio()
  {
    that.PlaySound("_EnableMobileAudio", false, 0.1);
    document.removeEventListener("touchstart", EnableMobileAudio);
  }
}

TomatoJS.AudioBank.prototype.AddSound = function(soundURL, soundName, numChannels)
{
  // Create the sound
  var sound = {};
  sound.url = soundURL;
  sound.audio = [];
  sound.activeChannel = 0;

  if (!this.context)
  {
    // Load channels
    if (!numChannels)
      numChannels = 1;
    for (var i = 0; i < numChannels; ++i)
    {
      sound.audio.push(new Audio(soundURL));
    }
  }
  else
  {

  }

  this.sounds[soundName] = sound;

  return true;
};

TomatoJS.AudioBank.prototype.PlaySound = function(soundName, loop, volume)
{
  var sound = this.sounds[soundName];
  if (!sound)
    return false;

  if (!this.context)
  {
    // Reset channel
    ++sound.activeChannel;
    if (sound.activeChannel >= sound.audio.length)
      sound.activeChannel = 0;

    sound.audio[sound.activeChannel].loop = loop;
    sound.audio[sound.activeChannel].play();
  }
  else
  {
    var that = this;
    TomatoJS.Core.fileManager.OpenFile(sound.url, "arraybuffer", true, function(soundFile)
    {
      sound.source = that.context.createBufferSource();
      sound.source.buffer = that.context.createBuffer(soundFile.fileData, true);
      sound.volume = that.context.createGainNode();
      sound.volume.connect(that.context.destination);
      sound.volume.gain.value = volume;
      sound.source.connect(sound.volume);
      sound.source.loop = loop;
      sound.startTime = TomatoJS.Core.elapsedTime;

      if (sound.paused)
        sound.source.noteGrainOn(0, sound.stoppedTime - sound.startTime, sound.source.buffer.duration);
      else
        sound.source.noteOn(0);
    });
  }
}

TomatoJS.AudioBank.prototype.StopSound = function(soundName, pause)
{
  var sound = this.sounds[soundName];
  if (!sound)
    return false;

  if (!this.context)
    sound.audio[sound.activeChannel].pause();
  else
  {
    sound.stoppedTime = TomatoJS.Core.elapsedTime;
    sound.source.noteOff(this.context.currentTime);
    sound.paused = pause;
  }
}

TomatoJS.AudioBank.prototype.StopAllSounds = function()
{
  for (var i in this.sounds)
    if (!this.context)
      this.sounds[i].audio[sound.activeChannel].pause();
    else
      sound.source.noteOff(this.context.currentTime);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));