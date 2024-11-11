/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

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
  .configure();

  function __isColorInContinuousMode() {
    // If the color role does not exist, enable the controls. A sub-class may have other means to control applicability.
    var colorRole = this.color;
    if (colorRole == null) {
      return true;
    }

    var mode = colorRole.mode;
    return mode !== null && mode.isContinuous;
  }
});
