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
   * A nominal color palette of 12 light colors.
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#80AFD5"></td><td>#80AFD5</td></tr>
   * <tr><td style="background-color:#81D4FA"></td><td>#81D4FA</td></tr>
   * <tr><td style="background-color:#FFBC80"></td><td>#FFBC80</td></tr>
   * <tr><td style="background-color:#F8E1A4"></td><td>#F8E1A4</td></tr>
   * <tr><td style="background-color:#AFA1E2"></td><td>#AFA1E2</td></tr>
   * <tr><td style="background-color:#C9B7EE"></td><td>#C9B7EE</td></tr>
   * <tr><td style="background-color:#80C2AD"></td><td>#80C2AD</td></tr>
   * <tr><td style="background-color:#8BE2C1"></td><td>#8BE2C1</td></tr>
   * <tr><td style="background-color:#BFD09D"></td><td>#BFD09D</td></tr>
   * <tr><td style="background-color:#CBEC8A"></td><td>#CBEC8A</td></tr>
   * <tr><td style="background-color:#DB8E8E"></td><td>#DB8E8E</td></tr>
   * <tr><td style="background-color:#FBADAB"></td><td>#FBADAB</td></tr>
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.nominalLight
   * @type {pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/nominalLight
   */

  var spec = specUtil.merge({
    level: "nominal",
    colors: [
      "#80AFD5", "#81D4FA", "#FFBC80", "#F8E1A4", "#AFA1E2", "#C9B7EE",
      "#80C2AD", "#8BE2C1", "#BFD09D", "#CBEC8A", "#DB8E8E", "#FBADAB"
    ]
  }, module.config);

  return new Palette(spec);
});
