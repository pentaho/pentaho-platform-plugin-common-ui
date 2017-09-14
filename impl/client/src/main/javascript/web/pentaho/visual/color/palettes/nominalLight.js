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
     * @amd {pentaho.type.spec.UInstanceModule<pentaho.visual.color.Palette>} pentaho/visual/color/palettes/nominalLight
     */

    var spec = specUtil.merge({
      level: "nominal",
      colors: [
        "#80AFD5", "#81D4FA", "#FFBC80", "#F8E1A4", "#AFA1E2", "#C9B7EE",
        "#80C2AD", "#8BE2C1", "#BFD09D", "#CBEC8A", "#DB8E8E", "#FBADAB"
      ]
    }, config);

    return new Palette(spec);
  }];
});
