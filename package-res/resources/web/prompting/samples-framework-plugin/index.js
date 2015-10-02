define([], function() {
  var plugin;
  return {
    name : "Prompt Panel API",
    init : function(framework) {
      var url = framework.getPluginBaseURL() + "/js/prompting-plugin.js";
      require([url], function(PromptingPlugin) {
        plugin = new PromptingPlugin(framework)
        plugin.init();
      });
    },
    unload : function(framework) {
      plugin = null;
    }
  };
});