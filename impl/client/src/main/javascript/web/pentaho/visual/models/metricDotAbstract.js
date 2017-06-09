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
  "./cartesianAbstract",
  "pentaho/i18n!./i18n/model",
  "./types/labelsOption",
  "./mixins/scaleColorContinuous",
  "./mixins/multiCharted",
  "./mixins/trended"
], function(module, baseModelFactory, bundle, labelsOptionFactory,
    scaleColorContinuousFactory, multiChartedFactory, trendedFactory) {

  "use strict";

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,
        isAbstract: true,
        // TODO: scaleColor... should only be applicable when color is continuous
        mixins: [trendedFactory, scaleColorContinuousFactory, multiChartedFactory],

        category: "scatter",

        props: [
          {
            name: "rows", // VISUAL_ROLE
            type: {
              isAccident: true,
              levels: ["ordinal"],
              props: {attributes: {isRequired: true}}
            }
          },
          {
            name: "x", // VISUAL_ROLE
            type: {
              base: "pentaho/visual/role/quantitative",
              props: {attributes: {countMin: 1, countMax: 1}}
            },
            ordinal: 1
          },
          {
            name: "y", // VISUAL_ROLE
            type: {
              base: "pentaho/visual/role/quantitative",
              props: {attributes: {countMin: 1, countMax: 1}}
            },
            ordinal: 2
          },
          {
            // Modal visual role
            name: "color", // VISUAL_ROLE
            type: {
              base: "pentaho/visual/role/mapping",
              levels: ["nominal", "quantitative"],
              props: {
                attributes: {
                  // TODO: countMax depends on whether data props are discrete or continuous...
                  countMax: function() {
                    var MeasurementLevel = this.type.context.get("pentaho/visual/role/level");
                    return MeasurementLevel.type.isQuantitative(this.levelEffective) ? 1 : null;
                  }// TODO: should only be applicable when color is continuous
                }
              },
              getAttributesMaxLevelOf: function(mapping) {
                // If the mapping contains a single `date` attribute,
                // consider it ordinal, and not quantitative as the base code does.
                // Currently, CCC does not like dates in continuous color scales...
                if(mapping.attributes.count === 1) {
                  var dataAttr = mapping.attributes.at(0).dataAttribute;
                  if(dataAttr && dataAttr.type === "date")
                    return "ordinal";
                }

                return this.base(mapping);
              }
            },
            ordinal: 6
          },
          {
            name: "multi", // VISUAL_ROLE
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
    .implement({type: bundle.structured.metricDot});
  };
});
