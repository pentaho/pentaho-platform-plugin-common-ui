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
   * A nominal color palette of 12 dark colors.
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#002644"></td><td>#002644</td></tr>
   * <tr><td style="background-color:#014462"></td><td>#014462</td></tr>
   * <tr><td style="background-color:#663000"></td><td>#663000</td></tr>
   * <tr><td style="background-color:#604E1D"></td><td>#604E1D</td></tr>
   * <tr><td style="background-color:#261B4E"></td><td>#261B4E</td></tr>
   * <tr><td style="background-color:#3B2C58"></td><td>#3B2C58</td></tr>
   * <tr><td style="background-color:#003524"></td><td>#003524</td></tr>
   * <tr><td style="background-color:#094E34"></td><td>#094E34</td></tr>
   * <tr><td style="background-color:#668032"></td><td>#668032</td></tr>
   * <tr><td style="background-color:#74A611"></td><td>#74A611</td></tr>
   * <tr><td style="background-color:#490B0B"></td><td>#490B0B</td></tr>
   * <tr><td style="background-color:#632422"></td><td>#632422</td></tr>
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.nominalDark
   * @type {pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/nominalDark
   */

  var spec = specUtil.merge({
    level: "nominal",
    colors: [
      "#002644", "#014462", "#663000", "#604E1D", "#261B4E", "#3B2C58",
      "#003524", "#094E34", "#668032", "#74A611", "#490B0B", "#632422"
    ]
  }, module.config);

  return new Palette(spec);
});
