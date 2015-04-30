/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
define(function() {

  var O_hasOwn = Object.prototype.hasOwnProperty;

  /**
   * @module common-ui.vizapi
   */

  /**
   * A color palette is an ordered list of colors.
   *
   * This is a documentation artifact — there is no
   * `IColorPalette` constructor.
   *
   * @class IColorPalette
   * @constructor
   */

  /**
   * The name of the color palette.
   * @property name
   * @type String
   */

  /**
   * The array of colors of the palette.
   *
   * An array of {{#crossLink "String"}}{{/crossLink}},
   * colors in "#RRGGBB" format.
   *
   * @property colors
   * @type Array
   */

  /**
   * A singleton class that manages a set of discrete color palettes
   * available for visualizations to consume.
   *
   * The registry comes pre-loaded with three color palettes:
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
   * @class ColorPaletteRegistry
   * @constructor
   */
  function ColorPaletteRegistry() {
    this._paletteList = [];
    this._paletteMap  = {};
  }

  /**
   * Adds a specified color palette.
   *
   * @method add
   * @param {IColorPalette} palette The color palette.
   * @chainable
   */
  ColorPaletteRegistry.prototype.add = function(palette) {
    if(!palette) throw new Error("Argument required 'palette'.");

    var name = palette.name,
        current = O_hasOwn.call(this._paletteMap, name) ? this._paletteMap[name] : null; 
    
    if(!current)
      this._paletteList.push(palette);
    else
      this._paletteList.splice(this._paletteList.indexOf(current), 1, palette);

    this._paletteMap[name] = palette;
    return this;
  };

  /**
   * Gets an array with all registered color palettes.
   *
   * Do **not** modify the returned array.
   *
   * @method getAll
   * @return {Array} An array of {{#crossLink "IColorPalette"}}{{/crossLink}}.
   */
  ColorPaletteRegistry.prototype.getAll = function() {
    return this._paletteList;
  };

  /**
   * Sets the default color palette, given its name.
   *
   * If this method is not called,
   * or if the _name_ argument is not specified,
   * the default palette becomes the first palette.
   *
   * The default palette is obtained by calling the
   * {{#crossLink "ColorPaletteRegistry/get:method"}}{{/crossLink}}
   * with no arguments:
   *
   * @example
   *     var defaultPalette = colorPaletteRegistry.get();
   *
   * @method setDefault
   * @param {String} [name] The name of the default palette.
   * @chainable
   */
  ColorPaletteRegistry.prototype.setDefault = function(name) {
    if(name && !O_hasOwn.call(this._paletteMap, name))
      throw new Error(
        "Invalid argument 'name'. " +
        "A palette with name '" + name + "' is not defined.");

    this._defaultName = name || null;
    return this;
  };

  /**
   * Gets a specified or default color palette.
   *
   * When the name of the color palette is not specified,
   * the default color palette is returned.
   *
   * @method get
   * @param {String} [name] The name of the desired color palette.
   * @return {IColorPalette} The color palette.
   */
  ColorPaletteRegistry.prototype.get = function(name) {
    if(!name && !(name = this._defaultName)) {
      return this._paletteList.length ? this._paletteList[0] : null;
    }

    return O_hasOwn.call(this._paletteMap, name) ? this._paletteMap[name] : null;
  };

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

  return paletteRegistry;
});
