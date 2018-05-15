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
  "pentaho/module!",
  "./CartesianAbstract",
  "./types/Shape",
  "./types/LabelsOption",
  "./mixins/ScaleSizeContinuous",
  "./mixins/ScaleColorContinuous",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, Shape, LabelsOption, ScaleSizeContinuousModel, ScaleColorContinuousModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleSizeContinuousModel, ScaleColorContinuousModel],

      v2Id: "ccc_heatgrid",
      category: "heatgrid",
      defaultView: "pentaho/ccc/visual/HeatGrid",

      props: [
        {
          name: "rows", // VISUAL_ROLE
          modes: [
            {dataType: "list"}
          ],
          fields: {isRequired: true},
          ordinal: 5
        },
        {
          name: "columns", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "list"}
          ],
          ordinal: 6
        },
        {
          name: "color", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"}
          ],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 7
        },
        {
          name: "size", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"}
          ],
          fields: {isRequired: __isRequiredOneMeasure},
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
  .localize({$type: bundle.structured.HeatGrid})
  .configure({$type: module.config});

  function __isRequiredOneMeasure() {
    /* jshint validthis:true*/
    return !this.size.hasFields && !this.color.hasFields;
  }
});
