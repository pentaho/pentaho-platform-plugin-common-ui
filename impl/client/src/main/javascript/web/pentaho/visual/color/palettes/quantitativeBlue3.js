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
   * A quantitative color palette of 3 tones of blue.
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#CCDFED"></td><td>#CCDFED</td></tr>
   * <tr><td style="background-color:#6D85A4"></td><td>#6D85A4</td></tr>
   * <tr><td style="background-color:#0F2B5B"></td><td>#0F2B5B</td></tr>
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.quantitativeBlue3
   * @type {pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/quantitativeBlue3
   */

  var spec = specUtil.merge({
    level: "quantitative",
    colors: [
      "#CCDFED", "#6D85A4", "#0F2B5B"
    ]
  }, module.config);

  return new Palette(spec);
});
