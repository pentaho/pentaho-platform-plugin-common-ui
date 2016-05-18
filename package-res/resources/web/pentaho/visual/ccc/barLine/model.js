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
  "../barAbstract/model",
  "pentaho/i18n!../abstract/i18n/model",
  "../abstract/types/labelsOption",
  "../abstract/types/shape",
  "../abstract/types/lineWidth",
  "../abstract/mixins/interpolationType"
], function(barAbstractModelFactory, bundle, labelsOptionFactory, shapeFactory, lineWidthFactory,
    interpolationType) {

  "use strict";

  return function(context) {

    var BarAbstract = context.get(barAbstractModelFactory);

    function requiredOneMeasure() {
      /*jshint validthis:true*/
      return !this.model.measures.attributes.count && !this.model.measuresLine.attributes.count;
    }

    function hasAttributesMeasuresLine() {
      /*jshint validthis:true*/
      return this.measuresLine.attributes.count > 0;
    }

    function hasAttributesMeasures() {
      /*jshint validthis:true*/
      return this.measuresLine.attributes.count > 0;
    }

    return BarAbstract.extend({

      type: {
        id: "pentaho/visual/ccc/barLine",
        v2Id: "ccc_barline",

        view: "View",
        styleClass: "pentaho-visual-ccc-bar-line",

        props: [
          {
            name: "measures", //VISUAL_ROLE
            type: {
              props: {attributes: {isRequired: requiredOneMeasure}}
            }
          },
          {
            name: "measuresLine", //VISUAL_ROLE
            type: {
              base: "pentaho/visual/role/quantitative",
              dataType: "number",
              props: {attributes: {isRequired: requiredOneMeasure}}
            }
          },

          {
            name: "lineWidth",
            type: lineWidthFactory,
            isApplicable: hasAttributesMeasuresLine,
            isRequired: true,
            value: 1
          },
          {
            name: "labelsOption",
            type: {
              base: labelsOptionFactory,
              domain: ["none", "center", "insideEnd", "insideBase", "outsideEnd"]
            },
            isApplicable: hasAttributesMeasures,
            isRequired: true,
            value: "none"
          },

          {
            name: "lineLabelsOption",
            type: {
              base: labelsOptionFactory,
              domain: ["none", "center", "left", "right", "top", "bottom"]
            },
            isApplicable: hasAttributesMeasuresLine,
            isRequired: true,
            value: "none"
          },

          {
            name: "shape",
            type: shapeFactory,
            isRequired: true,
            value: "circle",
            isApplicable: hasAttributesMeasuresLine
          }
        ]
      }
    })
    .implement({type: interpolationType})
    .implement({type: bundle.structured["interpolation"]})
    .implement({type: bundle.structured["barLine"]});
  };
});
