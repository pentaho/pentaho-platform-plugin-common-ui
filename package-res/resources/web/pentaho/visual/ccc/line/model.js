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
  "../categoricalContinuousAbstract/model",
  "pentaho/i18n!../abstract/i18n/model",
  "../abstract/types/labelsOption",
  "../abstract/types/shape",
  "../abstract/types/lineWidth",
  "../abstract/mixins/trendType",
  "../abstract/mixins/settingsMultiChartType",
  "../abstract/mixins/interpolationType"
], function(categoricalContinuousAbstractFactory, bundle, labelsOptionFactory, shapeFactory, lineWidthFactory,
    trendType, settingsMultiChartType, interpolationType) {

  "use strict";

  return function(context) {

    var CategoricalContinuousAbstract = context.get(categoricalContinuousAbstractFactory);

    return CategoricalContinuousAbstract.extend({

        type: {
          id: "pentaho/visual/ccc/line",
          v2Id: "ccc_line",

          view: "View",
          styleClass: "pentaho-visual-ccc-line",

          props: [
            {
              name: "columns", //VISUAL_ROLE
              type: "pentaho/visual/role/ordinal"
            },
            {
              name: "measures", //VISUAL_ROLE
              type: {
                props: {attributes: {isRequired: true}}
              }
            },
            {
              name: "multi", //VISUAL_ROLE
              type: "pentaho/visual/role/ordinal"
            },

            {
              name: "lineWidth",
              type: lineWidthFactory,
              isApplicable: function() { return this.count("measures") > 0; },
              isRequired: true,
              value: 1
            },
            {
              name: "shape",
              type: shapeFactory,
              isRequired: true,
              value: "circle"
            },
            {
              name: "labelsOption",
              type: {
                base: labelsOptionFactory,
                domain: ["none", "center", "left", "right", "top", "bottom"]
              },
              isRequired: true,
              value: "none"
            }
          ]
        }

      })
      .implement({type: trendType})
      .implement({type: bundle.structured["trendType"]})
      .implement({type: settingsMultiChartType})
      .implement({type: bundle.structured["settingsMultiChart"]})
      .implement({type: interpolationType})
      .implement({type: bundle.structured["interpolation"]})
      .implement({type: bundle.structured["line"]});
  };
});
