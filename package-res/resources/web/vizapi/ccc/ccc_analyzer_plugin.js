
var analyzerPlugins = analyzerPlugins || [];

analyzerPlugins.push({
    init:function (){

        dojo.declare("analyzer.CCCVizHelper", null, {

            isDrillEnabled: function(){
                return !(/\bcl=/).test(window.location.href);
            },

            /**
             * Returns the label of a given formula.
             */
            getFormulaLabel: function(formula){
                return cv.util.parseMDXExpression(formula, false);
            },

            /**
             * Returns an array with all the formulas of the hierarchy to which a given formula belongs.
             * The order of the formulas is from root level to leaf level.
             * Any formula, including a hierarchy id. can be specified in argument 'formula'.
             */
            getHierarchyFormulas: function(formula, includeHidden, excludeChildren){
                return cv.getFieldHelp().getHierarchy(formula, includeHidden, excludeChildren)
            },
            
            /**
             * Returns an array of the FormulaInfo of a given axis.
             * The order of the formulas is significant.
             * Possible axis values are 'row', 'column' and 'measure'.
             */
            getAxisFormulasInfo: function(axis){
                var reportDoc = cv.getActiveReport().reportDoc,
                    levelElems,
                    isMeasure = (axis === 'measure');

                if(isMeasure){
                    levelElems = reportDoc.getMetrics();
                } else {
                    // We care not if an attribute is in the row or col Attributes,
                    // but if it is in the 'rows' or 'columns' gem -
                    // it's what is relevant for charts.
                    levelElems = reportDoc.getReportNode().selectNodes(
                        // Note the axis plural introduction
                        "cv:columnAttributes/cv:attribute[@gembarId='" + axis + "s'] | " +
                        "cv:rowAttributes/cv:attribute[@gembarId='" + axis + "s']"
                    );
                }

                // NOTE: levelElems is an Array of elements

                var formulasInfo = [];

                levelElems.forEach(function(levelElem, index){
                    var formula = levelElem.getAttribute('formula'),
                        gem = cv.getActiveReport().getGem(formula),
                        fieldHelp = cv.getFieldHelp();

                    // Only formulas that are visible in charts are considered
                    if(!isMeasure || !gem.isHideInChart()){

                        formulasInfo.push({
                            id:        gem.getUniqueId(), // measures have an id != from formula
                            formula:   formula,
                            label:     gem.getDisplayLabel(true),

                            hierarchy: fieldHelp.get(formula, 'hierarchy'),
                            axis:      axis,

                            // "Roles" provide more detail for measures
                            role:  gem.getGembarId(), // rows, columns, ...custom_role...

                            // For measures the relevant order is the report order...
                            index: isMeasure ? index : parseFloat(gem.getGembarOrdinal())
                        });
                    }
                });

                // Return formulas sorted by index
                formulasInfo.sort(function(a, b){ return a.index - b.index; });

                return formulasInfo;
            },

            /**
             * Performs a click action with the specified context.
             */
            click: function(actionContext, keepGem){
                cv.getActiveReport().clickChart(actionContext, keepGem);
            },

            // set visualization options based on analyzer's state.
            generateOptionsFromAnalyzerState:function (report) {
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

                // build style for pv
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
        });

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

        // ----------------------
        // Register CCC Visualizations

        var vizIds = [
                    'ccc_heatgrid',
                    'ccc_bar',
                    'ccc_barstacked',
                    'ccc_barnormalized',
                    'ccc_horzbar',
                    'ccc_horzbarstacked',
                    'ccc_horzbarnormalized',
                    'ccc_bulletchart'
                ];

        var vizHelper = new analyzer.CCCVizHelper();

        vizIds.forEach(function(vizId){
            
            cv.pentahoVisualizations.push(pentaho.visualizations.getById(vizId));

            cv.pentahoVisualizationHelpers[vizId] = vizHelper;

            analyzer.LayoutPanel.configurationManagers['JSON_' + vizId] = analyzer.CCCVizConfig;
            
        });
    } // end init method
});
