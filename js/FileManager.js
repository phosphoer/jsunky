(function (TomatoJS, $, undefined)
{

TomatoJS.FileManager = function()
{
  this.loadedFiles = {};
}

TomatoJS.FileManager.prototype.OpenFile = function(filePath, readMode, asynchronous, callback)
{
  var file = this.loadedFiles[filePath];
  if (!file)
  {
    file = new TomatoJS.File(filePath);
    file.Read(readMode, asynchronous, callback);
    this.loadedFiles[filePath] = file;
  }
  else if (callback)
    callback(file);

  return file;
};

TomatoJS.FileManager.prototype.OpenFileDialog = function(callback, defaultPath)
{
  var ui = "<div id='openBox'>";
  ui += "<input id='openInput'> </input>"
  ui += "<div id='openLink'>Ok</div></div>";
  $(ui).dialog({title: "Open File"});
  $('#openLink').button();

  $('#openLink').css({
    "margin": "auto",
    "display": "block"
  });
  $('#openInput').css({
    "margin": "auto",
    "display": "block"
  });

  $('#openInput').val((defaultPath ? defaultPath : "File Name.txt"));
  $('#openInput').keypress(function(e)
  {
    if (e.keyCode == 13)
      $('#openLink').click();
  });

  var fileName = "";
  $('#openLink').click(function()
  {
    fileName = $('#openInput').val();
    $('#openBox').remove();
    callback(fileName)
  });
};

TomatoJS.FileManager.prototype.WriteFile = function(filePath, data)
{
  var file = new File(filePath);
  file.Write(data);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));