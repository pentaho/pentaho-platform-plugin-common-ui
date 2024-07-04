/*!
 * Copyright 2024 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "./Abstract",
  "./mixins/ScaleColorDiscrete",
  "./mixins/ScaleColorContinuous",
  "pentaho/i18n!./i18n/model"
], function (module, BaseModel, ScaleColorDiscreteModel, ScaleColorContinuousModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleColorDiscreteModel, ScaleColorContinuousModel],
      category: "misc2",

      props: [
        // VISUAL_ROLE
        {
          name: "rows",
          modes: {dataType: "list"},
          fields: {isRequired: true}
        },
        {
          name: "measures",
          base: "pentaho/visual/role/Property",
          modes: {dataType: "number"},
          fields: {isRequired: true},
          ordinal: 7
        },
        {
          name: "labelsOption",
          isApplicable: false
        },
        // End VISUAL_ROLE
        {
          name: "useMeasureColors",
          valueType: "boolean",
          isRequired: true,
          defaultValue: false
        },
        {
          name: "paletteQuantitative",
          isApplicable: __useMeasureColors
        },
        {
          name: "pattern",
          isApplicable: __useMeasureColors,
          domain: ["3_color", "5_color"],
          defaultValue: "3_color"
        },
        {
          name: "colorSet",
          isApplicable: __useMeasureColors
        },
        {
          name: "reverseColors",
          isApplicable: __useMeasureColors
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Gauge})
  .configure();

  function __useMeasureColors() {
    return this.useMeasureColors;
  }
});
