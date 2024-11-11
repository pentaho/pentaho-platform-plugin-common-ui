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
   * A divergent color palette of 5 colors: two tones of red, one of yellow and another two of blue.
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#FF0000"></td><td>#FF0000</td></tr>
   * <tr><td style="background-color:#FFBF3F"></td><td>#FFBF3F</td></tr>
   * <tr><td style="background-color:#FFFF00"></td><td>#FFFF00</td></tr>
   * <tr><td style="background-color:#DCDDDE"></td><td>#DCDDDE</td></tr>
   * <tr><td style="background-color:#4BB6E4"></td><td>#4BB6E4</td></tr>
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.divergentRyb5
   * @type {pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/divergentRyb5
   */

  var spec = specUtil.merge({
    level: "divergent",
    colors: [
      "#FF0000", "#FFBF3F", "#FFFF00", "#DCDDDE", "#4BB6E4"
    ]
  }, module.config);

  return new Palette(spec);
});
