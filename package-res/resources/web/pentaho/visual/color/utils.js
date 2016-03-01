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
  "./paletteRegistry"
], function(paletteRegistry) {

  var reRgbColor = /^rgb\((\d+),(\d+),(\d+)\)$/i;

  var reNumColorPattern = /^(\d+)[_-]COLOR$/i;

  // Used by parseColor
  var CSS_Names = {
    "aliceblue" : "F0F8FF",
    "antiquewhite" : "FAEBD7",
    "aqua" : "00FFFF",
    "aquamarine" : "7FFFD4",
    "azure" : "F0FFFF",
    "beige" : "F5F5DC",
    "bisque" : "FFE4C4",
    "black" : "000000",
    "blanchedalmond" : "FFEBCD",
    "blue" : "0000FF",
    "blueviolet" : "8A2BE2",
    "brown" : "A52A2A",
    "burlywood" : "DEB887",
    "cadetblue" : "5F9EA0",
    "chartreuse" : "7FFF00",
    "chocolate" : "D2691E",
    "coral" : "FF7F50",
    "cornflowerblue" : "6495ED",
    "cornsilk" : "FFF8DC",
    "crimson" : "DC143C",
    "cyan" : "00FFFF",
    "darkblue" : "00008B",
    "darkcyan" : "008B8B",
    "darkgoldenRod" : "B8860B",
    "darkgray" : "A9A9A9",
    "darkgrey" : "A9A9A9",
    "darkgreen" : "006400",
    "darkkhaki" : "BDB76B",
    "darkmagenta" : "8B008B",
    "darkoliveGreen" : "556B2F",
    "darkorange" : "FF8C00",
    "darkorchid" : "9932CC",
    "darkred" : "8B0000",
    "darksalmon" : "E9967A",
    "darkseagreen" : "8FBC8F",
    "darkslateblue" : "483D8B",
    "darkslategray" : "2F4F4F",
    "darkslategrey" : "2F4F4F",
    "darkturquoise" : "00CED1",
    "darkviolet" : "9400D3",
    "deeppink" : "FF1493",
    "deepskyblue" : "00BFFF",
    "dimgray" : "696969",
    "dimgrey" : "696969",
    "dodgerblue" : "1E90FF",
    "firebrick" : "B22222",
    "floralwhite" : "FFFAF0",
    "forestgreen" : "228B22",
    "fuchsia" : "FF00FF",
    "gainsboro" : "DCDCDC",
    "ghostwhite" : "F8F8FF",
    "gold" : "FFD700",
    "goldenrod" : "DAA520",
    "gray" : "808080",
    "grey" : "808080",
    "green" : "008000",
    "greenyellow" : "ADFF2F",
    "honeydew" : "F0FFF0",
    "hotpink" : "FF69B4",
    "indianred" : "CD5C5C",
    "indigo" : "4B0082",
    "ivory" : "FFFFF0",
    "khaki" : "F0E68C",
    "lavender" : "E6E6FA",
    "lavenderblush" : "FFF0F5",
    "lawngreen" : "7CFC00",
    "lemonchiffon" : "FFFACD",
    "lightblue" : "ADD8E6",
    "lightcoral" : "F08080",
    "lightcyan" : "E0FFFF",
    "lightgoldenrodyellow" : "FAFAD2",
    "lightgray" : "D3D3D3",
    "lightgrey" : "D3D3D3",
    "lightgreen" : "90EE90",
    "lightpink" : "FFB6C1",
    "lightsalmon" : "FFA07A",
    "lightseagreen" : "20B2AA",
    "lightskyblue" : "87CEFA",
    "lightslategray" : "778899",
    "lightslategrey" : "778899",
    "lightsteelblue" : "B0C4DE",
    "lightyellow" : "FFFFE0",
    "lime" : "00FF00",
    "limegreen" : "32CD32",
    "linen" : "FAF0E6",
    "magenta" : "FF00FF",
    "maroon" : "800000",
    "mediumaquamarine" : "66CDAA",
    "mediumblue" : "0000CD",
    "mediumorchid" : "BA55D3",
    "mediumpurple" : "9370D8",
    "mediumseagreen" : "3CB371",
    "mediumslateblue" : "7B68EE",
    "mediumspringgreen" : "00FA9A",
    "mediumturquoise" : "48D1CC",
    "mediumvioletred" : "C71585",
    "midnightblue" : "191970",
    "mintcream" : "F5FFFA",
    "mistyrose" : "FFE4E1",
    "moccasin" : "FFE4B5",
    "navajowhite" : "FFDEAD",
    "navy" : "000080",
    "oldlace" : "FDF5E6",
    "olive" : "808000",
    "olivedrab" : "6B8E23",
    "orange" : "FFA500",
    "orangered" : "FF4500",
    "orchid" : "DA70D6",
    "palegoldenrod" : "EEE8AA",
    "palegreen" : "98FB98",
    "paleturquoise" : "AFEEEE",
    "palevioletRed" : "D87093",
    "papayawhip" : "FFEFD5",
    "peachpuff" : "FFDAB9",
    "peru" : "CD853F",
    "pink" : "FFC0CB",
    "plum" : "DDA0DD",
    "powderblue" : "B0E0E6",
    "purple" : "800080",
    "red" : "FF0000",
    "rosybrown" : "BC8F8F",
    "royalblue" : "4169E1",
    "saddlebrown" : "8B4513",
    "salmon" : "FA8072",
    "sandybrown" : "F4A460",
    "seagreen" : "2E8B57",
    "seashell" : "FFF5EE",
    "sienna" : "A0522D",
    "silver" : "C0C0C0",
    "skyblue" : "87CEEB",
    "slateblue" : "6A5ACD",
    "slategray" : "708090",
    "slategrey" : "708090",
    "snow" : "FFFAFA",
    "springgreen" : "00FF7F",
    "steelblue" : "4682B4",
    "tan" : "D2B48C",
    "teal" : "008080",
    "thistle" : "D8BFD8",
    "tomato" : "FF6347",
    "turquoise" : "40E0D0",
    "violet" : "EE82EE",
    "wheat" : "F5DEB3",
    "white" : "FFFFFF",
    "whitesmoke" : "F5F5F5",
    "yellow" : "FFFF00",
    "yellowgreen" : "9ACD32"
  };

  return {
    getRgbColor:  getRgbColor,
    parseColor:   parseColor,

    getRgbGradient: getRgbGradient,
    getRgbStep:     getRgbStep,

    buildPalette:     buildPalette,
    createPaletteMap: createPaletteMap,

    getRgbDarker: getRgbDarker
  };

  function createPaletteMap(items, palette) {
    var map = {},
        I = items.length,
        P = palette.length;

    for(var i = 0; i < I && i < P; i++) {
      map[items[i]] = palette[i];
    }

    // are there more items than colors in the palette?
    for(i = P; i < I; i++) {
      map[items[i]] = "#000000";
    }

    return map;
  }

  function getRgbGradient(value, min, max, color1, color2) {
    // Clamp `value` to given interval
    if(value < min)
      value = min;
    else if(value > max)
      value = max;

    return arguments.length > 4
      ? _getRgbGradientCore(value, min, max, parseColor(color1), parseColor(color2))
      : _getRgbGradientFromPalette(value, min, max, color1);

  }

  function _getRgbGradientFromPalette(value, min, max, colors) {
    var steps  = colors.length - 1,
        domain = max - min;

    // Indexes in `colors` for `color1` and `color2`
    var start, end, color1, color2;
    if(domain <= 0 || !steps) {
      end = start = steps;
    } else {
      var step = (value - min) / domain * steps;
      start = Math.floor(step);
      end   = Math.ceil(step);
    }

    color1 = parseColor(colors[start]);
    color2 = end !== start ? parseColor(colors[end]) : color1;

    var domainMin = (start / steps) * domain + min,
        domainMax = (end   / steps) * domain + min;

    return _getRgbGradientCore(value, domainMin, domainMax, color1, color2);
  }

  function _getRgbGradientCore(value, min, max, color1, color2) {
    var interpColor;
    if(max - min <= 0) {
      interpColor = color2;
    } else {
      var inRange = (value - min) / (max - min);
      interpColor = [
        Math.floor(inRange * (color2[0] - color1[0]) + color1[0]),
        Math.floor(inRange * (color2[1] - color1[1]) + color1[1]),
        Math.floor(inRange * (color2[2] - color1[2]) + color1[2])
      ];
    }

    return getRgbColor(interpColor);
  }

  // Adapted from protovis
  function getRgbDarker(color, k) {
    color = parseColor(color);
    k = Math.pow(0.7, k != null ? k : 1);
    return getRgbColor(
          Math.max(0, Math.floor(k * color[0])),
          Math.max(0, Math.floor(k * color[1])),
          Math.max(0, Math.floor(k * color[2])));
  }

  function getRgbStep(value, min, max, colors) {
    var steps  = colors.length - 1,
        domain = max - min,
        step   = Math.round(((value - min) / domain) * steps);

    return getRgbColor(parseColor(colors[step]));
  }

  function parseColor(hex) {
    // assume already a color-array.
    if(typeof hex !== "string") return hex;

    if(hex.indexOf("#") === 0) {
      hex = hex.substring(1);
    } else {
      var m = reRgbColor.exec(hex);
      if(m) return [
        parseInt(m[1], 10),
        parseInt(m[2], 10),
        parseInt(m[3], 10)
      ];

      hex = CSS_Names[hex.toLowerCase()];
    }

    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ];
  }

  // colorSet:     "ryg" | "ryb" | "blue" | "gray"
  //
  // pattern:      "gradient" | "3_color" | "5_color"
  //  =>
  //   scalingType:  "linear" | <--   "discrete"  -->
  //  =>
  //   suffix:       "-5"     | "-3"      | "-5"
  //
  // paletteName:  "ryg_3", "ryg_5", "ryb_3", "ryb_5", "blue_3", "blue_5", "gray_3", "gray_5"

  function buildPalette(colorSet, pattern, reversed) {
    var colors = null;

    if(colorSet) {
      var suffix;
      pattern = pattern.toLowerCase();

      if(pattern === "gradient") {
        suffix = "_5";
      } else {
        var m = reNumColorPattern.exec(pattern);
        suffix = m ? ("_" + m[1]) : pattern;
      }

      var palette = paletteRegistry.get(colorSet + suffix);
      if(palette) {
        colors = palette.colors.slice();
        if(reversed) colors = colors.reverse();
      }
    }

    return colors;
  }

  function getRgbColor(r, g, b) {
    if(r instanceof Array) {
      b = r[2];
      g = r[1];
      r = r[0];
    }

    return 'RGB(' + r + ',' + g + ',' + b + ')';
  }
});
