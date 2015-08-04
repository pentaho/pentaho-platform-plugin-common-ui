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
    "cdf/lib/CCC/def"
], function(declare, def) {

    /*global analyzerPlugins:true, cv: true, cvCatalog: true, analyzer: true*/

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
                },

                completeAxisGemsMetadata: function(axis, gemsInfoList) {
                    var reportElem = cv.getActiveReport().reportDoc.getReportNode();
                    var isMeasure  = (axis === 'measure');
                    var unboundGemElemsByRole = {};

                    function gemElemComparer(a, b) {
                        return parseFloat(a.getAttribute("gembarOrdinal")) -
                               parseFloat(b.getAttribute("gembarOrdinal"));
                    }

                    function getRoleGemElems(role) {
                        var xpath = "[@gembarId='" + role + "']";
                        if(isMeasure) {
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

                    function getNextGemElem(role) {
                        var gemElems = def.getOwn(unboundGemElemsByRole, role);
                        if(!gemElems) {
                            gemElems = unboundGemElemsByRole[role] = getRoleGemElems(role);
                        }

                        var gemElem;
                        while(gemElems.length) {
                            gemElem = gemElems.shift();
                            if(gemElem.getAttribute("hideInChart") !== 'true') {
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
