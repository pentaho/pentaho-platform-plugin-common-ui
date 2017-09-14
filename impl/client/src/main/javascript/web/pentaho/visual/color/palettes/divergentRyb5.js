/*!
 * Copyright 2017 Pentaho Corporation. All rights reserved.
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
  "pentaho/util/spec"
], function(specUtil) {

  "use strict";

  return ["pentaho/visual/color/palette", function(Palette, config) {

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
     * @amd {pentaho.type.spec.UInstanceModule<pentaho.visual.color.Palette>} pentaho/visual/color/palettes/divergentRyb5
     */

    var spec = specUtil.merge({
      level: "divergent",
      colors: [
        "#FF0000", "#FFBF3F", "#FFFF00", "#DCDDDE", "#4BB6E4"
      ]
    }, config);

    return new Palette(spec);
  }];
});
