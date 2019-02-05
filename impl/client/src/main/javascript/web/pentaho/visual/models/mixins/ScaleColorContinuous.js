/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "../../Model",
  "../types/ColorSet",
  "../types/Pattern",
  "pentaho/i18n!../i18n/model"
], function(module, BaseModel, ColorSet, Pattern, bundle) {

  "use strict";

  // Used by: HG, Scatter and GEO

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      props: [
        {
          name: "paletteQuantitative",
          base: "pentaho/visual/color/PaletteProperty",
          levels: ["quantitative", "divergent"],
          isApplicable: __isColorInContinuousMode,
          defaultValue: null // Value is calculated from the other properties.
        },
        {
          name: "pattern",
          valueType: Pattern,
          isRequired: true,
          isApplicable: __isColorInContinuousMode,
          defaultValue: "gradient"
        },
        {
          name: "colorSet",
          valueType: ColorSet,
          isRequired: true,
          isApplicable: __isColorInContinuousMode,
          defaultValue: "ryg"
        },
        {
          name: "reverseColors",
          valueType: "boolean",
          isRequired: true,
          isApplicable: __isColorInContinuousMode,
          defaultValue: false
        }
      ]
    }
  })
  .localize({$type: bundle.structured.ScaleColorContinuous})
  .configure({$type: module.config});

  function __isColorInContinuousMode() {
    var mode = this.color.mode;
    return mode !== null && mode.isContinuous;
  }
});
