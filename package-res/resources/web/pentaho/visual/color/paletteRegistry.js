/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../../lang/Base",
  "../../util/object"
], function(Base, O) {

  "use strict";

  /**
   * @name PaletteRegistry
   * @memberOf pentaho.visual.color
   * @extends pentaho.lang.Base
   *
   * @class
   *
   * @amd {pentaho.visual.color.PaletteRegistry} pentaho/visual/color/paletteRegistry
   *
   * @classDesc A singleton class that manages a set of discrete color palettes
   * available for visuals to consume.
   *
   * ### Standard Color Palettes
   *
   * The registry comes pre-loaded with the following color palettes:
   *
   * 1. `"palette 1"` (13 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#336699"></td><td>#336699</td></tr>
   * <tr><td style="background-color:#99CCFF"></td><td>#99CCFF</td></tr>
   * <tr><td style="background-color:#999933"></td><td>#999933</td></tr>
   * <tr><td style="background-color:#666699"></td><td>#666699</td></tr>
   * <tr><td style="background-color:#CC9933"></td><td>#CC9933</td></tr>
   * <tr><td style="background-color:#006666"></td><td>#006666</td></tr>
   * <tr><td style="background-color:#3399FF"></td><td>#3399FF</td></tr>
   * <tr><td style="background-color:#993300"></td><td>#993300</td></tr>
   * <tr><td style="background-color:#CCCC99"></td><td>#CCCC99</td></tr>
   * <tr><td style="background-color:#666666"></td><td>#666666</td></tr>
   * <tr><td style="background-color:#FFCC66"></td><td>#FFCC66</td></tr>
   * <tr><td style="background-color:#6699CC"></td><td>#6699CC</td></tr>
   * <tr><td style="background-color:#663366"></td><td>#663366</td></tr>
   * </table>
   *
   * 2. `"palette 2"` (11 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#880A0F"></td><td>#880A0F</td></tr>
   * <tr><td style="background-color:#B09A6B"></td><td>#B09A6B</td></tr>
   * <tr><td style="background-color:#772200"></td><td>#772200</td></tr>
   * <tr><td style="background-color:#C52F0D"></td><td>#C52F0D</td></tr>
   * <tr><td style="background-color:#123D82"></td><td>#123D82</td></tr>
   * <tr><td style="background-color:#4A0866"></td><td>#4A0866</td></tr>
   * <tr><td style="background-color:#FFAA00"></td><td>#FFAA00</td></tr>
   * <tr><td style="background-color:#1E8AD3"></td><td>#1E8AD3</td></tr>
   * <tr><td style="background-color:#AA6611"></td><td>#AA6611</td></tr>
   * <tr><td style="background-color:#8B2834"></td><td>#8B2834</td></tr>
   * <tr><td style="background-color:#333333"></td><td>#333333</td></tr>
   * </table>
   *
   * 3. `"palette 3"` (12 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#387179"></td><td>#387179</td></tr>
   * <tr><td style="background-color:#626638"></td><td>#626638</td></tr>
   * <tr><td style="background-color:#A8979A"></td><td>#A8979A</td></tr>
   * <tr><td style="background-color:#B09A6B"></td><td>#B09A6B</td></tr>
   * <tr><td style="background-color:#772200"></td><td>#772200</td></tr>
   * <tr><td style="background-color:#C52F0D"></td><td>#C52F0D</td></tr>
   * <tr><td style="background-color:#123D82"></td><td>#123D82</td></tr>
   * <tr><td style="background-color:#4A0866"></td><td>#4A0866</td></tr>
   * <tr><td style="background-color:#445500"></td><td>#445500</td></tr>
   * <tr><td style="background-color:#FFAA00"></td><td>#FFAA00</td></tr>
   * <tr><td style="background-color:#1E8AD3"></td><td>#1E8AD3</td></tr>
   * <tr><td style="background-color:#AA6611"></td><td>#AA6611</td></tr>
   * </table>
   *
   * 4. `"ryg-3"` (3 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#FF0000"></td><td>#FF0000</td></tr>
   * <tr><td style="background-color:#FFFF00"></td><td>#FFFF00</td></tr>
   * <tr><td style="background-color:#008000"></td><td>#008000</td></tr>
   * </table>
   *
   * 5. `"ryg-5"` (5 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#FF0000"></td><td>#FF0000</td></tr>
   * <tr><td style="background-color:#FFBF3F"></td><td>#FFBF3F</td></tr>
   * <tr><td style="background-color:#FFFF00"></td><td>#FFFF00</td></tr>
   * <tr><td style="background-color:#BFDF3F"></td><td>#BFDF3F</td></tr>
   * <tr><td style="background-color:#008000"></td><td>#008000</td></tr>
   * </table>
   *
   * 6. `"ryb-3"` (3 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#FF0000"></td><td>#FF0000</td></tr>
   * <tr><td style="background-color:#FFFF00"></td><td>#FFFF00</td></tr>
   * <tr><td style="background-color:#4BB6E4"></td><td>#4BB6E4</td></tr>
   * </table>
   *
   * 7. `"ryb-5"` (5 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#FF0000"></td><td>#FF0000</td></tr>
   * <tr><td style="background-color:#FFBF3F"></td><td>#FFBF3F</td></tr>
   * <tr><td style="background-color:#FFFF00"></td><td>#FFFF00</td></tr>
   * <tr><td style="background-color:#DCDDDE"></td><td>#DCDDDE</td></tr>
   * <tr><td style="background-color:#4BB6E4"></td><td>#4BB6E4</td></tr>
   * </table>
   *
   * 8. `"blue-3"` (3 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#CBE7FF"></td><td>#CBE7FF</td></tr>
   * <tr><td style="background-color:#33A1FF"></td><td>#33A1FF</td></tr>
   * <tr><td style="background-color:#0345A9"></td><td>#0345A9</td></tr>
   * </table>
   *
   * 9. `"blue-5"` (5 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#CBE7FF"></td><td>#CBE7FF</td></tr>
   * <tr><td style="background-color:#99D0FF"></td><td>#99D0FF</td></tr>
   * <tr><td style="background-color:#33A1FF"></td><td>#33A1FF</td></tr>
   * <tr><td style="background-color:#006ECC"></td><td>#006ECC</td></tr>
   * <tr><td style="background-color:#0345A9"></td><td>#0345A9</td></tr>
   * </table>
   *
   * 10. `"gray-3"` (3 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#E6E6E6"></td><td>#E6E6E6</td></tr>
   * <tr><td style="background-color:#999999"></td><td>#999999</td></tr>
   * <tr><td style="background-color:#333333"></td><td>#333333</td></tr>
   * </table>
   *
   * 11. `"gray-5"` (5 colors):
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#E6E6E6"></td><td>#E6E6E6</td></tr>
   * <tr><td style="background-color:#CCCCCC"></td><td>#CCCCCC</td></tr>
   * <tr><td style="background-color:#999999"></td><td>#999999</td></tr>
   * <tr><td style="background-color:#666666"></td><td>#666666</td></tr>
   * <tr><td style="background-color:#333333"></td><td>#333333</td></tr>
   * </table>
   *
   * @description Creates the color palette registry singleton instance.
   * @constructor
   */
  var ColorPaletteRegistry = Base.extend("pentaho.visual.color.PaletteRegistry",
  /** @lends pentaho.visual.color.PaletteRegistry# */{

    constructor: function() {
      this._paletteList = [];
      this._paletteMap  = {};
    },

    /**
     * Adds a specified color palette.
     *
     * @param {pentaho.visual.color.IColorPalette} palette The color palette.
     * @chainable
     */
    add: function(palette) {
      if(!palette) throw new Error("Argument required 'palette'.");

      var name = palette.name,
          current = O.hasOwn(this._paletteMap, name) ? this._paletteMap[name] : null;

      if(!current)
        this._paletteList.push(palette);
      else
        this._paletteList.splice(this._paletteList.indexOf(current), 1, palette);

      this._paletteMap[name] = palette;
      return this;
    },

    /**
     * Gets an array with all registered color palettes.
     *
     * Do **not** modify the returned array.
     *
     * @return {Array.<pentaho.visual.color.IColorPalette>} An array of color palettes.
     */
    getAll: function() {
      return this._paletteList;
    },

    /**
     * Sets the default color palette, given its name.
     *
     * If this method is not called,
     * or if the _name_ argument is not specified,
     * the default palette becomes the first palette.
     *
     * The default palette is obtained by calling
     * {@link pentaho.visual.color.PaletteRegistry#get}
     * with no arguments.
     *
     * @example
     * <caption>
     *   Obtaining the default color palette.
     * </caption>
     *
     * var defaultPalette = paletteRegistry.get();
     *
     * @param {String} [name] The name of the default palette.
     * @return {pentaho.visual.color.PaletteRegistry} This instance.
     */
    setDefault: function(name) {
      if(name && !O.hasOwn(this._paletteMap, name))
        throw new Error(
          "Invalid argument 'name'. " +
          "A palette with name '" + name + "' is not defined.");

      this._defaultName = name || null;
      return this;
    },

    /**
     * Gets a specified or default color palette.
     *
     * When the name of the color palette is not specified,
     * the default color palette is returned.
     *
     * @param {String} [name] The name of the desired color palette.
     * @return {pentaho.visual.color.IColorPalette} The color palette.
     */
    get: function(name) {
      if(!name && !(name = this._defaultName)) {
        return this._paletteList.length ? this._paletteList[0] : null;
      }

      return O.hasOwn(this._paletteMap, name) ? this._paletteMap[name] : null;
    }
  });

  // ---------------

  var paletteRegistry = new ColorPaletteRegistry();

  paletteRegistry.add({
    name: 'palette 1', // TODO: Give this a meaningful name!
    colors: [
      "#336699",
      "#99CCFF",
      "#999933",
      "#666699",
      "#CC9933",
      "#006666",
      "#3399FF",
      "#993300",
      "#CCCC99",
      "#666666",
      "#FFCC66",
      "#6699CC",
      "#663366"
    ]
  });

  paletteRegistry.add({
    name: 'palette 2', // TODO: Give this a meaningful name!
    colors: [
      "#880a0f",
      "#b09a6b",
      "#772200",
      "#c52f0d",
      "#123d82",
      "#4a0866",
      "#ffaa00",
      "#1e8ad3",
      "#aa6611",
      "#8b2834",
      "#333333"
    ]
  });

  paletteRegistry.add({
    name: 'palette 3', // TODO: Give this a meaningful name!
    colors: [
      "#387179",
      "#626638",
      "#A8979A",
      "#B09A6B",
      "#772200",
      "#C52F0D",
      "#123D82",
      "#4A0866",
      "#445500",
      "#FFAA00",
      "#1E8AD3",
      "#AA6611"
    ]
  });

  paletteRegistry.add({name: "ryg-3",  colors: ["#FF0000", "#FFFF00", "#008000"]});
  paletteRegistry.add({name: "ryg-5",  colors: ["#FF0000", "#FFBF3F", "#FFFF00", "#BFDF3F", "#008000"]});
  paletteRegistry.add({name: "ryb-3",  colors: ["#FF0000", "#FFFF00", "#4BB6E4"]});
  paletteRegistry.add({name: "ryb-5",  colors: ["#FF0000", "#FFBF3F", "#FFFF00", "#DCDDDE", "#4BB6E4"]});
  paletteRegistry.add({name: "blue-3", colors: ["#CBE7FF", "#33A1FF", "#0345A9"]});
  paletteRegistry.add({name: "blue-5", colors: ["#CBE7FF", "#99D0FF", "#33A1FF", "#006ECC", "#0345A9"]});
  paletteRegistry.add({name: "gray-3", colors: ["#E6E6E6", "#999999", "#333333"]});
  paletteRegistry.add({name: "gray-5", colors: ["#E6E6E6", "#CCCCCC", "#999999", "#666666", "#333333"]});

  return paletteRegistry;
});
