/*!
 * Copyright 2017 Hitachi Vantara. All rights reserved.
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
     * @amd {pentaho.type.spec.UInstanceModule<pentaho.visual.color.Palette>} pentaho/visual/color/palettes/quantitativeBlue3
     */

    var spec = specUtil.merge({
      level: "quantitative",
      colors: [
        "#CCDFED", "#6D85A4", "#0F2B5B"
      ]
    }, config);

    return new Palette(spec);
  }];
});
