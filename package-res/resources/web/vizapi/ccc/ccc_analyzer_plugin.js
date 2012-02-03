var analyzerPlugins = analyzerPlugins || [];
analyzerPlugins.push(
    {
      init:function () {
        // Register types to display in Analyzer
        cv.pentahoVisualizations.push(pentaho.visualizations.getById("ccc_heatgrid"));

        cv.pentahoVisualizationHelpers["ccc_heatgrid"] = {
          generateOptionsFromAnalyzerState:function (report) { // set visualization options based on analyzer's state.
            var userDefinedOpts = {};
            var chartOptions = report.reportDoc.getChartOptions().attributes;
            for (var i = 0; i < chartOptions.length; i++) {
              var option = chartOptions[i];
              var val = option.nodeValue;

              switch (option.nodeName) {
                case "backgroundColor":
                  userDefinedOpts.extensionPoints = userDefinedOpts.extensionPoints || {};
                  userDefinedOpts.extensionPoints.base_fillStyle = val;
                  break;
                case "labelColor":
                  userDefinedOpts.extensionPoints = userDefinedOpts.extensionPoints || {};
                  userDefinedOpts.extensionPoints.xAxisLabel_textStyle = val;
                  userDefinedOpts.extensionPoints.yAxisLabel_textStyle = val;
                  break;
                default:
                  userDefinedOpts[option.nodeName] = val;
              }


            }
            //build style for pv
            if (userDefinedOpts.labelSize) {
              var style = userDefinedOpts.labelStyle;
              if (style == null || style == 'PLAIN') {
                style = '';
              }
              else {
                style += ' ';
              }
              userDefinedOpts.axisLabelFont = style + userDefinedOpts.labelSize + 'px ' + userDefinedOpts.labelFontFamily;
            }
            return userDefinedOpts;
          }
        };


        dojo.declare("analyzer.CCCVizConfig", [analyzer.ColorConfiguration], {


          onModelEvent:function (config, item, eventName, args) {
            if (eventName == "value") {
              // works by convention where the ids of the data req items match the property names
              this.report.visualization.args[item.id] = args.newVal;
            }
            this.inherited(arguments); // Let super class handle the insertAt and removedGem events
          },
          _setScalingType:function (scalingType) {

            this.report.visualization.args.scalingType = scalingType;
          },
          _setColorRange:function (range) {
            this.report.visualization.args.colorRange = range;
          },
          getConfiguration:function () {
            var config = this.inherited(arguments);

            // set current values.
            dojo.forEach(config.properties, function (item) {
              if (this.report.visualization.args[item.id] !== "undefined") {
                item.value = this.report.visualization.args[item.id];
              }
            }, this);
            return config;

          }
        });
        analyzer.LayoutPanel.configurationManagers["JSON_ccc_heatgrid"] = analyzer.CCCVizConfig;

      }
    }
);
