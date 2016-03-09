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
  "../abstract/types/shape",
  "../abstract/types/labelsOption",
  "../abstract/mixins/scaleSizeContinuousMeta",
  "../abstract/mixins/scaleColorContinuousMeta"
], function(cartesianAbstractModelFactory, bundle, shapeFactory, labelsOptionFactory,
    scaleSizeContinuousMeta, scaleColorContinuousMeta) {

  "use strict";

  return function(context) {

    var CartesianAbstract = context.get(cartesianAbstractModelFactory);

    function requiredOneMeasure() {
      /*jshint validthis:true*/
      return !this.count("size") && !this.count("color");
    }

    return CartesianAbstract.extend({
        meta: {
          id: "pentaho/visual/ccc/heatGrid",
          v2Id: "ccc_heatgrid",

          view: "View",
          styleClass: "pentaho-visual-ccc-heat-grid",

          props: [
            {
              name: "rows",
              isRequired: true
            },
            {
              name: "columns",
              type: ["string"],
              dataType: "string",
              isVisualRole: true,
              isRequired: false
            },
            {
              name: "size",
              type: "string",
              dataType: "number",
              isVisualRole: true,
              isRequired: requiredOneMeasure
            },
            {
              name: "color",
              type: "string",
              dataType: "number",
              isVisualRole: true,
              isRequired: requiredOneMeasure
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
              name: "shape",
              type: {
                base: shapeFactory,
                domain: ["none", "circle", "square"]
              },
              isRequired: true,
              value: "square"
            }
          ]
        }
      })
      .implement({meta: scaleSizeContinuousMeta})
      .implement({meta: bundle.structured["scaleSizeContinuous"]})
      .implement({meta: scaleColorContinuousMeta})
      .implement({meta: bundle.structured["scaleColorContinuous"]})
      .implement({meta: bundle.structured["heatGrid"]});
  };
});
