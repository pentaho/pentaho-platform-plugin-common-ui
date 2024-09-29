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
  "pentaho/visual/color/Palette",
  "pentaho/util/spec"
], function(module, Palette, specUtil) {

  "use strict";

  /**
   * A quantitative color palette of 5 tones of blue.
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#CCDFED"></td><td>#CCDFED</td></tr>
   * <tr><td style="background-color:#9CB2C8"></td><td>#9CB2C8</td></tr>
   * <tr><td style="background-color:#6D85A4"></td><td>#6D85A4</td></tr>
   * <tr><td style="background-color:#3E587F"></td><td>#3E587F</td></tr>
   * <tr><td style="background-color:#0F2B5B"></td><td>#0F2B5B</td></tr>
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.quantitativeBlue5
   * @type {pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/quantitativeBlue5
   */

  var spec = specUtil.merge({
    level: "quantitative",
    colors: [
      "#CCDFED", "#9CB2C8", "#6D85A4", "#3E587F", "#0F2B5B"
    ]
  }, module.config);

  return new Palette(spec);
});
