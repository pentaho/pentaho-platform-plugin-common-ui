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
  "pentaho/visual/base/View",
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/pvc",
  "cdf/lib/CCC/cdo",
  "cdf/lib/CCC/protovis",
  "../_axes/Axis",
  "../util",
  "pentaho/visual/events",
  "pentaho/visual/color/utils",
  "pentaho/visual/color/paletteRegistry",
  "pentaho/data/TableView",
  "pentaho/i18n!view"
], function(View,
    def, pvc, cdo, pv, Axis,
    util, visualEvents, visualColorUtils, visualPaletteRegistry,
    DataView, bundle) {

  "use strict";

  /*global alert:false, cv:false */

  var ruleStrokeStyle = "#808285",  // "#D8D8D8",  // #f0f0f0
      lineStrokeStyle = "#D1D3D4";  // "#D1D3D4"; //"#A0A0A0"; // #D8D8D8",// #f0f0f0

  function legendShapeColorProp(scene) {
    return scene.isOn() ? scene.color : pvc.toGrayScale(scene.color);
  }

  var baseOptions = {
    // Chart
    compatVersion: 2, // use CCC version 2

    margins:  0,
    paddings: 10,
    plotFrameVisible: false,

    format: {
      percent: "#,0.00%"
    },

    // Multi-chart
    multiChartMax: 50,

    // Legend
    legend:  true,
    legendPosition: "right",
    legendSizeMax:  "60%",
    legendPaddings: 10,
    legendItemPadding: {left: 1, right: 1, top: 2, bottom: 2}, // width: 2, height: 4
    legendClickMode: "toggleSelected",
    color2AxisLegendClickMode: "toggleSelected", // for plot 2 (lines in bar/line combo)
    color3AxisLegendClickMode: "toggleSelected", // for trends

    // Axes
    axisSizeMax:      "50%",
    axisTitleSizeMax: "20%",
    orthoAxisGrid:    true,
    continuousAxisLabelSpacingMin: 1.1, // em

    // Title
    titlePosition: "top",

    // Interaction
    interactive:    true,
    animate:        false,
    clickable:      true,
    selectable:     true,
    hoverable:      false,
    ctrlSelectMode: false,
    clearSelectionMode: "manual",
    tooltipEnabled: true,
    tooltip: {
      className:    "pentaho-visual-ccc",
      delayIn:      200,
      delayOut:     80,
      offset:       2,
      html:         true,
      gravity:      "nw",
      fade:         false,
      followMouse:  true,
      useCorners:   true,
      arrowVisible: false,
      opacity:      1
    },

    // Plot
    valuesVisible: false,

    // Data source
    isMultiValued: false,
    seriesInRows: false,

    // Data
    ignoreNulls: false,
    groupedLabelSep: "~",

    // TODO: stop using the extension points map
    extensionPoints: {
      axisRule_strokeStyle:   ruleStrokeStyle,
      axisTicks_strokeStyle:  lineStrokeStyle,
      dot_lineWidth: 1.5,
      legendArea_lineWidth:   1,
      legendArea_strokeStyle: "#c0c0c0",
      legendLabel_textDecoration: null,
      legendDot_fillStyle:    legendShapeColorProp,
      legendDot_strokeStyle:  legendShapeColorProp,
      legend2Dot_fillStyle:   legendShapeColorProp,
      legend2Dot_strokeStyle: legendShapeColorProp
    }
  };

  return View.extend(/** @lends pentaho.visual.ccc.base.View# */{

    //region PROPERTIES
    _options: baseOptions,

    // Hide discrete null members in tooltip.
    _hideNullMembers: false,

    // Default mapping from gembarId to CCC dimension group.
    // From requirement visual roles to CCC visual roles...
    _roleToCccDimGroup: {
      "multi":    "multiChart",
      "columns":  "series",
      "rows":     "category",
      "measures": "value"
    },

    // Set to the name of the CCC dimension (group) which should trigger the addition
    // of a measure discriminator column to distinguish among multiple attributes
    // mapped to a single CCC dimension.
    _genericMeasureCccDimName: null,

    _keyAxesIds: ["column", "row"],
    _axesIds:    ["column", "row", "measure"],

    // Measure roles that do not show the role in the tooltip.
    // Essentially, those measures that are represented by cartesian axes...
    _noRoleInTooltipMeasureRoles: {"measures": true},

    // Do not show percentage value in front of a "percent measure" gem.
    _tooltipHidePercentageForPercentGems: false,

    // The name of the role that represents the "multi-chart" concept.
    _multiRole: "multi",

    // The name of the role that represents the "discrete color" concept.
    _discreteColorRole: "columns",

    _useLabelColor: true,
    //endregion

    //region IVisual INTERFACE
    _render: function() {
      this._dataTable = this.model.getv("data");

      // Ensure we have a plain data table
      // TODO: with nulls preserved, because of order...
      this._dataView = this._dataTable.toPlainTable();

      this._visualMap = this._invVisualMap = this._dataView = null;

      // ----------

      this._initOptions(drawSpec);

      this._initData();

      this._readUserOptions(this.options, drawSpec);

      this._configure();

      this._prepareLayout(this.options);

      this._renderCore();
    },

    // Sets the items on the chart that should be highlighted
    setHighlights: function(highlights) {
      this._selections = highlights;

      if(!this._ownChange) { // reentry control
        if(!highlights || highlights.length === 0) {
          // will cause selectionChangedAction being called
          this._ownChange = true;
          try {
            this._chart.clearSelections();
          } finally {
            this._ownChange = false;
          }
        }
      }
    },

    // TODO: what's this for? Column/Bar?
    // Returns the output parameters of the chart.
    getOutputParameters: function() {
      var params = [];
      if(this._cccClass == "PieChart") {
        params.push([
          this._dataTable.getColumnId(0),
          true,
          this._dataTable.getColumnId(0)
        ]);
      } else {
        for(var j = 0 ; j < this._dataTable.getNumberOfColumns() ; j++) {
          params.push([
            this._dataTable.getColumnId(j),
            true,
            this._dataTable.getColumnId(j)
          ]);
        }
      }

      return params;
    },

    resize: function(width, height) {
      // Resize event throttling
      if(this._lastResizeTimeout != null)
        clearTimeout(this._lastResizeTimeout);

      this._lastResizeTimeout = setTimeout(function() {
        this._lastResizeTimeout = null;
        this._doResize(width, height);
      }.bind(this), 50);
    },

    dispose: function() {

      this.base();

      if(this._chart && this._chart.dispose) {
        this._chart.dispose();
        this._chart = null;
      }
    },
    //endregion

    //region Helpers
    _doResize: function(width, height) {
      if(this._chart) {
        var options = this._chart.options;

        def.set(options, "width", width, "height", height);

        this._prepareLayout(options);

        this._chart.render(true, true, false);
      }
    },

    _initOptions: function() {
      var model = this.model;

      // Store the current selections
      this._selections = null; //drawSpec.highlights; // TODO: hookup model selections?

      // Recursively inherit this class' shared options
      var options = this.options = def.create(this._options);
      def.set(
          options,
          "canvas",          this._element,
          "height",          model.getv("height") || 400,
          "width",           model.getv("width")  || 400,
          "dimensionGroups", {},
          "dimensions",      {},
          "visualRoles",     {},
          "readers",         [],
          "calculations",    []);
    },
    //endregion

    //region VISUAL MAP
    _getVisualMap: function() {
      return this._visualMap || (this._visualMap = this._buildVisualMap());
    },

    _buildVisualMap: function() {
      var model = this.model,
          visualMap = {};

      Object.keys(this._roleToCccDimGroup)
          .forEach(function(roleName) {
            if(this[roleName]) {
              if(model.meta.get(roleName).list) {
                visualMap[roleName] = model.getv(roleName).toArray().map(function(elem) { return elem.value; });
              } else {
                visualMap[roleName] = model.getv(roleName);
              }
            }
          }, this._roleToCccDimGroup);

      return visualMap;
    },

    _getInverseVisualMap: function() {
      return this._invVisualMap || (this._invVisualMap = this._buildInverseVisualMap());
    },

    _buildInverseVisualMap: function() {
      var invVisualMap = {},
          visualMap = this._getVisualMap();
      Object.keys(visualMap).forEach(function(roleName) {
        visualMap[roleName].forEach(function(attrName) {
          def.array.lazy(invVisualMap, attrName).push(roleName);
        });
      });
      return invVisualMap;
    },

    _getFirstRoleOfAttribute: function(attrName) {
      var roles = def.getOwn(this._getInverseVisualMap(), attrName);
      return roles && roles.length ? roles[0] : null;
    },

    _getCccDimGroupOfRole: function(roleName) {
      return (def.getOwn(this._roleToCccDimGroup, roleName) ||
      def.assert("Role '" + roleName + "' is not defined."));
    },

    _getCccDimGroupOfAttribute: function(attrName) {
      var roleName = this._getFirstRoleOfAttribute(attrName);
      return roleName && this._getCccDimGroupOfRole(roleName);
    },

    _getAttributeInfoByName: function(attrName, assertExists) {
      return def.getOwn(this._gemsMap, attrName) ||
          (assertExists ? def.assert("Undefined attribute of name: '" + attrName + "'") : null);
    },

    _getAttributeInfosOfRole: function(roleName) {
      return def.getOwn(this._getVisualMapInfo(), roleName);
    },

    _getCccDimNamesOfRole: function(roleName) {
      var ais = this._getAttributeInfosOfRole("rows");
      if(ais) return ais.map(function(ai) { return ai.cccDimName; });
    },

    _getRolesByCccDimGroup: function() {
      return this._rolesByCccDimGroup ||
          (this._rolesByCccDimGroup = this._buildRolesByCccDimGroup());
    },

    _buildRolesByCccDimGroup: function() {
      var rolesByCccDimGroup = def.query(Object.keys(this._roleToCccDimGroup))
          .multipleIndex(function(roleName) { return this[roleName]; }, this._roleToCccDimGroup);

      // Must have a stable order for laying out multiple roles that map to a single CCC dimension group.
      Object.keys(rolesByCccDimGroup).forEach(function(cccDimGroup) {
        rolesByCccDimGroup[cccDimGroup].sort();
      });

      return rolesByCccDimGroup;
    },

    _getVisualMapInfo: function() {
      return this._visualMapInfo;
    },

    _getRoleDepth: function(roleName, includeMeasureDiscrim) {
      var depth = 0,
          ais = this._getAttributeInfosOfRole(roleName);
      if(ais) {
        depth = ais.length;
        if(!includeMeasureDiscrim && this.measureDiscrimGem &&
            this.measureDiscrimGem.role === roleName) {
          depth -= 1;
        }
      }

      return depth;
    },

    _isRoleBound: function(roleName) {
      return !!this._getAttributeInfosOfRole(roleName);
    },

    _getRoleIsDiscrete: function(roleName) {
      var ais = this._getAttributeInfosOfRole(roleName);
      if(ais) return ais.some(function(ai) { return ai.attr.isDiscrete; });
    },
    //endregion

    _setNullInterpolationMode: function(options, value) {
    },

    _readUserOptions: function(options) {
      var model = this.model;
      var extPoints = options.extensionPoints;

      var value = model.getv("backgroundFill");
      if(value && value !== "none") {
        var fillStyle;
        if(value === "gradient") {
          if(this._hasMultiChartColumns) {
            // Use the first color with half of the saturation
            var bgColor = pv.color(model.getv("backgroundColor")).rgb();
            bgColor = pv.rgb(
                Math.floor((255 + bgColor.r) / 2),
                Math.floor((255 + bgColor.g) / 2),
                Math.floor((255 + bgColor.b) / 2),
                bgColor.a);

            fillStyle = bgColor;
          } else {
            fillStyle = "linear-gradient(to top, " +
                model.getv("backgroundColor") + ", " +
                model.getv("backgroundColorEnd") + ")";
          }
        } else {
          fillStyle = model.getv("backgroundColor");
        }

        extPoints.base_fillStyle = fillStyle;
      }

      value = model.getv("labelColor");
      if(value !== undefined) {
        extPoints.axisLabel_textStyle = extPoints.axisTitleLabel_textStyle = value;
      }

      options.legend = value = model.getv("showLegend");
      if(value) {
        value = model.getv("legendColor");
        if(value) extPoints.legendLabel_textStyle = value;

        // TODO: ignoring white color cause analyzer has no on-off for the legend bg color
        // and always send white. When the chart bg color is active it
        // would not show through the legend.
        value = model.getv("legendBackgroundColor");
        if(value && value.toLowerCase() !== "#ffffff")
          extPoints.legendArea_fillStyle = value;

        value = model.getv("legendPosition");
        if(value) options.legendPosition = value;


        if(model.getf("legendSize"))
          options.legendFont = util.readFontModel(model, "legend");
      }

      value = model.getf("lineWidth");
      if(value != null) {
        extPoints.line_lineWidth = value;
        var radius = 3 + 6 * (value / 8); // 1 -> 8 => 3 -> 9,
        extPoints.dot_shapeSize = radius * radius;

        extPoints.plot2Line_lineWidth = extPoints.line_lineWidth;
        extPoints.plot2Dot_shapeSize  = extPoints.dot_shapeSize;
      }

      value = model.getf("maxChartsPerRow");
      if(value != null)
        options.multiChartColumnsMax = value;

      value = model.getv("emptyCellMode");
      if(value) this._setNullInterpolationMode(options, value);

      value = model.getv("multiChartRangeScope");
      if(value) options.numericAxisDomainScope = value;

      value = model.getv("labelSize");
      if(value) {
        var labelFont = util.readFontModel(model, "label");

        options.axisTitleFont = options.axisFont = labelFont;

        if(this._hasMultiChartColumns) {
          var labelFontFamily = model.getv("labelFontFamily");
          options.titleFont = (value + 2) + "px " + labelFontFamily;
        }
      }

      var sizeByNegativesMode = model.getv("sizeByNegativesMode");
      options.sizeAxisUseAbs = sizeByNegativesMode === "useAbs";
    },

    _initData: function() {
      var dataTable = this._dataTable,

      // axisId -> AttributeInfo[]
          axesGemsInfo = {
            row: [],
            column: [],
            measure: []
          },

      // attrName -> AttributeInfo
          gemsMap = {},

      // roleName -> attr-name[]
          visualMap = this._getVisualMap(),

      // roleName -> AttributeInfo[]
          visualMapInfo = {},

          genericMeasuresCount = 0;

      // Create attribute infos for each attribute in the data table.
      if(dataTable.isCrossTable) {
        var crossLayout = dataTable.implem.layout,
            addStructPos = function(axisId, structPos) {
              addAxisAttribute.call(this, axisId, structPos.attribute);
            };

        crossLayout.rows.forEach(addStructPos.bind(this, "row"));
        crossLayout.cols.forEach(addStructPos.bind(this, "column"));
        crossLayout.meas.forEach(addStructPos.bind(this, "measure"));
      } else {
        // Table in plain layout
        var C = dataTable.getNumberOfColumns(),
            j = -1;
        while(++j < C) {
          var attr = dataTable.getColumnAttribute(j);
          addAxisAttribute.call(this, attr.isDiscrete ? "row" : "measure", attr);
        }
      }

      function addAxisAttribute(axisId, attr) {
        // Is this attribute mapped to any role?
        // Note: it can be an automatically provided property of a mapped attribute
        //   (e.g.: for a "location" geo role attribute,
        //   Analyzer automatically adds "latitude" and "longitude" attributes)

        /*jshint validthis:true*/

        var attrName = attr.name,
            roleName = this._getFirstRoleOfAttribute(attrName);
        if(roleName) {
          var cccDimGroup = this._getCccDimGroupOfRole(roleName),
              roleAttrNames = visualMap[roleName],
              roleOrdinal = roleAttrNames.indexOf(attrName),
              attrInfo = {
                attr: attr,

                name: attr.name,
                label: attr.label,
                isPercent: !!attr.isPercent,

                role: roleName,
                cccDimGroup: cccDimGroup,
                cccDimName:  undefined,
                axis: axisId,
                isMeasureGeneric: (cccDimGroup === this._genericMeasureCccDimName),
                isMeasureDiscrim: false
              };

          if(attrInfo.isMeasureGeneric) genericMeasuresCount++;

          gemsMap[attrInfo.name] = attrInfo;
          axesGemsInfo[axisId].push(attrInfo);

          /* Note that, in general, and apart from the attrName to AttributeInfo conversion,
           * `visualMapInfo` is a subset of `visualMap`.
           * This is because due to row/column number limits,
           * the data service may, for example, omit some of the requested measures
           * (see Analyzer's `maxValues` visual type property).
           */
          var roleAttrInfos = visualMapInfo[roleName] ||
              (visualMapInfo[roleName] = new Array(roleAttrNames.length));

          // We later take care of clearing the gaps caused by missing attributes (i).
          roleAttrInfos[roleOrdinal] = attrInfo;
        }
      }

      // (i) Clear gaps caused by missing attributes.
      Object.keys(visualMapInfo).forEach(function(roleName) {
        def.array.removeIf(visualMapInfo[roleName], def.falsy);
      });

      this._gemsMap = gemsMap;
      this._visualMapInfo = visualMapInfo;
      this._genericMeasuresCount = genericMeasuresCount;
      this.measureDiscrimGem = null;

      var hasDiscrim = genericMeasuresCount > 1;
      if(hasDiscrim) this._addGenericMeasureDiscriminator();

      this._initAxes(axesGemsInfo);
    },

    /**
     * Adds a generic measure discriminator attribute info.
     *
     * When a measure visual role like "measures" or "measuresLine" accepts multiple attributes, and
     * it is desired that each of these displays as if it were a different series
     * (different line, different color etc.),
     * we trick CCC into interpreting each measure attribute column as a _column value_ in cross-table format.
     *
     * This is done by using CCC's crosstab format (with measuresInColumns=false).
     * All measures' values end up in a single CCC "value" dimension.
     * The name of the original measure column ends up in the special CCC dimension we call "the measure discriminator".
     *
     * Has the following restrictions/consequences:
     * * all measure attributes have to be in the rightmost columns of the data table...
     * * looses the ability to have different formatting per measure attribute as there is
     *   a single CCC dimension that holds the values of all measure attributes.
     *   The formatting configuration of the first measure in the measure role is used.
     */
    _addGenericMeasureDiscriminator: function() {
      // In which of the discrete axes should we add the discriminator to?
      // To the first whose defaultRole is mapped to a ccc dim group.
      // (not all vizs have/use both axis; see Pie chart, for example).
      var roleToCccDimGroup = this._roleToCccDimGroup,
          attrInfo = tryCreateInAxis("column") || tryCreateInAxis("row") ||
              def.assert("Need a mapped discrete axis to hold the measure discriminator.");

      this.measureDiscrimGem = attrInfo;

      def.array.lazy(this._visualMapInfo, attrInfo.role).push(attrInfo);

      this._gemsMap[attrInfo.name] = attrInfo;

      // ----

      function tryCreateInAxis(axisId) {
        // DefaultRole of axis
        var roleName = axisId + "s";

        var cccDimGroup = def.getOwn(roleToCccDimGroup, roleName);
        return cccDimGroup && createAttributeInfo(axisId, roleName, cccDimGroup);
      }

      function createAttributeInfo(axisId, roleName, cccDimGroup) {
        // Has no data table attribute to map to.
        return {
          attr: null,
          name: "__MeasureDiscrim__",
          label: "Measure discriminator",
          role: roleName,
          cccDimGroup: cccDimGroup,
          cccDimName: undefined,
          axis: axisId,
          isMeasureGeneric: false,
          isMeasureDiscrim: true
        };
      }
    },

    _initAxes: function(axesGemsInfo) {
      // 1. Create axes.

      // axisId -> Axis
      this.axes = {};

      // Order is not relevant.
      this._axesIds.forEach(function(axisId) {
        this.axes[axisId] = Axis.create(this, axisId, axesGemsInfo[axisId]);
      }, this);

      // 2. Ensure we have a plain data table
      // TODO: with nulls preserved, because of order...
      this._dataView = this._dataTable.toPlainTable();

      // 3. Remove _unmapped_ attributes and reorder attributes of the plain data table.
      this._transformData();

      // 4. Assign a CCC dimension name to each attribute info.
      this._assignCccDimensions();

      // 5. Configure CCC readers
      this._configureCccReaders();

      // 6. Determine if there are any multi-chart playing roles
      // (ignoring the measure discrim, if any)
      var hasMulti = false;
      if(this._multiRole) {
        var mais = this._getAttributeInfosOfRole(this._multiRole);
        if(mais)
          hasMulti = !this.measureDiscrimGem ||
              mais.some(function(mai) { return !mai.isMeasureDiscrim; });
      }
      this._hasMultiChartColumns = hasMulti;
    },

    /**
     * Removes _unmapped_ attributes and reorders attributes of the plain data table.
     *
     * Gets array of _mapped_ column indexes of the plain table to set in a data view.
     *
     * Reorders by splitting into generic and non-generic attributes,
     * so that all generic measure attributes are placed last
     * to _enable_ the measure discriminator scenario.
     */
    _transformData: function() {
      var mappedColumnIndexesOther = [],
          mappedColumnIndexesGeneric = [],
          C = this._dataView.getNumberOfColumns(),
          j = -1,
          filteredOrReordered = false;
      while(++j < C) {
        var attrInfo = this._getAttributeInfoByName(this._dataView.getColumnAttribute(j).name);
        if(!attrInfo) {
          // Filter. Not mapped.
          filteredOrReordered = true;
        } else {
          if(this.measureDiscrimGem && attrInfo.isMeasureGeneric) {
            mappedColumnIndexesGeneric.push(j);
          } else {
            mappedColumnIndexesOther.push(j);

            // Going back to non-generic after any generic?
            // Reordering columns.
            if(mappedColumnIndexesGeneric.length)
              filteredOrReordered = true;

          }
        }
      }

      // Filtered or reordered any of the plain table attributes?
      if(filteredOrReordered) {
        this._dataView = new DataView(this._dataView);
        this._dataView.setSourceColumns(mappedColumnIndexesOther.concat(mappedColumnIndexesGeneric));
      }

      // Set CCC cross-tab mode and categories count
      // for proper logical row construction.
      if((this.options.crosstabMode = !!this.measureDiscrimGem)) {
        this.options.dataCategoriesCount = mappedColumnIndexesOther.length;
      } else {
        // Not relevant, as every position is mapped in readers,
        // and this only server to split discrete columns among
        // series and categories.
        this.options.dataCategoriesCount = null;
      }
    },

    /**
     * Assign a CCC dimension name to each attribute info.
     *
     * (CCC Dim Group)     1-->oo     (Role)     1-->oo    (AttributeInfo)
     *                       |                     |
     *               rolesByCccDimGroup       visualMapInfo
     */
    _assignCccDimensions: function() {
      var rolesByCccDimGroup = this._getRolesByCccDimGroup(),
          visualMapInfo = this._visualMapInfo,
          hasGenericDiscrim = !!this.measureDiscrimGem,
          genericCccDimName = this._genericMeasureCccDimName;

      Object.keys(rolesByCccDimGroup).forEach(function(cccDimGroup) {
        var isGenericGroup = hasGenericDiscrim && (cccDimGroup === genericCccDimName),
            ordinal = 0;

        rolesByCccDimGroup[cccDimGroup].forEach(function(roleName) {
          // Role may be unbound.
          var ais = def.getOwn(visualMapInfo, roleName);
          if(ais) ais.forEach(function(ai) {
            /*jshint laxbreak:true*/
            ai.cccDimName = isGenericGroup
                ? cccDimGroup
                : pvc.buildIndexedId(cccDimGroup, ordinal++);
          });
        });
      });
    },

    /**
     * With all the plain table transformations in place,
     * and apart from the measure discriminator,
     * which always takes the first position in CCC's logical row,
     * the CCC mapping is 1-1.
     */
    _configureCccReaders: function() {
      var readers  = this.options.readers,
          dataView = this._dataView,
          C = dataView.getNumberOfColumns(),
          j = -1,
          hasGenericReader = false,
          attrName, ai;

      if(this.measureDiscrimGem)
        readers.push(this.measureDiscrimGem.cccDimName);

      while(++j < C) {
        attrName = dataView.getColumnAttribute(j).name;
        ai = this._getAttributeInfoByName(attrName);
        if(ai.isMeasureGeneric) {
          if(hasGenericReader) continue;
          hasGenericReader = true;
        }
        readers.push(ai.cccDimName);
      }
    },

    _configure: function() {
      var options = this.options,
          model = this.model;

      // By default hide overflow, otherwise,
      // resizing the window frequently ends up needlessly showing scrollbars.
      this._element.parentNode.style.overflow = "hidden"; // Hide overflow

      var colorScaleKind = this._getColorScaleKind();
      if(colorScaleKind)
        this._configureColor(colorScaleKind);

      if(options.legend && (options.legend = this._isLegendVisible()))
        this._configureLegend();

      if(this._hasMultiChartColumns)
        this._configureMultiChart();

      this._configureTrends();
      this._configureSorts();
      this._configureFormats();
      this._configureLabels(options, model);

      options.axisFont = util.defaultFont(options.axisFont, 12);
      options.axisTitleFont = util.defaultFont(options.axisTitleFont, 12);

      if(!model.getv("interactive")) {
        options.interactive = false;
      } else {
        if(options.tooltipEnabled) this._configureTooltip();

        this._configureSelection();

        this._configureDoubleClick();
      }
    },

    //region COLOR SCALE
    _getColorScaleKind: function() {
      return "discrete";
    },

    _configureColor: function(colorScaleKind) {
      var options = this.options,
          model = this.model;

      switch(colorScaleKind) {
        case "discrete":
          options.colors = this._getDiscreteColors();
          break;

        case "continuous":
          options.colorScaleType = model.getv("pattern") === "gradient" ? "linear" : "discrete";
          options.colors = visualColorUtils.buildPalette(model.getv("colorSet"), model.getv("pattern"), model.getv("reverseColors"));
          break;
      }
    },

    _getDiscreteColors: function() {
      var colors = this._discreteColorRole ? this._getDiscreteColorsCore() : null;
      return colors || this._getDefaultDiscreteColors();
    },

    _getDiscreteColorsCore: function() {
      var colorMap = this._getDiscreteColorMap();
      if(colorMap) {
        var defaultScale = pv.colors(this._getDefaultDiscreteColors()),
            scaleFactory = this._createDiscreteColorMapScaleFactory(colorMap, defaultScale);

        // Make sure the scales returned by scaleFactory
        // "are like" pv.Scale - have all the necessary methods.
        return function safeScaleFactory() {
          return def.copy(scaleFactory(), defaultScale);
        };
      }
    },

    _getDefaultDiscreteColors: function() {
      return visualPaletteRegistry.get().colors.slice();
    },

    _getDiscreteColorMap: function() {
      var memberPalette = this._getMemberPalette();
      if(!memberPalette) return;

      // 1 - The CCC color role is not being explicitly set, so whatever goes to the series role is used by
      //     the color role.
      // 2 - When a measure discrim is used and there is only one measure, the CCC dim name of the discriminator is
      //      not of the "series" group; so in this case, there's no discriminator in the key.
      var colorGems = this._getDiscreteColorGems(),
          C = colorGems.length,
          M = this._genericMeasuresCount,
          colorMap;

      // Possible to create colorMap based on memberPalette?
      if(C || M) {
        if(!C || M > 1) {
          // Use measure colors.
          // More than one measure gem or no color gems.
          // var keyIncludesMeasureDiscriminator = M > 1 && C > 0;
          // When the measure discriminator exists, it is the last gem.
          colorMap = this._copyColorMap(null, memberPalette["[Measures].[MeasuresLevel]"]);
        } else {
          // If C > 0, Pie chart always ends up here...
          // Use the members' colors of the last color attribute.
          colorMap = this._copyColorMap(null, memberPalette[colorGems[C - 1].name]);
        }
      }

      return colorMap;
    },

    _getDiscreteColorGems: function() {
      /*jshint laxbreak:true*/
      var colorAttrInfos = this._getVisualMapInfo()[this._discreteColorRole];
      return colorAttrInfos
          ? colorAttrInfos.filter(function(attrInfo) { return !attrInfo.isMeasureDiscrim; })
          : [];
    },

    _getMemberPalette: function() {
      /* TEST
       return {
         "[Markets].[Territory]": {
           "[Markets].[APAC]":   "rgb(150, 0, 0)",
           "[Markets].[EMEA]":   "rgb(0, 150, 0)",
           "[Markets].[Japan]":  "rgb(0, 0, 150)",
           "[Markets].[NA]":     "pink"
         },

         "[Order Status].[Type]": {
           "[Order Status].[Cancelled]":  "turquoise",
           "[Order Status].[Disputed]":   "tomato",
           //"[Order Status].[In Process]": "steelblue",
           "[Order Status].[Shipped]":    "seagreen"
           //"[Order Status].[On Hold]":    "",
           //"[Order Status].[Resolved]":   ""
         },

         "[Measures].[MeasuresLevel]": {
           "[MEASURE:0]": "violet",
           "[MEASURE:1]": "orange"
         }
       };
       */

      // Determine memberPalette from the data table attributes and members...
      var memberPalette = null;

      function setColor(dimName, memberValue, color) {
        if(!memberPalette) memberPalette = {};
        def.lazy(memberPalette, dimName)[memberValue] = color;
      }

      this._dataTable.model.attributes.forEach(function(attr) {
        if(attr.members) {
          // Level
          attr.members.forEach(function(member) {
            var color = member.property("color");
            if(color) setColor(attr.name, member.value, color);
          });
        } else {
          // Measure
          var color = attr.property("color");
          if(color) setColor("[Measures].[MeasuresLevel]", attr.name, color);
        }
      });

      return memberPalette;
    },

    _createDiscreteColorMapScaleFactory: function(colorMap, defaultScale) {
      return function scaleFactory() {
        return function(compKey) {
          if(compKey) {
            var keys = compKey.split("~"),
                key  = keys[keys.length - 1];
            return colorMap[key] || defaultScale(key);
          }
        };
      };
    },

    _copyColorMap: function(mapOut, mapIn) {
      if(mapIn) {
        if(!mapOut) mapOut = {};
        for(var key in mapIn) // tolerates nully
          if(def.hasOwn(mapIn, key))
            mapOut[key] = pv.color(mapIn[key]);
      }
      return mapOut;
    },
    //endregion

    _configureTrends: function() {
      var options = this.options,
          model = this.model;

      var trendType = (this._supportsTrends ? model.getv("trendType") : null) || "none";
      switch(trendType) {
        case "none":
        case "linear":
          break;
        default:
          trendType = "none";
      }

      options.trendType = trendType;
      if(trendType !== "none") {
        var trendName = model.getv("trendName");
        if(!trendName)
          trendName = bundle.get("trend.name." + trendType.toLowerCase(), trendType);

        options.trendLabel = trendName;

        var value = model.getv("trendLineWidth");
        if(value != null) {
          var extPoints = options.extensionPoints;

          extPoints.trendLine_lineWidth  = +value;      // + -> to number
          var radius = 3 + 6 * ((+value) / 8); // 1 -> 8 => 3 -> 9,
          extPoints.trendDot_shapeSize = radius * radius;
        }
      }
    },

    _configureSorts: function() {
      var value = this.model.getv("sliceOrder");

      if(value) this.options.sliceOrder = value;
    },

    _configureFormats: function() {
      // Top-level format info
      var formatInfo = this._dataTable.model.format;
      if(formatInfo) {
        // Recursively inherit from class format default.
        // Mixin the data table format.
        var formatInfoOut = this.options.format = def.create(this.options.format, formatInfo);

        // Default the percent style to the number style.
        var numberStyle = formatInfo.number && formatInfo.number.style;
        if(numberStyle && !(formatInfo.percent && formatInfo.percent.style)) {
          if(!formatInfoOut.percent) {
            formatInfoOut.percent = {};
          } else if(def.string.is(formatInfoOut.percent)) {
            formatInfoOut.percent = {
              mask: formatInfoOut.percent
            };
          }

          formatInfoOut.percent.style = numberStyle;
        }
      }

      // Attribute/dimension-level format info
      // var ais = this._getAttributeInfosOfRole(measureRole);
      var dims = this.options.dimensions;

      // 1. Handle all mapped, non-generic measure attributes
      def.query(Object.keys(this._gemsMap))
          .select(function(attrName) { return this._gemsMap[attrName]; }, this)
          .where(function(ai) { return !!ai.attr && !ai.attr.isDiscrete && !ai.isMeasureGeneric; })
          .each(setFormatInfo);

      // 2. Handle generic measure dimension name, if any.
      //    As there are multiple measure attributes in a single CCC dimension,
      //    (as when both Sales and Quantity are placed on the "Measure" gem bar),
      //    only the format of the first of these can be specified.
      //    Also, note, there may be more than one generic measure role,
      //    so only the first attribute of the first bound generic measure role is used...
      if(this.measureDiscrimGem) {
        // e.g.
        // _genericMeasureCccDimName = "value"
        // roles:
        //   "measures":     unbound
        //   "measuresLine": "sales", "quantity"
        var genericRoleNames = this._getRolesByCccDimGroup()[this._genericMeasureCccDimName],
            firstAi = def.query(genericRoleNames)
                .selectMany(this._getAttributeInfosOfRole, this)
                .first(def.notNully);
        if(firstAi) setFormatInfo(firstAi);
      }

      // ---

      function setFormatInfo(ai) {
        var format = ai.attr.format,
            mask = format && format.number && format.number.mask;
        if(mask) def.lazy(dims, ai.cccDimName).format = mask;
      }
    },

    //region LABELS
    _configureLabels: function(options, model) {
      var valuesAnchor  = model.getv("labelsOption"),
          valuesVisible = !!valuesAnchor && valuesAnchor !== "none";

      options.valuesVisible = valuesVisible;
      if(valuesVisible) {
        this._configureLabelsAnchor(options, model);

        options.valuesFont = util.defaultFont(util.readFontModel(model, "label"));

        if(this._useLabelColor)
          options.extensionPoints.label_textStyle = model.getv("labelColor");
      }
    },

    _configureLabelsAnchor: function(options, model) {
      var valuesAnchor = model.getv("labelsOption"),
          simpleCamelCase = /(^\w+)([A-Z])(\w+)/;

      var match = simpleCamelCase.exec(valuesAnchor);
      if(match != null) {
        valuesAnchor = match[1] + "_" + match[2].toLowerCase() + match[3];
      }

      options.valuesAnchor = valuesAnchor;
    },
    //endregion

    _configureMultiChart: function() {
      var options = this.options;

      // Let the vertical scrollbar show up if necessary
      var containerStyle = this._element.parentNode.style;
      containerStyle.overflowX = "hidden";
      containerStyle.overflowY = "auto";

      // Very small charts can't be dominated by text...
      //options.axisSizeMax = '30%';

      var titleFont = util.defaultFont(options.titleFont, 12);
      if(titleFont && !(/black|(\bbold\b)/i).test(titleFont))
        titleFont = "bold " + titleFont;

      options.smallTitleFont = titleFont;

      var multiChartOverflow = this.model.getv("multiChartOverflow");
      if(multiChartOverflow)
        options.multiChartOverflow = multiChartOverflow.toLowerCase();
    },

    //region TOOLTIP
    _configureTooltip: function() {
      var me = this;
      this.options.tooltipFormat = function(scene) {
        return me._getTooltipText(scene.datum, this);
      };
    },

    _getTooltipText: function(complex, context) {
      var tooltipLines = [], msg;

      this._axesIds.forEach(function(axisId) {
        this.axes[axisId].buildHtmlTooltip(tooltipLines, complex, context);
      }, this);

      if(!complex.isVirtual) {
        // TODO: container double click tooltip
        //msg = this._vizHelper.getDoubleClickTooltip();
        if(msg) tooltipLines.push(msg);
      }

      /* Add selection information */
      // Not the data point count, but the selection count (a single column selection may select many data points).
      //var selectedCount = this._chart && this._chart.data.selectedCount();
      var selections = this._selections,
          selectedCount = selections && selections.length;
      if(selectedCount) {
        var msgId = selectedCount === 1 ? "tooltip.footer.selectedOne" : "tooltip.footer.selectedMany";

        msg = bundle.get(msgId, [selectedCount]);

        tooltipLines.push(msg);
      }

      return tooltipLines.join("<br />");
    },
    //endregion

    //region LEGEND
    _isLegendVisible: function() {
      var colorRole = this._discreteColorRole;
      return !!colorRole && this._getRoleDepth(colorRole, /*includeMeasureDiscrim:*/true) > 0;
    },

    _configureLegend: function() {
      var options = this.options;

      options.legendFont = util.defaultFont(options.legendFont, 10);

      var legendPosition = options.legendPosition,
          isTopOrBottom = legendPosition === "top" || legendPosition === "bottom";

      if(this._hasMultiChartColumns && !isTopOrBottom) {
        options.legendAlignTo  = "page-middle";
        options.legendKeepInBounds = true; // ensure it is not placed off-page

        // Ensure that legend margins is an object.
        // Preseve already specifed margins.
        // CCC's default adds a left or right 5 px margin,
        // to separate the legend from the content area.
        var legendMargins = options.legendMargins;
        if(legendMargins) {
          if(typeof(legendMargins) !== "object")
            legendMargins = options.legendMargins = {all: legendMargins};
        } else {
          legendMargins = options.legendMargins = {};
          var oppositeSide = pvc.BasePanel.oppositeAnchor[legendPosition];
          legendMargins[oppositeSide] = 5;
        }

        legendMargins.top = 20;
      }

      // Calculate 'legendAlign' default value
      if(!("legendAlign" in options))
        options.legendAlign = isTopOrBottom ? "center" : "middle";
    },
    //endregion

    // Logic that depends on width and height
    _prepareLayout: function(options) {
      // TODO: Assumes vertical scrollbar!
      // Account for the width of the *possible* scrollbar
      if(this._hasMultiChartColumns && pv.renderer() !== "batik")
        options.width -= 17;
    },

    _renderCore: function() {
      while(this._element.firstChild)
        this._element.removeChild(this._element.firstChild);

      var ChartClass = pvc[this._cccClass];

      this._chart = new ChartClass(this.options);
      this._chart
          .setData(this._dataView.toJsonCda())
          .render();
    },

    //region SELECTION
    _configureSelection: function() {
      var me = this;
      this.options.userSelectionAction = function(cccSelections) {
        return me._onUserSelection(cccSelections);
      };
      this.options.selectionChangedAction = function(cccSelections) {
        me._onSelectionChanged(cccSelections);
      };
    },

    _onUserSelection: function(selectingDatums) {
      return this._processSelection(selectingDatums);
    },

    _getSelectionKey: function(selection) {
      var key = selection.__cccKey;
      if(!key) {
        var keys = [selection.type];

        var ap = def.array.append;
        if(selection.columnId) {
          ap(keys, selection.columnId);
          ap(keys, selection.columnItem);
        }

        if(selection.rowId) {
          ap(keys, selection.rowId);
          ap(keys, selection.rowItem);
        }

        key = selection.__cccKey = keys.join("||");
      }

      return key;
    },

    _doesSharedSeriesSelection: function() {
      // Until analyzer selection logic is moved out we need this auxiliary decoupling argument.
      return false;
    },

    _onSelectionChanged: function(selectedDatums) {

      // Convert to array of analyzer cell or column selection objects
      var selectionExcludesMulti = this._selectionExcludesMultiGems(),
          selections = [],
          selectionsByKey = {};

      if(this._doesSharedSeriesSelection()) {
        selectedDatums.forEach(function(datum) {
          if(!datum.isVirtual) {
            var selection = {type: "column"};

            this.axes.column.fillCellSelection(selection, datum, selectionExcludesMulti);

            // Check if there's already a selection with the same key.
            // If not, add a new selection to the selections list.
            // In the case where the selection max count limit is reached,
            // the datums included in each selection must be known (by its index).
            // So, add the datum to the new or existing selection's datums list.

            var key = this._getSelectionKey(selection),
                existingSelection = selectionsByKey[key];
            if(!existingSelection) {
              selection.__cccDatums = [datum];

              selectionsByKey[key] = selection;
              selections.push(selection);
            } else {
              existingSelection.__cccDatums.push(datum);
            }
          }
        }, this);

      } else {
        // Duplicates may occur due to excluded dimensions like the discriminator
        selectedDatums.forEach(function(datum) {
          if(!datum.isVirtual) {
            var selection = this._complexToCellSelection(datum, selectionExcludesMulti);

            // Check if there's already a selection with the same key.
            // If not, add a new selection to the selections list.
            var key = this._getSelectionKey(selection),
                existingSelection = selectionsByKey[key];
            if(!existingSelection) {
              selection.__cccDatums = datum;

              selectionsByKey[key] = selection;
              selections.push(selection);
            }
          }
        }, this);
      }

      selections = this._limitSelection(selections);

      // Wrap the event trigger with _ownChange=true,
      // cause otherwise, when the #setHighlights method is called,
      // in response to selection changing,
      // and if only interpolated dots had beed selected,
      // resulting in selections.length === 0,
      // then the chart selections would be reset...
      this._ownChange = true;
      try {
        // Launch analyzer select event, even if selection is empty (to clear it)
        visualEvents.trigger(this, "select", {
          source:        this,
          selections:    selections,
          selectionMode: "REPLACE"
        });
      } finally {
        this._ownChange = false;
      }
    },

    _limitSelection: function(selections) {
      var selectionsKept = selections;

      // limit selection
      var filterSelectionMaxCount = Infinity, //deselectCount > 0 always false
          L = selections.length,
          deselectCount = L - filterSelectionMaxCount;
      if(deselectCount > 0) {
        // Build a list of datums to deselect
        var deselectDatums = [];
        selectionsKept = [];

        for(var i = 0 ; i < L ; i++) {
          var selection = selections[i],
              keep = true;
          if(deselectCount) {
            if(this._previousSelectionKeys) {
              var key = this._getSelectionKey(selection);
              if(!this._previousSelectionKeys[key]) keep = false;
            } else if(i >= filterSelectionMaxCount) {
              keep = false;
            }
          }

          if(keep) {
            selectionsKept.push(selection);
          } else {
            var datums = selection.__cccDatums;
            if(datums) {
              if(def.array.is(datums))
                def.array.append(deselectDatums, datums);
              else
                deselectDatums.push(datums);
            }
            deselectCount--;
          }
        }

        // Deselect datums beyond the max count
        cdo.Data.setSelected(deselectDatums, false);

        // Mark for update UI ASAP
        this._chart.updateSelections();

        if(typeof alert !== "undefined") {
          alert([
                "infoExceededMaxSelectionItems",
                filterSelectionMaxCount,
                "SELECT_ITEM_LIMIT_REACHED"
              ]);
        }
      }

      // Index with the keys of previous selections
      this._previousSelectionKeys =
          def.query(selectionsKept)
              .object({
                name:    function(selection) { return this._getSelectionKey(selection); },
                value:   def.retTrue,
                context: this
              });

      return selectionsKept;
    },

    /**
     * By default, the keep only or the exclude menu operations
     * do not select level gems playing a multi role.
     *
     * The same applies to the the drill down operation,
     * that, by default, does not KEEP level gems playing
     * a multi role.
     * Note that a gem playing a multi role
     * can itself be drilled on.
     */
    _selectionExcludesMultiGems: function() {
      return true;
    },

    /**
     * HG totally overrides this and it is the only chart that ignores sharedSeriesSelection.
     */
    _processSelection: function(selectedDatums) {

      /**
       * Selection rules.
       *
       * -> gems with (chart)axis="measure" are excluded
       *
       * -> gems playing a "multi" role are excluded (!except in the pie chart!)
       *    -> this way, points with common category data in
       *       different small charts are simultaneously selected
       *
       * -> measure discriminator gems are excluded
       *    this way, selection is always expanded to other series of different measures
       *
       * this._gemCountColumnReportAxis : (new options: selectable and sharedSeriesSelection)
       *
       * -> if there are no gems with reportAxis='column':
       *    -> that's it. (most granular selection s available)
       *
       * -> if there is a single gem with reportAxis='column': (!except in the HG chart!)
       *    -> gems with (chart)axis="row" are excluded
       *       (selecting one point selects every other point of the same "series")
       *
       * -> if there is more that one gem with reportAxis='column':
       *    -> selection is disabled as a whole
       *       (in this case, code doesn't even enter here)
       *
       */
      /**
       * Example CCC "where" specification:
       * <pre>
       * whereSpec = [
       *     // Datums whose series is "Europe" or "Australia",
       *     // and whose category is 2001 or 2002
       *     {series: ["Europe", "Australia"], category: [2001, 2002]},
       *
       *     // Union'ed with
       *
       *     // Datums whose series is "America"
       *     {series: "America"},
       * ];
       * </pre>
       */
      var outDatums = [],
          whereSpec;

      if(selectedDatums.length) {
        var selectionExcludesMulti = this._selectionExcludesMultiGems();

        // Include axis="column" dimensions
        // * Excludes measure discrim dimensions
        // * Excludes "multi" role dimensions
        var colDimNames = this.axes.column.getSelectionGems(selectionExcludesMulti)
            .select(function(gem) { return gem.cccDimName; })
            .array(),
            rowDimNames;

        if(!this._doesSharedSeriesSelection()) {
          // Include axis="row" dimensions
          // * Excludes measure discrim dimensions
          // * Excludes "multi" role dimensions
          rowDimNames = this.axes.row.getSelectionGems(selectionExcludesMulti)
              .select(function(gem) { return gem.cccDimName; })
              .array();
        }

        if(!colDimNames.length && (!rowDimNames || !rowDimNames.length)) {
          selectedDatums = [];
        } else {
          whereSpec = [];

          selectedDatums.forEach(addDatum);

          this._chart.data
              .datums(whereSpec, {visible: true})
              .each(function(datum) {
                outDatums.push(datum);
              });

          // Replace
          selectedDatums = outDatums;
        }
      }

      function addDatum(datum) {
        if(!datum.isNull) {

          // Some trend datums, like those of the scatter plot,
          // don't have anything distinguishing between them,
          // so we need to explicitly add them to the output.
          if(datum.isTrend) outDatums.push(datum);

          var datumFilter = {},
              datoms = datum.atoms;

          if(colDimNames) colDimNames.forEach(addDim);
          if(rowDimNames) rowDimNames.forEach(addDim);

          whereSpec.push(datumFilter);
        }

        function addDim(dimName) {
          // The atom itself may be used as a value condition
          datumFilter[dimName] = datoms[dimName];
        }
      }

      return selectedDatums;
    },
    //endregion

    //region DOUBLE-CLICK
    _configureDoubleClick: function() {
      var me = this;
      this.options.doubleClickAction = function(scene) {
        me._onDoubleClick(scene.datum);
      };

      this.options.axisDoubleClickAction = function(scene) {
        var group = scene.group;
        if(group) return me._onDoubleClick(group);
      };
    },

    _onDoubleClick: function(complex) {
      var selection = this._complexToCellSelection(complex, this._selectionExcludesMultiGems());
      visualEvents.trigger(this, "doubleclick", {
        source:        this,
        selections:    [selection]
        // TODO: Analyzer needs to know whether this double click is coming from a chart data point or an axis.
        // For axis use case, please identify the gembar and include only those gems that are in this gembar
        // into the selection.
        // For chart data point use case, please pass all gems across gembars into the selection
        // gembar: rows
      });

      return true;
    },
    //endregion

    //region UTILITY
    /**
     * Converts a complex to an analyzer cell selection.
     *
     * An analyzer cell selection has the following structure:
     * {
     *    type:     "cell",
     *
     *    column:      table column index ??
     *    columnId:    ["[Time].[Years]", "[Time].[Quarters]"   ], // formulas
     *    columnItem:  ["[Time].[2003]",  "[Time].[2003].[QTR4]"], // values
     *    columnLabel: "2003~QTR4~Sales",
     *
     *    row:          table row index ??
     *    rowId:       ["[Markets].[Territory]", "[Order Status].[Type]"    ]  // formulas
     *    rowItem:     ["[Markets].[EMEA]",      "[Order Status].[Resolved]"], // values
     *    rowLabel:    "Type",
     *
     *    value:       28550.59 // formatted joined by ~ ?
     * }
     */
    _complexToCellSelection: function(complex, selectionExcludesMulti) {
      /* The analyzer cell-selection object */
      var selection = {type: "cell"};

      /* Add each axis' formulas to the selection */
      this._axesIds.forEach(function(axisId) {
        this.axes[axisId].fillCellSelection(selection, complex, selectionExcludesMulti);
      }, this);

      return selection;
    }
    //endregion
  }, /** @lends pentaho.visual.ccc.base.View */{

    /**
     * Core extend functionality for CCC View subclasses.
     *
     * Inherits and merges the shared,
     * prototype [_options]{@link pentaho.visual.ccc.base.View#_options} property.
     *
     * @param {?string} name - The name of the created class.
     * @param {Object} instSpec - The instance spec.
     * @param {Object} classSpec - The static spec.
     * @param {Object} keyArgs - Keyword arguments.
     * @override
     */
    _extend: function(name, instSpec, classSpec, keyArgs) {
      if(!instSpec) instSpec = {};

      // Extend _options property,
      // just like `def.type` does it in its classes.
      instSpec._options = def.mixin.share(this.prototype._options, instSpec._options || {});

      return this.base(name, instSpec, classSpec, keyArgs);
    }
  });
});
