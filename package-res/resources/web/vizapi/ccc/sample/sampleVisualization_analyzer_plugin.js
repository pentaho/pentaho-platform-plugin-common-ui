var analyzerPlugins = analyzerPlugins || [];
analyzerPlugins.push(
    {
      init:function () {
        // Register types to display in Analyzer
        cv.pentahoVisualizations.push(pentaho.visualizations.getById("sample_bar"));

        cv.pentahoVisualizationHelpers["sample_bar"] = {

          // set visualization options based on analyzer's state.
          generateOptionsFromAnalyzerState:function (report) { 
            return {}; // perform no work
          }

        };
        
        dojo.declare("SampleBarConfig", [analyzer.LayoutConfig], {


          onModelEvent:function (config, item, eventName, args) {
            this.inherited(arguments); // Let super class handle the insertAt and removedGem events
          },
          getConfiguration:function () {
            var config = this.inherited(arguments);
            // make customizations to the standard config here, set current values, toggle things on/off
            return config;

          }
        });
        analyzer.LayoutPanel.configurationManagers["JSON_sample_bar"] = SampleBarConfig;
    }
  }
);
