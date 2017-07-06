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
  "./barAbstract",
  "pentaho/i18n!./i18n/model",
  "./types/labelsOption",
  "./types/shape",
  "./types/lineWidth",
  "./mixins/interpolated"
], function(module, baseModelFactory, bundle, labelsOptionFactory, shapeFactory, lineWidthFactory,
    interpolatedFactory) {

  "use strict";

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({

      type: {
        id: module.id,
        mixins: [interpolatedFactory],

        v2Id: "ccc_barline",
        category: "barchart",
        defaultView: "pentaho/ccc/visual/barLine",

        props: [
          {
            name: "measures", // VISUAL_ROLE
            attributes: {isRequired: __requiredOneMeasure}
          },
          {
            name: "measuresLine", // VISUAL_ROLE
            base: "pentaho/visual/role/property",
            levels: ["quantitative"],
            dataType: "number",
            attributes: {isRequired: __requiredOneMeasure},
            ordinal: 7
          },

          {
            name: "lineWidth",
            valueType: lineWidthFactory,
            isApplicable: __hasAttributesMeasuresLine,
            isRequired: true,
            defaultValue: 1
          },
          {
            name: "labelsOption",
            valueType: labelsOptionFactory,
            domain: ["none", "center", "insideEnd", "insideBase", "outsideEnd"],
            isApplicable: __hasAttributesMeasures,
            isRequired: true,
            defaultValue: "none"
          },

          {
            name: "lineLabelsOption",
            valueType: labelsOptionFactory,
            domain: ["none", "center", "left", "right", "top", "bottom"],
            isApplicable: __hasAttributesMeasuresLine,
            isRequired: true,
            defaultValue: "none"
          },

          {
            name: "shape",
            valueType: shapeFactory,
            isRequired: true,
            defaultValue: "circle",
            isApplicable: __hasAttributesMeasuresLine
          }
        ]
      }
    })
    .implement({type: bundle.structured.barLine});
  };

  function __requiredOneMeasure() {
    /* jshint validthis:true*/
    return !this.measures.attributes.count && !this.measuresLine.attributes.count;
  }

  function __hasAttributesMeasuresLine() {
    /* jshint validthis:true*/
    return this.measuresLine.attributes.count > 0;
  }

  function __hasAttributesMeasures() {
    /* jshint validthis:true*/
    return this.measures.attributes.count > 0;
  }
});
