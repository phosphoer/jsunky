(function (TomatoJS, $, undefined)
{

TomatoJS.Animation = function()
{
  this.imageURL = null;
  this.image = null;
  this.frameWidth = 16;
  this.frameHeight = 16;
  this.frames = [];
  this.duration = 0;
}

TomatoJS.Animation.prototype.Initialize = function()
{
  var that = this;
  this.image = TomatoJS.Core.resourceManager.GetImage(this.imageURL, function()
  {
    that.framesX = that.image.width / that.frameWidth;
    that.framesY = that.image.height / that.frameHeight;
  });

  this.duration = 0;
  for (var i in this.frames)
  {
    this.frames[i].time = this.duration;
    this.duration += this.frames[i].duration;
  }
}

TomatoJS.Animation.prototype.Draw = function(context, time, x, y, rotation, offsetX, offsetY)
{
  if (!this.image)
  {
    this.Initialize()
  }

  var frameIndex = this.GetFrameAtTime(time);

  var clipX = (frameIndex) % this.framesX;
  var clipY = Math.floor((frameIndex) / this.framesX);
  this.image.DrawClipped(context, x, y, clipX * this.frameWidth, clipY * this.frameHeight, this.frameWidth, this.frameHeight, rotation, offsetX, offsetY);
}

TomatoJS.Animation.prototype.GetFrameAtTime = function(time)
{
  time %= this.duration;

  var frame = -1;
  for (var i = 0; i < this.frames.length; ++i)
    if (time >= this.frames[i].time)
      ++frame;

  return frame;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));