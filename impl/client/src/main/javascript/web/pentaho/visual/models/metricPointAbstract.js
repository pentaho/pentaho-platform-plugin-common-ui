/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/i18n!./i18n/model"
], function(bundle) {

  "use strict";

  return [
    "./cartesianAbstract",
    "./types/labelsOption",
    "./mixins/scaleColorContinuous",
    "./mixins/scaleColorDiscrete",
    "./mixins/multiCharted",
    "./mixins/trended",
    function(BaseModel, LabelsOption, ScaleColorContinuousModel, ScaleColorDiscreteModel,
             MultiChartedModel, TrendedModel) {

      return BaseModel.extend({
        $type: {
          isAbstract: true,
          // TODO: scaleColor... should only be applicable when color is continuous
          mixins: [TrendedModel, ScaleColorDiscreteModel, ScaleColorContinuousModel, MultiChartedModel],

          category: "scatter",

          props: [
            {
              name: "rows", // VISUAL_ROLE
              modes: [
                {dataType: "list"}
              ],
              fields: {isRequired: true}
            },
            {
              name: "x", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              modes: [
                {dataType: "number"},
                {dataType: "date"}
              ],
              fields: {isRequired: true},
              ordinal: 1
            },
            {
              name: "y", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              modes: [
                {dataType: "number"},
                {dataType: "date"}
              ],
              fields: {isRequired: true},
              ordinal: 2
            },
            {
              // Modal visual role
              name: "color", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              isVisualKey: false,
              modes: [
                {dataType: "number"},
                {dataType: "list"} // catch-all
              ],
              ordinal: 6
            },
            {
              name: "multi", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              modes: [
                {dataType: "list"}
              ],
              ordinal: 10
            },
            {
              name: "labelsOption",
              valueType: LabelsOption,
              domain: ["none", "center", "left", "right", "top", "bottom"],
              isRequired: true,
              defaultValue: "none"
            }
          ]
        }
      })
      .implement({$type: bundle.structured.metricDot});
    }
  ];
});
