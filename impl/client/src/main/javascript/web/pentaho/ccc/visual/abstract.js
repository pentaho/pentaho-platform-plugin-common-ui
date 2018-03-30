/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "module",
  "pentaho/visual/action/SelectionModes",
  "pentaho/lang/UserError",
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/pvc",
  "cdf/lib/CCC/cdo",
  "cdf/lib/CCC/protovis",
  "./_util",
  "pentaho/data/util",
  "pentaho/util/object",
  "pentaho/visual/color/utils",
  "pentaho/data/TableView",
  "pentaho/util/logger",
  "pentaho/debug",
  "pentaho/debug/Levels",
  "pentaho/i18n!view"
], function(module, SelectionModes, UserError, def, pvc, cdo, pv, util, dataUtil, O, visualColorUtils, DataView,
            logger, debugMgr, DebugLevels, bundle) {

  "use strict";

  /* globals Promise */

  var _isDebugMode = debugMgr.testLevel(DebugLevels.debug, module);

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

  return [
    "pentaho/visual/base/view",
    "pentaho/visual/models/abstract",
    "pentaho/visual/action/select",
    "pentaho/visual/action/execute",
    function(BaseView, Model, SelectAction, ExecuteAction) {

      return BaseView.extend(/** @lends pentaho.ccc.visual.Abstract# */{

        $type: {
          props: {
            model: {valueType: Model}
          }
        },

        // region PROPERTIES
        _options: {
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

          // Data Source
          crosstabMode: false,
          isMultiValued: true,
          seriesInRows: false,

          // Data
          dataTypeCheckingMode: "none",
          ignoreNulls: false,

          // Axis
          baseAxisOriginIsZero: false
        },

        // Hide discrete null members in tooltip.
        _hideNullMembers: false,

        // Maps Viz. API visual roles to CCC visual roles.
        // Sub-classes can override.
        _roleToCccRole: {
          "multi": "multiChart",
          "columns": "series",
          "rows": "category",
          "measures": "value"
        },

        /* Some CCC measure visual roles accept multiple fields.
         * We call them generic measure visual roles...
         *
         * Also, more than one Viz measure visual role can map to a CCC measure visual role:
         *
         *   Viz Visual Role  -> Generic Measure CCC Visual Role
         *   ---------------------------------------------------
         *   "measures"          "value"
         *   "measuresLine"      "value"
         *
         * Each of the Viz visual roles may support more than one field.
         *
         * When, a CCC measure visual role is mapped to more than one field,
         * a special "measure discriminator field" must be bound to one of the
         * discrete visual roles. This field indicates the active measure.
         *
         * To activate the measure discriminator mode, a chart class has to specify the
         * prototype property `_genericMeasureCccVisualRole` with the name of the multiple measures CCC visual role
         * and `_genericMeasureDiscrimCccVisualRole` with the name of the discrete CCC visual role that should receive
         * the discriminator field.
         *
         * When multiple source roles exist,
         * these are sorted alphabetically and the within role field order is preserved.
         */
        _genericMeasureCccVisualRole: null,
        _genericMeasureDiscrimCccVisualRole: null,

        // e.g. valueRole.dim
        get _genericMeasureDiscrimCccDimName() {
          var roleName = this._genericMeasureCccVisualRole;
          return roleName !== null ? (roleName + "Role.dim") : null;
        },

        // Measure roles that do not show the role in the tooltip.
        // Essentially, those measures that are represented by cartesian axes...
        _noRoleInTooltipMeasureRoles: {"measures": true},

        // Do not show percentage value in front of a "percent measure" MappingFieldInfo.
        _tooltipHidePercentageOnPercentFields: false,

        // The name of the role that represents the "multi-chart" concept.
        _multiRole: "multi",

        // The name of the role that represents the "discrete color" concept.
        _discreteColorRole: "columns",
        // endregion

        // region VizAPI implementation

        /** @inheritDoc */
        _updateAll: function() {

          // Determine if there is a multi-chart role and if it is bound (ignoring the measure discrim, if any).
          this._isMultiChartMode = !!this._multiRole && this.model.get(this._multiRole).hasFields;

          this._initOptions();

          this._processExtensions();

          this._initData();

          this._configureOptions();

          this._prepareLayout();

          this._applyExtensions();

          // Return any rejection promise.
          return this._renderCore();
        },

        /** @inheritDoc */
        _updateSize: function() {

          // TODO: Consider moving this to the base/view...

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

          // TODO: Re-implement this to filter datums by directly applying the selectionFilter.
          // Create some kind of element adapter for that, like the data table does.

          if(_isDebugMode) logger.log("_updateSelection BEGIN");
          try {
            var dataFilter = this.model.selectionFilter;

            // Skipping rows with all null measures, when converting from cross-tab, can speed up things a lot.
            // The dataView sourceColumns are not relevant as filter uses the field names.
            // TODO: replace by a view of plain table without all null measures rows.
            // There's a similar construct in Analyzer cv.Report#displayClientSideReport / will:change handler
            // and in pentaho.visual.action.SelectionModes.toggle
            var dataTable = this.model.data;
            if(dataTable.originalCrossTable) {
              dataTable = dataTable.originalCrossTable.toPlainTable({skipRowsWithAllNullMeasures: true});
            }

            // Get information on the axes

            var mappingFieldInfos = this._getSourceKeyMappingFieldInfos().array();
            var selectedDataView = dataTable.filter(dataFilter);

            // Build a CCC filter (whereSpec)
            var whereSpec = [];
            var alreadyIn = {};
            for(var k = 0, N = selectedDataView.getNumberOfRows(); k < N; k++) {

              /* eslint no-loop-func: 0 */
              var datumFilterSpec = mappingFieldInfos.reduce(function(datumFilter, mappingFieldInfo) {
                datumFilter[mappingFieldInfo.name] = selectedDataView.getValue(k, mappingFieldInfo.sourceIndex);
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
          } finally {
            if(_isDebugMode) logger.log("_updateSelection END");
          }

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

            this._prepareLayout();

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
            "readers", []);
        },
        // endregion

        // region ATTRIBUTE INFO / VISUAL MAP

        _getMappingFieldInfosOfRole: function(roleName, excludeMeasureDiscrim) {
          var mappingFieldInfos = def.getOwn(this._visualMap, roleName, null);
          if(mappingFieldInfos !== null && excludeMeasureDiscrim) {
            mappingFieldInfos = mappingFieldInfos.filter(function(mappingFieldInfo) {
              return !mappingFieldInfo.isMeasureDiscrim;
            });
          }
          return mappingFieldInfos;
        },

        _isRoleCategorical: function(roleName) {
          var mode = this.model.get(roleName).mode;
          return mode !== null && !mode.isContinuous;
        },

        _getRolesMappedToCccRole: function(cccRoleName) {
          return def.getOwn(this._rolesByCccVisualRole, cccRoleName, null);
        },

        _getSourceKeyMappingFieldInfos: function() {
          return def.query(this._axes.key).where(function(mappingFieldInfo) {
            return !mappingFieldInfo.isMeasureDiscrim;
          });
        },
        // endregion

        _setNullInterpolationMode: function(value) {
        },

        // region initData
        /**
         * Initializes the view in what concerns to the current data table's data and metadata.
         *
         * * Creates the local `MappingFieldInfo` instances,
         *   one per `MappingField` of visual role properties of the model
         *   (one more for the special measure discriminator field added in certain circumstances).
         *   Sets {@link pentaho.ccc.visual.Abstract#fieldInfos} and
         *   {@link pentaho.ccc.visual.Abstract#visualMap}.
         *
         * * Determines if the visualization will operate in "generic measure mode",
         *   which happens when there is more than one field mapped to the generic measure visual role, if any.
         *   In this case, also, creates the special measure discriminator field.
         *   Sets {@link pentaho.ccc.visual.Abstract#_isGenericMeasureMode} and
         *   {@link pentaho.ccc.visual.Abstract#_genericMeasuresCount}.
         *
         * * Determines if the visualization will operate in multi-chart mode or not.
         *
         * * Creates a `DataView` that selects and reorders columns of the data table.
         *
         * * Configures CCC readers, dimensions and visual roles.
         *
         * * Creates the axes map, {@link pentaho.ccc.visual.Abstract#axes}.
         */
        _initData: function() {

          var data = this.model.data;

          var hasDataKeyColumns = this._hasDataKeyColumns = dataUtil.hasAnyKeyColumns(data);

          var genericMeasuresCount = 0;
          var genericMeasureCccVisualRole = this._genericMeasureCccVisualRole;

          // Multiple ways to store and index MappingFieldInfo...
          var mappingFieldInfos = [];

          // mappingFieldName -> MappingFieldInfo
          var mappingFieldInfosByName = {};

          // axisId -> MappingFieldInfo[]
          var axes = {
            key: [],
            measure: []
          };

          // roleName -> MappingFieldInfo[]
          var visualMap = {};

          // cccRoleName -> roleName[]
          var rolesByCccVisualRole = {};

          // ----

          /**
           * Registers a mapping field info.
           *
           * @param {!MappingFieldInfo} mappingFieldInfo - The mapping field info to add.
           */
          var addMappingFieldInfo = function(mappingFieldInfo) {

            mappingFieldInfo.isGenericMeasure = mappingFieldInfo.cccRoleName === genericMeasureCccVisualRole;
            if(mappingFieldInfo.isGenericMeasure) {
              genericMeasuresCount++;
            }

            mappingFieldInfos.push(mappingFieldInfo);
            mappingFieldInfosByName[mappingFieldInfo.name] = mappingFieldInfo;

            axes[mappingFieldInfo.isKey ? "key" : "measure"].push(mappingFieldInfo);

            def.array.lazy(visualMap, mappingFieldInfo.roleName).push(mappingFieldInfo);
          };

          /* ----
           * Phase 1 - Build MappingFieldInfo part 1...
           *
           * For each visual role mapping field,
           * build a corresponding "visual role mapping field info", pointing to the corresponding
           * data table field.
           *
           * NOTE: ignoring unmapped fields like the GEO ones that Analyzer automatically adds:
           * "latitude" and "longitude". For now this is ok, but when the GeoMap viz gets converted to VizAPI3,
           * we'll have to see if these columns should be explicitly mapped or be provided as part of
           * a GEO entity's sub-properties.
           *
           * NOTE: ignoring the fact that Analyzer sometimes does not send visual role mapped fields due to
           * "max rows" configurations. Limiting the number of rows is acceptable, but not the number of columns...
           *
           * NOTE: a field may be consumed by more than one visual role,
           * and still CCC dimensions are created for each mapping field info.
           * This is because, otherwise, we would not be able to specify valueType and isDiscrete differently
           * for different visual roles...
           */

          this.model.$type.eachVisualRole(function(visualRolePropType) {

            var roleName = visualRolePropType.name;
            var mapping  = this.model.get(roleName);

            // Could this be done only at construction time?
            var cccRoleName = this._roleToCccRole[roleName];
            if(!cccRoleName) {
              throw def.error.operationInvalid("No CCC Role for '{0}'", [roleName]);
            }

            def.array.lazy(rolesByCccVisualRole, cccRoleName).push(roleName);

            if(mapping.hasFields) {

              mapping.fields.each(function(mappingField, mappingFieldIndex) {
                var dataAttributeName = mappingField.name;
                var columnIndex = data.getColumnIndexById(dataAttributeName);
                var dataAttribute = data.getColumnAttribute(columnIndex);

                // Create an intelligible MappingFieldInfo name.
                // The "_" prefix prevents CCC auto binding to visual roles.
                var name = "_" + roleName + "_" + (mappingFieldIndex + 1);

                var sourceIsKeyEffective = hasDataKeyColumns ? dataAttribute.isKey : !dataAttribute.isContinuous;

                addMappingFieldInfo({
                  name:  name,
                  label: dataAttribute.label || dataAttributeName,
                  roleName: roleName,
                  isKey: sourceIsKeyEffective,

                  sourceName: dataAttribute.name,
                  sourceType: dataAttribute.type,
                  sourceIndex: data.getColumnIndexById(dataAttribute.name),
                  sourceIsContinuous: dataAttribute.isContinuous,
                  sourceFormat: dataAttribute.format,
                  sourceMembers: dataAttribute.members,
                  sourceIsPercent: !!dataAttribute.isPercent,
                  sourceColor: dataAttribute.property("color"),
                  sourceTimeIntervalDuration: dataAttribute.property("timeIntervalDuration"),

                  cccRoleName: cccRoleName,

                  isMeasureDiscrim: false
                });
              });
            }
          }, this);

          // ----
          // Phase 2 - 2nd passage stuff

          // Must have a stable order for laying out multiple roles that map to a single CCC visual role.
          Object.keys(rolesByCccVisualRole).forEach(function(cccRoleName) {
            rolesByCccVisualRole[cccRoleName].sort();
          });

          // ----

          // Publish the created stores/indexes.
          this._mappingFieldInfos = mappingFieldInfos;
          this._mappingFieldInfosByName = mappingFieldInfosByName;
          this._axes = axes;
          this._visualMap = visualMap;

          this._rolesByCccVisualRole = rolesByCccVisualRole;
          this._genericMeasuresCount = genericMeasuresCount;

          // ----

          // Generic Measure Mode?
          // Needs to be done after publishing _rolesByCccVisualRole.
          if((this._isGenericMeasureMode = genericMeasuresCount > 1)) {
            // Create the measure discriminator field.
            // Will be the last field of its discrete role.
            addMappingFieldInfo(this._createGenericMeasureDiscriminator());
          }

          // ----

          // Hide columns not bound to visual roles and reorder fields of the plain data table.
          this._transformData();

          this._configureCccDimensions();

          this._configureCccVisualRoles();
        },

        /**
         * Adds generic measure discriminator field information.
         *
         * When a measure visual role like "measures" or "measuresLine" accepts multiple fields, and
         * it is desired that each of these displays as if it were a different series
         * (different line, different color etc.),
         * we use CCC's measure visual roles' discriminator dimensions.
         *
         * For example,
         * if the CCC multiple measures visual role is `value`,
         * then we would map the special `valueRole.dim` field to CCC's
         * `series` visual role, to make series unfold for each field bound to `value`.
         *
         * @return {!MappingFieldInfo} The created generic measure discriminator.
         * @private
         */
        _createGenericMeasureDiscriminator: function() {

          var discrimCccRoleName = this._genericMeasureDiscrimCccVisualRole;
          var discrimRoleName = this._getRolesMappedToCccRole(discrimCccRoleName)[0];

          return {
            // e.g. valueRole.dim
            name: this._genericMeasureDiscrimCccDimName,
            label: "Generic Measure Discriminator",
            roleName: discrimRoleName,
            cccRoleName: discrimCccRoleName,
            isKey: true,

            sourceName: null,
            sourceType: null,
            sourceIndex: null,
            sourceIsContinuous: null,
            sourceFormat: null,
            sourceMembers: null,
            sourceIsPercent: false,
            sourceColor: null,

            isMeasureDiscrim: true
          };
        },

        /**
         * Removes _unmapped_ fields and reorders fields of the plain data table.
         *
         * Builds an array of _mapped_ column indexes of the plain table and sets it in a data view.
         *
         * Columns are reordered here, placing discrete columns first,
         * so that we don't get tricked by CCC doing so.
         * This way we ensure a stable logical row layout.
         *
         * Specifies readers (and measuresIndexes and dataCategoriesCount)
         * because this is the only way to bind specific columns to arbitrary, specific dimensions.
         * With all the plain table transformations in place, the CCC readers mapping is 1-1.
         */
        _transformData: function() {

          // For DataView source columns
          var categoriesSourceIndexes = [];
          var measuresSourceIndexes   = [];

          // For CCC readers
          var categoriesDimNames = [];
          var measuresDimNames   = [];

          // The use of the relational translator with the following options
          // is the most reliable way to "control" the translator code and avoid unexpected shuffling of columns
          // crosstabMode = false
          // isMultiValued = true
          // measuresIndexes...
          // readers...

          var data = this.model.data;

          this._mappingFieldInfos.forEach(function(mappingFieldInfo) {

            if(!mappingFieldInfo.isMeasureDiscrim) {
              var sourceIndexes;
              var dimNames;

              if(mappingFieldInfo.sourceType === "number") {
                sourceIndexes = measuresSourceIndexes;
                dimNames = measuresDimNames;
              } else {
                sourceIndexes = categoriesSourceIndexes;
                dimNames = categoriesDimNames;
              }

              sourceIndexes.push(mappingFieldInfo.sourceIndex);
              dimNames.push(mappingFieldInfo.name);
            }
          });

          // Indexes of measures in the data view (already mapped with source columns).
          // Start index for first measure:
          var i = categoriesSourceIndexes.length;
          var M = measuresSourceIndexes.length;
          var afterMappingColumnIndexesMeasures = [];
          while(M--) {
            afterMappingColumnIndexesMeasures.push(i++);
          }

          this.options.measuresIndexes = afterMappingColumnIndexesMeasures;

          this._dataView = new DataView(data);
          this._dataView.setSourceColumns(categoriesSourceIndexes.concat(measuresSourceIndexes));

          this.options.readers = categoriesDimNames.concat(measuresDimNames);
        },

        /**
         * Configure CCC `dimensions`.
         */
        _configureCccDimensions: function() {

          var cccDimSpecs = this.options.dimensions;

          // MappingFieldInfos is filled above, in visual role mapping field order.
          // This enables its use for configuring the CCC visual roles.
          this._mappingFieldInfos.forEach(function(mappingFieldInfo) {

            // Configure CCC main dimensions' options.
            if(mappingFieldInfo.sourceName) {
              var cccDimSpec = def.lazy(cccDimSpecs, mappingFieldInfo.name);

              cccDimSpec.valueType  = util.getCccValueTypeOfFieldType(mappingFieldInfo.sourceType);
              cccDimSpec.isDiscrete = this._isRoleCategorical(mappingFieldInfo.roleName);
              cccDimSpec.comparer   = null;
              if(cccDimSpec.valueType === Date) {
                // Change the default formatter to use JavaScript's default serialization.
                // Affects tooltips and discrete axes.
                cccDimSpec.formatter = function(v) { return v == null ? "" : v.toString(); };
              }
            }
          }, this);
        },

        /**
         * Configure CCC `visualRoles`.
         *
         * @overridable
         * @protected
         */
        _configureCccVisualRoles: function() {

          var cccRoleSpecs = this.options.visualRoles;

          // MappingFieldInfos is filled above, in visual role mapping field order.
          // This enables its use for configuring the CCC visual roles.
          this._mappingFieldInfos.forEach(function(mappingFieldInfo) {

            var cccRoleSpec = def.lazy(cccRoleSpecs, mappingFieldInfo.cccRoleName);

            def.array.lazy(cccRoleSpec, "dimensions").push(mappingFieldInfo.name);
          });
        },
        // endregion

        _configureOptions: function() {

          var options = this.options;
          var model = this.model;

          this._labelFont = util.defaultFont(model.labelSize ? util.readFontModel(model, "label") : null);

          var value = model.backgroundFill;
          if(value && value !== "none") {
            var fillStyle;
            if(value === "gradient") {
              if(this._isMultiChartMode) {
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

          value = model.getv("emptyCellMode", /* sloppy: */true);
          if(value) {
            this._setNullInterpolationMode(value);
          }

          value = model.getv("sizeByNegativesMode", /* sloppy: */true);
          options.sizeAxisUseAbs = value === "useAbs";

          this._configureColor();

          // region Legend
          var legendAreaVisible = def.get(this._validExtensionOptions, "legendAreaVisible");
          if(legendAreaVisible == null) {
            legendAreaVisible = this._shouldShowLegend();
          }

          options.legendAreaVisible = legendAreaVisible;

          if(legendAreaVisible) {
            this._configureLegend();
          }
          // endregion

          this._configureTrends();
          this._configureFormats();
          this._configureLabels();

          if(this._isMultiChartMode) {
            this._configureMultiChart();
          }

          options.interactive = !!def.get(this._validExtensionOptions, "interactive", true);
          if(options.interactive) {
            if(options.tooltipEnabled) {
              this._configureTooltip();
            }

            if(def.get(this._validExtensionOptions, "selectable", options.selectable)) {
              this._configureSelection();
            }

            if(def.get(this._validExtensionOptions, "clickable", options.clickable)) {
              this._configureDoubleClick();
            }
          }
        },

        // region COLOR SCALE
        /**
         * Gets a value that indicates if a color role is defined, and mapped, and, if so,
         * if it is categorical or not.
         *
         * @protected
         *
         * @return {undefined|boolean} `undefined` if there is no color role,
         * or if it is not mapped;
         * otherwise, `true` if its operating mode is categorical; `false` otherwise.
         */
        _isColorCategorical: function() {
          var colorRole = this._discreteColorRole;
          if(colorRole && this.model[colorRole].hasFields) {
            return this._isRoleCategorical(colorRole);
          }
        },

        _getColorScaleKind: function() {
          return "discrete";
        },

        _configureColor: function() {

          /* eslint default-case: 0 */

          switch(this._getColorScaleKind()) {
            case "discrete":
              this._configureDiscreteColors();
              break;

            case "continuous":
              this._configureContinuousColors();
              break;
          }
        },

        /**
         * Configures the discrete color scale for the discrete color role.
         *
         * @protected
         */
        _configureDiscreteColors: function() {

          var defaultScale = pv.colors(this._getDefaultDiscreteColors());
          var scale;

          if(this._discreteColorRole) {
            var colorMap = this._getDiscreteColorMap();
            if(colorMap) {
              // Final?
              if(def.fun.is(colorMap)) {
                scale = colorMap;
              } else {
                var colorMapScale = function(key) {
                  return def.getOwn(colorMap, key);
                };

                scale = this._createDiscreteColorMapScaleFactory(colorMapScale, defaultScale);
              }
            }
          }

          this.options.colors = scale || defaultScale;
        },

        _configureContinuousColors: function() {

          var model = this.model;

          this.options.colorScaleType = model.pattern === "gradient" ? "linear" : "discrete";

          var paletteQuantitative = model.paletteQuantitative;
          if(paletteQuantitative) {
            this.options.colors = paletteQuantitative.colors.toArray(function(color) { return color.value; });
          } else {
            this.options.colors = visualColorUtils.buildPalette(
                model.$type.context,
                model.colorSet,
                model.pattern,
                model.reverseColors);
          }
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
         * and no color fields.
         *
         * SPEC
         * - Viz. has a discrete color scale and:
         * - Pie
         *   - Ignores measures’ colors.
         *   - Uses the member colors of the last Slices field.
         * - Sunburst
         *   - Ignores measure colors.
         *   - Creates a combined map of all fields with colors.
         * - All Other
         *   - When no Color fields Or there is more than one generic measure:
         *   - Use the measures’ colors (even if only one measure and no color fields).
         *   - When there are Color fields and at most one generic measure:
         *   - Uses the member colors of the last Color field, if any.
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
          var colorMappingFieldInfos =
              this._getMappingFieldInfosOfRole(this._discreteColorRole, /* excludeMeasureDiscrim: */true);
          var C = colorMappingFieldInfos ? colorMappingFieldInfos.length : 0;
          var M = this._genericMeasuresCount;
          var colorMap;

          // Possible to create colorMap based on memberPalette?
          if(C > 0 || M > 0) {
            if(C === 0 || M > 1) {
              // Use measure colors
              //
              // a) C == 0 && M > 0
              // b) C >  0 && M > 1

              // TODO: Mondrian/Analyzer specific
              colorMap = memberPalette["[Measures].[MeasuresLevel]"];

              if(M === 1) {
                // => C == 0
                // The color key is empty... so need to do it this way.
                var c = colorMap && colorMap[this._axes.measure[0].name];
                return c ? pv.colors([c]) : null;
              }

              colorMap = util.copyColorMap(null, colorMap);
            } else {
              // a) C > 0 && M <= 1

              // If C > 0
              // Use the members' colors of the last color field.
              colorMap = util.copyColorMap(null, memberPalette[colorMappingFieldInfos[C - 1].name]);
            }
          }

          return colorMap;
        },

        _getMemberPalette: function() {
          /* TEST - does not work anymore; must adjust dimension names.
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

          // Determine memberPalette from the data table fields and members...
          var memberPalette = null;

          function setColor(dimName, memberValue, color) {
            if(!memberPalette) memberPalette = {};
            def.lazy(memberPalette, dimName)[memberValue] = color;
          }

          this._mappingFieldInfos.forEach(function(mappingFieldInfo) {

            if(!mappingFieldInfo.isMeasureDiscrim) {

              if(mappingFieldInfo.sourceMembers) {
                // Level
                mappingFieldInfo.sourceMembers.forEach(function(member) {
                  var color = member.property("color");
                  if(color) {
                    setColor(mappingFieldInfo.name, member.value, color);
                  }
                });
              } else if(mappingFieldInfo.isGenericMeasure && mappingFieldInfo.sourceColor) {

                // Measure colors are used when a generic measure visual role exists,
                // and thus a measure ends up as a "series" and taking part in the color scale.
                // Use the name of the dimension which will be used by CCC in valueRole.dim dimensions;
                // not the data table field name.

                // TODO: Mondrian/Analyzer specific
                setColor("[Measures].[MeasuresLevel]", mappingFieldInfo.name, mappingFieldInfo.sourceColor);
              }
            }
          });

          return memberPalette;
        },

        /**
         * Creates a color factory given two color scales,
         * the color map scale, which resolves colors for values with fixed colors and the
         * base scale, which assigns colors to values on a first-come-first-served basis.
         *
         * The actual key used by color scales with color maps is *the value of the last field*
         * that belongs to the color role. This applies both to values that are fixed in the color map and
         * to those that have to resource to the base color scale.
         * This key scheme satisfies the requirements of member palettes.
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
          // TODO: accessing Data API private stuff
          var formatInfo = this.model.data.model.format;
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

          // (CCC dimension) Field-level format info.
          var cccDimSpecs = this.options.dimensions;

          var continuousMappingFieldInfos = def.query(this._mappingFieldInfos)
                .where(function(mappingFieldInfo) {
                  return !mappingFieldInfo.isMeasureDiscrim && mappingFieldInfo.sourceIsContinuous;
                });

          continuousMappingFieldInfos.each(function(mappingFieldInfo) {
            var format = mappingFieldInfo.sourceFormat;
            var mask = format && format.number && format.number.mask;
            if(mask) {
              def.lazy(cccDimSpecs, mappingFieldInfo.name).format = mask;
            }
          });
        },

        // region LABELS
        _configureLabels: function() {
          var options = this.options;
          var model = this.model;
          var valuesAnchor = model.labelsOption;
          var valuesVisible =
              !!def.get(this._validExtensionOptions, "valuesVisible", (valuesAnchor && valuesAnchor !== "none"));

          options.valuesVisible = valuesVisible;
          if(valuesVisible) {
            this._configureLabelsAnchor();

            options.valuesFont = this._labelFont;

            var labelColor = model.labelColor;
            if(labelColor) {
              options.label_textStyle = labelColor;
            }
          }
        },

        _configureLabelsAnchor: function() {
          var valuesAnchor = this.model.labelsOption;
          var simpleCamelCase = /(^\w+)([A-Z])(\w+)/;

          var match = simpleCamelCase.exec(valuesAnchor);
          if(match != null) {
            valuesAnchor = match[1] + "_" + match[2].toLowerCase() + match[3];
          }

          this.options.valuesAnchor = valuesAnchor;
        },
        // endregion

        _configureMultiChart: function() {

          var model = this.model;
          var options = this.options;

          // Very small charts can't be dominated by text...
          // options.axisSizeMax = '30%';

          var titleFont;
          var labelSize = model.labelSize;
          if(labelSize) {
            var labelFontFamily = model.labelFontFamily;
            titleFont = (labelSize + 2) + "px " + labelFontFamily;
          } else {
            titleFont = util.defaultFont(null, 12);
          }

          options.titleFont = titleFont;

          if(!(/black|(\bbold\b)/i).test(titleFont)) {
            titleFont = "bold " + titleFont;
          }

          options.smallTitleFont = titleFont;

          var value = model.multiChartOverflow;
          if(value) {
            options.multiChartOverflow = value.toLowerCase();
          }

          value = model.maxChartsPerRow;
          if(value != null) {
            options.multiChartColumnsMax = value;
          }

          value = model.multiChartRangeScope;
          if(value) {
            options.numericAxisDomainScope = value;
          }
        },

        // region TOOLTIP
        _configureTooltip: function() {
          var view = this;
          this.options.tooltipFormat = function() {
            return view._getTooltipHtml(this);
          };
        },

        /* SPEC
         * - Correct measure shows up when multiple measures are used.
         * - Percentage is displayed on Stacked/100% Column/Bar, Stacked Area, Sunburst and Pie.
         *   - Except does not show when measures are percentages already.
         * - Shows number of clauses of the selection filter.
         * - Shows drilling information when it is possible to drill.
         *   - Does not show drill info on trend-line points.
         * - Does not show fields in the multi-chart role.
         * - Shows trend label besides trended measures.
         * - Shows interpolation label besides interpolated measures (according to empty cell mode).
         */
        _getTooltipHtml: function(cccContext) {

          if(this.isDirty) {
            return;
          }

          var tooltipLines = [];
          var msg;

          // Show key fields first.
          this._axes.key.forEach(function(mappingFieldInfo) {
            this._buildTooltipHtmlOfField(tooltipLines, mappingFieldInfo, cccContext);
          }, this);

          this._axes.measure.forEach(function(mappingFieldInfo) {
            this._buildTooltipHtmlOfField(tooltipLines, mappingFieldInfo, cccContext);
          }, this);

          // What happens when executed information.
          var cccDatum = cccContext.scene.datum;
          if(!cccDatum.isVirtual) {

            // TODO: Generalize getDoubleClickTooltip somehow.
            var app = this.model.application;
            if(app && app.getDoubleClickTooltip) {
              // Drilling preferably uses the group, if it exists (e.g. scatter does not have it).
              var drillOnFilter = this._createExecuteFilter(cccContext);
              if(drillOnFilter !== null) {
                msg = app.getDoubleClickTooltip(drillOnFilter);
                if(msg) {
                  tooltipLines.push(msg);
                }
              }
            }
          }

          // Selection filter information.
          // Not the data point count, but the selection count (a single column selection may select many data points).
          var clauseCount = util.getFilterClauseCount(this.model.selectionFilter);
          if(clauseCount > 0) {
            var msgId = clauseCount === 1 ? "tooltip.footer.selectedOne" : "tooltip.footer.selectedMany";

            msg = bundle.get(msgId, [clauseCount]);

            tooltipLines.push(msg);
          }

          return tooltipLines.join("<br />");
        },

        _buildTooltipHtmlOfField: function(lines, mappingFieldInfo, cccContext) {
          // This field is not real.
          if(mappingFieldInfo.isMeasureDiscrim) {
            return;
          }

          // Don't show hidden CCC dimensions.
          var dimType = cccContext.chart.data.type.dimensions(mappingFieldInfo.name);
          if(dimType.isHidden) {
            return;
          }

          if(mappingFieldInfo.sourceType === "number") {
            this._buildTooltipHtmlOfFieldNumeric(lines, mappingFieldInfo, cccContext);
          } else {
            this._buildTooltipHtmlOfFieldNonNumeric(lines, mappingFieldInfo, cccContext);
          }
        },

        _buildTooltipHtmlOfFieldNonNumeric: function(lines, mappingFieldInfo, cccContext) {
          // Multi-chart formulas are not shown in the tooltip because
          // they're on the small chart's title.
          if(this._multiRole !== null && mappingFieldInfo.roleName === this._multiRole) {
            return;
          }

          var cccDatum = cccContext.scene.datum;
          var cccAtom = cccDatum.atoms[mappingFieldInfo.name];
          var value = cccAtom.value;

          // If the chart hides null **members**...
          if(this._hideNullMembers && util.isNullMember(value)) {
            return;
          }

          // TODO: null trend value?
          if(cccDatum.isTrend && value == null) {
            return;
          }

          // ex: "Line: Ships"
          lines.push(def.html.escape(mappingFieldInfo.label) + ": " + def.html.escape(cccAtom.label));
        },

        _buildTooltipHtmlOfFieldNumeric: function(lines, mappingFieldInfo, cccContext) {

          var dimName = mappingFieldInfo.name;
          var cccActiveRoles = util.getCccContextActiveVisualRolesOfMeasureDimension(cccContext, dimName);
          if(cccActiveRoles === null) {
            // Field does not have an active visual role.
            // This includes fields mapped to generic measure visual roles which are
            // not active in this scene.
            return;
          }

          // Obtain the first datum which is not null on the given dimName.
          // This can happen on trend scenes with measure discriminator,
          // where there will be one datum per trended measure in the scene,
          // but where only one of which is actually non-null for the active
          // measure of the scene...
          var cccDatum = cccContext.scene.datums().first(function(datum) {
            return datum.atoms[dimName].value !== null;
          });

          // Don't think that this happens, but it is better to be safe.
          if(cccDatum == null) {
            return;
          }

          // ex: "Field-Label (Role-Label): 200 (10%)"
          var tooltipLine = def.html.escape(mappingFieldInfo.label);

          // Role Label
          if(this._noRoleInTooltipMeasureRoles[mappingFieldInfo.roleName] !== true)
            tooltipLine += " (" + def.html.escape(mappingFieldInfo.roleName) + ")";

          tooltipLine += ": " + def.html.escape(util.getCccContextAtomLabel(cccContext, cccDatum.atoms[dimName]));

          if(!mappingFieldInfo.sourceIsPercent || !this._tooltipHidePercentageOnPercentFields) {
            var pctLabel = util.findCccContextPercentRoleLabel(cccContext, cccActiveRoles);
            if(pctLabel !== null) {
              tooltipLine += " (" + def.html.escape(pctLabel) + ")";
            }
          }

          var cccInterpolationLabel = util.getCccContextInterpolationLabelOfDimension(cccContext, dimName);
          if(cccInterpolationLabel !== null) {
            tooltipLine += " " + bundle.get("tooltip.dim.interpolation." + cccInterpolationLabel);
          }

          if(cccDatum.isTrend) {
            tooltipLine += " (" + this.options.trendLabel + ")";
            // bundle.get("tooltip.dim.interpolation." + complex.trendType);
          }

          lines.push(tooltipLine);
        },
        // endregion

        // region LEGEND
        /* SPEC
         * The color legend is displayed iff all of the following conditions are met:
         * - It is not the Sunburst visualization
         * - The color visual role is working in a discrete/qualitative mode.
         * - There should be one or more fields in the color visual role and/or
         *   two or more fields in the generic measure visual role
         *   (when the visualization has a generic "Measures" visual role).
         * - The number of legend items should be one or more.
         *   The Scatter chart requires that there are two or more legend items.
         * - The number of legend items should be no more than 20. Otherwise, hide the legend.
         * - The length of the side which is orthogonal to the side of the legend panel
         *   which is anchored should be no more than 30% of the corresponding length of the chart.
         *   The Pie chart, in multi-pie mode, uses a limit of 50%.
         */
        _shouldShowLegend: function() {

          if(!this.model.showLegend) {
            return false;
          }

          // When the measureDiscrim is accounted for,
          // it is not necessary to have a mapped color role to have a legend...
          // It is only needed that, if it is mapped, that it is qualitative.
          var isContinuousColor = this._isColorCategorical() === false;
          return !isContinuousColor && !!this._getMappingFieldInfosOfRole(this._discreteColorRole);
        },

        _configureLegend: function() {

          var model = this.model;
          var options = this.options;

          var value = model.legendColor;
          if(value) {
            options.legendLabel_textStyle = value;
          }

          // TODO: ignoring white color cause analyzer has no on-off for the legend bg color
          // and always send white. When the chart bg color is active it
          // would not show through the legend.
          value = model.legendBackgroundColor;
          if(value && value.toLowerCase() !== "#ffffff") {
            options.legendArea_fillStyle = value;
          }

          value = model.legendPosition;
          if(value) {
            options.legendPosition = value;
          }

          if(model.legendSize) {
            options.legendFont = util.readFontModel(model, "legend");
          }

          options.legendFont = util.defaultFont(options.legendFont, 10);

          var legendPosition = options.legendPosition;
          var isTopOrBottom = legendPosition === "top" || legendPosition === "bottom";

          if(isTopOrBottom) {
            options.legendAlign = "left";
          } else {
            options.legendAlign = "top";

            if(this._isMultiChartMode) {
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
        _prepareLayout: function() {
          // Default Does Nothing
        },

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
         * @return {!pvc.BaseChart} The created chart instance.
         * @protected
         */
        _createChart: function(ChartClass) {
          return new ChartClass(this.options);
        },

        /**
         * Gets the current value of maximum number of visual elements.
         *
         * @return {number} The maximum number when defined and greater than `0`; `-1`, otherwise.
         * @protected
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
          this._chart = this._createChart(pvc[this._cccClass]);
          this._chart
            .setData(this._dataView.toJsonCda())
            .render();

          // Render may fail due to required visual roles, invalid data, etc.
          var error = this._chart.getLastRenderError();
          if(error) {
            return Promise.reject(this._convertCccError(error));
          }

          this._updateSelection();
        },

        _convertCccError: function(error) {
          var typeError;
          if((error instanceof pvc.InvalidDataException) || (error instanceof pvc.NoDataException)) {
            typeError = new UserError(error.message);
            Object.defineProperty(typeError, "name", {value: error.name});
          } else {
            typeError = new Error(error.toString());
          }

          return typeError;
        },

        // region SELECTION
        _configureSelection: function() {

          var view = this;

          this.options.userSelectionAction = function(cccSelectingDatums, cccSelectingGroup) {
            return view._onUserSelection(this, cccSelectingDatums, cccSelectingGroup);
          };

          this.options.base_event = [["click", function() {
            view._onUserSelection(this, []);
          }]];
        },

        _onUserSelection: function(cccContext, cccSelectingDatums, cccSelectingGroup) {

          if(this.isDirty) {
            // Explicitly cancel CCC's own selection handling.
            return [];
          }

          var selectFilter = this._createSelectFilter(cccSelectingDatums, cccSelectingGroup);

          var srcEvent = cccContext.event;

          this.act(new SelectAction({
            dataFilter: selectFilter,
            position: srcEvent ? {x: srcEvent.clientX, y: srcEvent.clientY} : null
          }));

          // Explicitly cancel CCC's own selection handling.
          return [];
        },

        _createSelectFilter: function(cccSelectingDatums, cccSelectingGroup) {

          // TODO: improve detection of viz without fields.

          var operands = [];

          if(cccSelectingGroup) {
            var operand = this._convertCccComplexToFilter(cccSelectingGroup);
            if(operand) {
              operands.push(operand);
            }
          } else {
            // There can be no duplicate filters...
            // * There are no a priori duplicate rows in the viz's data table, w.r.t key visual roles.
            // * Datums do not contain the special discriminator dimension.
            // * CCC's special "dataPart" dimension only comes up with a different value
            //   for trend datums, which are excluded by the below !isVirtual test.
            // * Interpolated datums could also generate duplicate filters,
            //   but are also excluded by the below !isVirtual test.
            cccSelectingDatums.forEach(function(cccDatum) {

              // Virtual (interpolated or trended) datums or datums with
              // all-null-measures are not used to create selection filters.
              if(!cccDatum.isVirtual && !cccDatum.isNull) {

                // Operand is null when there are no key fields
                // (e.g. bar chart with measures alone).
                var operand = this._convertCccComplexToFilter(cccDatum);
                if(operand) {
                  operands.push(operand);
                }
              }
            }, this);
          }

          var Or = this.$type.context.get("or");

          return new Or({operands: operands});
        },
        // endregion

        // region DOUBLE-CLICK / EXECUTE
        _configureDoubleClick: function() {

          var view = this;

          this.options.doubleClickAction = function() {
            view._executeOn(this);
          };

          // Only discrete cartesian axes are clickable (composite or not).
          // Scenes of discrete axes always have one or more groups.
          this.options.axisDoubleClickAction = function() {
            view._executeOn(this);
          };
        },

        _executeOn: function(cccContext) {

          if(this.isDirty) {
            return;
          }

          var executeFilter = this._createExecuteFilter(cccContext);
          if(executeFilter === null) {
            return;
          }

          var Or = this.$type.context.get("or");

          executeFilter = new Or({operands: [executeFilter]});

          var srcEvent = cccContext.event;

          this.act(new ExecuteAction({
            dataFilter: executeFilter,
            position: srcEvent ? {x: srcEvent.clientX, y: srcEvent.clientY} : null
          }));
        },

        _createExecuteFilter: function(cccContext) {

          var cccScene = cccContext.scene;

          if(cccScene.groups !== null && cccScene.groups.length > 1) {
            // If there is more than one group in a scene, then there is not a well-defined execution target.
            // This happens in scenes of the discrete non-composite axis that are the result of
            // merging several ticks and their data sets (groups), due to lack of space.
            return null;
          }

          // Not all scenes have a group (e.g. scatter does not have it).
          // We prefer the group if it exists over datum,
          // because datums have atoms which are not relevant for the execution operation.
          // The group will contain only relevant atoms.
          // However, not sure if there is one case in which always using datum would cause problems.
          var cccComplex = cccScene.group || cccScene.datum;

          // May still be null.
          return this._convertCccComplexToFilter(cccComplex);
        },
        // endregion

        // region UTILITY

        // The CCC extension DET Tooltip hacks into this method. Beware if changed.
        _convertCccComplexToFilter: function(cccComplex) {

          var filter = null;

          var context = this.$type.context;
          var IsEqual = context.get("=");
          var And = context.get("and");

          this._getSourceKeyMappingFieldInfos().each(function(mappingFieldInfo) {

            var cccAtom = cccComplex.getSpecifiedAtom(mappingFieldInfo.name);
            if(cccAtom) {
              // TODO: Is this rawValue recovery still needed?
              var value = cccAtom.value === null ? cccAtom.rawValue : cccAtom.value;

              // The Data field types for "string", "date", "number" are the same
              // as the Type API aliases of those types.
              var valueType = mappingFieldInfo.sourceType;

              var operand = new IsEqual({
                property: mappingFieldInfo.sourceName,
                value: value === null ? null : {_: valueType, v: value, f: cccAtom.label}
              });

              filter = filter !== null ? filter.and(operand) : new And({operands: [operand]});
            }
          });

          return filter;
        }
        // endregion
      }, /** @lends pentaho.ccc.visual.Abstract */{

        /**
         * Core extend functionality for CCC View subclasses.
         *
         * Inherits and merges the shared,
         * prototype [_options]{@link pentaho.ccc.visual.Abstract#_options} property.
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
