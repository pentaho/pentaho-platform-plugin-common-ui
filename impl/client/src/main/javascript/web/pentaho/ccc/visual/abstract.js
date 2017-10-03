/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "pentaho/visual/action/SelectionModes",
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/pvc",
  "cdf/lib/CCC/cdo",
  "cdf/lib/CCC/protovis",
  "./axes/Axis",
  "./_util",
  "pentaho/util/object",
  "pentaho/util/logger",
  "pentaho/visual/color/utils",
  "pentaho/data/TableView",
  "pentaho/i18n!view"
], function(SelectionModes, def, pvc, cdo, pv, Axis, util, O, logger, visualColorUtils, DataView, bundle) {

  "use strict";

  /* globals Promise */

  var extensionBlacklist = {
    "compatVersion": 1,
    "compatFlags": 1,
    "isMultiValued": 1,
    "measuresIndexes": 1,
    "multiChartIndexes": 1,
    "measuresInColumns": 1,
    "dataMeasuresInColumns": 1,
    "ignoreMetadataLabels": 1,
    "dataIgnoreMetadataLabels": 1,
    "typeCheckingMode": 1,
    "dataTypeCheckingMode": 1,
    "seriesInRows": 1,
    "crosstabMode": 1,
    "width": 1,
    "height": 1,
    "canvas": 1,
    "readers": 1,
    "visualRoles": 1,
    "extensionPoints": 1,
    "categoriesCount": 1,
    "dataCategoriesCount": 1
  };

  var baseOptions = {
    // Chart
    compatVersion: 2, // use CCC version 2
    compatFlags: {
      discreteTimeSeriesTickFormat: false
    },

    format: {
      percent: "#,0.00%"
    },

    // Interaction
    clearSelectionMode: "manual",

    // Tooltip
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
    trendDot_ibits: 0,
    trendDot_imask: "ShowsActivity",
    trendLine_ibits: 0,
    trendLine_imask: "ShowsActivity",

    // Data source
    isMultiValued: false,
    seriesInRows: false,

    // Data
    dataTypeCheckingMode: "none",
    ignoreNulls: false
  };

  return [
    "pentaho/visual/base/view",
    "pentaho/visual/models/abstract",
    "pentaho/visual/action/select",
    "pentaho/visual/action/execute",
    "pentaho/visual/role/level",
    // Pre-load all registered filter types
    {$types: {base: "pentaho/data/filter/abstract"}},
    function(BaseView, Model, SelectAction, ExecuteAction, MeasurementLevel) {

      return BaseView.extend(/** @lends pentaho.visual.ccc.visual.Abstract# */{

        $type: {
          props: {
            model: {valueType: Model}
          }
        },

        // region PROPERTIES
        _options: baseOptions,

        // Hide discrete null members in tooltip.
        _hideNullMembers: false,

        // Default mapping from gembarId to CCC dimension group.
        // From requirement visual roles to CCC visual roles...
        _roleToCccRole: {
          "multi": "multiChart",
          "columns": "series",
          "rows": "category",
          "measures": "value"
        },

        /* There can be one special CCC dimension into which
         * the attributes of one or more Viz measure roles are mapped.
         *
         * e.g.:
         *
         *   Viz Visual Role  -> Generic Measure CCC Visual Role
         *   ---------------------------------------------------
         *   "measures"          "value"
         *   "measuresLine"      "value"
         *
         * Each of the Viz visual roles may support more than one attribute.
         *
         * In the end, if more than one measure attribute were mapped to the same
         * CCC visual role, either multiple CCC dimensions would be created,
         * one for each of the attributes (e.g.: value, value2, value3...)
         * or - the current solution - an auxiliary measure discriminator dimension is added to
         * distinguish which of the measure attributes is in the CCC visual role (e.g.: "value").
         *
         * To activate the measure discriminator mode, a chart class has to specify the
         * prototype property `_genericMeasureCccVisualRole` with the name of the target CCC visual role.
         *
         * When multiple source roles exist,
         * these are sorted alphabetically and the within role attribute order is preserved.
         */
        _genericMeasureCccVisualRole: null,

        GENERIC_MEASURE_DIM_NAME: "__GENERIC_MEASURE__",
        GENERIC_MEASURE_DISCRIM_DIM_NAME: "__GENERIC_MEASURE_DISCRIM__",

        _keyAxesIds: ["column", "row"],
        _axesIds: ["column", "row", "measure"],

        // Measure roles that do not show the role in the tooltip.
        // Essentially, those measures that are represented by cartesian axes...
        _noRoleInTooltipMeasureRoles: {"measures": true},

        // Do not show percentage value in front of a "percent measure" MappingAttributeInfo.
        _tooltipHidePercentageOnPercentAttributes: false,

        // The name of the role that represents the "multi-chart" concept.
        _multiRole: "multi",

        // The name of the role that represents the "discrete color" concept.
        _discreteColorRole: "columns",

        _useLabelColor: true,
        // endregion

        // region VizAPI implementation

        /** @inheritDoc */
        _updateAll: function() {
          this._dataTable = this.model.data;

          // Ensure we have a plain data table
          // TODO: with nulls preserved, because of order...
          this._dataView = this._dataTable.toPlainTable();

          // ----------

          this._initOptions();

          this._processExtensions();

          this._initData();

          this._readUserOptions(this.options);

          this._configureOptions();

          this._prepareLayout(this.options);

          this._applyExtensions();

          // Return any rejection promise.
          return this._renderCore();
        },

        /** @inheritDoc */
        _updateSize: function() {
          // Resize event throttling
          if(this._lastResizeTimeout != null)
            clearTimeout(this._lastResizeTimeout);

          this._lastResizeTimeout = setTimeout(function() {
            this._lastResizeTimeout = null;
            this._doResize();
          }.bind(this), 50);
        },

        /** @inheritDoc */
        _releaseDomContainer: function() {
          if(this._chart && this._chart.dispose) {
            this._chart.dispose();
            this._chart = null;
          }
        },

        /** @inheritDoc */
        _updateSelection: function() {
          var dataFilter = this.selectionFilter;
          var selectedItems = this._dataView.filter(dataFilter);

          // Get information on the axes
          var props = def.query(this._keyAxesIds)
                .selectMany(function(axisId) {
                  return this.axes[axisId].getSelectionMappingAttrInfos();
                }, this)
                .select(function(maInfo) {
                  return {
                    attr: maInfo.attr,
                    cccDimName: maInfo.cccDimName
                  };
                })
                .array();

          // Build a CCC filter (whereSpec)
          var whereSpec = [];
          var alreadyIn = {};
          for(var k = 0, N = selectedItems.getNumberOfRows(); k < N; k++) {

            /* eslint no-loop-func: 0 */
            var datumFilterSpec = props.reduce(function(datumFilter, prop) {
              var value = selectedItems.getValue(k, selectedItems.getColumnIndexByAttribute(prop.attr));
              datumFilter[prop.cccDimName] = value;
              return datumFilter;
            }, {});

            // Prevent repeated terms.
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

        // endregion

        // region Helpers

        _doResize: function() {
          if(this._chart) {
            var options = this._chart.options;
            options.width = this.width;
            options.height = this.height;

            this._prepareLayout(options);

            this._chart.renderResize(options.width, options.height);
          }
        },

        _initOptions: function() {
          // Recursively inherit this class' shared options
          var options = this.options = def.create(this._options);
          def.set(
            options,
            "canvas", this.domContainer,
            "height", this.height || 400,
            "width", this.width || 400,
            "dimensions", {},
            "visualRoles", {},
            "readers", [],
            "calculations", []);
        },
        // endregion

        // region VISUAL MAP
        _getMappingAttrInfosByRole: function(roleName) {
          return def.getOwn(this._visualMapInfo, roleName);
        },

        _getRoleDepth: function(roleName, includeMeasureDiscrim) {
          var depth = 0;
          var maInfos = this._getMappingAttrInfosByRole(roleName);
          if(maInfos) {
            depth = maInfos.length;
            if(!includeMeasureDiscrim && this._isGenericMeasureMode &&
               this._genericMeasureDiscrimMappingAttrInfo.role === roleName) {
              depth -= 1;
            }
          }

          return depth;
        },

        _isRoleBound: function(roleName) {
          return !!this._getMappingAttrInfosByRole(roleName);
        },

        _isRoleQualitative: function(roleName) {
          if(this._isGenericMeasureRole(roleName)) return false;

          var mapping = this.model.get(roleName);
          if(mapping.attributes.count > 1) return true;

          var rolePropType = this.model.$type.get(roleName);
          var level = rolePropType.levelEffectiveOn(this.model);
          return !level || MeasurementLevel.type.isQualitative(level);
        },

        _isGenericMeasureRole: function(roleName) {
          var cccGenericRoleName = this._genericMeasureCccVisualRole;
          return !!cccGenericRoleName && def.getOwn(this._roleToCccRole, roleName) === cccGenericRoleName;
        },

        _getGenericMeasureRoleNames: function() {
          var cccRole = this._genericMeasureCccVisualRole;
          return (cccRole && def.getOwn(this._rolesByCccVisualRole, cccRole)) || [];
        },

        _selectGenericMeasureMappingAttrInfos: function() {
          return def.query(this._getGenericMeasureRoleNames())
              .selectMany(this._getMappingAttrInfosByRole, this)
              .where(def.notNully);
        },
        // endregion

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

          // region label
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
          // endregion

          options.legendAreaVisible = value = model.showLegend && this._isLegendVisible();
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

          value = model.getv("lineWidth", /* sloppy: */true);
          if(value != null) {
            options.line_lineWidth = value;
            // 1 -> 3.167
            // 2 -> 4
            // 8 -> 9
            var radius = 5 / 6 * (value - 2) + 4;
            options.dot_shapeSize = radius * radius;

            options.plot2Line_lineWidth = options.line_lineWidth;
            options.plot2Dot_shapeSize  = options.dot_shapeSize;
          }

          value = model.getv("maxChartsPerRow", /* sloppy: */true);
          if(value != null)
            options.multiChartColumnsMax = value;

          value = model.getv("multiChartRangeScope", /* sloppy: */true);
          if(value) options.numericAxisDomainScope = value;

          value = model.getv("emptyCellMode", /* sloppy: */true);
          if(value) this._setNullInterpolationMode(options, value);

          value = model.getv("sizeByNegativesMode", /* sloppy: */true);
          options.sizeAxisUseAbs = value === "useAbs";
        },

        _initData: function() {
          var dataTable = this._dataTable;
          var attributes = dataTable.model.attributes;

          var genericMeasuresCount = 0;
          var genericMeasureCccVisualRole = this._genericMeasureCccVisualRole;

          // Multiple ways to store and index MappingAttributeInfo...
          var mappingAttrInfos = [];

          // axisId -> MappingAttributeInfo[]
          var mappingAttrInfosByAxisId = {
            row:     [],
            column:  [],
            measure: []
          };

          // mappingAttrName -> MappingAttributeInfo
          var mappingAttrInfosByName = {};

          // roleName -> MappingAttributeInfo[]
          var visualMapInfo = {};

          // ----

          // roleName -> attrName[]
          var visualMap = {};

          // attrName -> roleName[]
          var invVisualMap = {};

          var rolesByCccVisualRole = {};

          // ----

          /**
           * Registers a mapping attribute info.
           *
           * @param {MappingAttributeInfo} mappingAttrInfo The mapping attribure info to add.
           * @return {MappingAttributeInfo} The same as `mappingAttrInfo`.
           */
          var addMappingAttrInfo = function(mappingAttrInfo) {

            // Complete
            var isMeasureGeneric = !!genericMeasureCccVisualRole &&
                (mappingAttrInfo.cccRole === genericMeasureCccVisualRole);

            mappingAttrInfo.isMeasureGeneric = isMeasureGeneric;

            // Not final; see below. When genericMeasuresCount.length > 1,
            // all isMeasureGeneric mappingAttrInfo will share a single CCC dimension.
            mappingAttrInfo.cccDimName = mappingAttrInfo.name;

            // Store/Index in multiple ways
            mappingAttrInfos.push(mappingAttrInfo);

            if(isMeasureGeneric) genericMeasuresCount++;

            mappingAttrInfosByName[mappingAttrInfo.name] = mappingAttrInfo;

            mappingAttrInfosByAxisId[mappingAttrInfo.axis].push(mappingAttrInfo);

            var roleName = mappingAttrInfo.role;
            def.array.lazy(visualMapInfo, roleName).push(mappingAttrInfo);

            var attr = mappingAttrInfo.attr;
            if(attr) def.array.lazy(invVisualMap, attr.name).push(roleName);

            return mappingAttrInfo;
          };

          // ----
          // Phase 1 - Determine the AxisId of each data table column.

          // An Attribute can only belong to one axis.
          // attrName -> axisId
          var axisIdByAttrName = {};

          var indexAttributeByAxis = function(axisId, attr) {
            var attrName = attr.name;
            if(!def.hasOwn(axisIdByAttrName, attrName))
              axisIdByAttrName[attrName] = axisId;
          };

          if(dataTable.isCrossTable) {
            // The axis of an attribute is tied to the first cross-tab layout role where the attribute participates
            // Ideally, an attribute would either be in one of rows, columns or measures...
            var crossLayout = dataTable.implem.layout;

            var addStructurePosition = function(axisId, structPos) {
              indexAttributeByAxis(axisId, structPos.attribute);
            };

            crossLayout.rows.forEach(addStructurePosition.bind(this, "row"));
            crossLayout.cols.forEach(addStructurePosition.bind(this, "column"));
            crossLayout.meas.forEach(addStructurePosition.bind(this, "measure"));
        }

          // ----
          // Phase 2 - Build MappingAttributeInfo part 1...

          // For each visual role mapping attribute,
          // build a corresponding "visual role mapping attribute info", pointing to the corresponding
          // data table attribute.

          // NOTE: ignoring unmapped attributes like the GEO ones that Analyzer automatically adds:
          // "latitude" and "longitude". For now this is ok, but when the GeoMap viz gets converted to VizAPI3,
          // we'll have to see if these columns should be explicitly mapped or be provided as part of
          // a GEO entity's sub-properties.

          // NOTE: ignoring the fact that Analyzer sometimes does not send visual role mapped attributes due to
          // "max rows" configurations. Limiting the number of rows is acceptable, but not the number of columns...

          // NOTE: an attribute may be consumed by more than one visual role,
          // and still CCC dimensions are created for each mapping attribute info.
          // This is because, otherwise, we would not be able to specify valueType and isDiscrete differently
          // for different visual roles...

          this.model.$type.eachVisualRole(function(propType) {
            var roleName = propType.name;
            var mapping  = this.model.get(roleName);

          if(mapping.isMapped) {
            var isVisualKey = propType.isVisualKeyOn(this.model);

            var cccRoleName = this._roleToCccRole[roleName];
            if(cccRoleName)
              def.array.lazy(rolesByCccVisualRole, cccRoleName).push(roleName);

              var dataView = this._dataView;
              visualMap[roleName] = mapping.attributes.toArray(function(mappingAttr, mappingAttrIndex) {
                var attrName = mappingAttr.name;
                var attr = attributes.get(attrName);
                var attrColIndex = dataView.getColumnIndexByAttribute(attr);
                var axisId = axisIdByAttrName[attrName] || (isVisualKey ? "row" : "measure");

                // Create an intelligible MappingAttrInfo id.
                // The "_" prefix prevents CCC auto binding to visual roles.
                var name = "_" + roleName + "_" + (mappingAttrIndex + 1);

                addMappingAttrInfo({
                  name:  name,
                  label: attr.label || attrName,

                  role: roleName,
                  mapping: mapping,
                  mappingAttr: mappingAttr,

                  attr: attr,
                  attrColIndex: attrColIndex,

                  isPercent: !!attr.isPercent,

                  cccRole: cccRoleName,

                  axis: axisId,
                  isMeasureDiscrim: false
                });

                return attrName;
              }, this);
            }
          }, this);

          // ----
          // Phase 3 - 2nd passage stuff

          // Must have a stable order for laying out multiple roles that map to a single CCC dimension group.
          Object.keys(rolesByCccVisualRole).forEach(function(cccRoleName) {
            rolesByCccVisualRole[cccRoleName].sort();
          });

          // Generic Measure Mode?
          var isGenericMeasureMode = this._isGenericMeasureMode = genericMeasuresCount > 1;
          if(isGenericMeasureMode) {
            this._genericMeasureDiscrimMappingAttrInfo = this._createGenericMeasureDiscriminator();
            addMappingAttrInfo(this._genericMeasureDiscrimMappingAttrInfo);
          } else {
            this._genericMeasureDiscrimMappingAttrInfo = null;
          }

          var cccDims = this.options.dimensions;
          var cccVisualRoles = this.options.visualRoles;
          var addToCCCVisualRole = function(cccRoleName, cccDimName) {
            var cccRole = def.lazy(cccVisualRoles, cccRoleName);
            def.array.lazy(cccRole, "dimensions").push(cccDimName);
          };

          // Configure the generic measure visual role
          if(isGenericMeasureMode)
            addToCCCVisualRole(genericMeasureCccVisualRole, this.GENERIC_MEASURE_DIM_NAME);

          // mappingAttrInfos is filled above, in visual role mapping attribute order;
          // this enables its use for configuring the CCC visual roles.
          mappingAttrInfos.forEach(function(maInfo) {

            // i) Fix CCC dim names of generic measures if there is more than one.
            var isMeasureGeneric = isGenericMeasureMode && maInfo.isMeasureGeneric;
            if(isMeasureGeneric)
              maInfo.cccDimName = this.GENERIC_MEASURE_DIM_NAME;

            if(maInfo.cccDimName) {
              // Exclude measure discriminator
              var cccDim;
              if(maInfo.attr) {
                // ii) Configure CCC dimension options.
                cccDim = def.lazy(cccDims, maInfo.cccDimName);
                cccDim.valueType  = this._getAttributeCccValueType(maInfo.attr);
                cccDim.isDiscrete = this._isRoleQualitative(maInfo.role);
                cccDim.comparer   = null;
                if(cccDim.valueType === Date) {
                  // Change the default formatter to use JavaScript's default serialization.
                  // Affects tooltips and discrete axes.
                  cccDim.formatter = function(v) { return v == null ? "" : v.toString(); };
                }
              }

              if(maInfo.isMeasureDiscrim) {
                cccDim = def.lazy(cccDims, maInfo.cccDimName);
                cccDim.isHidden = true;
              }

              // iii) Add to corresponding CCC visual role
              if(!isMeasureGeneric) addToCCCVisualRole(maInfo.cccRole, maInfo.cccDimName);
            }
          }, this);

          // Publish the created stores/indexes
          this._mappingAttrInfos = mappingAttrInfos;
          this._mappingAttrInfoByName = mappingAttrInfosByName;
          this._visualMap = visualMap;
          this._visualMapInfo = visualMapInfo;
          this._invVisualMap = invVisualMap;
          this._rolesByCccVisualRole = rolesByCccVisualRole;
          this._genericMeasuresCount = genericMeasuresCount;

          this._initAxes(mappingAttrInfosByAxisId);
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
         * The name of the original measure column ends up in the special CCC dimension we
         * call "the measure discriminator".
         *
         * This has the following restrictions/consequences:
         * * all measure attributes have to be in the rightmost columns of the data table
         * * and the ability to have different formatting per measure attribute, as there is
         *   a single CCC dimension that holds the values of all measure attributes, is lost.
         *   The formatting configuration of the first measure in the measure role is used.
         *
         * @return {MappingAttrInfo} The created generic measure discriminator.
         * @private
         */
        _createGenericMeasureDiscriminator: function() {
          // In which of the discrete axes should we add the discriminator to?
          // To the first whose defaultRole is mapped to a ccc dim group.
          // (not all vizs have/use both axis; see Pie chart, for example).
          var me = this;
          var roleToCccVisualRole = this._roleToCccRole;
          return tryCreateInAxis("column") || tryCreateInAxis("row") ||
                def.assert("Need a mapped discrete axis to hold the measure discriminator.");

          // ----

          function tryCreateInAxis(axisId) {
            // DefaultRole of axis
            var roleName = axisId + "s";
            var cccRoleName = def.getOwn(roleToCccVisualRole, roleName);
            if(cccRoleName)
              return createAttributeInfo(axisId, roleName, cccRoleName);
          }

          function createAttributeInfo(axisId, roleName, cccRoleName) {
            return {
              name: me.GENERIC_MEASURE_DISCRIM_DIM_NAME,
              label: "Generic Measure Discriminator",
              role: roleName,
              mapping: null,
              mappingAttr: null,
              attr: null,
              isPercent: false,
              cccRole: cccRoleName,
              axis: axisId,
              isMeasureDiscrim: true
            };
          }
        },

        _getAttributeCccValueType: function(attr) {
          /* eslint default-case: 0 */
          switch(attr.type) {
            case "string": return String;
            case "number": return Number;
            case "date": return Date;
          }
          return null; // any
        },

        _initAxes: function(mappingAttrInfosByAxisId) {
          // 1. Create axes.

          // axisId -> Axis
          this.axes = {};

          // Order is not relevant.
          this._axesIds.forEach(function(axisId) {
            this.axes[axisId] = Axis.create(this, axisId, mappingAttrInfosByAxisId[axisId]);
          }, this);

          // 2. Hide columns not bound to visual roles and reorder attributes of the plain data table.
          this._transformData();

          // 3. Determine if there are any multi-chart playing roles
          // (ignoring the measure discrim, if any)
          // TODO: refactor this check by using the model directly? Would not need to account for measure discrim...
          var hasMulti = false;
          if(this._multiRole) {
            var maInfos = this._getMappingAttrInfosByRole(this._multiRole);
            if(maInfos)
              hasMulti = !this._isGenericMeasureMode ||
                  maInfos.some(function(maInfo) { return !maInfo.isMeasureDiscrim; });
          }
          this._hasMultiChartColumns = hasMulti;
        },

        /**
         * Removes _unmapped_ attributes and reorders attributes of the plain data table.
         *
         * Gets array of _mapped_ column indexes of the plain table to set in a data view.
         *
         * Column reordering serves two purposes:
         * 1. All generic measures are placed last to satisfy the cross-tab/generic measure discriminator scenario
         * 2. All measures are placed last so that CCC doesn't reorder the "logical row", discrete columns first
         *
         * Specifies readers (and measuresIndexes and dataCategoriesCount)
         * because this is the only way to bind specific columns to arbitrary, specific dimensions.
         * With all the plain table transformations in place,
         * and apart from the measure discriminator,
         * which always takes the first position in CCC's logical row,
         * the CCC readers mapping is 1-1.
         */
        _transformData: function() {
          // For DataView source columns
          var categoriesSourceIndexes = [];
          var measuresSourceIndexes   = [];

          // For CCC readers
          var categoriesDimNames = [];
          var measuresDimNames   = [];

          // If there are generic measures, then the cross-tab format is used.
          if(this._isGenericMeasureMode) {
            this.options.crosstabMode  = true;
            this.options.isMultiValued = false;

            categoriesDimNames.push(this.GENERIC_MEASURE_DISCRIM_DIM_NAME);

            this._mappingAttrInfos.forEach(function(maInfo) {
              if(maInfo.attr) {
                var sourceIndexes = maInfo.isMeasureGeneric ? measuresSourceIndexes : categoriesSourceIndexes;
                sourceIndexes.push(maInfo.attrColIndex);

                if(!maInfo.isMeasureDiscrim && !maInfo.isMeasureGeneric) {
                  categoriesDimNames.push(maInfo.cccDimName);
                }
              }
            });

            measuresDimNames.push(this.GENERIC_MEASURE_DIM_NAME);
          } else {
            // The use of the relational translator with the following options
            // is the most reliable way to "control" the translator code and avoid unexpected shuffling of columns
            this.options.crosstabMode = false;
            this.options.isMultiValued = true;

            this._mappingAttrInfos.forEach(function(maInfo) {
              if(maInfo.attr) {
                var sourceIndexes;
                var dimNames;

                if(maInfo.attr.type === "number") {
                  sourceIndexes = measuresSourceIndexes;
                  dimNames = measuresDimNames;
                } else {
                  sourceIndexes = categoriesSourceIndexes;
                  dimNames = categoriesDimNames;
                }

                sourceIndexes.push(maInfo.attrColIndex);
                dimNames.push(maInfo.cccDimName);
              }
            });

            // The already mapped data view indexes of measures.
            var i = categoriesSourceIndexes.length;
            var C = measuresSourceIndexes.length;
            var afterMappingColumnIndexesMeasures = [];
            while(C--) afterMappingColumnIndexesMeasures.push(i++);

            this.options.measuresIndexes = afterMappingColumnIndexesMeasures;

            // dataCategoriesCount is sort of irrelevant in this case, but it is set anyway, J.I.C.
            // It is only used to split discrete columns among series and categories
            // which, because readers are fully specified, does not affect the mapping.
          }

          this._dataView = new DataView(this._dataView);
          this._dataView.setSourceColumns(categoriesSourceIndexes.concat(measuresSourceIndexes));

          this.options.dataCategoriesCount = categoriesSourceIndexes.length;

          this.options.readers = categoriesDimNames.concat(measuresDimNames);
        },

        _configureOptions: function() {
          var options = this.options;
          var model = this.model;

          this._configureColor();

          if(def.get(this._validExtensionOptions, "legendAreaVisible", options.legendAreaVisible))
            this._configureLegend();

          if(this._hasMultiChartColumns)
            this._configureMultiChart();

          this._configureTrends();
          this._configureFormats();
          this._configureLabels(options, model);

          options.axisFont = util.defaultFont(options.axisFont, 12);
          options.axisTitleFont = util.defaultFont(options.axisTitleFont, 12);

          options.interactive = !!def.get(this._validExtensionOptions, "interactive", true);
          if(options.interactive) {
            if(options.tooltipEnabled) this._configureTooltip();

            if(def.get(this._validExtensionOptions, "selectable", options.selectable))
              this._configureSelection();

            if(def.get(this._validExtensionOptions, "clickable", options.clickable))
              this._configureDoubleClick();
          }
        },

        // region COLOR SCALE
        _getColorScaleKind: function() {
          return "discrete";
        },

        _configureColor: function() {
          var colorScaleKind = this._getColorScaleKind();
          if(colorScaleKind) {
            var options = this.options;
            var model = this.model;

            switch(colorScaleKind) {
              case "discrete":
                options.colors = this._getDiscreteColors();
                break;

              case "continuous":
                options.colorScaleType = model.pattern === "gradient" ? "linear" : "discrete";

                var paletteQuantitative = model.paletteQuantitative;
                if(paletteQuantitative) {
                  options.colors = paletteQuantitative.colors.toArray(function(color) { return color.value; });
                } else {
                  options.colors = visualColorUtils.buildPalette(
                      model.$type.context,
                      model.colorSet,
                      model.pattern,
                      model.reverseColors);
                }
                break;
            }
          }
        },

        /**
         * Gets the final color scale, color scale factory or array of colors to use
         * for the current discrete color role.
         *
         * @return {pv.Scale|Array.<string|pv.Color>|function():pv.Scale} The final color scale.
         *
         * @protected
         */
        _getDiscreteColors: function() {
          var defaultScale = pv.colors(this._getDefaultDiscreteColors());

          var scale;
          if(this._discreteColorRole) {
            var colorMap = this._getDiscreteColorMap();
            if(colorMap) {
              // Final?
              if(def.fun.is(colorMap)) { return colorMap; }

              var colorMapScale = function(key) {
                return def.getOwn(colorMap, key);
              };

              scale = this._createDiscreteColorMapScaleFactory(colorMapScale, defaultScale);
            }
          }

          return scale || defaultScale;
        },

        /**
         * Gets the base array of colors for a discrete color scale.
         *
         * @return  {string[]} The base colors.
         *
         * @protected
         */
        _getDefaultDiscreteColors: function() {
          // Note palette is only available for models with the pentaho.visual.models.mixin.ScaleColorDiscrete applied.
          return this.model.palette.colors.toArray(function(color) { return color.value; });
        },

        /**
         * Gets a color map for members who have fixed colors.
         *
         * If the returned value is a function, it is assumed to be final color scale.
         * The default implementation may return a color scale with one color when there is a single measure
         * and no color attributes.
         *
         * @return {Object.<string, pv.Color>|pv.Scale} The color map, if any or _nully_.
         *
         * @protected
         */
        _getDiscreteColorMap: function() {
          var memberPalette = this._getMemberPalette();
          if(!memberPalette)
            return;

          // 1 - The CCC color role is not being explicitly set, so whatever goes to the series role is used by
          //     the color role.
          // 2 - When a measure discrim is used and there is only one measure, the CCC dim name of the discriminator is
          //      not of the "series" group; so in this case, there's no discriminator in the key.
          var colorMAInfos = this._getDiscreteColorMappingAttrInfos();
          var C = colorMAInfos.length;
          var M = this._genericMeasuresCount;
          var colorMap;

          // Possible to create colorMap based on memberPalette?
          if(C || M) {
            if(!C || M > 1) {
              // TODO: Mondrian/Analyzer specific
              colorMap = memberPalette["[Measures].[MeasuresLevel]"];

              // Use measure colors
              // a) C == 0 && M > 0
              // b) C >  0 && M > 1

              // More than one measure MappingAttributeInfo or no color MappingAttributeInfos.
              // var keyIncludesMeasureDiscriminator = M > 1 && C > 0;
              // When the measure discriminator exists, it is the last MappingAttributeInfo.

              if(M === 1) {
                // => C == 0
                // The color key is empty... so need to do it this way.
                var c = colorMap && colorMap[this.axes.measure.mappingAttrInfos[0].attr.name];
                return c ? pv.colors([c]) : null;
              }

              colorMap = this._copyColorMap(null, colorMap);
            } else {
              // a) C > 0 && M <= 1

              // If C > 0, Pie chart always ends up here...
              // Use the members' colors of the last color attribute.
              colorMap = this._copyColorMap(null, memberPalette[colorMAInfos[C - 1].attr.name]);
            }
          }

          return colorMap;
        },

        _getDiscreteColorMappingAttrInfos: function() {
          /* jshint laxbreak:true*/
          var colorAttrInfos = this._getMappingAttrInfosByRole(this._discreteColorRole);
          return colorAttrInfos
              ? colorAttrInfos.filter(function(mappingAttrInfo) { return !mappingAttrInfo.isMeasureDiscrim; })
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

        /**
         * Creates a color factory given two color scales,
         * the color map scale, which resolves colors for values with fixed colors and the
         * base scale, which assigns colors to values on a first-come-first-served basis.
         *
         * The actual key used by color scales with color maps is *the value of the last attribute*
         * that belongs to the color role. This applies both to values that are fixed in the color map and
         * to those that have to resource to the base color scale.
         *
         * @param {function(string) : pv.Color | pv.Scale} colorMapScale - The color map scale.
         * @param {pv.Scale} baseScale - The base scale.
         *
         * @return {function() : pv.Scale} A color scale factory.
         *
         * @protected
         */
        _createDiscreteColorMapScaleFactory: function(colorMapScale, baseScale) {

          // Make sure the scales returned by scaleFactory
          // "are like" pv.Scale - have all the necessary methods.
          return function safeScaleFactory() {
            return def.copy(scaleFactory(), baseScale);
          };

          function scaleFactory() {
            return function(compKey) {
              if(compKey) {
                var keys = compKey.split("~");
                var key = keys[keys.length - 1];
                return colorMapScale(key) || baseScale(key);
              }
            };
          }
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
        // endregion

        _configureTrends: function() {
          var options = this.options;
          var model = this.model;

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
              value = +value; // + -> to number

              options.trendLine_lineWidth = value;
              // 1 -> 3.167
              // 2 -> 4
              // 8 -> 9
              var radius = 5 / 6 * (value - 2) + 4;
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
          var dims = this.options.dimensions;

          // 1. Handle all mapped, non-generic measure attributes
          def.query(Object.keys(this._mappingAttrInfoByName))
            .select(function(attrName) { return this._mappingAttrInfoByName[attrName]; }, this)
            .where(function(maInfo) {
              return !!maInfo.attr && !maInfo.attr.isDiscrete &&
                  (!this._isGenericMeasureMode || !maInfo.isMeasureGeneric);
            }, this)
            .each(setCccDimFormatInfo);

          // 2. Handle generic measure dimension name, if any.
          //    As there are multiple measure attributes in a single CCC dimension,
          //    (as when both Sales and Quantity are placed on the "Measure" gem bar),
          //    only the format of the first of these can be specified.
          //    Also, note, there may be more than one generic measure role,
          //    so only the first attribute of the first bound generic measure role is used...
          if(this._isGenericMeasureMode) {
            // e.g.
            // roles:
            //   "measures":     unbound
            //   "measuresLine": "sales", "quantity"
            var firstMappingAttrInfo = this._selectGenericMeasureMappingAttrInfos().first();
            if(firstMappingAttrInfo) setCccDimFormatInfo(firstMappingAttrInfo);
          }

          // ---

          function setCccDimFormatInfo(maInfo) {
            var format = maInfo.attr.format;
            var mask = format && format.number && format.number.mask;
            if(mask) def.lazy(dims, maInfo.cccDimName).format = mask;
          }
        },

        // region LABELS
        _configureLabels: function(options, model) {
          var valuesAnchor = model.labelsOption;
          var valuesVisible =
              !!def.get(this._validExtensionOptions, "valuesVisible", (valuesAnchor && valuesAnchor !== "none"));

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
          var valuesAnchor = model.labelsOption;
          var simpleCamelCase = /(^\w+)([A-Z])(\w+)/;

          var match = simpleCamelCase.exec(valuesAnchor);
          if(match != null) {
            valuesAnchor = match[1] + "_" + match[2].toLowerCase() + match[3];
          }

          options.valuesAnchor = valuesAnchor;
        },
        // endregion

        _configureMultiChart: function() {
          var options = this.options;

          // Very small charts can't be dominated by text...
          // options.axisSizeMax = '30%';

          var titleFont = util.defaultFont(options.titleFont, 12);
          if(titleFont && !(/black|(\bbold\b)/i).test(titleFont))
            titleFont = "bold " + titleFont;

          options.smallTitleFont = titleFont;

          var multiChartOverflow = this.model.multiChartOverflow;
          if(multiChartOverflow)
            options.multiChartOverflow = multiChartOverflow.toLowerCase();
        },

        // region TOOLTIP
        _configureTooltip: function() {
          var me = this;
          this.options.tooltipFormat = function(scene) {
            return me._getTooltipText(scene.datum, this);
          };
        },

        _getTooltipText: function(complex, context) {
          var tooltipLines = [];
          var msg;

          this._axesIds.forEach(function(axisId) {
            this.axes[axisId].buildHtmlTooltip(tooltipLines, complex, context);
          }, this);

          if(!complex.isVirtual) {

            // TODO: Generalize getDoubleClickTooltip somehow.
            var app = this.model.application;
            if(app && app.getDoubleClickTooltip) {
              var pointFilter = this._complexToFilter(context.scene.group || complex);
              msg = app.getDoubleClickTooltip(pointFilter);
              if(msg) {
                tooltipLines.push(msg);
              }
            }
          }

          /* Add selection information */
          // Not the data point count, but the selection count (a single column selection may select many data points).
          // var selectedCount = this._chart && this._chart.data.selectedCount();
          var selectionFilter = this.selectionFilter;
          if(selectionFilter) {
            selectionFilter = selectionFilter.toDnf();
            if(selectionFilter.kind === "or") {
              var selectedCount = selectionFilter.operands.count;
              if(selectedCount) {
                var msgId = selectedCount === 1 ? "tooltip.footer.selectedOne" : "tooltip.footer.selectedMany";

                msg = bundle.get(msgId, [selectedCount]);

                tooltipLines.push(msg);
              }
            }
          }

          return tooltipLines.join("<br />");
        },
        // endregion

        // region LEGEND
        /**
         * Gets a value that indicates if a color role is defined, and mapped, and, if so,
         * if it is qualitative or not.
         *
         * @private
         *
         * @return {undefined|boolean} `undefined` if there is no color role,
         * or if it is not mapped;
         * otherwise, `true` if its effective level of measurement is qualitative; `false` otherwise.
         */
        _isColorDiscrete: function() {
          var colorRole = this._discreteColorRole;
          if(colorRole && this.model[colorRole].isMapped) return this._isRoleQualitative(colorRole);
        },

        _isLegendVisible: function() {
          // When the measureDiscrim is accounted for,
          // it is not necessary to have a mapped color role to have a legend...
          // It is only needed that, if it is mapped, that it it qualitative.
          return (this._isColorDiscrete() !== false) &&
              this._getRoleDepth(this._discreteColorRole, /* includeMeasureDiscrim: */true) > 0;
        },

        _configureLegend: function() {
          var options = this.options;

          options.legendFont = util.defaultFont(options.legendFont, 10);

          var legendPosition = options.legendPosition;
          var isTopOrBottom = legendPosition === "top" || legendPosition === "bottom";

          if(isTopOrBottom) {
            options.legendAlign = "left";
          } else {
            options.legendAlign = "top";

            if(this._hasMultiChartColumns) {
              // Ensure that legend margins is an object.
              // Preserve already specified margins.
              // CCC's default adds a left or right 5 px margin,
              // to separate the legend from the content area.
              var legendMargins = options.legendMargins;
              if(legendMargins) {
                if(typeof legendMargins !== "object")
                  legendMargins = options.legendMargins = {all: legendMargins};
              } else {
                legendMargins = options.legendMargins = {};
                var oppositeSide = pvc.BasePanel.oppositeAnchor[legendPosition];
                legendMargins[oppositeSide] = 5;
              }

              legendMargins.top = 20;
            }
          }

          // Set, before, whenever lineWidth is defined.
          // var dotSize = 16;
          var dotRadius = 4;
          // If no line width was used, shapes such as crosses could not show.
          var dotStrokeWidth = 2;

          // Unfortunately, diamonds are slightly bigger than other shapes, and would overflow or touch the text.
          var extraMargin = 1;

          // [BACKLOG-15788] In 'pentaho/visual/config/vizApi.conf#L778' there is a configuration for "pentaho-cdf"
          // that needs to match this values
          options.legendMarkerSize = 2 * (dotRadius + extraMargin);
          options.legend$Dot_lineWidth = dotStrokeWidth;
          options.legend$Dot_shapeSize = Math.pow(dotRadius - dotStrokeWidth / 2, 2); // 9
        },
        // endregion

        // Logic that depends on width and height
        _prepareLayout: function(options) { /* Default Does Nothing */ },

        /**
         * Processes extension properties and stores the valid ones in `_validExtensionOptions`.
         */
        _processExtensions: function() {
          var valid = null;

          var extension = this.$type.extensionEffective;
          if(extension) {
            def.each(extension, function(v, p) {
              if(!def.hasOwn(extensionBlacklist, p)) {
                if(!valid) valid = {};
                valid[p] = v;
              }
            });
          }

          this._validExtensionOptions = valid;
        },

        /**
         * Applies extension properties to the CCC options.
         */
        _applyExtensions: function() {
          var extensions = this._validExtensionOptions;
          if(extensions) {
            this.options = def.mixin.copy({}, this.options, extensions);
          }
        },

        /**
         * Creates a chart of a given class and with given options.
         *
         * @param {!Class.<pvc.BaseChart>} ChartClass The CCC chart constructor.
         * @param {!object} options The CCC options.
         * @return {!pvc.BaseChart} The created chart instance.
         * @protected
         */
        _createChart: function(ChartClass, options) {
          return new ChartClass(options);
        },

        /**
         * Gets the current value of maximum number of visual elements.
         *
         * @return {number} The maximum number when defined and greater than `0`; `-1`, otherwise.
         */
        _getVisualElementsCountMax: function() {

          // TODO: Currently, this is DET dependent...

          var modelTypeApp = this.model.$type.application;
          var cellCountMax = +(modelTypeApp && modelTypeApp.optimalMaxDataSize);
          return cellCountMax > 0 ? cellCountMax : -1;
        },

        _validateVisualElementsCount: function(count, countMax) {
          if(count > countMax) {
            var msgId = "visual-elems-count-max";
            var msgParams = {count: count, countMax: countMax};
            var error = new pvc.InvalidDataException(bundle.get("error.visualElemsCountMax", msgParams), msgId);

            error.messageParams = msgParams;

            throw error;
          }
        },

        _renderCore: function() {
          this._chart = this._createChart(pvc[this._cccClass], this.options);
          this._chart
            .setData(this._dataView.toJsonCda())
            .render();

          // Render may fail due to required visual roles, invalid data, etc.
          var error = this._chart.getLastRenderError();
          if(error) return Promise.reject(error);

          // This test should be needed after the no error check above,
          // but we're being extra-cautious because the last check was a post-code-freeze change.
          // Se we're preserving the original check that prevents clearSelection (called from within _updateSelection)
          // from throwing.
          if(this._chart.data) this._updateSelection();
        },

        // region SELECTION
        _configureSelection: function() {
          var me = this;
          this.options.userSelectionAction = function(cccSelections, cccGroup) {
            return me._onUserSelection(cccSelections, cccGroup, this.event);
          };
          this.options.base_event = [["click", function() {
            me._onUserSelection([]);
          }]];
        },

        _onUserSelection: function(selectingDatums, selectingGroup, srcEvent) {
          // Duplicates may occur due to excluded dimensions like the discriminator

          // TODO: improve detection of viz without attributes.

          var alreadyIn = {};
          var operands = [];

          if(selectingGroup) {
            var operand = this._complexToFilter(selectingGroup);
            if(operand) {
              operands.push(operand);
            }
          } else {
            operands = selectingDatums.reduce(function(memo, datum) {
              if(!datum.isVirtual && !datum.isNull) {
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
          }

          var Or = this.$type.context.get("or");
          this.act(new SelectAction({
            dataFilter: new Or({operands: operands}),
            position: srcEvent ? {x: srcEvent.clientX, y: srcEvent.clientY} : null
          }));

          // Explicitly cancel CCC's native selection handling.
          return [];
        },

        // endregion

        // region DOUBLE-CLICK
        _configureDoubleClick: function() {
          var me = this;
          this.options.doubleClickAction = function(scene) {
            me._onDoubleClick(scene.group || scene.datum, this.event);
          };

          this.options.axisDoubleClickAction = function(scene) {
            var group = scene.group;
            if(group) return me._onDoubleClick(group, this.event);
          };
        },

        _onDoubleClick: function(complex, srcEvent) {
          var dataFilter = this._complexToFilter(complex);
          if(dataFilter != null) {
            var Or = this.$type.context.get("or");
            this.act(new ExecuteAction({
              dataFilter: new Or({operands: [dataFilter]}),
              position: srcEvent ? {x: srcEvent.clientX, y: srcEvent.clientY} : null
            }));
          }
        },
        // endregion

        // region UTILITY

        _complexToFilter: function(complex) {
          // Add each axis' formulas to the selection
          var filter = null;

          this._keyAxesIds.forEach(function(axisId) {
            var operand = this.axes[axisId].complexToFilter(complex);
            if(operand)
              filter = filter ? filter.and(operand) : operand;
          }, this);

          // Enforce that the returned filter is wrapped by an And
          if(filter != null && filter.kind !== "and") {
            var And = this.$type.context.get("and");
            return new And({
              operands: [filter]
            });
          }

          return filter;
        }
        // endregion
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
      });
    }
  ];
});
