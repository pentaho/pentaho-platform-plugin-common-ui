/*!
 * Copyright 2016 - 2017 Pentaho Corporation. All rights reserved.
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
  "pentaho/visual/color/paletteRegistry"
], function(paletteRegistry) {

  "use strict";

  /* eslint camelcase: "off", require-jsdoc: "off", brace-style:0, key-spacing:0, quote-props:0 */

  var vizApiFont = "10px OpenSansRegular";
  var maxHorizontalTextWidth = 117;
  var pvc = null;
  var pv = null;
  var numberFormatCache = {};

  var numberStyle = {
    group: " ",
    abbreviations:    ["k", "M", "G", "T", "P", "E", "Z", "Y"],
    subAbbreviations: ["m", "µ", "n", "p", "f", "a", "z", "y"]
  };

  var defaultVizApiPalette = "viz_api_all_colors";
  paletteRegistry.setDefault(defaultVizApiPalette);

  return {
    rules: [
      // line/barLine models
      {
        select: {
          priority: -1,
          type: [
            "pentaho/visual/models/line",
            "pentaho/visual/models/barLine"
          ]
        },
        apply: {
          props: {
            // . line
            lineWidth: {
              value: 2
            }
          }
        }
      },

      // heatGrid model
      {
        select: {
          priority: -1,
          type: [
            "pentaho/visual/models/heatGrid"
          ]
        },
        apply: {
          props: {
            colorSet: {
              value: "blue"
            }
          }
        }
      },

      // Pentaho CCC Abstract
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/abstract"
        },
        apply: {
          extension: {

            // Chart
            format: {
              number: {
                style: numberStyle
              }
            },

            errorMessage_visible: false,
            noDataMessage_visible: false,
            invalidDataMessage_visible: false,

            plotFrameVisible: false,

            hoverable:  true,

            // Legend
            // legend: true,
            legendPosition:    "top",
            legendAlign:       "left",
            legendDrawLine:    false,
            legendDrawMarker:  true,
            legendDot_shape:   "circle",
            legendFont:        vizApiFont,
            legendLabel_textStyle: "#666",

            legendItemCountMax: 20,
            legendSizeMax:      "30%",
            legendOverflow:     "collapse",

            legendPaddings:    0,
            legendMargins:     0,
            legendItemSize:    {height: 30},
            // must left, right, ... to override the options set by the wrapper (width and height don't work)
            legendItemPadding: {left: 7.5, right: 7.5, top: 0, bottom: 0},

            // NOTE: needs to be set to slightly higher than 4 to look like 4...
            legendTextMargin:  6,
            legendMarkerSize:  8,

            legendArea_lineWidth: 0, // reset viz wrapper style

            // No hover effect
            legendDot_ibits:  0,
            legendDot_imask:  "Hoverable",

            legend: {
              scenes: {
                item: {
                  // Trim label text
                  labelText: function() {
                    if(!pvc) {
                      pvc = require("cdf/lib/CCC/pvc");
                    }
                    var text = this.base();
                    return pvc.text.trimToWidthB(maxHorizontalTextWidth, text, this.vars.font, "..");
                  }
                }
              }
            },

            tooltipOffset: 20,

            // Title
            titleVisible:  true,
            titleSize:     30,
            titlePosition: "top",
            titleAlign:    "center",
            titleAlignTo:  "page-center"
          }
        }
      },

      // CCC Cartesian
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/cartesianAbstract"
        },
        apply: {
          extension: {
            margins:  0,
            paddings: 0,

            // Chart
            contentMargins: {top: 30, bottom: 30},

            // Cartesian Axes

            // . font
            axisFont: vizApiFont,
            axisLabel_textStyle: "#666",

            // . title
            axisTitleVisible: true,
            axisTitleSize: 18,
            axisTitleFont: vizApiFont,
            axisTitleLabel_textStyle: "#666",
            axisTitleLabel_textMargin: 0,
            xAxisTitleAlign: "left",
            yAxisTitleAlign: "top",

            // . label
            discreteAxisLabel_ibits: 0,
            discreteAxisLabel_imask: "ShowsActivity|Hoverable",

            // . grid
            continuousAxisGrid: true,
            numericAxisTickFormatter: function(value, precision) {
              return getNumberFormatter(precision, this.base)(value);
            },
            // Disable "smart" Date value type on discrete cartesian axis formatting...
            discreteAxisTickFormatter: function(value, absLabel) {
              if(arguments.length > 2) {
                // Being called for discrete scale / Date formatting...
                return String(value);
              }

              // Normal discrete formatting.
              return absLabel;
            },

            axisGrid_lineWidth:   1,
            axisGrid_strokeStyle: "#CCC",

            // . horizontal discrete / minimum distance between bands/ticks
            xAxisBandSizeMin: 18,

            // . vertical discrete / minimum distance between bands/ticks/line-height
            yAxisBandSizeMin: 30,

            // . rule
            axisRule_lineWidth: 1,
            axisRule_strokeStyle: "#999999",

            // . ticks
            axisTicks: true,
            axisMinorTicks: false,
            continuousAxisDesiredTickCount: 5,
            continuousAxisLabelSpacingMin:  2, // 2em = 20px

            axisTicks_lineWidth:   1,
            axisTicks_strokeStyle: "#999999",
            axisLabel_textMargin:  10,
            xAxisTicks_height:     3, // account for part of the tick that gets hidden by the rule
            yAxisTicks_width:      3
          }
        }
      },

      // X/Horizontal Discrete Axis at bottom
      {
        select: {
          priority: -1,
          type: [
            "pentaho/ccc/visual/bar",
            "pentaho/ccc/visual/barStacked",
            "pentaho/ccc/visual/barNormalized",
            "pentaho/ccc/visual/pointAbstract",
            "pentaho/ccc/visual/barLine"
          ]
        },
        apply: {
          extension: {
            // Cartesian Axes
            xAxisPosition: "bottom",
            xAxisSizeMax:  90,

            xAxisOverlappedLabelsMode: "rotatethenhide",
            xAxisLabelRotationDirection: "clockwise",
            xAxisLabelDesiredAngles: [0, 40 * (Math.PI / 180)]
          }
        }
      },

      // Y/Vertical Continuous Axis at left
      {
        select: {
          priority: -1,
          type: [
            "pentaho/ccc/visual/bar",
            "pentaho/ccc/visual/barStacked",
            "pentaho/ccc/visual/barNormalized",
            "pentaho/ccc/visual/pointAbstract",
            "pentaho/ccc/visual/barLine",
            "pentaho/ccc/visual/metricDotAbstract"
          ]
        },
        apply: {
          extension: {
            // Cartesian Axes
            yAxisPosition: "left",

            // TODO: should be minimum size
            yAxisSize: 57,
            contentPaddings: {right: 57 + 18}
          }
        }
      },

      // Scatter/Bubble
      // X/Horizontal Continuous Axis at bottom
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/metricDotAbstract"
        },
        apply: {
          extension: {
            // Cartesian Axes
            xAxisPosition: "bottom",
            xAxisSize:     30,

            // Plot
            // reset wrapper viz defaults
            autoPaddingByDotSize: true,
            axisOffset: 0,

            // TODO: sizeAxisMin,Max, nullShape

            // . dot
            dot_lineWidth: 0,
            dot_fillStyle: function() {
              var c = this.delegate();
              var scene = this.scene;
              var sign = this.sign;

              if(sign.showsInteraction()) {

                if(sign.mayShowNotAmongSelected(scene)) {

                  if(sign.mayShowActive(scene, true)) {
                    // not selected & active
                    if(!pv) pv = require("cdf/lib/CCC/protovis");

                    c = pv.Color.names.darkgray.darker(2).alpha(0.8);
                  } else {
                    // not selected
                    c = pvc.toGrayScale(c, -0.3);
                  }
                } else if(sign.mayShowActive(scene, true)) {
                  // active || (active & selected)
                } else {
                  c = c.alpha(0.5);
                }
                // else (normal || selected)
              }

              return this.finished(c);
            }
          }
        }
      },

      // Bubble - Visual Roles
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/bubble"
        },
        apply: {
          extension: {
            // Plot

            // . dot
            dot_shapeSize: function() {
              var v = this.panel.visualRoles.size.isBound() ? this.delegate() : (5 * 5);
              return this.finished(v);
            }
          }
        }
      },

      // Scatter
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/scatter"
        },
        apply: {
          extension: {
            // Plot

            // . dot
            dot_shapeRadius: function() {
              return this.finished(5);
            }
          }
        }
      },

      // X/Horizontal Continuous Axis at top
      // Y/Vertical Discrete Axis at left, and
      {
        select: {
          priority: -1,
          type: [
            "pentaho/ccc/visual/barHorizontal",
            "pentaho/ccc/visual/barStackedHorizontal",
            "pentaho/ccc/visual/barNormalizedHorizontal"
          ]
        },
        apply: {
          extension: {
            // Cartesian Axes
            xAxisPosition: "top",
            xAxisSize:     30,

            yAxisPosition: "left",
            yAxisSizeMax:  maxHorizontalTextWidth,
            contentMargins: {right: 30} // merges with base margins.
          }
        }
      },

      // Bars
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/barAbstract"
        },
        apply: {
          extension: {
            barSizeRatio:   0.92, // TODO: Remove when barSizeSpacing actually works
            barSizeSpacing: 2,
            barSizeMin:     4,
            barSizeMax:     150,

            // No stroke
            bar_lineWidth: function() {
              return this.finished(0);
            },
            bar_fillStyle: function() {

              var c = this.delegate();
              var scene = this.scene;
              var sign = this.sign;

              if(sign.showsInteraction()) {

                if(sign.mayShowNotAmongSelected(scene)) {
                  if(scene.isActive) {
                    // not selected & active
                    if(!pv) pv = require("cdf/lib/CCC/protovis");

                    c = pv.Color.names.darkgray.darker(2).alpha(0.8);
                  } else {
                    // not selected
                    c = pvc.toGrayScale(c, -0.3);
                  }
                } else if(sign.mayShowActive(scene, true)) {
                  // active || (active & selected)
                  c = c.alpha(0.5);
                }
                // else (normal || selected)
              }

              return this.finished(c);
            }
          }
        }
      },

      // Line/Area
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/pointAbstract"
        },
        apply: {
          extension: {
            // Cartesian Axes

            // X/Horizontal Discrete Grid
            xAxisGrid: true,

            // . centered grid lines
            xAxisGrid_visible: function() {
              if(this.panel.axes.base.isDiscrete()) {
                return this.index > 0;
              }
              return this.delegate();
            },
            xAxisGrid_left: function() {
              var left = this.delegate();
              if(this.panel.axes.base.isDiscrete()) {
                var halfStep = this.panel.axes.base.scale.range().step / 2;
                return left - halfStep;
              }
              return left;
            },

            // Plot
            // . dot
            dotsVisible: false,

            // . visible only on hover
            dot_fillStyle:   function() {
              var c = this.delegate();
              var scene = this.scene;
              var sign = this.sign;

              if(sign.showsInteraction()) {

                if(sign.mayShowNotAmongSelected(scene)) {

                  if(sign.mayShowActive(scene, true)) {
                    // not selected & active
                    if(!pv) pv = require("cdf/lib/CCC/protovis");

                    c = pv.Color.names.darkgray.darker(2).alpha(0.8);
                  } else {
                    // not selected
                    c = pvc.toGrayScale(c, -0.3);
                  }
                } else if(sign.mayShowActive(scene, true)) {
                  // active || (active & selected)
                  c = "white";
                }
                // else (normal || selected)
              }

              return this.finished(c);
            },

            dot_strokeStyle: function() {
              var c = this.delegate();
              var scene = this.scene;
              var sign = this.sign;

              if(sign.showsInteraction()) {

                // Not among selected
                if(sign.mayShowNotAmongSelected(scene)) {

                  if(sign.mayShowActive(scene, true)) {
                    // not selected & active
                    if(!pv) pv = require("cdf/lib/CCC/protovis");

                    c = pv.Color.names.darkgray.darker(2).alpha(0.8);
                  } else {
                    // not selected
                    c = pvc.toGrayScale(c, -0.3);
                  }
                }
              }

              return this.finished(c);
            },
            dot_lineWidth:   function() { return this.finished(2); },
            dot_shapeRadius: function() { return this.finished(5); },

            // . line
            linesVisible: true,
            line_ibits: 0,
            line_imask: "ShowsActivity"
          }
        }
      },

      // Area
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/areaStacked"
        },
        apply: {
          extension: {
            linesVisible: false
          }
        }
      },

      // Pie/Donut
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/pie"
        },
        apply: {
          extension: {
            slice_lineWidth: 0,

            // Chart
            contentPaddings: 0,
            contentMargins: {top: 30},

            legendAlign: "center",

            // Plot
            activeSliceRadius: 0,

            // . slice
            slice_fillStyle: function() {
              var c = this.delegate();
              var scene = this.scene;
              var sign = this.sign;

              if(sign.showsInteraction()) {

                if(sign.mayShowNotAmongSelected(scene)) {
                  if(scene.isActive) {
                    // not selected & active
                    if(!pv) pv = require("cdf/lib/CCC/protovis");

                    c = pv.Color.names.darkgray.darker(2).alpha(0.8);
                  } else {
                    // not selected
                    c = pvc.toGrayScale(c, -0.3);
                  }
                } else if(sign.mayShowActive(scene, true)) {
                  // active || (active & selected)
                  c = c.alpha(0.85);
                }
                // else (normal || selected)
              }

              return this.finished(c);
            }
          }
        }
      },

      // Donut
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/donut"
        },
        apply: {
          extension: {
            slice_lineWidth: 0,
            slice_innerRadiusEx: "60%"
          }
        }
      },

      // Heat Grid
      {
        select: {
          priority: -1,
          type: "pentaho/ccc/visual/heatGrid"
        },
        apply: {
          extension: {
            // Don't use composite/hierarchical axes
            axisComposite: false,

            // ---

            // . rule
            axisRule_lineWidth: 0,

            // . grid
            orthoAxisGrid: false,
            baseAxisGrid:  false,

            axisBandSpacing: 5, // white border or transparent ?

            // X
            xAxisPosition: "top",
            xAxisSizeMax: 80,
            xAxisBandSizeMin: 30, // make equal to the inherited yAxisBandSizeMin: 30,

            // Y
            yAxisSizeMax: 80, // shouldn't it be: maxHorizontalTextWidth ??
            yAxisBandSizeMin: 30,

            // . label
            xAxisOverlappedLabelsMode: "rotatethenhide",
            xAxisLabelRotationDirection: "counterclockwise",
            xAxisLabelDesiredAngles: [0, 40 * (Math.PI / 180)],

            // . dot
            dot_ibits: 0,
            dot_imask: "ShowsActivity",
            dot_lineWidth: 0,
            dot_fillStyle: function() {
              var c = this.delegate();
              var scene = this.scene;
              var sign = this.sign;

              if(sign.showsInteraction()) {

                if(sign.mayShowNotAmongSelected(scene)) {
                  if(scene.isActive) {
                    // not selected & active
                    if(!pv) pv = require("cdf/lib/CCC/protovis");

                    c = pv.Color.names.darkgray.darker(2).alpha(0.8);
                  } else {
                    // not selected
                    c = pvc.toGrayScale(c, -0.3);
                  }
                } else if(sign.mayShowActive(scene, true)) {
                  // active || (active & selected)
                  c = c.alpha(0.5);
                }
                // else (normal || selected)
              }

              return this.finished(c);
            }
          }
        }
      }
    ]
  };

  function getNumberFormatter(precision, base) {
    if(!pvc) {
      pvc = require("cdf/lib/CCC/pvc");
    }

    var useAbrev = (base >= 1000);
    var key = useAbrev + "|" + precision;
    var numberFormat = numberFormatCache[key];
    if(!numberFormat) {
      // #,0 A
      // #,0.0 A
      // #,0.00 A
      var depPlacesMask = precision ? ("." + new Array(precision + 1).join("0")) : ".##";
      var mask = "#,0" + depPlacesMask + (useAbrev ? " A" : "");

      numberFormat = pvc.data.numberFormat(mask);
      numberFormat.style(numberStyle);
      numberFormatCache[key] = numberFormat;
    }

    return numberFormat;
  }

});
