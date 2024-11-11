/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


/* eslint-disable max-len */

define(function() {

  "use strict";

  /**
   * In this file you can add configuration rules that fine-tune the look and behaviour
   * of visualizations when displayed in different applications.
   *
   * Below, you'll find several examples of configuration rules which can be individually uncommented and experimented.
   * Links to the documentation of the options being configured are provided.
   *
   * For help on configuration, please check the following help topics:
   * 1. [General information on configuration](https://docs.hitachivantara.com/r/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia002/developer-center/platform-javascript-apis/configuration-api)
   * 2. [Configuring a visualization](https://docs.hitachivantara.com/r/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia002/developer-center/platform-javascript-apis/visualization-api/configuring-a-visualization)
   *
   * If you need to know the identifiers of well-known modules, check the following help topics:
   * 1. [Ids of Well-Known Applications](https://docs.hitachivantara.com/r/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia002/developer-center/platform-javascript-apis/configuration-api/known-values-of-pentaho-platform-environment-variables)
   * 2. [Ids of Stock Visualization Models and Views](https://docs.hitachivantara.com/r/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia002/developer-center/platform-javascript-apis/visualization-api/configuring-a-visualization/stock-visualizations-identifiers)
   * 3. [Ids of Stock Color Palettes](https://docs.hitachivantara.com/r/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia002/developer-center/platform-javascript-apis/visualization-api/configuring-a-visualization/stock-color-palettes-identifiers)
   *
   * Almost all stock visualizations are based on the CCC charting library.
   * To experiment with CCC options and styles you can use the [CCC playground](https://webdetails.github.io/ccc).
   * You can also check the [CCC reference documentation](https://webdetails.github.io/ccc/charts/jsdoc).
   *
   * After changing this file, it is sufficient to refresh the browser to test any changes.
   */
  return /** @type {pentaho.config.spec.IRuleSet} */{
    rules: [
      // region Example Rules
      // #region
      /**
       * Example Rule 1 - Hide a visualization from an application's menu.
       *
       * - For PDI Data Inspection and Pentaho Analyzer
       * _ For the Pie visualization model
       * - Hide from the applications' menu(s)
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://docs.hitachivantara.com/v/u/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia012
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          application: ["pentaho/det", "pentaho/analyzer"],
          module: "pentaho/visual/models/Pie"
        },
        apply: {
          isBrowsable: false
        }
      },
      */

      /**
       * Example Rule 2 - Show a visualization in an application's menu.
       *
       * - For any application
       * - For the sample Calculator visualization model
       * - Show it in the applications' menu(s) (this visualization is hidden by default)
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://docs.hitachivantara.com/v/u/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia012
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          module: "pentaho/visual/samples/calc/Model"
        },
        apply: {
          isBrowsable: true
        }
      },
      */

      /**
       * Example Rule 3 - Change the label of a visualization in an application's menu.
       *
       * - For Pentaho Analyzer
       * - For the 100% Stacked Bar visualization model
       * - Change its menu label
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://docs.hitachivantara.com/v/u/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia012
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          application: "pentaho/analyzer",
          module: "pentaho/visual/models/BarNormalizedHorizontal"
        },
        apply: {
          label: "Relative Proportion Bar"
        }
      },
      */

      /**
       * Example Rule 4 - Change the shape of data points in a line visualization and hide the option.
       *
       * - For any application
       * - For the Line and Bar/Line visualizations models
       * - Change the shape of data points and hide the option from the user
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://docs.hitachivantara.com/v/u/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia012
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          module: [
            "pentaho/visual/models/Line",
            "pentaho/visual/models/BarLine"
          ]
        },
        apply: {
          props: {
            shape: {
              defaultValue: "diamond",
              isBrowsable: false
            }
          }
        }
      },
      */

      /**
       * Example Rule 5 - Change the inner radius of the donut visualization.
       *
       * - For Pentaho Analyzer
       * - For the Donut visualization view
       * - Change the Donut's inner radius, using CCC extension points
       *
       * Note that the Donut chart is really just a Pie chart with a non-zero inner radius.
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.charts.PieChart.html#extensionPoints
       * @see https://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.ext.PiePlotExtensionPoints.html#slice
       * @see https://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.marks.PieChartWedgeExtensionPoint.html#innerRadiusEx
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          application: "pentaho/analyzer",
          module: "pentaho/ccc/visual/Donut"
        },
        apply: {
          extension: {
            slice_innerRadiusEx: "40%"
          }
        }
      },
      */

      /**
       * Example Rule 6 - Change the colors of a well-known color palette.
       *
       * - For any application
       * - For the primary nominal color palette (which is the default discrete color palette)
       * - Change its colors
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://docs.hitachivantara.com/v/u/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia012
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          module: "pentaho/visual/color/palettes/nominalPrimary"
        },
        apply: {
          colors: ["red", "#00FF00", "rgb(0,0,255)"]
        }
      },
      */

      /**
       * Example Rule 7 - Change the color palette of a visualization to a new one.
       *
       * - For any application
       * - For the Bar visualization model
       * - Change its color palette to a newly defined one
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://docs.hitachivantara.com/v/u/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia012
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          module: "pentaho/visual/models/Bar"
        },
        apply: {
          props: {
            palette: {
              defaultValue: {
                level: "nominal",
                colors: ["red", "#00FF00", "rgb(0,0,255)"]
              }
            }
          }
        }
      },
      */

      /**
       * Example Rule 8 - Change the color palette of a visualization to a registered one.
       *
       * - For any application
       * - For the Bar visualization model
       * - Change its color palette to a registered one
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://docs.hitachivantara.com/v/u/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia012
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
       {
        select: {
          module: "pentaho/visual/models/Bar"
        },
        deps: [
          "pentaho/visual/color/palettes/nominalLight"
        ],
        apply: function(nominalLightPalette) {
          return {
            props: {
              palette: {
                defaultValue: nominalLightPalette
              }
            }
          };
        }
      },
      */

      /**
       * Example Rule 9 - Change the ranking of a registered color palette.
       *
       * - For any application
       * - For the special "pentaho/modules" module
       * - Change the ranking of the nominal primary color palette,
       *   so that it is not the default discrete color palette anymore
       *
       * Uncomment the following comment block to activate the rule.
       *
       * @see https://docs.hitachivantara.com/v/u/en-us/pentaho-data-integration-and-analytics/10.2.x/mk-95pdia012
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          module: "pentaho/modules"
        },
        apply: {
          "pentaho/visual/color/palettes/nominalPrimary": {
            ranking: -1000
          }
        }
      },
      */

      /**
       * Example Rule 10 - Disable date levels using a continuous axis.
       *
       * - For Pentaho Analyzer
       * - For the *Continuous Date* visual role adaptation strategy
       * - Disable it; date levels will be represented in a discrete axis, instead of in a continuous axis
       *
       * Uncomment the following comment block to activate the rule.
       *
       * [Viz. API 2 Style]
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          application: "pentaho/analyzer",
          module: "pentaho/visual/role/adaptation/EntityWithTimeIntervalKeyStrategy"
        },
        apply: {
          isBrowsable: false
        }
      },
      */

      /**
       * Example Rule 11 - Disable numeric levels using a continuous axis.
       *
       * - For Pentaho Analyzer
       * - For the *Continuous Number* visual role adaptation strategy
       * - Disable it; numeric levels will be represented in a discrete axis, instead of in a continuous axis
       *
       * Uncomment the following comment block to activate the rule.
       *
       * [Viz. API 2 Style]
       *
       * @type {pentaho.config.spec.IRule}
       */
      /*
      {
        select: {
          application: "pentaho/analyzer",
          module: "pentaho/visual/role/adaptation/EntityWithNumberKeyStrategy"
        },
        apply: {
          isBrowsable: false
        }
      }
      */

      // #endregion

      // region Styles For Pentaho Analyzer
      // #region

      /*
       * The following rules contain several useful options of CCC stock visualization views.
       *
       * The rules are targeting Pentaho Analyzer, for convenience, but can be used for other applications, if desired.
       *
       * Unlike the rules in the _Example Rules_ section, above, the following rules are active by default, albeit with
       * every option commented out.
       *
       * Uncomment the desired options.
       */

      /**
       * Configuration of the Discrete Color Legend of CCC Stock Visualizations
       *
       * - For Pentaho Analyzer
       * - For All CCC Stock Visualization Views
       *
       * @type {pentaho.config.spec.IRule}
       */
      {
        select: {
          application: "pentaho/analyzer",
          module: "pentaho/ccc/visual/Abstract"
        },
        apply: {
          extension: {
            /**
             * The behavior of the legend panel when "overflow" of legend items occurs.
             *
             * When 'clip', all legend items are rendered but the overflow in the legend panel is hidden.
             * When 'collapse' and when overflow is detected, the whole legend panel is collapsed; the legend is not displayed.
             *
             * The inherited value is `"collapse"`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.panels.LegendPanel.html#overflow
             */
            // [Viz. API 2 Style] Uncomment:
            // legendOverflow: "clip",

            /**
             * Maximum number of legend items to show.
             *
             * When set to `null`, the number of legend items is not limited.
             *
             * When set to a non-`null` value, the legend is considered to be in "overflow" when the number of legend items is greater,
             * which may cause hiding the legend altogether (according to `legendOverflow`).
             *
             * The inherited value is `20`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.panels.LegendPanel.html#itemCountMax
             */
            // [Viz. API 2 Style] Uncomment:
            // legendItemCountMax: null,

            /**
             * The maximum size of the legend panel.
             *
             * When the legend is docked at left or right, *size*, when specified as a single number or percentage,
             * refers to the legend panel's _width_. Otherwise, when docked at top or bottom, it refers to its _height_.
             *
             * When set to `null`, the _size_ of the legend panel is not limited.
             *
             * The inherited value is `"30%"`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.panels.Panel.html#sizeMax
             */
            // [Viz. API 2 Style] Uncomment:
            // legendItemSizeMax: "60%",

            // Other, assorted legend styles.
            // @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.panels.LegendPanel.html

            // [Viz. API 2 Style] Uncomment:
            // legendPaddings:  10,
            // [Viz. API 2 Style] Uncomment:
            // legendMargins: null,
            // [Viz. API 2 Style] Uncomment:
            // legendItemSize:  null,
            // [Viz. API 2 Style] Uncomment:
            // legendItemPadding: {left: 1, right: 1, top: 2, bottom: 2},
            // [Viz. API 2 Style] Uncomment:
            // legendTextMargin: null,
            // [Viz. API 2 Style] Uncomment:
            // legendArea_lineWidth:   1,
            // [Viz. API 2 Style] Uncomment:
            // legendLabel_textDecoration: null
          }
        }
      },

      /**
       * Configurations which are common to X and Y cartesian axes of CCC Stock Visualizations.
       *
       * @type {pentaho.config.spec.IRule}
       */
      {
        select: {
          application: "pentaho/analyzer",
          module: [
            "pentaho/ccc/visual/Bar",
            "pentaho/ccc/visual/BarStacked",
            "pentaho/ccc/visual/BarNormalized",
            "pentaho/ccc/visual/BarHorizontal",
            "pentaho/ccc/visual/BarStackedHorizontal",
            "pentaho/ccc/visual/BarNormalizedHorizontal",
            "pentaho/ccc/visual/Line",
            "pentaho/ccc/visual/AreaStacked",
            "pentaho/ccc/visual/BarLine",
            "pentaho/ccc/visual/HeatGrid",
            "pentaho/ccc/visual/Bubble",
            "pentaho/ccc/visual/Scatter"
          ]
        },
        apply: {
          extension: {
            /**
             * Indicates if the cartesian axes' title panels should be visible.
             *
             * When `true`, the title panel will be visible even if the title text is empty.
             * When `false`, the title panel will be hidden.
             * When `null`, the title panel will be visible if the title is not empty.
             *
             * @type {boolean|null}
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.panels.TitlePanel.html#visible
             */
            // [Viz. API 2 Style] Uncomment:
            // axisTitleVisible: null,

            /**
             * The alignment of the cartesian axes' title panels.
             *
             * @type {string|null}
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.panels.DockedPanel.html#align
             */
            // [Viz. API 2 Style] Uncomment:
            // xAxisTitleAlign: null,
            // [Viz. API 2 Style] Uncomment:
            // x2AxisTitleAlign: null,
            // [Viz. API 2 Style] Uncomment:
            // x3AxisTitleAlign: null,
            // [Viz. API 2 Style] Uncomment:
            // yAxisTitleAlign: null,
            // [Viz. API 2 Style] Uncomment:
            // y2AxisTitleAlign: null,
            // [Viz. API 2 Style] Uncomment:
            // y3AxisTitleAlign: null,

            /**
             * The minimum spacing between two consecutive discrete axis tick labels
             * below which they are considered overlapping (in ems).
             *
             * The related options `xAxisOverlappedLabelsMode` and `yAxisOverlappedLabelsMode` control
             * what happens when discrete labels overlap.
             *
             * The inherited value is `0`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.axes.FlattenedDiscreteCartesianAxis.html#labelSpacingMin
             */
            // [Viz. API 2 Style] Uncomment:
            // discreteAxisLabelSpacingMin: 0.25
          }
        }
      },

      /**
       * Configuration of Discrete X Axis of CCC Stock Visualizations.
       *
       * - For Pentaho Analyzer
       * - For CCC Stock Visualization Views which (may) show a Discrete X Axis
       *
       * @type {pentaho.config.spec.IRule}
       */
      {
        select: {
          application: "pentaho/analyzer",
          module: [
            "pentaho/ccc/visual/Bar",
            "pentaho/ccc/visual/BarStacked",
            "pentaho/ccc/visual/BarNormalized",
            "pentaho/ccc/visual/Line",
            "pentaho/ccc/visual/AreaStacked",
            "pentaho/ccc/visual/BarLine",
            "pentaho/ccc/visual/HeatGrid"
          ]
        },
        apply: {
          extension: {
            /**
             * The maximum height of the X axis panel.
             *
             * When set to `null`, the X axis height may grow as needed to fit its content,
             * however limited to the initial height of the visualization.
             * When the axis height increases, the (initially) available height for the plot/drawing is diminished.
             * If, then, the plot is not configured to allow the visualization to grow, it effectively reduces the
             * available plot height. As such, it's considered a best practice to limit the axis height by some amount,
             * absolute or relative (as a percentage).
             *
             * When set to a non-`null` value, the axis's tick labels are trimmed when they don't fit the available space,
             * while still showing the full value when hovered over.
             *
             * The inherited value is `90`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.panels.Panel.html#sizeMax
             */
            // [Viz. API 2 Style] Uncomment:
            // xAxisSizeMax: "50%",

            /**
             * The minimum width of discrete X axis categorical bands.
             *
             * When `null` the categorical bands can be as small as needed
             * for the visualization to fit into the available width.
             *
             * When not `null`, horizontal scrollbars may appear.
             *
             * The inherited value is `18`, except for the "HeatGrid", for which it is `30`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.axes.DiscreteCartesianAxis.html#bandSizeMin
             */
            // [Viz. API 2 Style] Uncomment:
            // xAxisBandSizeMin: null,

            /**
             * Chooses how to deal with overlapping, discrete X axis' tick labels.
             *
             * - `"hide"` - hide the labels that overlap.
             * - `"leave"` - let labels overlap.
             * - `"rotate"` - attempt to rotate labels so that these do not overlap; if these always overlap, then let them overlap.
             * - `"rotatethenhide"` - attempt to rotate labels so that these do not overlap; if these always overlap, hide some.
             *
             * When `"rotate"` or `"rotatethenhide"`, the attempted rotations depend on the value of the options
             * `xAxisLabelRotationDirection` and `xAxisLabelDesiredAngles`.
             *
             * The inherited value is `"rotatethenhide"`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.axes.DiscreteCartesianAxis.html#overlappedLabelsMode
             */
            // xAxisOverlappedLabelsMode: "rotatethenhide",

            /**
             * The automatic rotation direction of discrete X axis tick labels.
             *
             * This option only applies when `xAxisOverlappedLabelsMode` is one of `"rotate"` or `"rotatethenhide"`.
             *
             * The angle `0` corresponds to horizontally laid out labels, aligned with the X-axis.
             *
             * - `"clockwise"` - labels rotate in a clockwise direction;
             * - `"counterclockwise"` - labels rotate in a counter-clockwise direction.
             *
             * When, `xAxisLabelDesiredAngles` is specified, this option affects the meaning of positive angle:
             * - `"clockwise"` - positive label angles are measured in a clockwise direction;
             * - `"counterclockwise"` - positive label label angles are measures in a counter-clockwise direction.
             *
             * The inherited value is `"clockwise"`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.axes.DiscreteCartesianAxis.html#labelRotationDirection
             */
            // [Viz. API 2 Style] Uncomment:
            // xAxisLabelRotationDirection: "counterclockwise",

            /**
             * The automatic rotation angles of discrete X axis tick labels (in radians).
             *
             * This option only applies when `xAxisOverlappedLabelsMode` is one of `"rotate"` or `"rotatethenhide"`.
             *
             * The angle `0` corresponds to horizontally laid out labels, aligned with the X-axis.
             *
             * The angles are measured from the X-axis in a direction according to `xAxisLabelRotationDirection`:
             * - `"clockwise"` - positive label angles are measured in a clockwise direction;
             * - `"counterclockwise"` - positive label label angles are measures in a counter-clockwise direction.
             *
             * The angles are tested for no-label-overlap in the specified order.
             * The first angle for which tick labels do not overlap is chosen.
             *
             * When explicitly set to `null`, the _first_ possible angle which causes labels to not overlap is chosen.
             *
             * The inherited value is `[0, 40 * (Math.PI / 180)]`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.axes.DiscreteCartesianAxis.html#labelDesiredAngles
             */
            // xAxisLabelDesiredAngles: [0, 40 * (Math.PI / 180)]
          }
        }
      },

      /**
       * Configuration of Discrete Y Axis of CCC Stock Visualizations.
       *
       * - For Pentaho Analyzer
       * - For CCC Stock Visualization Views which show a Discrete Y Axis
       *
       * @type {pentaho.config.spec.IRule}
       */
      {
        select: {
          application: "pentaho/analyzer",
          module: [
            "pentaho/ccc/visual/BarHorizontal",
            "pentaho/ccc/visual/BarStackedHorizontal",
            "pentaho/ccc/visual/BarNormalizedHorizontal",
            "pentaho/ccc/visual/HeatGrid"
          ]
        },
        apply: {
          extension: {
            /**
             * The maximum width of the Y axis panel.
             *
             * When set to `null`, the Y axis width may grow as needed to fit its content,
             * however limited to the initial width of the visualization.
             * When the axis width increases, the (initially) available width for the plot/drawing is diminished.
             * If, then, the plot is not configured to allow the visualization to grow, it effectively reduces the
             * available plot width. As such, it's considered a best practice to limit the axis width by some amount,
             * absolute or percentual.
             *
             * When set to a non-`null` value, the axis's tick labels are trimmed when they don't fit the available space,
             * while still showing the full value when hovered over.
             *
             * The inherited value is `117`, except for the "HeatGrid", for which it is `80`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.panels.Panel.html#sizeMax
             */
            // [Viz. API 2 Style] Uncomment:
            // yAxisSizeMax: "50%",

            /**
             * The minimum height of discrete Y axis categorical bands.
             *
             * When `null` the categorical bands can be as small as needed
             * for the visualization to fit into the available height.
             *
             * When not `null`, vertical scrollbars may appear.
             *
             * The inherited value is `30`.
             *
             * @see http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.axes.DiscreteCartesianAxis.html#bandSizeMin
             */
            // [Viz. API 2 Style] Uncomment:
            // yAxisBandSizeMin: null
          }
        }
      }
      // #endregion
    ]
  };
});
