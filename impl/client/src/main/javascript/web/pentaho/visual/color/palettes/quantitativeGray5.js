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
     * A quantitative color palette of 5 tones of gray.
     *
     * <table style="font-family:courier; width:120px;">
     * <colgroup><col width="20px"/><col />
     * <tr><td style="background-color:#E6E6E6"></td><td>#E6E6E6</td></tr>
     * <tr><td style="background-color:#CCCCCC"></td><td>#CCCCCC</td></tr>
     * <tr><td style="background-color:#999999"></td><td>#999999</td></tr>
     * <tr><td style="background-color:#666666"></td><td>#666666</td></tr>
     * <tr><td style="background-color:#333333"></td><td>#333333</td></tr>
     * </table>
     *
     * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
     *
     * @name pentaho.visual.color.palettes.quantitativeGray5
     * @type {pentaho.visual.color.Palette}
     * @amd {pentaho.type.spec.UInstanceModule<pentaho.visual.color.Palette>} pentaho/visual/color/palettes/quantitativeGray5
     */

    var spec = specUtil.merge({
      level: "quantitative",
      colors: [
        "#E6E6E6", "#CCCCCC", "#999999", "#666666", "#333333"
      ]
    }, config);

    return new Palette(spec);
  }];
});
