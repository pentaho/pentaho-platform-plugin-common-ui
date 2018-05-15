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
  "pentaho/module!",
  "pentaho/visual/color/Palette",
  "pentaho/util/spec"
], function(module, Palette, specUtil) {

  "use strict";

  /**
   * A nominal color palette of 12 neutral colors.
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
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.nominalNeutral
   * @type {!pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/nominalNeutral
   */
  var spec = specUtil.merge({
    level: "nominal",
    colors: [
      "#005DA6", "#03A9F4", "#FF7900", "#F2C249", "#5F43C4", "#946FDD",
      "#00845B", "#18C482", "#A4C65F", "#AFE73E", "#B71C1C", "#F75B57"
    ]
  }, module.config);

  return new Palette(spec);
});
