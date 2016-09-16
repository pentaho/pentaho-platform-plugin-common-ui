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
  "module",
  "../cartesianAbstract/model",
  "pentaho/i18n!../abstract/i18n/model",
  "../abstract/types/labelsOption",
  "../abstract/mixins/scaleColorContinuousType",
  "../abstract/mixins/settingsMultiChartType",
  "../abstract/mixins/trendType"
], function(module, cartesianAbstractModelFactory, bundle, labelsOptionFactory,
    scaleColorContinuousType, settingsMultiChartType, trendType) {

  "use strict";

  return function(context) {

    var CartesianAbstractModel = context.get(cartesianAbstractModelFactory);

    return CartesianAbstractModel.extend({

        type: {
          sourceId: module.id,
          id: module.id.replace(/.\w+$/, ""),
          isAbstract: true,
          category: "scatter",

          props: [
            {
              name: "rows", //VISUAL_ROLE
              type: {
                props: {attributes: {isRequired: true}}
              }
            },
            {
              name: "x", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/quantitative",
                props: {attributes: {countMin: 1, countMax: 1}}
              },
              ordinal: 1
            },
            {
              name: "y", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/quantitative",
                props: {attributes: {countMin: 1, countMax: 1}}
              },
              ordinal: 2
            },
            {
              // Modal visual role
              name: "color", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/mapping",
                levels: ["nominal", "quantitative"],
                props: {
                  attributes: {
                    // TODO: countMax depends on whether data props are discrete or continuous...
                    countMax: function() {
                      return this.levelEffective === "quantitative" ? 1 : null;
                    }
                  }
                }
              },
              ordinal: 6
            },
            {
              name: "multi", //VISUAL_ROLE
              type: "pentaho/visual/role/ordinal",
              ordinal: 10
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
      // TODO: should only be applicable when color is continuous
      .implement({type: scaleColorContinuousType})
      .implement({type: bundle.structured["scaleColorContinuous"]})
      .implement({type: settingsMultiChartType})
      .implement({type: bundle.structured["settingsMultiChart"]})
      .implement({type: trendType})
      .implement({type: bundle.structured["trendType"]})
      .implement({type: bundle.structured["metricDot"]});
  };
});
