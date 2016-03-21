/*!
* Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
    "cdf/lib/CCC/def"
], function(declare, def) {

    /*global analyzerPlugins:true, cv: true, cvCatalog: true, analyzer: true */

    // If necessary, declare **global** variable, initializing it with an array
    analyzerPlugins = typeof analyzerPlugins == "undefined" ? [] : analyzerPlugins;

    analyzerPlugins.push({
        init: function () {
            declare("analyzer.XCCCVizHelper", null, {
                // Analyzer hooks.
                // generateOptionsFromAnalyzerState(report)
                // placeholderImageSrc
                // canRefreshReport()

                /**
                 * Indicates if interaction features are enabled.
                 * When printing, as in a server environment,
                 * interaction features are disabled.
                 */
                isInteractionEnabled: function() {
                    return true;
                },

                showConfirm: function(msg, msgId) {
                    if (!msgId || !cv.prefs.suppressMsg[msgId]) {
                        cv.getActiveReport().rptDlg.showConfirm(msg, null, null, null, msgId);
                    }
                },

                message: function(msgId, args) {
                    var msg = cvCatalog[msgId] || "";
                    if(msg && args) {
                        msg = cv.util.substituteParams.apply(cv.util, [msg].concat(args));
                    }

                    return msg;
                },

                getDoubleClickTooltip: function() {
                    return cv.getActiveReport().getDoubleClickTooltip();
                }
            });

            // Register CCC Visuals with Analyzer
            var visualHelper = new analyzer.XCCCVizHelper();

            [
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
            ].forEach(
                function(typeId) {
                    // VizAPI 3 side-by-side
                    // x-prefix
                    typeId = "x-" + typeId;

                    this[typeId] = visualHelper;
                },
                cv.pentahoVisualizationHelpers || (cv.pentahoVisualizationHelpers = {}));
        } // end init method
    });
});
