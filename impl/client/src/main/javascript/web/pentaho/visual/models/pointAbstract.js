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
  "./categoricalContinuousAbstract",
  "pentaho/i18n!./i18n/model",
  "./types/labelsOption",
  "./types/shape",
  "./mixins/settingsMultiChartType",
  "./mixins/interpolationType"
], function(module, baseModelFactory, bundle, labelsOptionFactory, shapeFactory,
    settingsMultiChartType, interpolationType) {

  "use strict";

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,
        isAbstract: true,
        props: [
          {
            name: "rows", // VISUAL_ROLE
            type: {
              // Always a visual key, whatever the effective measurement level or data type.
              isVisualKey: true,
              instance: {
                _getAttributesMaxLevel: function() {
                  // If the mapping contains a single `number` attribute,
                  // consider it ordinal, and not quantitative as the base code does.
                  var count = this.attributes.count;
                  if(count === 1) {
                    var dataAttr = this.attributes.at(0).dataAttribute;
                    if(dataAttr && dataAttr.type === "number") {
                      return "ordinal";
                    }
                  } else if(count > 1) {
                    return "ordinal";
                  }

                  return this.base();
                }
              }
            }
          },
          {
            name: "measures", // VISUAL_ROLE
            type: {
              props: {attributes: {isRequired: true}}
            },
            ordinal: 7
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
    .implement({type: settingsMultiChartType})
    .implement({type: bundle.structured.settingsMultiChart})
    .implement({type: interpolationType})
    .implement({type: bundle.structured.interpolation})
    .implement({type: bundle.structured.pointAbstract});
  };
});
