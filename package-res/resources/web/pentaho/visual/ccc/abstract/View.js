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
  "pentaho/visual/base/types/selectionModes",
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/pvc",
  "cdf/lib/CCC/cdo",
  "cdf/lib/CCC/protovis",
  "../_axes/Axis",
  "../util",
  "pentaho/util/object",
  "pentaho/util/logger",
  "pentaho/visual/color/utils",
  "pentaho/visual/color/paletteRegistry",
  "pentaho/data/TableView",
  "./ViewDemo",
  "pentaho/i18n!view"
], function(View, selectionModes,
            def, pvc, cdo, pv, Axis,
            util, O, logger, visualColorUtils, visualPaletteRegistry,
            DataView, ViewDemo, bundle) {

  "use strict";

  /*global alert:false, cv:false */

  var ruleStrokeStyle = "#808285",  // "#D8D8D8",  // #f0f0f0
      lineStrokeStyle = "#D1D3D4",  // "#D1D3D4"; //"#A0A0A0"; // #D8D8D8",// #f0f0f0
      extensionBlacklist = {
        "compatVersion": 1,
        "interactive": 1,
        "isMultiValued": 1,
        "seriesInRows": 1,
        "crosstabMode": 1,
        "width": 1,
        "height": 1,
        "canvas": 1,
        "readers": 1,
        "visualRoles": 1,
        "extensionPoints": 1,
        "dataCategoriesCount": 1
      };

  function legendShapeColorProp(scene) {
    return scene.isOn() ? scene.color : pvc.toGrayScale(scene.color);
  }

  var baseOptions = {
    // Chart
    compatVersion: 2, // use CCC version 2

    margins: 0,
    paddings: 10,
    plotFrameVisible: false,

    format: {
      percent: "#,0.00%"
    },

    // Multi-chart
    multiChartMax: 50,

    // Legend
    legend: true,
    legendPosition: "right",
    legendSizeMax: "60%",
    legendPaddings: 10,
    legendItemPadding: {left: 1, right: 1, top: 2, bottom: 2}, // width: 2, height: 4
    legendClickMode: "toggleSelected",
    color2AxisLegendClickMode: "toggleSelected", // for plot 2 (lines in bar/line combo)
    color3AxisLegendClickMode: "toggleSelected", // for trends

    // Axes
    axisSizeMax: "50%",
    axisTitleSizeMax: "20%",
    orthoAxisGrid: true,
    continuousAxisLabelSpacingMin: 1.1, // em

    // Title
    titlePosition: "top",

    // Interaction
    interactive: true,
    animate: false,
    clickable: true,
    selectable: true,
    hoverable: false,
    ctrlSelectMode: false,
    clearSelectionMode: "manual",
    tooltipEnabled: true,
    tooltip: {
      className: "pentaho-visual-ccc",
      delayIn: 200,
      delayOut: 80,
      offset: 2,
      html: true,
      gravity: "nw",
      fade: false,
      followMouse: true,
      useCorners: true,
      arrowVisible: false,
      opacity: 1
    },

    // Plot
    valuesVisible: false,

    // Data source
    isMultiValued: false,
    seriesInRows: false,

    // Data
    ignoreNulls: false,
    groupedLabelSep: "~",

    axisRule_strokeStyle: ruleStrokeStyle,
    axisTicks_strokeStyle: lineStrokeStyle,
    dot_lineWidth: 1.5,
    legendArea_lineWidth: 1,
    legendArea_strokeStyle: "#c0c0c0",
    legendLabel_textDecoration: null,
    legendDot_fillStyle: legendShapeColorProp,
    legendDot_strokeStyle: legendShapeColorProp,
    legend2Dot_fillStyle: legendShapeColorProp,
    legend2Dot_strokeStyle: legendShapeColorProp
  };

  return View.extend(/** @lends pentaho.visual.ccc.base.View# */{

    //region PROPERTIES
    _options: baseOptions,

    // Hide discrete null members in tooltip.
    _hideNullMembers: false,

    // Default mapping from gembarId to CCC dimension group.
    // From requirement visual roles to CCC visual roles...
    _roleToCccDimGroup: {
      "multi": "multiChart",
      "columns": "series",
      "rows": "category",
      "measures": "value"
    },

    // Set to the name of the CCC dimension (group) which should trigger the addition
    // of a measure discriminator column to distinguish among multiple attributes
    // mapped to a single CCC dimension.
    _genericMeasureCccDimName: null,

    _keyAxesIds: ["column", "row"],
    _axesIds: ["column", "row", "measure"],

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

    //region VizAPI implementation

    _updateAll: function() {
      this._dataTable = this.model.data;

      // Ensure we have a plain data table
      // TODO: with nulls preserved, because of order...
      this._dataView = this._dataTable.toPlainTable();

      this._visualMap = this._invVisualMap = this._dataView = null;

      // ----------

      this._initOptions();

      this._initData();

      this._readUserOptions(this.options);

      this._configure();

      this._prepareLayout(this.options);

      this._applyExtensions();

      this._renderCore();
    },

    _updateSize: function() {
      // Resize event throttling
      if(this._lastResizeTimeout != null)
        clearTimeout(this._lastResizeTimeout);

      this._lastResizeTimeout = setTimeout(function() {
        this._lastResizeTimeout = null;
        this._doResize();
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

    _updateSelection: function() {
      var dataFilter = this.model.selectionFilter;
      var selectedItems = this.model.data.filter(dataFilter);

      // Get information on the axes
      var props = def.query(this._keyAxesIds)
            .selectMany(function(axisId) {
              return this.axes[axisId].getSelectionGems();
            }, this)
            .select(function(gem) {
              return {
                ordinal: gem.attr.ordinal,
                cccDimName: gem.cccDimName
              };
            })
            .array();

      // Build a CCC filter (whereSpec)
      var whereSpec = [];
      var alreadyIn = {};
      for(var k = 0, N = selectedItems.getNumberOfRows(); k < N; k++) {

        //jshint -W083
        var datumFilterSpec = props.reduce(function(datumFilter, prop) {
          var value = selectedItems.getValue(k, prop.ordinal);
          datumFilter[prop.cccDimName] = value;
          return datumFilter;
        }, {});

        //Prevent repeated terms
        var key = specToKey(datumFilterSpec);
        if(!O.hasOwn(alreadyIn, key)) {
          alreadyIn[key] = true;
          whereSpec.push(datumFilterSpec);
        }
      }

      if(!whereSpec.length)
        return this._chart.clearSelections();

      this._chart.data.replaceSelected(this._chart.data.datums(whereSpec));

      this._chart.updateSelections();

      function specToKey(spec) {
        var entries = Object.keys(spec).sort();
        var key = entries.map(function(entry) {
          return entry + ":" + spec[entry];
        }).join(",");
        return key;
      }
    },

    _doResize: function() {
      if(this._chart) {
        var width = this.model.width;
        var height = this.model.height;
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
        "canvas", this.domContainer,
        "height", model.height || 400,
        "width",  model.width || 400,
        "dimensionGroups", {},
        "dimensions", {},
        "visualRoles", {},
        "readers", [],
        "calculations", []);
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
              var mapping = model.get(roleName);

              /*jshint laxbreak:true*/
              visualMap[roleName] = mapping
                  ? mapping.attributes.toArray(function(mappingAttr) { return mappingAttr.name; })
                  : [];
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

    _getAttributeInfoByName: function(attrName, assertExists) {
      return def.getOwn(this._gemsMap, attrName) ||
        (assertExists ? def.assert("Undefined attribute of name: '" + attrName + "'") : null);
    },

    _getAttributeInfosOfRole: function(roleName) {
      return def.getOwn(this._getVisualMapInfo(), roleName);
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
    //endregion

    _setNullInterpolationMode: function(options, value) {
    },

    _readUserOptions: function(options) {
      var model = this.model;

      var value = model.backgroundFill;
      if(value && value !== "none") {
        var fillStyle;
        if(value === "gradient") {
          if(this._hasMultiChartColumns) {
            // Use the first color with half of the saturation
            var bgColor = pv.color(model.backgroundColor).rgb();
            bgColor = pv.rgb(
              Math.floor((255 + bgColor.r) / 2),
              Math.floor((255 + bgColor.g) / 2),
              Math.floor((255 + bgColor.b) / 2),
              bgColor.a);

            fillStyle = bgColor;
          } else {
            fillStyle = "linear-gradient(to top, " +
              model.backgroundColor + ", " +
              model.backgroundColorEnd + ")";
          }
        } else {
          fillStyle = model.backgroundColor;
        }

        options.base_fillStyle = fillStyle;
      }

      //region label
      value = model.labelColor;
      if(value != null) {
        options.axisLabel_textStyle = options.axisTitleLabel_textStyle = value;
      }

      value = model.labelSize;
      if(value) {
        var labelFont = util.readFontModel(model, "label");

        options.axisTitleFont = options.axisFont = labelFont;

        if(this._hasMultiChartColumns) {
          var labelFontFamily = model.labelFontFamily;
          options.titleFont = (value + 2) + "px " + labelFontFamily;
        }
      }
      //endregion

      options.legend = value = model.showLegend;
      if(value) {
        value = model.legendColor;
        if(value) options.legendLabel_textStyle = value;

        // TODO: ignoring white color cause analyzer has no on-off for the legend bg color
        // and always send white. When the chart bg color is active it
        // would not show through the legend.
        value = model.legendBackgroundColor;
        if(value && value.toLowerCase() !== "#ffffff")
          options.legendArea_fillStyle = value;

        value = model.legendPosition;
        if(value) options.legendPosition = value;


        if(model.legendSize)
          options.legendFont = util.readFontModel(model, "legend");
      }


      value = model.getv("lineWidth", /*sloppy:*/true);
      if(value != null) {
        options.line_lineWidth = value;
        var radius = 3 + 6 * (value / 8); // 1 -> 8 => 3 -> 9,
        options.dot_shapeSize = radius * radius;

        options.plot2Line_lineWidth = options.line_lineWidth;
        options.plot2Dot_shapeSize  = options.dot_shapeSize;
      }

      value = model.getv("maxChartsPerRow", /*sloppy:*/true);
      if(value != null)
        options.multiChartColumnsMax = value;

      value = model.getv("multiChartRangeScope", /*sloppy:*/true);
      if(value) options.numericAxisDomainScope = value;

      value = model.getv("emptyCellMode", /*sloppy:*/true);
      if(value) this._setNullInterpolationMode(options, value);

      value = model.getv("sizeByNegativesMode", /*sloppy:*/true);
      options.sizeAxisUseAbs = value === "useAbs";
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
                label: attr.label || attr.name,
                isPercent: !!attr.isPercent,

                role: roleName,
                cccDimGroup: cccDimGroup,
                cccDimName: undefined,
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
     * Adds generic measure discriminator attribute information.
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
     * This has the following restrictions/consequences:
     * * all measure attributes have to be in the rightmost columns of the data table 
     * * and the ability to have different formatting per measure attribute, as there is
     *   a single CCC dimension that holds the values of all measure attributes, is lost.
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
     * Column reordering serves two purposes:
     * 1. All generic measures are placed last to satisfy the crosstab/generic measure discriminator scenario
     * 2. All measures are placed last so that CCC doesn't reorder the "logical row", discrete columns first
     */
    _transformData: function() {
      var mappedColumnIndexesDiscrete = [],
          mappedColumnIndexesContinuous = [],
          C = this._dataView.getNumberOfColumns(),
          j = -1;

      while(++j < C) {
        var ai = this._getAttributeInfoByName(this._dataView.getColumnAttribute(j).name);
        if(ai) {
          if(ai.attr.isDiscrete)
            mappedColumnIndexesDiscrete.push(j);
          else
            mappedColumnIndexesContinuous.push(j);
        }
      }

      this._dataView = new DataView(this._dataView);
      this._dataView.setSourceColumns(mappedColumnIndexesDiscrete.concat(mappedColumnIndexesContinuous));

      // Set CCC cross-tab mode and categories count
      // for proper logical row construction.
      if((this.options.crosstabMode = !!this.measureDiscrimGem)) {
        this.options.dataCategoriesCount = mappedColumnIndexesDiscrete.length;
      } else {
        // Not relevant, as every position is mapped in readers,
        // and this only serves to split discrete columns among
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
      var readers = this.options.readers,
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
          // All generic measure columns are collapsed into a single measure dimension.
          if(hasGenericReader) continue;
          hasGenericReader = true;
        }
        readers.push(ai.cccDimName);
      }
    },

    _configure: function() {
      var options = this.options,
          model   = this.model;

      // TODO: hack hack .....
      // By default hide overflow, otherwise,
      // resizing the window frequently ends up needlessly showing scrollbars.
      if(this.domContainer.parentNode) {
        this.domContainer.parentNode.style.overflow = "hidden"; // Hide overflow
      }

      var colorScaleKind = this._getColorScaleKind();
      if(colorScaleKind)
        this._configureColor(colorScaleKind);

      if(options.legend && (options.legend = this._isLegendVisible()))
        this._configureLegend();

      if(this._hasMultiChartColumns)
        this._configureMultiChart();

      this._configureTrends();
      this._configureFormats();
      this._configureLabels(options, model);

      options.axisFont = util.defaultFont(options.axisFont, 12);
      options.axisTitleFont = util.defaultFont(options.axisTitleFont, 12);

      if(!model.isInteractive) {
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
          options.colorScaleType = model.pattern === "gradient" ? "linear" : "discrete";
          options.colors = visualColorUtils.buildPalette(
            model.colorSet,
            model.pattern,
            model.reverseColors);
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
              key = keys[keys.length - 1];
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

      var trendType = (this._supportsTrends ? model.trendType : null) || "none";
      switch(trendType) {
        case "none":
        case "linear":
          break;
        default:
          trendType = "none";
      }

      options.trendType = trendType;
      if(trendType !== "none") {
        var trendName = model.trendName;
        if(!trendName)
          trendName = bundle.get("trend.name." + trendType.toLowerCase(), trendType);

        options.trendLabel = trendName;

        var value = model.trendLineWidth;
        if(value != null) {
          options.trendLine_lineWidth = +value;      // + -> to number
          var radius = 3 + 6 * ((+value) / 8); // 1 -> 8 => 3 -> 9,
          options.trendDot_shapeSize = radius * radius;
        }
      }
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
      var valuesAnchor = model.labelsOption,
          valuesVisible = !!valuesAnchor && valuesAnchor !== "none";

      options.valuesVisible = valuesVisible;
      if(valuesVisible) {
        this._configureLabelsAnchor(options, model);

        options.valuesFont = util.defaultFont(util.readFontModel(model, "label"));

        if(this._useLabelColor) {
          var labelColor = model.labelColor;
          if(labelColor) options.label_textStyle = model.labelColor;
        }
      }
    },

    _configureLabelsAnchor: function(options, model) {
      var valuesAnchor = model.labelsOption,
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

      // TODO: hack hack...
      // Let the vertical scrollbar show up if necessary
      if(this.domContainer.parentNode) {
        var containerStyle = this.domContainer.parentNode.style;
        containerStyle.overflowX = "hidden";
        containerStyle.overflowY = "auto";
      }

      // Very small charts can't be dominated by text...
      //options.axisSizeMax = '30%';

      var titleFont = util.defaultFont(options.titleFont, 12);
      if(titleFont && !(/black|(\bbold\b)/i).test(titleFont))
        titleFont = "bold " + titleFont;

      options.smallTitleFont = titleFont;

      var multiChartOverflow = this.model.multiChartOverflow;
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
        options.legendAlignTo = "page-middle";
        options.legendKeepInBounds = true; // ensure it is not placed off-page

        // Ensure that legend margins is an object.
        // Preserve already specified margins.
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

    /**
     * Applies extension properties to the CCC options.
     */
    _applyExtensions: function() {
      var extension = this.model.type.extensionEffective;
      if(extension) {

        var valid = null;

        def.each(extension, function(v, p) {
          if(!def.hasOwn(extensionBlacklist, p)) {
            if(!valid) valid = {};
            valid[p] = v;
          }
        });

        if(valid) {
          this.options = def.mixin.copy({}, this.options, valid);
        }
      }
    },

    _renderCore: function() {
      var domContainer = this.domContainer;
      while(domContainer.firstChild) {
        domContainer.removeChild(domContainer.firstChild);
      }

      var ChartClass = pvc[this._cccClass];

      this._chart = new ChartClass(this.options);
      this._chart
        .setData(this._dataView.toJsonCda())
        .render();

      // When render fails, due to required visual roles, for example, there is no chart.data.
      // Calling clearSelection, ahead, ends up causing an error.
      if(this._chart.data) this._updateSelection();
    },

    //region SELECTION
    _configureSelection: function() {
      var me = this;
      this.options.userSelectionAction = function(cccSelections) {
        return me._onUserSelection(cccSelections);
      };
      this.options.base_event = [["click", function() {
        me._onUserSelection([]);
      }]];
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

    _onUserSelection: function(selectingDatums) {
      // Duplicates may occur due to excluded dimensions like the discriminator

      // TODO: improve detection of viz without attributes.

      var alreadyIn = {};
      var operands = selectingDatums.reduce(function(memo, datum) {
        if(!datum.isVirtual) {
          // When there are no attributes (e.g. bar chart with measures alone),
          // operand is null...
          var operand = this._complexToFilter(datum);
          if(operand) {
            // Check if there's already a selection with the same key.
            // If not, add a new selection to the selections list.
            var key = JSON.stringify(operand.toSpec()); // TODO: improve key
            if(alreadyIn[key]) return memo;
            alreadyIn[key] = true;

            memo.push(operand);
          }
        }
        return memo;
      }.bind(this), []);

      var Or = this.context.get("pentaho/type/filter/or");

      var keyArgs = {};

      // Replace with empty selection when the user selects nothing.
      if(operands && operands.length === 0) keyArgs.selectionMode = selectionModes.REPLACE;

      this.model.selectAction(new Or({operands: operands}), keyArgs);

      // Explicitly cancel CCC's native selection handling.
      return [];
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

        for(var i = 0; i < L; i++) {
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
            name: function(selection) { return this._getSelectionKey(selection); },
            value: def.retTrue,
            context: this
          });

      return selectionsKept;
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
      return this.model.executeAction(this._complexToFilter(complex));
    },
    //endregion

    //region UTILITY

    _complexToFilter: function(complex) {
      // Add each axis' formulas to the selection
      var filter = null;

      this._keyAxesIds.forEach(function(axisId) {
        var operand = this.axes[axisId].complexToFilter(complex);
        if(operand)
          filter = filter ? filter.and(operand) : operand;
      }, this);

      return filter;
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
      instSpec._options = def.mixin.share({}, this.prototype._options, instSpec._options || {});

      return this.base(name, instSpec, classSpec, keyArgs);
    }
  })
    .implement(ViewDemo);
});
