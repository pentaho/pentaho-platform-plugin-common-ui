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
  "./BarAbstract",
  "./types/LabelsOption",
  "./types/Shape",
  "./types/LineWidth",
  "./mixins/Interpolated",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, LabelsOption, Shape, LineWidth, InterpolatedModel, bundle) {

  "use strict";

  return BaseModel.extend({

    $type: {
      id: module.id,
      mixins: [InterpolatedModel],

      v2Id: "ccc_barline",
      category: "barchart",
      defaultView: "pentaho/ccc/visual/BarLine",

      props: [
        {
          name: "measures", // VISUAL_ROLE
          fields: {isRequired: __isRequiredOneMeasure}
        },
        {
          name: "measuresLine", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: ["number"]}
          ],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 7
        },

        {
          name: "lineWidth",
          valueType: LineWidth,
          isApplicable: __hasFieldsMeasuresLine,
          isRequired: true,
          defaultValue: 1
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center", "insideEnd", "insideBase", "outsideEnd"],
          isApplicable: __hasFieldsMeasures,
          isRequired: true,
          defaultValue: "none"
        },

        {
          name: "lineLabelsOption",
          valueType: LabelsOption,
          domain: ["none", "center", "left", "right", "top", "bottom"],
          isApplicable: __hasFieldsMeasuresLine,
          isRequired: true,
          defaultValue: "none"
        },

        {
          name: "shape",
          valueType: Shape,
          isRequired: true,
          defaultValue: "circle",
          isApplicable: __hasFieldsMeasuresLine
        }
      ]
    }
  })
  .localize({$type: bundle.structured.BarLine})
  .configure({$type: module.config});

  function __isRequiredOneMeasure() {
    /* jshint validthis:true*/
    return !this.measures.hasFields && !this.measuresLine.hasFields;
  }

  function __hasFieldsMeasuresLine() {
    /* jshint validthis:true*/
    return this.measuresLine.hasFields;
  }

  function __hasFieldsMeasures() {
    /* jshint validthis:true*/
    return this.measures.hasFields;
  }
});
