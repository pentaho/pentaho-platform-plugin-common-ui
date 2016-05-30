/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../abstract/model",
  "pentaho/i18n!../abstract/i18n/model",
  "../abstract/types/displayUnits",
  "../abstract/types/labelsOption",
  "../abstract/types/sliceOrder",
  "../abstract/mixins/settingsMultiChartType"
], function(abstractModelFactory, bundle, displayUnitsFactory, labelsOptionFactory, sliceOrderFactory,
    settingsMultiChartType) {

  "use strict";

  return function(context) {

    var Abstract = context.get(abstractModelFactory);

    return Abstract.extend({
      type: {
        id: "pentaho/visual/ccc/sunburst",
        v2Id: "ccc_sunburst",
        category: "treemapchart",

        view: "View",
        styleClass: "pentaho-visual-ccc-sunburst",

        props: [
          {
            name: "rows", //VISUAL_ROLE
            type: {
              props: {attributes: {isRequired: true}}
            }
          },
          {
            name: "size", //VISUAL_ROLE
            type: {
              base: "pentaho/visual/role/quantitative",
              dataType: "number",
              props: {attributes: {countMax: 1}}
            }
          },
          {
            name: "multi", //VISUAL_ROLE
            type: "pentaho/visual/role/ordinal"
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
            isRequired: true,
            value: "bySizeDescending"
          }
        ]
      }
    })
    .implement({type: settingsMultiChartType})
    .implement({type: bundle.structured["settingsMultiChart"]})
    .implement({type: bundle.structured["sunburst"]});
  };
});
