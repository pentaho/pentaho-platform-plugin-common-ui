/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/i18n!../i18n/model"
], function(bundle) {

  "use strict";

  // Used by: HG, Scatter and GEO

  return [
    "pentaho/visual/base/model",
    "../types/colorSet",
    "../types/pattern",
    "../types/multiChartOverflow",
    function(BaseModel, ColorSet, Pattern) {

      return BaseModel.extend({
        $type: {
          isAbstract: true,
          props: [
            {
              name: "paletteQuantitative",
              base: "pentaho/visual/color/paletteProperty",
              levels: ["quantitative", "divergent"],
              isApplicable: __hasQuantitativeAttributesColor,
              defaultValue: null // value is calculated from the other properties.
            },
            {
              name: "pattern",
              valueType: Pattern,
              isRequired: true,
              isApplicable: __hasQuantitativeAttributesColor,
              defaultValue: "gradient"
            },
            {
              name: "colorSet",
              valueType: ColorSet,
              isRequired: true,
              isApplicable: __hasQuantitativeAttributesColor,
              defaultValue: "ryg"
            },
            {
              name: "reverseColors",
              valueType: "boolean",
              isRequired: true,
              isApplicable: __hasQuantitativeAttributesColor,
              defaultValue: false
            }
          ]
        }
      })
      .implement({$type: bundle.structured.scaleColorContinuous});

      function __hasQuantitativeAttributesColor() {
        if(!this.color.isMapped) return false;

        var rolePropType = this.$type.get("color");
        var level = rolePropType.levelEffectiveOn(this);

        return MeasurementLevel.type.isQuantitative(level);
      }
    }
  ];
});
