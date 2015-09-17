require(["common-ui/jquery", "js/PentahoEmbedFramework"], function($, PentahoEmbedFramework) {
  var currentPlugin;

  $.ajax({
    url: "PentahoEmbedFramework.json",
    type: "GET",
    success: function(config, status) {
      if (status == "success") {
        var paths = [];
        for (var pluginName in config.plugins) {
          paths.push(config.plugins[pluginName]);
        }

        $(document).ready(function() {
          loadPlugins(paths);
        });
      } else {
        alert("error");
      }
    },
    error: function(msg) {
      alert(JSON.stringify(msg, null, 2))
    },
    dataType: "json"
  });

  var resetFramework = function() {
    $("#back-button").hide();
    PentahoEmbedFramework.console.reset();
    PentahoEmbedFramework.showConsole(false);
    $("#properties, #render-area, #documentation").fadeOut(function() {
      $(this).empty();

      $("#app-header").text("Pentaho Samples Framework");
      $("#properties-container h2").text("Plugins");

      PentahoEmbedFramework._unload();
      $("#plugin-button-container").fadeIn();

      if (currentPlugin && currentPlugin.unload) {
        currentPlugin.unload(PentahoEmbedFramework);
      }
    });
  }

  var loadPlugins = function(paths) {
    /*
     * Assumes index.js at path
     */
    for (var i in paths) {
      var path = paths[i];
      var file = path + (path.charAt(path.length-1) == "/" ? "" : "/") + "index.js";
      loadPlugin(file, path);
    }
  }

  var loadPlugin = function(file, basePath) {
    require([file], function(plugin) {
      if (plugin && plugin.name) {
        var button = $("<button class='btn btn-large btn-block plugin-btn'></button>")
          .text(plugin.name)
          .on("click", function() {
            currentPlugin = this;
            $("#app-header").text(this.name);
            $("#plugin-button-container").hide();
            $("#properties-container h2").text("Properties");
            $("#back-button").show();

            PentahoEmbedFramework._setBaseURL(basePath);
            currentPlugin.init(PentahoEmbedFramework); // Calls the plugin's init method
          }.bind(plugin));

        $("#plugin-button-container").append(button);
      }
    }, function(err) {
      // DO NOTHING
    });
  }

  $(document).ready(function() {
    resetFramework();

    $("#back-button").on("click", function() {
      resetFramework();
    });
  });
});