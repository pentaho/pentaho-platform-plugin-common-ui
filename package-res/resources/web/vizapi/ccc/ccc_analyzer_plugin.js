/*!
* Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

define([
    "dojo/_base/declare",
    "cdf/lib/CCC/def",
    "../vizTypeRegistry"
], function(declare, def, vizTypes) {

    // If necessary, declare **global** variable, initializing it with an array
    analyzerPlugins = typeof analyzerPlugins == "undefined" ? [] : analyzerPlugins;

    analyzerPlugins.push({
        init: function () {

            declare("analyzer.CCCVizHelper", null, {
                /**
                 * Indicates if interaction features are enabled.
                 * When printing, as in a server environment,
                 * interaction features are disabled.
                 */
                isInteractionEnabled: function(){
                    return true;
                },

                showConfirm: function(msg, msgId){
                    if (!msgId || !cv.prefs.suppressMsg[msgId]){
                        cv.getActiveReport().rptDlg.showConfirm(msg, null, null, null, msgId);
                    }
                },

                message: function(msgId, args){
                    var msg = cvCatalog[msgId] || "";
                    if(msg && args){
                        msg = cv.util.substituteParams.apply(cv.util, [msg].concat(args));
                    }

                    return msg;
                },

                getDoubleClickTooltip: function(){
                    return cv.getActiveReport().getDoubleClickTooltip();
                },

                completeAxisGemsMetadata: function(axis, gemsInfoList){
                    var reportElem = cv.getActiveReport().reportDoc.getReportNode();
                    var isMeasure  = (axis === 'measure');
                    var unboundGemElemsByRole = {};

                    function gemElemComparer(a, b){
                        return parseFloat(a.getAttribute("gembarOrdinal")) -
                               parseFloat(b.getAttribute("gembarOrdinal"));
                    }

                    function getRoleGemElems(role){
                        var xpath = "[@gembarId='" + role + "']";
                        if(isMeasure){
                            xpath = "cv:measures/cv:measure" + xpath;
                        } else {
                            xpath = "cv:columnAttributes/cv:attribute" + xpath +
                                    " | " +
                                    "cv:rowAttributes/cv:attribute" + xpath;
                        }

                        var unboundGemElems = reportElem.selectNodes(xpath);

                        // Converts array like collection to array
                        unboundGemElems = def.query(unboundGemElems).array();

                        // Sort by gem bar position
                        unboundGemElems.sort(gemElemComparer);

                        return unboundGemElems;
                    }

                    function getNextGemElem(role){
                        var gemElems = def.getOwn(unboundGemElemsByRole, role);
                        if(!gemElems){
                            gemElems = unboundGemElemsByRole[role] = getRoleGemElems(role);
                        }

                        var gemElem;
                        while(gemElems.length){
                            gemElem = gemElems.shift();
                            if(gemElem.getAttribute("hideInChart") !== 'true'){
                                break;
                            }
                        }

                        return gemElem;
                    }

                    if(gemsInfoList) gemsInfoList.forEach(function(gemInfo) {
                        var role = gemInfo.role;
                        if(!role || role === 'undefined') {
                            // unmapped role
                            return;
                        }

                        var gemElem = getNextGemElem(gemInfo.role) || def.assert("Undefined gem in document.");
                        var formula = gemElem.getAttribute('formula') || null;
                        var id, reportAxis;

                        switch(gemElem.parentNode.tagName) {
                            case 'rowAttributes':    reportAxis = 'row';     break;
                            case 'columnAttributes': reportAxis = 'column';  break;
                            case 'measures':         reportAxis = 'measure'; break;
                        }

                        if(isMeasure) gemInfo.measureType = gemElem.getAttribute("measureTypeEnum");

                        if(isMeasure && gemInfo.measureType !== 'VALUE') {
                            // Some kind of calculated formula
                            id      = gemElem.getAttribute('id');
                            formula = null; // ignore
                            //label   = getLevelLabel(gemElem);
                        } else {
                            var gem = cv.getActiveReport().getGem(formula) ||
                                def.assert("No gem object.");

                            // measures have an id != from formula
                            id = gem.getUniqueId();

                            // Need to get the label of "column" gems (reportAxis=column) this way,
                            // because of limitations of the metadata in the
                            // crosstab datatable format.
                            gemInfo.label = gem.getDisplayLabel(true);

                            isMeasure || formula || def.assert("Non-measures have formulas.");
                        }

                        def.set(
                            gemInfo,
                            'id',         id,
                            'formula',    formula,
                            // label
                            // measureType
                            'reportAxis', reportAxis);
                    });
                },

                // Benny: This method should only return the options which would
                // directly be used by CCC when derived from the input report.
                generateOptionsFromAnalyzerState: function (report) {
                  var userDefinedOpts = {};
                  var chartOptions = report.reportDoc.getChartOptions().attributes;
                  for (var i = 0; i < chartOptions.length; i++) {
                    var option = chartOptions[i];
                    switch(option.nodeName){
                      case 'lineShape':
                      case 'lineWidth':
                      case 'scatterPattern':
                      case 'scatterColorSet':
                      case 'scatterReverseColors':
                        break;

                      default:
                        userDefinedOpts[option.nodeName] = option.nodeValue;
                    }
                  }
                  return userDefinedOpts;
                },

                // Adapted from cv.Report#isRequiredGembarsFilled
                //
                // DCL - this uses the report API while
                // the Config#updateConfiguration uses the
                // pentaho.commons.propertiesPanel.Configuration API...
                canRefreshReport: function(report){
                    var dataReq = report.getVizDataReq();
                    for(var i = 0; i < dataReq.length ; i++) {
                      if(dataReq[i].required == true) {
                        if(report.findGemsByGembarId(dataReq[i].id).length == 0)
                          return false;
                      }
                    }

                    switch(report.visualization.id){
                        case 'ccc_heatgrid':
                            return report.findGemsByGembarId("color").length > 0 ||
                                   report.findGemsByGembarId("size" ).length > 0;
                            break;

                        case 'ccc_barline':
                            return report.findGemsByGembarId("measures"    ).length > 0 ||
                                   report.findGemsByGembarId("measuresLine").length > 0;
                            break;
                    }

                    return true;
                }
            });

            declare("analyzer.CCCVizConfig", [analyzer.ColorConfiguration], {

                _processModelValueChange: function(item, args){
                    // works by convention where the ids of the data req items match the property names
                    this.report.visualization.args[item.id] = args.newVal;
                },

                onModelEvent: function (config, item, eventName, args) {
                    if (eventName == "value") {
                        this._processModelValueChange(item, args);
                    }

                    this.inherited(arguments); // Let super class handle the insertAt and removedGem events
                },

                updateConfiguration: function(config){

                    this.inherited(arguments);

                    // Make sure that every dataReq value is passed as a report arg.
                    // This is not the case on a new report...
                    var reportArgs = this.report.visualization.args;
                    var props = config.properties;
                    if(props) props.forEach(function(item) {
                        if(!item.dataStructure){
                            var value = item.value;
                            if(value === undefined){
                                var values = item.values;
                                if(values && values.length){
                                    value = /*item.value = */values[0];
                                }
                            }

                            if(value !== undefined){
                                reportArgs[item.id] = value;
                            }
                        }
                    }, this);

                    // TODO: On a new report onModelEvent is not fired
                    // and thus _setScalingType and _setColorRange
                    // are not called to set default values.
                    // We detect an empty colorScaleType and
                    // calculate the missing values.
                    // When the report is saved, those
                    // properties will be saved with the report args
                    // and will no longer be empty.
                    if(!reportArgs.colorScaleType){
                        var patternConfig = config.byId('pattern');
                        if(patternConfig){
                            this._updateColorConfiguration(config);
                        }
                    }

                    this._updateTrendUI(config);
                },

                // TODO: Taken from analyzer.ColorConfiguration#onModelEvent
                _updateColorConfiguration: function(config){
                    var pattern = config.byId("pattern" ).value;
                    var colors  = config.byId("colorSet").value;
                    var suffix = "";
                    var scalingType;
                    // compute an array
                    if(pattern == "GRADIENT"){
                      //smooth gradient based on range
                      scalingType = "linear";
                      suffix = "-5";
                    } else {
                      suffix = (pattern == "3-COLOR") ? "-3": "-5";
                      scalingType = "discrete";
                    }

                    this._setScalingType(scalingType);

                    var reverse = config.byId("reverseColors").value;
                    var palette = this.palettes[colors+suffix];
                    if(reverse){
                      var newPalette = [];
                      for(var i = palette.length-1; i >= 0; i--){
                        newPalette.push(palette[i]);
                      }
                      palette = newPalette;
                    }

                    this._setColorRange(palette);
                },

                _updateTrendUI: function(config){
                    var trendTypeConfig = config.byId('trendType');
                    if(trendTypeConfig){
                        var trendType = trendTypeConfig.value;
                        var hidden = !trendType || trendType === 'none';

                        config.byId("trendLineWidth").ui.hidden = hidden;
                        config.byId("trendName").ui.hidden = hidden;
                    }
                },
                _setScalingType: function (colorScaleType) {
                    this.report.visualization.args.colorScaleType = colorScaleType;
                },

                _setColorRange: function (range) {
                    this.report.visualization.args.colors = range;
                }
            });

            declare("analyzer.CCCHeatgridVizConfig", [analyzer.CCCVizConfig], {

                onModelEvent: function (config, item, eventName, args) {
                    switch(eventName){
                        case 'insertAt':
                        case 'gems': // move gem
                            this._updateOptions(config);
                            break;
                    }

                    this.inherited(arguments); // ends up calling updateConfiguration
                },

                updateConfiguration: function(config){
                    this._updateOptions(config);

                    this.inherited(arguments);
                },

                _updateOptions: function(config){
                    // Required logic, both size and color required by default, turn required off one when the other is filled.

                    var colorBy = config.byId("color");
                    var sizeBy  = config.byId("size");
                    var totalGems = colorBy.gems.length + sizeBy.gems.length;
                    colorBy.required = (totalGems == 0);
                    sizeBy.required = (totalGems == 0);
                }
            });

            declare("analyzer.CCCBarLineVizConfig", [analyzer.CCCVizConfig], {

                onModelEvent: function (config, item, eventName, args) {
                    // Moving or adding a gem may cause the color options to appear/disappear
                    switch(eventName){
                        case 'insertAt':
                        case 'gems': // move gem
                            this._updateMeasuresOptions(config);
                            break;
                    }

                    this.inherited(arguments); // ends up calling updateConfiguration
                },

                updateConfiguration: function(config){
                    this._updateMeasuresOptions(config);

                    this.inherited(arguments);
                },

                _updateMeasuresOptions: function(config){
                    // Required logic, at least one of measuresBar or measuresLine is required by default
                    var measuresBar  = config.byId("measures");
                    var measuresLine = config.byId("measuresLine");
                    var totalGems = measuresBar.gems.length + measuresLine.gems.length;
                    measuresBar .required = (totalGems == 0);
                    measuresLine.required = (totalGems == 0);

                    // Show/hide line color options
                    var visible = measuresLine.gems.length > 0;
                    ["shape", "lineWidth"]
                    .forEach(function(id){
                        config.byId(id).ui.hidden = !visible;
                    })
                }
            });

            declare("analyzer.CCCScatterVizConfig", [analyzer.CCCVizConfig], {

                onModelEvent: function (config, item, eventName, args) {
                    // Moving or adding a gem may cause the color options to appear/disappear
                    switch(eventName){
                        case 'insertAt':
                        case 'gems': // move gem
                            this._updateColorRoleOptions(config);
                            break;
                    }

                    this.inherited(arguments); // ends up calling updateConfiguration
                },

                updateConfiguration: function(config){
                    this._updateColorRoleOptions(config);
                    this.inherited(arguments);
                },

                _updateColorRoleOptions: function(config){
                    var colorBy = config.byId("color");

                    colorBy.allowMultiple = !colorBy.gems.length ||
                                            colorBy.gems[0].type !== 'measure';

                    // Show/hide color options
                    var visible = colorBy.gems.length > 0 && colorBy.gems[0].type === 'measure';
                    config.byId("reverseColors").ui.hidden = !visible;
                    config.byId("colorSet").ui.hidden = !visible;
                    config.byId("pattern").ui.hidden = !visible;
                }
            });

            // Register CCC Visualizations
            var vizIds = [
                'ccc_bar',
                'ccc_barstacked',
                'ccc_barnormalized',

                'ccc_horzbar',
                'ccc_horzbarstacked',
                'ccc_horzbarnormalized',

                'ccc_pie',
                'ccc_line',
                'ccc_area',

                'ccc_scatter',
                'ccc_barline',
                'ccc_heatgrid',
                'ccc_sunburst'

                //'ccc_treemap' - See ANALYZER-1983

                //'ccc_waterfall',
                //'ccc_boxplot'
                //'ccc_bulletchart'
            ];

            var vizCustomConfigs = {
                'ccc_heatgrid': analyzer.CCCHeatgridVizConfig,
                'ccc_scatter':  analyzer.CCCScatterVizConfig,
                'ccc_barline':  analyzer.CCCBarLineVizConfig
            };

            var vizHelper = new analyzer.CCCVizHelper();

            if(!cv.pentahoVisualizations       ) cv.pentahoVisualizations = [];
            if(!cv.pentahoVisualizationsHelpers) cv.pentahoVisualizationsHelpers = {};

            vizIds.forEach(function(vizId) {
                cv.pentahoVisualizations.push(vizTypes.get(vizId));

                cv.pentahoVisualizationHelpers[vizId] = vizHelper;

                analyzer.LayoutPanel.configurationManagers['JSON_' + vizId] =
                    vizCustomConfigs[vizId] || analyzer.CCCVizConfig;
            });
        } // end init method
    });
});
