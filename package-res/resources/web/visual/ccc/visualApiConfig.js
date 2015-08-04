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
define(function() {

  return /* @type IVisualApiConfiguration */{

    // IVisualType Configurations for sets of <type,container>
    types: /* @type IVisualTypeConfiguration[] */[

      // Configure all CCC-based visuals for Analyzer
      {
        id:        /^x-ccc_/,
        container: "analyzer",

        getEditorProperties: function(editorDoc, filterPropsList, filterPropsMap) {
          // Let every Analyzer option pass-through except certain ignored ones.
          // This is true even if some/all don't have corresponding data requirements.

          var visualProps = {};

          (filterPropsList || editorDoc).forEach(function(p) {
              if(!isIgnoredEditorProp(p)) {
                var value = editorDoc.get(p);
                switch(p) {
                  // boolean
                  case "autoRange":
                  case "autoRangeSecondary":
                  case "showLegend":
                    value = (value === "true");
                    break;

                  case "maxChartsPerRow":
                    value = parseFloat(value);
                    break;
                }

                visualProps[p] = value;
              }
            });

          return visualProps;
        }
      }
    ]
  };

  function isIgnoredEditorProp(p) {
    switch(p) {
      case "customChartType":
      case "chartType":
      case "maxValues":

      case "lineShape":
      case "lineWidth":
      case "scatterPattern":
      case "scatterColorSet":
      case "scatterReverseColors":
        return true;
    }
    return false;
  }
});
