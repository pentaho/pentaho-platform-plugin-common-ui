/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
    "./types/shape",
    "./types/labelsOption",
    "./mixins/scaleSizeContinuous",
    "./mixins/scaleColorContinuous",
    function(BaseModel, Shape, LabelsOption, ScaleSizeContinuousModel, ScaleColorContinuousModel) {

      return BaseModel.extend({
        $type: {
          mixins: [ScaleSizeContinuousModel, ScaleColorContinuousModel],

          v2Id: "ccc_heatgrid",
          category: "heatgrid",
          defaultView: "pentaho/ccc/visual/heatGrid",

          props: [
            {
              name: "rows", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["ordinal"],
              attributes: {isRequired: true},
              ordinal: 5
            },
            {
              name: "columns", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["ordinal"],
              ordinal: 6
            },
            {
              name: "color", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["quantitative"],
              dataType: "number",
              attributes: {isRequired: __requiredOneMeasure, countMax: 1},
              ordinal: 7
            },
            {
              name: "size", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["quantitative"],
              dataType: "number",
              attributes: {isRequired: __requiredOneMeasure, countMax: 1},
              ordinal: 8
            },
            {
              name: "labelsOption",
              valueType: LabelsOption,
              domain: ["none", "center"],
              isRequired: true,
              defaultValue: "none"
            },
            {
              name: "shape",
              valueType: Shape,
              domain: ["none", "circle", "square"],
              isRequired: true,
              defaultValue: "square"
            }
          ]
        }
      })
      .implement({$type: bundle.structured.heatGrid});
    }
  ];

  function __requiredOneMeasure() {
    /* jshint validthis:true*/
    return !this.size.attributes.count && !this.color.attributes.count;
  }
});
