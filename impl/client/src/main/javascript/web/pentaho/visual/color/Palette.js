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
  "pentaho/type/Complex",
  "./Level"
], function(module, Complex, PaletteLevel) {

  "use strict";

  /**
   * @name pentaho.visual.color.PaletteType
   * @class
   * @extends pentaho.type.ComplexType
   *
   * @classDesc The base type class of color palette types.
   *
   * For more information see {@link pentaho.visual.color.Palette}.
   */

  /**
   * @name pentaho.visual.color.Palette
   * @class
   * @extends pentaho.type.Complex
   *
   * @amd pentaho/visual/color/Palette
   *
   * @classDesc The base class of color palettes.
   *
   * Color palettes describe lists of colors for use in discrete or continuous color scales.
   *
   * @description Creates a color palette instance.
   *
   * @constructor
   * @param {pentaho.visual.color.palette.spec.IPalette} [spec] A color palette specification.
   */

  return Complex.extend({
    /**
     * The level of measurement of the color palette.
     *
     * @name level
     * @memberOf pentaho.visual.color.Palette#
     * @type {pentaho.visual.color.Level}
     * @default "nominal"
     * @readOnly
     */

    // TODO: document the supported color formats.
    /**
     * The list of colors of the color palette.
     *
     * This property is required.
     *
     * @name colors
     * @memberOf pentaho.visual.color.Palette#
     * @type {pentaho.type.List<pentaho.type.String>}
     * @readOnly
     */

    $type: {
      id: module.id,

      props: [
        {
          name: "level",
          valueType: PaletteLevel,
          isRequired: true,
          defaultValue: "nominal",
          isReadOnly: true
        },
        {
          name: "colors",
          valueType: ["string"],
          countMin: 1,
          isReadOnly: true
        }
      ]
    }
  })
  .configure({$type: module.config});
});
