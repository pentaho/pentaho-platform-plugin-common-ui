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
    "./abstract",
    "./types/displayUnits",
    "./types/labelsOption",
    "./types/sliceOrder",
    "./mixins/multiCharted",
    "./mixins/scaleColorDiscrete",
    function(BaseModel, DisplayUnits, LabelsOption, SliceOrder, MultiChartedModel, ScaleColorDiscreteModel) {

      return BaseModel.extend({
        $type: {
          mixins: [MultiChartedModel, ScaleColorDiscreteModel],
          v2Id: "ccc_sunburst",
          category: "treemapchart",
          defaultView: "pentaho/ccc/visual/sunburst",

          props: [
            {
              name: "rows", // VISUAL_ROLE
              modes: [
                {dataType: "list"}
              ],
              fields: {isRequired: true}
            },
            {
              name: "size", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              modes: [
                {dataType: "number"}
              ],
              ordinal: 7
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
              name: "displayUnits",
              valueType: DisplayUnits,
              isRequired: true,
              defaultValue: "units_0"
            },
            {
              name: "labelsOption",
              valueType: LabelsOption,
              domain: ["none", "center"],
              isApplicable: __hasFieldsSize,
              isRequired: true,
              defaultValue: "none"
            },
            {
              name: "emptySlicesHidden",
              valueType: "boolean",
              isRequired: true,
              defaultValue: true
            },
            {
              name: "sliceOrder",
              valueType: SliceOrder,
              isApplicable: __hasFieldsSize,
              isRequired: true,
              defaultValue: "bySizeDescending"
            }
          ]
        }
      })
      .implement({$type: bundle.structured.sunburst});
    }
  ];

  function __hasFieldsSize() {
    return this.size.hasFields;
  }
});
