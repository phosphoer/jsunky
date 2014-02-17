(function (TomatoJS, $, undefined)
{

var offscreen_canvas_a = document.createElement('canvas');
var offscreen_context_a = offscreen_canvas_a.getContext('2d');

var offscreen_canvas_b = document.createElement('canvas');
var offscreen_context_b = offscreen_canvas_b.getContext('2d');

TomatoJS.PixelImage = function(img_url, scale, loadedCallback)
{
  this.url = img_url;
  this.scaled_image = new Image();
  this.image = new Image();
  this.image.src = img_url;
  this.scale = scale;
  this.scale_position = true;

  var that = this;
  this.image.onload = function()
  {
    that.scaled_image.src = PixelScale(that.scaled_image, that.image, scale);
    that.width = that.image.width;
    that.height = that.image.height;
    that.scaled_width = that.image.width * scale;
    that.scaled_height = that.image.height * scale;
    if (loadedCallback)
      loadedCallback();
  };
}

TomatoJS.PixelImage.prototype.Draw = function(context, x, y, rotation, originOffsetX, originOffsetY)
{
  if (rotation != undefined)
  {
    context.save();
    context.translate(Math.floor(x * this.scale + this.scaled_width / 2), Math.floor(y * this.scale + this.scaled_height / 2));
    context.rotate(rotation);
    context.translate(Math.floor(-this.scaled_width / 2 - originOffsetX * this.scale), Math.floor(-this.scaled_height / 2 - originOffsetY * this.scale));
    context.drawImage(this.scaled_image, 0, 0);
    context.restore();
  }
  else
    context.drawImage(this.scaled_image, Math.ceil(x * this.scale), Math.ceil(y * this.scale));
}

TomatoJS.PixelImage.prototype.DrawClipped = function(context, x, y, clipX, clipY, clipWidth, clipHeight, rotation, originOffsetX, originOffsetY)
{
  var scaledClipWidth = clipWidth * this.scale;
  var scaledClipHeight = clipHeight * this.scale;

  if (rotation != undefined)
  {
    context.save();
    context.translate(Math.floor(x * this.scale + scaledClipWidth / 2), Math.floor(y * this.scale + scaledClipHeight / 2));
    context.rotate(rotation);
    context.translate(Math.floor(-scaledClipWidth / 2 - originOffsetX * this.scale), Math.floor(-scaledClipHeight / 2 - originOffsetY * this.scale));
    context.drawImage(this.scaled_image, clipX, clipY, clipWidth, clipHeight, 0, 0);
    context.restore();
  }
  else
    context.drawImage(this.scaled_image, clipX * this.scale, clipY * this.scale, scaledClipWidth, scaledClipHeight, Math.ceil(x * this.scale), Math.ceil(y * this.scale), scaledClipWidth, scaledClipHeight);
}

function PixelScale(dst_img, src_img, scale)
{
  var src_width = src_img.width;
  var src_height = src_img.height;
  var dst_width = src_width * scale;
  var dst_height = src_height * scale;

  offscreen_canvas_a.width = src_width;
  offscreen_canvas_a.height = src_height;
  offscreen_canvas_b.width = dst_width;
  offscreen_canvas_b.height = dst_height;

  offscreen_context_a.drawImage(src_img, 0, 0);

  var src_data = offscreen_context_a.getImageData(0, 0, src_width, src_height).data;
  var dst_imgdata = offscreen_context_b.getImageData(0, 0, dst_width, dst_height);
  var dst_data = dst_imgdata.data;

  var src_p = 0;
  var dst_p = 0;
  for (var y = 0; y < src_height; ++y)
  {
    for (var i = 0; i < scale; ++i)
    {
      for (var x = 0; x < src_width; ++x)
      {
        var src_p = 4 * (y * src_width + x);
        for (var j = 0; j < scale; ++j)
        {
          var tmp = src_p;
          dst_data[dst_p++] = src_data[tmp++];
          dst_data[dst_p++] = src_data[tmp++];
          dst_data[dst_p++] = src_data[tmp++];
          dst_data[dst_p++] = src_data[tmp++];
        }
      }
    }
  }

  offscreen_context_b.putImageData(dst_imgdata, 0, 0);

  var data_url = offscreen_canvas_b.toDataURL("image/png");
  data_url.replace(/^data:image\/(png|jpg);base64,/, "");
  return data_url;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));