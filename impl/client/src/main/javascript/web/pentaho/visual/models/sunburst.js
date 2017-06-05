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
  "module",
  "./abstract",
  "pentaho/i18n!./i18n/model",
  "./types/displayUnits",
  "./types/labelsOption",
  "./types/sliceOrder",
  "./mixins/multiCharted"
], function(module, baseModelFactory, bundle, displayUnitsFactory, labelsOptionFactory, sliceOrderFactory,
    multiChartedFactory) {

  "use strict";

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,
        mixins: [multiChartedFactory],
        v2Id: "ccc_sunburst",
        category: "treemapchart",
        defaultView: "pentaho/ccc/visual/sunburst",

        props: [
          {
            name: "rows", // VISUAL_ROLE
            type: {
              levels: ["ordinal"],
              props: {attributes: {isRequired: true}}
            }
          },
          {
            name: "size", // VISUAL_ROLE
            type: {
              base: "pentaho/visual/role/quantitative",
              dataType: "number",
              props: {attributes: {countMax: 1}}
            },
            ordinal: 7
          },
          {
            name: "multi", // VISUAL_ROLE
            type: "pentaho/visual/role/ordinal",
            ordinal: 10
          },
          {
            name: "displayUnits",
            type: displayUnitsFactory,
            isRequired: true,
            value: "units_0"
          },
          {
            name: "labelsOption",
            type: {
              base: labelsOptionFactory,
              domain: ["none", "center"]
            },
            isApplicable: isSizeMapped,
            isRequired: true,
            value: "none"
          },
          {
            name: "emptySlicesHidden",
            type: "boolean",
            isRequired: true,
            value: true
          },
          {
            name: "sliceOrder",
            type: sliceOrderFactory,
            isApplicable: isSizeMapped,
            isRequired: true,
            value: "bySizeDescending"
          }
        ]
      }
    })
    .implement({type: bundle.structured.sunburst});
  };

  function isSizeMapped() {
    return this.size.attributes.count > 0;
  }
});
