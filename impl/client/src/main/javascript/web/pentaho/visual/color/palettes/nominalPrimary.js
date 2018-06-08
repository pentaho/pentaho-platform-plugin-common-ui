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
  "pentaho/visual/color/palettes/nominalNeutral",
  "pentaho/visual/color/palettes/nominalLight",
  "pentaho/visual/color/palettes/nominalDark",
  "pentaho/util/spec"
], function(module, Palette, nominalNeutral, nominalLight, nominalDark, specUtil) {

  "use strict";

  /**
   * A qualitative color palette of 36 varied colors.
   *
   * This color palette is a junction of the following palettes:
   * 1. {@link pentaho.visual.color.palettes.nominalNeutral}
   * 2. {@link pentaho.visual.color.palettes.nominalLight}
   * 3. {@link pentaho.visual.color.palettes.nominalDark}
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#005DA6"></td><td>#005DA6</td></tr>
   * <tr><td style="background-color:#03A9F4"></td><td>#03A9F4</td></tr>
   * <tr><td style="background-color:#FF7900"></td><td>#FF7900</td></tr>
   * <tr><td style="background-color:#F2C249"></td><td>#F2C249</td></tr>
   * <tr><td style="background-color:#5F43C4"></td><td>#5F43C4</td></tr>
   * <tr><td style="background-color:#946FDD"></td><td>#946FDD</td></tr>
   * <tr><td style="background-color:#00845B"></td><td>#00845B</td></tr>
   * <tr><td style="background-color:#18C482"></td><td>#18C482</td></tr>
   * <tr><td style="background-color:#A4C65F"></td><td>#A4C65F</td></tr>
   * <tr><td style="background-color:#AFE73E"></td><td>#AFE73E</td></tr>
   * <tr><td style="background-color:#B71C1C"></td><td>#B71C1C</td></tr>
   * <tr><td style="background-color:#F75B57"></td><td>#F75B57</td></tr>
   *
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
   *
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
   * @name pentaho.visual.color.palettes.nominalPrimary
   * @type {!pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/nominalPrimary
   */

  var defaultColors = nominalNeutral.colors.toArray()
        .concat(nominalLight.colors.toArray()
        .concat(nominalDark.colors.toArray()));

  var spec = specUtil.merge({
    level: "nominal",
    colors: defaultColors
  }, module.config);

  return new Palette(spec);
});
