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
define(function() {

  "use strict";

  /* eslint camelcase: "off", require-jsdoc: "off", brace-style:0, key-spacing:0, quote-props:0 */

  var RULE_PRIO_VIZ_DEFAULT = -5;
  var RULE_PRIO_APP_DEFAULT = -1;

  var pvc = null;
  var pv = null;

  var vizApiFont = "10px OpenSansRegular";
  var maxHorizontalTextWidth = 117;

  var numberFormatCache = {};
  var numberStyle = {
    group: " ",
    abbreviations:    ["k", "M", "G", "T", "P", "E", "Z", "Y"],
    subAbbreviations: ["m", "µ", "n", "p", "f", "a", "z", "y"]
  };

  var interactionState = {
    isSelected: 0,
    isActive: 0
  };

  return {
    rules: [
      // region Model Rules

      // line/barLine models
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
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
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/visual/models/heatGrid"
        },
        apply: {
          props: {
            colorSet: {
              value: "blue"
            }
          }
        }
      },

      // bubble model
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/visual/models/metricDotAbstract"
        },
        apply: {
          props: {
            colorSet: {
              value: "ryg"
            }
          }
        }
      },
      // endregion

      // region View rules for all applications
      // Pentaho CCC Abstract
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/abstract"
        },
        apply: {
          extension: {
            margins: 0,
            paddings: 10,

            // Chart
            format: {
              number: {
                style: numberStyle
              }
            },

            // Multi-chart
            multiChartMax: 50,

            errorMessage_visible: false,
            noDataMessage_visible: false,
            invalidDataMessage_visible: false,

            plotFrameVisible: false,

            // Interaction
            animate: false,
            clickable: true,
            selectable: true,
            ctrlSelectMode: false,
            hoverable: true,

            // Data
            groupedLabelSep: "~",

            // Legend
            // legend: true,
            legendDrawLine: false,
            color2AxisLegendDrawLine: false, // Used by plot2
            legendDrawMarker: true,
            legendShape: "circle",

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

            legendArea_lineWidth: 0, // reset viz wrapper style
            legendArea_strokeStyle: "#c0c0c0",

            // No hover effect
            legend$Dot_ibits: 0,
            legend$Dot_imask: "Hoverable",
            legend$Rule_ibits: 0,
            legend$Rule_imask: "Hoverable",

            legend: {
              scenes: {
                item: {
                  // Trim label text
                  labelText: function() {
                    var text = this.base();
                    return getPvc().text.trimToWidthB(maxHorizontalTextWidth, text, this.vars.font, "..");
                  }
                }
              }
            },

            legendClickMode: "toggleSelected",
            color2AxisLegendClickMode: "toggleSelected", // for plot 2 (lines in bar/line combo)
            color3AxisLegendClickMode: "toggleSelected", // for trends

            legendLabel_textDecoration: null,

            legendDot_fillStyle: legendShapeColorProp,
            legendDot_strokeStyle: legendShapeColorProp,
            legend2Dot_fillStyle: legendShapeColorProp,
            legend2Dot_strokeStyle: legendShapeColorProp,

            // Tooltip
            tooltipOffset: 20,

            // Title
            titleVisible:  true,
            titleSize:     30,
            titlePosition: "top",
            titleAlign:    "center",
            titleAlignTo:  "page-center",
            titleFont:     vizApiFont,

            // Labels
            label_ibits: 0,
            label_imask: "ShowsActivity"
          }
        }
      },

      // CCC Cartesian
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/cartesianAbstract"
        },
        apply: {
          extension: {
            margins:  0,
            paddings: 0,

            // Chart
            contentMargins: {top: 30, bottom: 30},

            // Cartesian Axes
            axisComposite: false,
            axisSizeMax: "50%",
            xAxisPosition: "bottom",
            yAxisPosition: "left",

            panelSizeRatio: 0.8,

            // . title
            axisTitleVisible: true,
            axisTitleSizeMax: "20%",
            axisTitleLabel_textMargin: 0,

            xAxisTitleAlign: "left",
            x2AxisTitleAlign: "left",
            x3AxisTitleAlign: "left",

            yAxisTitleAlign: "top",
            y2AxisTitleAlign: "top",
            y3AxisTitleAlign: "top",

            // . label
            discreteAxisLabel_ibits: 0,
            discreteAxisLabel_imask: "ShowsActivity|Hoverable",

            axisLabel_textMargin: 10,

            xAxisOverlappedLabelsMode: "rotatethenhide",
            xAxisLabelRotationDirection: "clockwise",
            xAxisLabelDesiredAngles: [0, 40 * (Math.PI / 180)],

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

            // . grid
            axisGrid: false,
            continuousAxisGrid: true,

            axisGrid_lineWidth:   1,
            axisGrid_strokeStyle: "#CCC",

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
            xAxisTicks_height:     3, // account for part of the tick that gets hidden by the rule
            yAxisTicks_width:      3
          }
        }
      },

      // X/Horizontal Discrete Axis at bottom
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: [
            "pentaho/ccc/visual/bar",
            "pentaho/ccc/visual/barStacked",
            "pentaho/ccc/visual/barNormalized",
            "pentaho/ccc/visual/pointAbstract",
            "pentaho/ccc/visual/barLine",
            "pentaho/ccc/visual/boxplot",
            "pentaho/ccc/visual/waterfall"
          ]
        },
        apply: {
          extension: {
            // Cartesian Axes
            xAxisSizeMax: 90
          }
        }
      },

      // Y/Vertical Continuous Axis at left
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: [
            "pentaho/ccc/visual/bar",
            "pentaho/ccc/visual/barStacked",
            "pentaho/ccc/visual/barNormalized",
            "pentaho/ccc/visual/pointAbstract",
            "pentaho/ccc/visual/barLine",
            "pentaho/ccc/visual/waterfall",
            "pentaho/ccc/visual/boxplot",
            "pentaho/ccc/visual/metricDotAbstract"
          ]
        },
        apply: {
          extension: {
            // Cartesian Axes
            // TODO: should be minimum size
            yAxisSize: 57,
            contentPaddings: {right: 57 + 18}
          }
        }
      },

      // Scatter/Bubble
      // X/Horizontal Continuous Axis at bottom
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/metricDotAbstract"
        },
        apply: {
          extension: {
            // Cartesian Axes
            xAxisSize: 30,

            // Plot
            // reset wrapper viz defaults
            autoPaddingByDotSize: true,
            axisOffset: 0,

            // TODO: sizeAxisMin,Max, nullShape

            // . dot
            dot_lineWidth: 0,
            dot_fillStyle: fillStyle2
          }
        }
      },

      // Bubble
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/bubble"
        },
        apply: {
          extension: {
            // Plot
            sizeAxisRatio: 1 / 5,
            sizeAxisRatioTo: "height", // plot area client height
            sizeAxisOriginIsZero: true,

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
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
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
      // Y/Vertical Discrete Axis at left
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
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
            xAxisSize: 30,

            yAxisSizeMax: maxHorizontalTextWidth,
            contentMargins: {right: 30} // merges with inherited contentMargins
          }
        }
      },

      // Bars
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
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
            bar_fillStyle: fillStyle1
          }
        }
      },

      // Line/Area
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/pointAbstract"
        },
        apply: {
          extension: {
            // Cartesian Axes
            axisOffset: 0,

            // Tooltip
            tooltipOffset: 15,

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

            // . line
            // Line chart actually forces this to true.
            // Only takes effect on areaXyz
            linesVisible: false
          }
        }
      },

      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: [
            "pentaho/ccc/visual/pointAbstract",
            "pentaho/ccc/visual/barLine"
          ]
        },
        apply: {
          extension: {
            // The point prefix covers both the main and the second plot (barLine).

            // Plot
            // . dot
            // . on hover
            pointDot_fillStyle:   function() {
              var c = this.delegate();
              var scene = this.scene;
              var sign = this.sign;

              if(sign.showsInteraction()) {

                if(sign.mayShowNotAmongSelected(scene)) {

                  if(sign.mayShowActive(scene, true)) {
                    // not selected & active
                    c = getPv().Color.names.darkgray.darker(2).alpha(0.8);
                  } else {
                    // not selected
                    c = getPvc().toGrayScale(c, -0.3);
                  }
                } else if(sign.mayShowActive(scene, true)) {
                  // active || (active & selected)
                  c = "white";
                }
                // else (normal || selected)
              }

              return this.finished(c);
            },

            pointDot_strokeStyle: function() {
              var c = this.delegate();
              var scene = this.scene;
              var sign = this.sign;

              if(sign.showsInteraction()) {

                // Not among selected
                if(sign.mayShowNotAmongSelected(scene)) {

                  if(sign.mayShowActive(scene, true)) {
                    // not selected & active
                    c = getPv().Color.names.darkgray.darker(2).alpha(0.8);
                  } else {
                    // not selected
                    c = getPvc().toGrayScale(c, -0.3);
                  }
                }
              }

              return this.finished(c);
            },
            pointDot_lineWidth: function() { return this.finished(2); },

            // . line
            pointLine_ibits: 0,
            pointLine_imask: "ShowsActivity"
          }
        }
      },

      // Area
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/areaAbstract"
        },
        apply: {
          extension: {
            linesVisible: false
          }
        }
      },
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/area"
        },
        apply: {
          extension: {
            area_fillStyle: fillStyle2
          }
        }
      },
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/areaStacked"
        },
        apply: {
          extension: {
            area_fillStyle: fillStyle3
          }
        }
      },

      // Pie/Donut
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/pie"
        },
        apply: {
          extension: {
            // Chart
            contentPaddings: 0,
            contentMargins: {top: 30},

            legendAlign: "center",

            // Plot
            activeSliceRadius: 0,
            valuesAnchor: "outer",
            valuesOptimizeLegibility: true,

            // Title
            titlePosition: "bottom",

            // . slice
            slice_lineWidth: 0,
            slice_strokeStyle: "white",
            slice_fillStyle: fillStyle1
          }
        }
      },

      // Donut
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/donut"
        },
        apply: {
          extension: {
            slice_innerRadiusEx: "60%"
          }
        }
      },

      // Heat Grid
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/heatGrid"
        },
        apply: {
          extension: {
            useShapes: true,

            // colorMissing: "lightgray",
            colorScaleType: "linear",
            colorNormByCategory: false,

            axisTitleSize: 25,

            // paddings
            contentPaddings: {right: 80 + 18},

            // . rule
            axisRule_lineWidth: 0,

            // . grid
            axisBandSpacing: 5, // white border or transparent ?

            // X
            xAxisPosition: "top",
            xAxisSizeMax: 80,
            xAxisLabelRotationDirection: "counterclockwise",

            // Y
            yAxisSizeMax: 80, // shouldn't it be: maxHorizontalTextWidth ??

            // . dot
            dot_lineWidth: function() { return this.finished(0); },
            dot_shapeRadius: function() { return this.finished(this.delegate()); },
            dot_fillStyle: fillStyle1
          }
        }
      },

      // Sunburst
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/sunburst"
        },
        apply: {
          extension: {
            rootCategoryLabel: "",

            legendAreaVisible: false,

            valuesVisible: true,
            valuesOverflow: "trim",
            valuesOptimizeLegibility: true,

            colorMode: "level",

            slice_strokeStyle: function() { return this.finished("white"); },
            slice_lineWidth: function() { return this.finished(2); },
            slice_fillStyle: fillStyle1
          }
        }
      },

      // Treemap
      {
        priority: RULE_PRIO_VIZ_DEFAULT,
        select: {
          type: "pentaho/ccc/visual/treemap"
        },
        apply: {
          extension: {
            valuesVisible: true
          }
        }
      },

      // endregion

      // region context specific rules, not defined in the global configuration
      // Abstract
      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: "pentaho-det",
          type: "pentaho/ccc/visual/abstract"
        },
        apply: {
          extension: {
            selectable: false
          }
        }
      },
      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: ["pentaho-det", "pentaho-cdf"],
          type: "pentaho/ccc/visual/abstract"
        },
        apply: {
          extension: {
            legendPosition:    "top",
            legendAlign:       "left",

            legendFont:        vizApiFont,
            legendLabel_textStyle: "#666"
          }
        }
      },
      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: "pentaho-cdf",
          type: "pentaho/ccc/visual/abstract"
        },
        apply: {
          extension: {
            // Plot
            valuesVisible: false,
            valuesFont: vizApiFont,

            // Legend defaults
            // By UX design spec, line-width: 2 => radius: 4
            legend$Dot_shapeSize: 16, // = radius * radius
            legendMarkerSize:      8  // = diameter = 2 * radius
          }
        }
      },

      // Line/Area
      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: ["pentaho-det", "pentaho-cdf"],
          type: "pentaho/ccc/visual/pointAbstract"
        },
        apply: {
          extension: {
            // Plot
            // . dot
            dotsVisible: false,
            dot_shapeRadius: function() { return this.finished(5); }
          }
        }
      },

      // CCC Cartesian
      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: ["pentaho-det", "pentaho-cdf"],
          type: "pentaho/ccc/visual/cartesianAbstract"
        },
        apply: {
          extension: {
            // Cartesian Axes

            // . font
            axisFont: vizApiFont,
            axisLabel_textStyle: "#666",

            // . title
            axisTitleSize: 18,
            axisTitleFont: vizApiFont,
            axisTitleLabel_textStyle: "#666"
          }
        }
      },

      // BarAbstract
      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: "pentaho-cdf",
          type: "pentaho/ccc/visual/barAbstract"
        },
        apply: {
          extension: {
            label_textMargin: 7
          }
        }
      },

      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: ["pentaho-analyzer", "pentaho-det"],
          type: "pentaho/ccc/visual/cartesianAbstract"
        },
        apply: {
          extension: {
            // . horizontal discrete / minimum distance between bands/ticks
            xAxisBandSizeMin: 18,

            // . vertical discrete / minimum distance between bands/ticks/line-height
            yAxisBandSizeMin: 30,

            // Show labels, until they really overlap.
            // This is "fine-tuned" so that Analyzer's default 12px font, the xAxisBandSizeMin of 18px,
            // and the 40º slanted labels, don't cause ticks to hide. Only if font size is increased,
            // will that happen.
            discreteAxisLabelSpacingMin: 0
          }
        }
      },

      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: ["pentaho-analyzer", "pentaho-det"],
          type: "pentaho/ccc/visual/heatGrid"
        },
        apply: {
          extension: {
            // . horizontal discrete / minimum distance between bands/ticks
            xAxisBandSizeMin: 30
          }
        }
      },

      // MetricDocAbstract
      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: "pentaho-cdf",
          type: "pentaho/ccc/visual/metricDotAbstract"
        },
        apply: {
          extension: {
            continuousColorAxisColors: ["#FF0000", "#FFFF00", "#008000"]
          }
        }
      },

      // Bubble
      {
        priority: RULE_PRIO_APP_DEFAULT,
        select: {
          application: "pentaho-cdf",
          type: "pentaho/ccc/visual/bubble"
        },
        apply: {
          extension: {
            sizeAxisUseAbs: false
          }
        }
      }
      // endregion
    ]
  };

  function legendShapeColorProp(scene) {
    return scene.isOn() ? scene.color : getPvc().toGrayScale(scene.color);
  }

  function getNumberFormatter(precision, base) {
    var useAbrev = (base >= 1000);
    var key = useAbrev + "|" + precision;
    var numberFormat = numberFormatCache[key];
    if(!numberFormat) {
      // #,0 A
      // #,0.0 A
      // #,0.00 A
      var depPlacesMask = precision ? ("." + new Array(precision + 1).join("0")) : ".##";
      var mask = "#,0" + depPlacesMask + (useAbrev ? " A" : "");

      numberFormat = getPvc().data.numberFormat(mask);
      numberFormat.style(numberStyle);
      numberFormatCache[key] = numberFormat;
    }

    return numberFormat;
  }

  // For Bars, Slices and HG dots
  function fillStyle1() {

    var c = this.delegate();
    if(c) {
      c = c.rgb();

      var istate = getInteractionState(this);

      if(!istate.isActive && istate.isSelected < 0) {
        c = c.alpha(0.5);
      } else if(istate.isActive && istate.isSelected > -1) {
        // 20% darker
        c = c.hsl();
        c = c.lightness(c.l * (1 - 0.2));
      }
    }

    return this.finished(c);
  }

  // For Scatter/Bubble & NonStacked Area
  function fillStyle2() {

    var c = this.delegate();
    if(c) {
      c = c.rgb();

      var istate = getInteractionState(this);

      if(!istate.isActive && istate.isSelected < 1) {
        c = c.alpha(0.5);
      } else if(istate.isActive && istate.isSelected > 0) {
        // 20% darker
        c = c.hsl();
        c = c.lightness(c.l * (1 - 0.2));
      }
    }

    return this.finished(c);
  }

  // For StackedArea
  function fillStyle3() {

    var c = this.delegate();
    if(c) {
      c = c.rgb();

      var istate = getInteractionState(this);

      if(!istate.isActive && istate.isSelected < 0) {
        c = c.hsl();
        c = c.lightness(c.l * (1 + 0.2));
      } else if(istate.isActive && istate.isSelected > -1) {
        // 20% darker
        c = c.hsl();
        c = c.lightness(c.l * (1 - 0.2));
      }
    }

    return this.finished(c);
  }


  function getInteractionState(context) {
    var sign = context.sign;
    var scene = context.scene;

    interactionState.isSelected = (!sign.showsSelection() || !scene.anySelected()) ? 0 : scene.isSelected() ? 1 : -1;
    interactionState.isActive  = sign.mayShowActive(scene, true) ? 1 : 0;

    return interactionState;
  }

  function getPvc() {
    return pvc || (pvc = require("cdf/lib/CCC/pvc"));
  }

  function getPv() {
    return pv || (pv = require("cdf/lib/CCC/protovis"));
  }

});

