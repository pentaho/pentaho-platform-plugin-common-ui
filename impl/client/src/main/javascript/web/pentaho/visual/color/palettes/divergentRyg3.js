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
   * A divergent color palette of 3 colors: one red, one yellow and another one green.
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#FF0000"></td><td>#FF0000</td></tr>
   * <tr><td style="background-color:#FFFF00"></td><td>#FFFF00</td></tr>
   * <tr><td style="background-color:#008000"></td><td>#008000</td></tr>
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.divergentRyg3
   * @type {pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/divergentRyg3
   */

  var spec = specUtil.merge({
    level: "divergent",
    colors: [
      "#FF0000", "#FFFF00", "#008000"
    ]
  }, module.config);

  return new Palette(spec);
});
