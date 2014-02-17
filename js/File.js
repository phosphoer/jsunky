(function (TomatoJS, $, undefined)
{

TomatoJS.File = function(filePath)
{
  this.path = filePath;
  this.request = new XMLHttpRequest();
  this.fileData = null;
}

TomatoJS.File.prototype.Read = function(readMode, asynchronous, callback)
{
  if (!this.path)
  {
    console.log("TomatoJS.Core: Cannot read file with filepath: " + this.filePath);
    return null;
  }
  if (!asynchronous)
    asynchronous = false;
  this.request.open("GET", this.path + "?t=" + Math.random(), asynchronous);
  if (readMode)
    this.request.responseType = readMode;

  if (asynchronous)
  {
    var that = this;
    this.request.onload = function()
    {
      that.fileData = (readMode ? that.request.response : that.request.responseText);

      if (callback)
        callback(that);
    }
  }

  this.request.send();

  if (!asynchronous)
    this.fileData = (readMode ? this.request.response : this.request.responseText);

  return this.fileData;
};

TomatoJS.File.prototype.Write = function(data)
{
  var uriContent = "data:application/octet-stream," + encodeURIComponent(data);

  var ui = "<div id='downloadBox'>";
  ui += "<input id='downloadInput'> </input>"
  ui += "<a id='downloadLink' href='" + uriContent + "' download='testFile.dat'>Download File</a></div>";
  $(ui).dialog({title: "Save File"});
  $('#downloadLink').button();

  $('#downloadLink').css({
    "margin": "auto",
    "display": "block"
  });
  $('#downloadInput').css({
    "margin": "auto",
    "display": "block"
  });

  $('#downloadInput').val("File Name.txt");

  $('#downloadLink').mousedown(function()
  {
    $(this).attr("download", $('#downloadInput').val());
  });

  $('#downloadLink').click(function()
  {
    $('#downloadBox').remove();
  });
}

TomatoJS.File.prototype.GetJSONObject = function()
{
  var obj = null;
  try
  {
    var obj = JSON.parse(this.fileData);
  }
  catch (e)
  {
    console.log("TomatoJS.Core: Failed to parse as JSON: " + this.path + " (Error Message: " + e.message + ")");
    return null;
  }

  return obj;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));