(function (TomatoJS, $, undefined)
{

TomatoJS.PreLoader = function()
{
  this.loadedImages = {};
}

TomatoJS.PreLoader.prototype.Load = function(finishCallback)
{
  var that = this;

  // Add UI
  this.BuildUI();

  // Set up array of load tasks
  var tasks = [];

  // Add a task for loading sounds and images
  var soundTask = new $.Deferred();
  var imageTask = new $.Deferred();
  tasks.push(soundTask);
  tasks.push(imageTask);

  // Total number of assets
  var assetCount = 0;

  // Load all sounds
  var soundList = this.LoadSounds(TomatoJS.Core.configData["soundPath"], function(list, i, complete)
  {
    that.UpdateUIProgress(i / assetCount);

    // Resolve the task if all sounds are complete
    if (complete)
    {
      soundTask.resolve();
    }
  });

  assetCount += soundList.length;

  // Load all images
  var imageList = this.LoadImages(TomatoJS.Core.configData["imagePath"], function(list, i, complete)
  {
    that.UpdateUIProgress(i / assetCount);

    // Resolve the task if all sounds are complete
    if (complete)
    {
      imageTask.resolve();
    }
  });

  assetCount += imageList.length;

  // Load all JSON
  this.LoadJSON(TomatoJS.Core.configData["animationPath"]);
  this.LoadJSON(TomatoJS.Core.configData["blueprintPath"]);
  this.LoadJSON(TomatoJS.Core.configData["levelPath"]);
  this.LoadJSON(TomatoJS.Core.configData["tilesetPath"]);

  // When all tasks are complete, call finish
  $.when.apply($, tasks).done(function()
  {
    // Remove the UI
    that.RemoveUI();

    // Inform the engine
    finishCallback();
  });
}

TomatoJS.PreLoader.prototype.LoadJSON = function(path, progressCallback)
{
  // Open list file
  var listFile = TomatoJS.Core.fileManager.OpenFile(path + "Preload.json");
  var list = listFile.GetJSONObject();

  // Load each file in the list
  for (var i in list)
  {
    // Load the file
    TomatoJS.Core.fileManager.OpenFile(path + list[i]);
  }
}

TomatoJS.PreLoader.prototype.LoadSounds = function(path, progressCallback)
{
  // Open list file
  var listFile = TomatoJS.Core.fileManager.OpenFile(path + "Preload.json");
  var list = listFile.GetJSONObject();

  // Set up deferred tracking
  var tasks = [];

  // Load function
  function LoadFile(path, i)
  {
    // Add a deferred tracker to the list
    var task = new $.Deferred();
    tasks.push(task);

    // Load the file
    TomatoJS.Core.fileManager.OpenFile(path, "arraybuffer", true, function(soundFile)
    {
      progressCallback(list, i, false);
      task.resolve();
    });
  }

  // Load each file in the list
  for (var i in list)
    LoadFile(path + list[i], i);

  // When all tasks are complete, inform the caller
  $.when.apply($, tasks).done(function()
  {
    progressCallback(list, i, true);
  });

  return list;
}

TomatoJS.PreLoader.prototype.LoadImages = function(path, progressCallback)
{
  // Open list file
  var listFile = TomatoJS.Core.fileManager.OpenFile(path + "Preload.json");
  var list = listFile.GetJSONObject();

  // Set up deferred tracking
  var tasks = [];

  // Load function
  var that = this;
  function LoadFile(path, i, task)
  {
    // Load the file
    that.loadedImages[list[i]] = new TomatoJS.PixelImage(path, TomatoJS.CoreScale, function()
    {
      progressCallback(list, i, false);
      task.resolve();
    });
  }

  for (var i in list)
  {
    // Add a deferred tracker to the list
    var task = new $.Deferred();
    tasks.push(task);
  }

  // Load each file in the list
  for (var i in list)
    LoadFile(path + list[i], i, tasks[i]);

  // When all tasks are complete, inform the caller
  $.when.apply($, tasks).done(function()
  {
    progressCallback(list, i, true);
  });

  return list;
}

TomatoJS.PreLoader.prototype.BuildUI = function()
{
  var ui = "";

  // Beginning of UI
  ui += "<div id='preloader'>";

  ui += "<div id='preloader-progress'></div>";

  // End of UI
  ui += "</div>";

  // Add the UI
  $(ui).appendTo("body");

  // Style
  $("#preloader-progress").progressbar({"value": 1});
  $("#preloader-progress").css({
    "position": "absolute",
    "font-size": "60px",
    "left": "10%",
    "top": "40%",
    "width": "80%",
    "height": "20%",
    "display": "block"
  });
}

TomatoJS.PreLoader.prototype.UpdateUIProgress = function(percent)
{
  // $("#preloader-progress").progressbar("value", percent * 100);
  var anim = setInterval(function()
  {
    var value = $("#preloader-progress").progressbar("value");
    $("#preloader-progress").progressbar("value", value + 1);
    if ($("#preloader-progress").progressbar("value") >= percent * 100)
      clearInterval(anim);
  }, 10);
}

TomatoJS.PreLoader.prototype.RemoveUI = function()
{
  $("#preloader").remove();
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));