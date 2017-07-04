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
  "./types/shape",
  "./types/labelsOption",
  "./mixins/scaleSizeContinuous",
  "./mixins/scaleColorContinuous"
], function(module, baseModelFactory, bundle, shapeFactory, labelsOptionFactory,
    scaleSizeContinuousFactory, scaleColorContinuousFactory) {

  "use strict";

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,
        mixins: [scaleColorContinuousFactory, scaleSizeContinuousFactory],

        v2Id: "ccc_heatgrid",
        category: "heatgrid",
        defaultView: "pentaho/ccc/visual/heatGrid",

        props: [
          {
            name: "rows", // VISUAL_ROLE
            base: "pentaho/visual/role/property",
            levels: ["ordinal"],
            attributes: {isRequired: true},
            ordinal: 5
          },
          {
            name: "columns", // VISUAL_ROLE
            base: "pentaho/visual/role/property",
            levels: ["ordinal"],
            ordinal: 6
          },
          {
            name: "color", // VISUAL_ROLE
            base: "pentaho/visual/role/property",
            levels: ["quantitative"],
            dataType: "number",
            attributes: {isRequired: requiredOneMeasure, countMax: 1},
            ordinal: 7
          },
          {
            name: "size", // VISUAL_ROLE
            base: "pentaho/visual/role/property",
            levels: ["quantitative"],
            dataType: "number",
            attributes: {isRequired: requiredOneMeasure, countMax: 1},
            ordinal: 8
          },
          {
            name: "labelsOption",
            valueType: labelsOptionFactory,
            domain: ["none", "center"],
            isRequired: true,
            defaultValue: "none"
          },
          {
            name: "shape",
            valueType: shapeFactory,
            domain: ["none", "circle", "square"],
            isRequired: true,
            defaultValue: "square"
          }
        ]
      }
    })
    .implement({type: bundle.structured.heatGrid});
  };

  function requiredOneMeasure() {
    /* jshint validthis:true*/
    return !this.size.attributes.count && !this.color.attributes.count;
  }
});
