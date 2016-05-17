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
  "../cartesianAbstract/model",
  "pentaho/i18n!../abstract/i18n/model",
  "../abstract/types/labelsOption",
  "../abstract/mixins/scaleSizeContinuousType",
  "../abstract/mixins/scaleColorContinuousType",
  "../abstract/mixins/settingsMultiChartType"
], function(cartesianAbstractModelFactory, bundle, labelsOptionFactory,
    scaleSizeContinuousType, scaleColorContinuousType, settingsMultiChartType) {

  "use strict";

  return function(context) {

    var CartesianAbstractModel = context.get(cartesianAbstractModelFactory);

    return CartesianAbstractModel.extend({

        type: {
          id: "pentaho/visual/ccc/metricDot",
          v2Id: "ccc_scatter",

          view: "View",
          styleClass: "pentaho-visual-ccc-metric-dot",

          props: [
            {
              name: "rows", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/nominal",
                props: {attributes: {isRequired: true}}
              }
            },
            {
              name: "x", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/quantitative",
                dataType: "number",
                props: {attributes: {countMin: 1, countMax: 1, isRequired: true}}
              }
            },
            {
              name: "y", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/quantitative",
                dataType: "number",
                props: {attributes: {countMin: 1, countMax: 1, isRequired: true}}
              }
            },
            {
              name: "color", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/mapping",
                levels: ["nominal", "quantitative"],
                props: {attributes: {isRequired: true}}
              }
              // TODO: countMin depends on whether data props are discrete or continuous...
            },
            {
              name: "size", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/quantitative",
                dataType: "number",
                props: {attributes: {countMin: 1, countMax: 1}}
              }
            },
            {
              name: "multi", //VISUAL_ROLE
              type: {
                base: "pentaho/visual/role/nominal",
                props: {attributes: {isRequired: false}}
              }
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

      .implement({type: scaleSizeContinuousType})
      .implement({type: bundle.structured["scaleSizeContinuous"]})
      // TODO: should only be applicable when color is continuous
      .implement({type: scaleColorContinuousType})
      .implement({type: bundle.structured["scaleColorContinuous"]})
      .implement({type: settingsMultiChartType})
      .implement({type: bundle.structured["settingsMultiChart"]})
      .implement({type: bundle.structured["metricDot"]});
  };
});
