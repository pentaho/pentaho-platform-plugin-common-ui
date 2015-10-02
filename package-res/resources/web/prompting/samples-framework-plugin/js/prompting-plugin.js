define(["./properties-panel.js"], function(PropertiesPanel) {


  var PromptingPlugin = function(framework) {
    this.framework = framework;
    this.propertiesPanel = new PropertiesPanel(framework);

    this.init = function() {
      var propertiesPanelLoaded = false;
      var renderAreaLoaded = false;

      var allDone = function() {
        propertiesPanelLoaded && renderAreaLoaded && this.propertiesPanel.init();
      }

      var error = function(e) {
        alert(e);
      }

      // Load Properties Panel
      this.framework.loadPropertiesPanel({
        html: "partials/properties-panel.html",
        css: "css/properties-panel.css",
        success: function() {
          propertiesPanelLoaded = true;
          allDone.call(this);
        }.bind(this),
        error: error
      });

      // Load Render Area
      this.framework.loadRenderArea({
        html: "partials/render-area.html",
        css: "css/render-area.css",
        success: function() {
          renderAreaLoaded = true;
          allDone.call(this);
        }.bind(this),
        error: error
      });

      // Load CSS for Documentation panel
      this.framework.loadDocumentation({
        html: "partials/doc-panel.html",
        css: "css/doc-panel.css"
      });

      this.framework.showConsole(true);
    }
  };

  return PromptingPlugin;
});