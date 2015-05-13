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
    "common-ui/es6-promise-shim",
    "require",
    "cdf/lib/CCC/def",
    "./wrapper/trends"
], function(Promise, require, def) {
    
    var vizTypeToClassMap = {
        "ccc_bar":               "BarChart",
        "ccc_barstacked":        "StackedBarChart",
        "ccc_horzbar":           "HorizontalBarChart",
        "ccc_horzbarstacked":    "HorizontalStackedBarChart",
        "ccc_barnormalized":     "NormalizedBarChart",
        "ccc_horzbarnormalized": "HorizontalNormalizedBarChart",
        "ccc_line":         	 "LineChart",
        "ccc_area":              "StackedAreaChart",
        "ccc_scatter":           "MetricDotChart",
        "ccc_barline":           "BarLineChart",
        "ccc_waterfall":         "WaterfallChart",
        "ccc_boxplot":           "BoxplotChart",
        "ccc_pie":               "PieChart",
        "ccc_heatgrid":          "HeatGridChart",
        "ccc_treemap":           "TreemapChart",
        "ccc_sunburst":          "SunburstChart"
    };
    
    // Async Instance Factory
    return function(type, arg) {
        var className = def.getOwn(vizTypeToClassMap, type);
        if(!className) throw new Error("Invalid CCC visualization type '" + type + "'.");
        
        // @type Promise<IViz> 
        return new Promise(function(resolve, reject) {
            require(["./wrapper/charts/" + className], function(ChartClass) {
                var viz = new ChartClass(arg);
                resolve(viz);
            });
        });
    };
});
