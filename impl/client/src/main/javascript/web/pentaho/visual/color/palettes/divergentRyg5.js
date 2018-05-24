/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/visual/color/Palette",
  "pentaho/util/spec"
], function(module, Palette, specUtil) {

  "use strict";

  /**
   * A divergent color palette of 5 colors: two tones of red, one of yellow and another two of green.
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#FF0000"></td><td>#FF0000</td></tr>
   * <tr><td style="background-color:#FFBF3F"></td><td>#FFBF3F</td></tr>
   * <tr><td style="background-color:#FFFF00"></td><td>#FFFF00</td></tr>
   * <tr><td style="background-color:#BFDF3F"></td><td>#BFDF3F</td></tr>
   * <tr><td style="background-color:#008000"></td><td>#008000</td></tr>
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.divergentRyg5
   * @type {!pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/divergentRyg5
   */

  var spec = specUtil.merge({
    level: "divergent",
    colors: [
      "#FF0000", "#FFBF3F", "#FFFF00", "#BFDF3F", "#008000"
    ]
  }, module.config);

  return new Palette(spec);
});
