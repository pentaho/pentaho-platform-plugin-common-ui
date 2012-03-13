dojo.require("pentaho.common.Messages");

var analyzerPlugins = analyzerPlugins || [];

analyzerPlugins.push({
    init: function (){

        dojo.declare("analyzer.CCCVizHelper", null, {

            /**
             * Indicates if interaction features are enabled.
             * When printing, as in a server eenvironment,
             * interaction features are disabled.
             */
            isInteractionEnabled: function(){
                return true;
            },

            /**
             * Indicates if drilling is enabled.
             * Takes into account whether content-linking is in effect.
             * Only available when interaction is enabled.
             */
            isDrillEnabled: function(){
                return !(/\bcl=/).test(window.location.href);
            },

            /**
             * Returns the label of a given formula.
             * Only available when interaction is enabled.
             */
            getFormulaLabel: function(formula){
                return cv.util.parseMDXExpression(formula, false);
            },

            /**
             * Returns an array with all the formulas of the hierarchy to which a given formula belongs.
             * The order of the formulas is from root level to leaf level.
             * Any formula, including a hierarchy id. can be specified in argument 'formula'.
             * Only available when interaction is enabled.
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

                dojo.forEach(levelElems, function(levelElem, index){
                    var formula = levelElem.getAttribute('formula'),
                        gem,
                        id,
                        label,
                        role,
                        hierarchy,
                        formIndex;

                    // Only formulas that are visible in charts are considered.
                    // Only measures can be hidden in charts.
                    if(levelElem.getAttribute("hideInChart") === 'true'){
                        return;
                    }

                    if(isMeasure){
                        var gembarId = levelElem.getAttribute("gembarId");
                        if(!gembarId ||  gembarId === 'undefined'){
                            // Unmapped measure
                            return;
                        }
                    }
                        
                    if(!formula){
                        //assert(isMeasure, "Only measures can not have a formula.");

                        id    = levelElem.getAttribute('id');
                        label = getLevelLabel(levelElem);
                        role  = axis;

                    } else {
                        gem = cv.getActiveReport().getGem(formula);
                        if(!gem){
                            // !gem => assume not placed for chart consumption
                            return;
                        }

                        // measures have an id != from formula
                        id = gem.getUniqueId();
                        label = gem.getDisplayLabel(true);

                        // "Roles" provide more detail for measures
                        // rows, columns, ...custom_role...
                        role = gem.getGembarId();
                    }
                    
                    if(isMeasure){
                        hierarchy = '[Measures]';
                        // For measures the relevant order is the report order...
                        // But note that this index may not be contiguous
                        //  because formula may be hidden.
                        // Below, after sorting, measure indexes are reassigned.
                        formIndex = index;
                    } else {
                        // !isMeasure => has formula => gem or already excluded
                        //assert(gem, "Non-measures have gem or were already excluded.");

                        var fieldHelp = cv.getFieldHelp();
                        hierarchy = fieldHelp.get(formula, 'hierarchy');

                        // Indexes of non-measure formulas also have to "fixed"
                        // because not always they start at 0-gembar-ordinal
                        // due to addition and removal of formulas from gems.
                        formIndex = parseFloat(gem.getGembarOrdinal());
                    }

                    formulasInfo.push({
                        id:        id,
                        formula:   formula,
                        label:     label,
                        hierarchy: hierarchy,
                        axis:      axis,
                        role:      role,
                        index:     formIndex
                    });
                });

                // Return formulas sorted by index
                formulasInfo.sort(function(a, b){ return a.index - b.index; });

                
                // Fix non-contiguous indexes
                dojo.forEach(formulasInfo, function(formulaInfo, index){
                    formulaInfo.index = index;
                }, this);

                return formulasInfo;
            },

            /**
             * Performs a click action with the specified context.
             * Only available when interaction is enabled.
             */
            click: function(actionContext, keepGem){
                cv.getActiveReport().clickChart(actionContext, keepGem);
            },

            // set visualization options based on analyzer's state.
            // Only available when interaction is enabled.
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

        function getLevelLabel(levelElem){
            var labelElem = levelElem.selectSingleNode("cv:displayLabels/cv:displayLabel");
            return (labelElem && labelElem.getAttribute("label")) || "";
        }

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
                    'ccc_heatgrid'
					/*
                    'ccc_bar',
                    'ccc_barstacked',
                    'ccc_barnormalized',
                    'ccc_horzbar',
                    'ccc_horzbarstacked',
                    'ccc_horzbarnormalized',
                    'ccc_line',
                    'ccc_area',
                    'ccc_bulletchart'
                    */
                ];

        var vizHelper = new analyzer.CCCVizHelper();

        dojo.forEach(vizIds, function(vizId){
            
            cv.pentahoVisualizations.push(pentaho.visualizations.getById(vizId));

            cv.pentahoVisualizationHelpers[vizId] = vizHelper;

            analyzer.LayoutPanel.configurationManagers['JSON_' + vizId] = analyzer.CCCVizConfig;
            
        }, this);
    } // end init method
});
