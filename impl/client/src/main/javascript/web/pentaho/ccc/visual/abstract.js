/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/pvc",
  "cdf/lib/CCC/cdo",
  "cdf/lib/CCC/protovis",
  "./_util",
  "pentaho/util/object",
  "pentaho/visual/color/utils",
  "pentaho/data/TableView",
  "pentaho/util/logger",
  "pentaho/debug",
  "pentaho/debug/Levels",
  "pentaho/i18n!view"
], function(module, SelectionModes, def, pvc, cdo, pv, util, O, visualColorUtils, DataView,
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
    "pentaho/visual/role/level",
    // Pre-load all registered filter types
    {$types: {base: "pentaho/data/filter/abstract"}},
    function(BaseView, Model, SelectAction, ExecuteAction, MeasurementLevel) {

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
          ignoreNulls: false
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

        /* Some CCC measure visual roles accept multiple attributes.
         * We call them generic measure visual roles...
         *
         * Also, more than one Viz measure visual role can map to a CCC measure visual role:
         *
         *   Viz Visual Role  -> Generic Measure CCC Visual Role
         *   ---------------------------------------------------
         *   "measures"          "value"
         *   "measuresLine"      "value"
         *
         * Each of the Viz visual roles may support more than one attribute.
         *
         * When, a CCC measure visual role is mapped to more than one attribute,
         * a special "measure discriminator attribute" must be bound to one of the
         * discrete visual roles. This attribute indicates the active measure.
         *
         * To activate the measure discriminator mode, a chart class has to specify the
         * prototype property `_genericMeasureCccVisualRole` with the name of the multiple measures CCC visual role
         * and `_genericMeasureDiscrimCccVisualRole` with the name of the discrete CCC visual role that should receive
         * the discriminator attribute.
         *
         * When multiple source roles exist,
         * these are sorted alphabetically and the within role attribute order is preserved.
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

        // Do not show percentage value in front of a "percent measure" MappingAttributeInfo.
        _tooltipHidePercentageOnPercentAttributes: false,

        // The name of the role that represents the "multi-chart" concept.
        _multiRole: "multi",

        // The name of the role that represents the "discrete color" concept.
        _discreteColorRole: "columns",
        // endregion

        // region VizAPI implementation

        /** @inheritDoc */
        _updateAll: function() {
          this._dataTable = this.model.data;

          // Ensure we have a plain data table
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

          // TODO: Re-implement this to filter datums by directly applying the selectionFilter.
          // Create some kind of element adapter for that, like the data table does.

          if(_isDebugMode) logger.log("_updateSelection BEGIN");
          try {
            var dataFilter = this.selectionFilter;

            // Skipping rows with all null measures, when converting from cross-tab, can speed up things a lot.
            // The dataView sourceColumns are not relevant as filter uses the attribute names.
            var dataTable = this._dataTable.toPlainTable({skipRowsWithAllNullMeasures: true});
            var selectedDataView = dataTable.filter(dataFilter);

            // Get information on the axes
            var props = def.query(this._getRealKeyAttributeInfos())
                  .select(function(attrInfo) {
                    return {
                      attr: attrInfo.attr,
                      name: attrInfo.name
                    };
                  })
                  .array();

            // Build a CCC filter (whereSpec)
            var whereSpec = [];
            var alreadyIn = {};
            for(var k = 0, N = selectedDataView.getNumberOfRows(); k < N; k++) {

              /* eslint no-loop-func: 0 */
              var datumFilterSpec = props.reduce(function(datumFilter, prop) {
                var value = selectedDataView.getValue(k, selectedDataView.getColumnIndexByAttribute(prop.attr));
                datumFilter[prop.name] = value;
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
            "readers", []);
        },
        // endregion

        // region ATTRIBUTE INFO / VISUAL MAP

        _getAttributeInfosOfRole: function(roleName, excludeMeasureDiscrim) {
          var attrInfos = def.getOwn(this.visualMap, roleName, null);
          if(attrInfos !== null && excludeMeasureDiscrim) {
            attrInfos = attrInfos.filter(function(attrInfo) { return !attrInfo.isMeasureDiscrim; });
          }
          return attrInfos;
        },

        _isRoleQualitative: function(roleName) {

          // TODO: Can't this use levelEffectiveOn alone?

          // Is generic visual role?
          var cccGenericRoleName = this._genericMeasureCccVisualRole;
          if(!!cccGenericRoleName && def.getOwn(this._roleToCccRole, roleName) === cccGenericRoleName) {
            return false;
          }

          var mapping = this.model.get(roleName);
          if(mapping.attributes.count > 1) {
            return true;
          }

          var rolePropType = this.model.$type.get(roleName);
          var level = rolePropType.levelEffectiveOn(this.model);
          return !level || MeasurementLevel.type.isQualitative(level);
        },

        _getRolesMappedToCccRole: function(cccRoleName) {
          return def.getOwn(this._rolesByCccVisualRole, cccRoleName, null);
        },

        _getRealKeyAttributeInfos: function() {
          return def.query(this.axes.key).where(function(attrInfo) { return !attrInfo.isMeasureDiscrim; });
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

          // region label
          value = model.labelColor;
          if(value != null) {
            options.axisLabel_textStyle = options.axisTitleLabel_textStyle = value;
          }

          value = model.labelSize;
          if(value) {
            var labelFont = util.readFontModel(model, "label");

            options.axisTitleFont = options.axisFont = labelFont;

            if(this._isMultiChartMode) {
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

        // region initData
        /**
         * Initializes the view in what concerns to the current data table's data and metadata.
         *
         * * Creates the local `MappingAttributeInfo` instances,
         *   one per `MappingAttribute` of visual role properties of the model
         *   (one more for the special measure discriminator attribute added in certain circumstances).
         *   Sets {@link pentaho.ccc.visual.Abstract#attributeInfos} and
         *   {@link pentaho.ccc.visual.Abstract#visualMap}.
         *
         * * Determines if the visualization will operate in "generic measure mode",
         *   which happens when there is more than one attribute mapped to the generic measure visual role, if any.
         *   In this case, also, creates the special measure discriminator attribute.
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
          var dataTable = this._dataTable;
          var attributes = dataTable.model.attributes;

          var genericMeasuresCount = 0;
          var genericMeasureCccVisualRole = this._genericMeasureCccVisualRole;

          // Multiple ways to store and index MappingAttributeInfo...
          var attributeInfos = [];

          // attributeName -> MappingAttributeInfo
          var attributeInfosByName = {};

          // axisId -> MappingAttributeInfo[]
          var axes = {
            key: [],
            measure: []
          };

          // roleName -> MappingAttributeInfo[]
          var visualMap = {};

          var rolesByCccVisualRole = {};

          // ----

          /**
           * Registers a mapping attribute info.
           *
           * @param {!MappingAttributeInfo} mappingAttrInfo - The mapping attribute info to add.
           */
          var addMappingAttrInfo = function(mappingAttrInfo) {

            if(mappingAttrInfo.cccRole === genericMeasureCccVisualRole) {
              genericMeasuresCount++;
            }

            attributeInfos.push(mappingAttrInfo);
            attributeInfosByName[mappingAttrInfo.name] = mappingAttrInfo;

            axes[mappingAttrInfo.axis].push(mappingAttrInfo);

            def.array.lazy(visualMap, mappingAttrInfo.role).push(mappingAttrInfo);
          };

          // ----
          // Phase 1 - Build MappingAttributeInfo part 1...

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

          this.model.$type.eachVisualRole(function(visualRolePropType) {

            var roleName = visualRolePropType.name;
            var mapping  = this.model.get(roleName);

            // Could this be done only at construction time?
            var cccRoleName = this._roleToCccRole[roleName];
            if(!cccRoleName) {
              throw def.error.operationInvalid("No CCC Role for '{0}'", [roleName]);
            }

            def.array.lazy(rolesByCccVisualRole, cccRoleName).push(roleName);

            if(mapping.isMapped) {
              var isKeyVisualRole = visualRolePropType.isVisualKeyOn(this.model);

              mapping.attributes.each(function(mappingAttr, mappingAttrIndex) {
                var attrName = mappingAttr.name;
                var attr = attributes.get(attrName);

                // Create an intelligible MappingAttrInfo name.
                // The "_" prefix prevents CCC auto binding to visual roles.
                var name = "_" + roleName + "_" + (mappingAttrIndex + 1);

                addMappingAttrInfo({
                  name:  name,
                  label: attr.label || attrName,

                  role: roleName,
                  mapping: mapping,
                  mappingAttr: mappingAttr,

                  attr: attr,

                  isPercent: !!attr.isPercent,

                  cccRole: cccRoleName,

                  axis: isKeyVisualRole ? "key" : "measure",
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
          this.attributeInfos = attributeInfos; // list
          this.attributeInfosByName = attributeInfosByName; // map by name
          this.axes = axes; // index by axis
          this.visualMap = visualMap; // index by role

          this._rolesByCccVisualRole = rolesByCccVisualRole;
          this._genericMeasuresCount = genericMeasuresCount;

          // ----

          // Generic Measure Mode?
          // Needs to be done after publishing _rolesByCccVisualRole.
          if((this._isGenericMeasureMode = genericMeasuresCount > 1)) {
            // Create the measure discriminator attribute.
            // Will be the last attribute of its discrete role.
            addMappingAttrInfo(this._createGenericMeasureDiscriminator());
          }

          // ----

          // 1. Hide columns not bound to visual roles and reorder attributes of the plain data table.
          this._transformData(attributeInfos);

          // 2. Configure CCC dimensions.
          this._configureCccDimensions(attributeInfos);

          // 3. Configure CCC visual roles.
          this._configureCccVisualRoles(attributeInfos);

          // 4. Determine if there is a multi-chart role and if it is bound.
          // (ignoring the measure discrim, if any)
          this._isMultiChartMode = !!this._multiRole && this.model.get(this._multiRole).isMapped;
        },

        /**
         * Adds generic measure discriminator attribute information.
         *
         * When a measure visual role like "measures" or "measuresLine" accepts multiple attributes, and
         * it is desired that each of these displays as if it were a different series
         * (different line, different color etc.),
         * we use CCC's measure visual roles' discriminator dimensions.
         *
         * For example,
         * if the CCC multiple measures visual role is `value`,
         * then we would map the special `valueRole.dim` attribute to CCC's
         * `series` visual role, to make series unfold for each attribute bound to `value`.
         *
         * @return {MappingAttrInfo} The created generic measure discriminator.
         * @private
         */
        _createGenericMeasureDiscriminator: function() {

          var discrimCccRoleName = this._genericMeasureDiscrimCccVisualRole;
          var discrimRoleName = this._getRolesMappedToCccRole(discrimCccRoleName)[0];

          return {
            // e.g. valueRole.dim
            name: this._genericMeasureDiscrimCccDimName,
            label: "Generic Measure Discriminator",
            role: discrimRoleName,
            cccRole: discrimCccRoleName,
            axis: "key",
            mapping: null,
            mappingAttr: null,
            attr: null,
            isPercent: false,
            isMeasureDiscrim: true
          };
        },

        /**
         * Removes _unmapped_ attributes and reorders attributes of the plain data table.
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
         *
         * @param {MappingAttributeInfo[]} attrInfos - The array of mapping attribute info objects.
         */
        _transformData: function(attrInfos) {
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

          var dataView = this._dataView;

          attrInfos.forEach(function(attrInfo) {

            if(!attrInfo.isMeasureDiscrim) {
              var sourceIndexes;
              var dimNames;

              if(attrInfo.attr.type === "number") {
                sourceIndexes = measuresSourceIndexes;
                dimNames = measuresDimNames;
              } else {
                sourceIndexes = categoriesSourceIndexes;
                dimNames = categoriesDimNames;
              }

              var attrColIndex = dataView.getColumnIndexByAttribute(attrInfo.attr);

              sourceIndexes.push(attrColIndex);
              dimNames.push(attrInfo.name);
            }
          });

          // Indexes of measures in the data view (already mapped with source columns).
          // Start index for first measure:
          var i = categoriesSourceIndexes.length;
          var M = measuresSourceIndexes.length;
          var afterMappingColumnIndexesMeasures = [];
          while(M--) afterMappingColumnIndexesMeasures.push(i++);

          this.options.measuresIndexes = afterMappingColumnIndexesMeasures;

          this._dataView = new DataView(dataView);
          this._dataView.setSourceColumns(categoriesSourceIndexes.concat(measuresSourceIndexes));

          this.options.readers = categoriesDimNames.concat(measuresDimNames);
        },

        /**
         * Configure CCC `dimensions`.
         *
         * @param {MappingAttributeInfo[]} attrInfos - The array of mapping attribute info objects.
         */
        _configureCccDimensions: function(attrInfos) {

          var cccDimSpecs = this.options.dimensions;

          // MappingAttrInfos is filled above, in visual role mapping attribute order.
          // This enables its use for configuring the CCC visual roles.
          attrInfos.forEach(function(attrInfo) {

            // Configure CCC main dimensions' options.
            if(attrInfo.attr) {
              var cccDimSpec = def.lazy(cccDimSpecs, attrInfo.name);

              cccDimSpec.valueType  = util.getCccValueTypeOfAttribute(attrInfo.attr);
              cccDimSpec.isDiscrete = this._isRoleQualitative(attrInfo.role);
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
         * @param {MappingAttributeInfo[]} attrInfos - The array of mapping attribute info objects.
         * @overridable
         * @protected
         */
        _configureCccVisualRoles: function(attrInfos) {

          var cccRoleSpecs = this.options.visualRoles;

          // MappingAttrInfos is filled above, in visual role mapping attribute order.
          // This enables its use for configuring the CCC visual roles.
          attrInfos.forEach(function(attrInfo) {

            var cccRoleSpec = def.lazy(cccRoleSpecs, attrInfo.cccRole);

            def.array.lazy(cccRoleSpec, "dimensions").push(attrInfo.name);
          });
        },
        // endregion

        _configureOptions: function() {
          var options = this.options;
          var model = this.model;

          this._configureColor();

          if(def.get(this._validExtensionOptions, "legendAreaVisible", options.legendAreaVisible))
            this._configureLegend();

          if(this._isMultiChartMode)
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
        /**
         * Gets a value that indicates if a color role is defined, and mapped, and, if so,
         * if it is qualitative or not.
         *
         * @protected
         *
         * @return {undefined|boolean} `undefined` if there is no color role,
         * or if it is not mapped;
         * otherwise, `true` if its effective level of measurement is qualitative; `false` otherwise.
         */
        _isColorDiscrete: function() {
          var colorRole = this._discreteColorRole;
          if(colorRole && this.model[colorRole].isMapped) {
            return this._isRoleQualitative(colorRole);
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
         * and no color attributes.
         *
         * SPEC
         * - Viz. has a discrete color scale and:
         * - Pie
         *   - Ignores measures’ colors.
         *   - Uses the member colors of the last Slices attribute.
         * - Sunburst
         *   - Ignores measure colors.
         *   - Creates a combined map of all attributes with colors.
         * - All Other
         *   - When no Color attributes Or there is more than one generic measure:
         *   - Use the measures’ colors (even if only one measure and no color attributes).
         *   - When there are Color attributes and at most one generic measure:
         *   - Uses the member colors of the last Color attribute, if any.
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
          var colorAttrInfos = this._getAttributeInfosOfRole(this._discreteColorRole, /* excludeMeasureDiscrim: */true);
          var C = colorAttrInfos ? colorAttrInfos.length : 0;
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
                var c = colorMap && colorMap[this.axes.measure[0].name];
                return c ? pv.colors([c]) : null;
              }

              colorMap = this._copyColorMap(null, colorMap);
            } else {
              // a) C > 0 && M <= 1

              // If C > 0
              // Use the members' colors of the last color attribute.
              colorMap = this._copyColorMap(null, memberPalette[colorAttrInfos[C - 1].attr.name]);
            }
          }

          return colorMap;
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

          // Index generic measure attribute infos by data table attribute name.
          // @type Object.<string, AttributeInfo[]>
          var genericMeasureAttrInfosByAttrName = null;

          // Index even if only one measure, as may want to show the color of that measure.
          if(this._genericMeasuresCount > 0) {
            genericMeasureAttrInfosByAttrName = Object.create(null);

            this._getRolesMappedToCccRole(this._genericMeasureCccVisualRole)
                .forEach(function(genericMeasureVisualRole) {
                  var genericMeasureAttrInfos = this._getAttributeInfosOfRole(genericMeasureVisualRole);
                  if(genericMeasureAttrInfos !== null) {
                    genericMeasureAttrInfos.forEach(function(attrInfo) {
                      def.array.lazy(genericMeasureAttrInfosByAttrName, attrInfo.attr.name).push(attrInfo);
                    });
                  }
                }, this);
          }

          this._dataTable.model.attributes.forEach(function(attr) {
            if(attr.members) {
              // Level
              attr.members.forEach(function(member) {
                var color = member.property("color");
                if(color) {
                  setColor(attr.name, member.value, color);
                }
              });
            } else if(genericMeasureAttrInfosByAttrName !== null) {
              // Measure
              var color = attr.property("color");
              if(color) {
                // Measure colors are used when a generic measure visual role exists,
                // and thus a measure ends up as a "series" and taking part in the color scale.
                // Use the name of the dimension which will be used by CCC in valueRole.dim dimensions;
                // not the data table attribute name.
                var attrInfos = def.getOwn(genericMeasureAttrInfosByAttrName, attr.name, null);
                if(attrInfos !== null) {
                  // TODO: Mondrian/Analyzer specific
                  attrInfos.forEach(function(attrInfo) {
                    setColor("[Measures].[MeasuresLevel]", attrInfo.name, color);
                  });
                }
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
         * The actual key used by color scales with color maps is *the value of the last attribute*
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
          var cccDimSpecs = this.options.dimensions;

          var continuousAttrInfos = def.query(this.attributeInfos)
                .where(function(attrInfo) {
                  return !attrInfo.isMeasureDiscrim && !attrInfo.attr.isDiscrete;
                });

          continuousAttrInfos.each(function(attrInfo) {
            var format = attrInfo.attr.format;
            var mask = format && format.number && format.number.mask;
            if(mask) {
              def.lazy(cccDimSpecs, attrInfo.name).format = mask;
            }
          });
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

            var labelColor = model.labelColor;
            if(labelColor) {
              options.label_textStyle = model.labelColor;
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
         * - Does not show attributes in the multi-chart role.
         * - Shows trend label besides trended measures.
         * - Shows interpolation label besides interpolated measures (according to empty cell mode).
         */
        _getTooltipHtml: function(cccContext) {

          if(this.isDirty) {
            return;
          }

          var tooltipLines = [];
          var msg;

          // Show key attributes first.
          this.axes.key.forEach(function(attrInfo) {
            this._buildTooltipHtmlAttribute(tooltipLines, attrInfo, cccContext);
          }, this);

          this.axes.measure.forEach(function(attrInfo) {
            this._buildTooltipHtmlAttribute(tooltipLines, attrInfo, cccContext);
          }, this);

          // What happens when executed information.
          var cccDatum = cccContext.scene.datum;
          if(!cccDatum.isVirtual) {

            // TODO: Generalize getDoubleClickTooltip somehow.
            var app = this.model.application;
            if(app && app.getDoubleClickTooltip) {
              // Drilling preferably uses the group, if it exists (e.g. scatter does not have it).
              var drillOnFilter = this._getExecuteFilter(cccContext);
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
          var clauseCount = util.getFilterClauseCount(this.selectionFilter);
          if(clauseCount > 0) {
            var msgId = clauseCount === 1 ? "tooltip.footer.selectedOne" : "tooltip.footer.selectedMany";

            msg = bundle.get(msgId, [clauseCount]);

            tooltipLines.push(msg);
          }

          return tooltipLines.join("<br />");
        },

        _buildTooltipHtmlAttribute: function(lines, attrInfo, cccContext) {
          // This attribute is not real.
          if(attrInfo.isMeasureDiscrim) {
            return;
          }

          // Don't show hidden CCC dimensions.
          var dimType = cccContext.chart.data.type.dimensions(attrInfo.name);
          if(dimType.isHidden) {
            return;
          }

          if(attrInfo.attr.type === "number") {
            this._buildTooltipHtmlAttributeNumeric(lines, attrInfo, cccContext);
          } else {
            this._buildTooltipHtmlAttributeNonNumeric(lines, attrInfo, cccContext);
          }
        },

        _buildTooltipHtmlAttributeNonNumeric: function(lines, attrInfo, cccContext) {
          // Multi-chart formulas are not shown in the tooltip because
          // they're on the small chart's title.
          if(this._multiRole !== null && attrInfo.role === this._multiRole) {
            return;
          }

          var cccDatum = cccContext.scene.datum;
          var cccAtom = cccDatum.atoms[attrInfo.name];
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
          lines.push(def.html.escape(attrInfo.label) + ": " + def.html.escape(cccAtom.label));
        },

        _buildTooltipHtmlAttributeNumeric: function(lines, attrInfo, cccContext) {

          var dimName = attrInfo.name;
          var cccActiveRoles = util.getCccContextActiveVisualRolesOfMeasureDimension(cccContext, dimName);
          if(cccActiveRoles === null) {
            // Attribute does not have an active visual role.
            // This includes attributes mapped to generic measure visual roles which are
            // not active in this scene.
            return;
          }

          var cccDatum = cccContext.scene.datum;
          var cccAtom = cccDatum.atoms[dimName];

          // TODO: null trend value?
          if(cccDatum.isTrend && cccAtom.value == null) {
            return;
          }

          // ex: "Attribute-Label (Role-Label): 200 (10%)"
          var tooltipLine = def.html.escape(attrInfo.label);

          // Role Label
          if(this._noRoleInTooltipMeasureRoles[attrInfo.role] !== true)
            tooltipLine += " (" + def.html.escape(attrInfo.role) + ")";

          tooltipLine += ": " + def.html.escape(util.getCccContextAtomLabel(cccContext, cccAtom));

          if(!attrInfo.isPercent || !this._tooltipHidePercentageOnPercentAttributes) {
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
         * - There should be one or more attributes in the color visual role and/or
         *   two or more attributes in the generic measure visual role
         *   (when the visualization has a generic "Measures" visual role).
         * - The number of legend items should be one or more.
         *   The Scatter chart requires that there are two or more legend items.
         * - The number of legend items should be no more than 20. Otherwise, hide the legend.
         * - The length of the side which is orthogonal to the side of the legend panel
         *   which is anchored should be no more than 30% of the corresponding length of the chart.
         *   The Pie chart, in multi-pie mode, uses a limit of 50%.
         */
        _isLegendVisible: function() {
          // When the measureDiscrim is accounted for,
          // it is not necessary to have a mapped color role to have a legend...
          // It is only needed that, if it is mapped, that it is qualitative.
          var isContinuousColor = this._isColorDiscrete() === false;
          return !isContinuousColor && !!this._getAttributeInfosOfRole(this._discreteColorRole);
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
        _prepareLayout: function(options) {
          /* Default Does Nothing */
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
          if(error) {
            return Promise.reject(error);
          }

          this._updateSelection();
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

          var selectFilter = this._getSelectFilter(cccSelectingDatums, cccSelectingGroup);

          var srcEvent = cccContext.event;

          this.act(new SelectAction({
            dataFilter: selectFilter,
            position: srcEvent ? {x: srcEvent.clientX, y: srcEvent.clientY} : null
          }));

          // Explicitly cancel CCC's own selection handling.
          return [];
        },

        _getSelectFilter: function(cccSelectingDatums, cccSelectingGroup) {

          // TODO: improve detection of viz without attributes.

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
            var operandsByContentKey = {};

            cccSelectingDatums.forEach(function(cccDatum) {

              // Virtual (interpolated or trended) datums or datums with
              // all-null-measures are not used to create selection filters.
              if(!cccDatum.isVirtual && !cccDatum.isNull) {

                // Operand is null when there are no key attributes
                // (e.g. bar chart with measures alone).
                var operand = this._convertCccComplexToFilter(cccDatum);
                if(operand) {

                  // TODO: delete this and the operandsByContentKey variable
                  // after testing proves the assumption is correct.
                  // BEGIN
                  var key = operand.contentKey;
                  if(def.hasOwn(operandsByContentKey, key))
                    throw def.error.operationInvalid("Bad programmer.");
                  operandsByContentKey[key] = true;
                  // END

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

          var executeFilter = this._getExecuteFilter(cccContext);
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

        _getExecuteFilter: function(cccContext) {
          var cccScene = cccContext.scene;

          if(cccScene.groups !== null && cccScene.groups.length > 1) {
            // If there is more than one group in a scene, then there is not well-defined execution target.
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

        _convertCccComplexToFilter: function(cccComplex) {
          var filter = null;

          var context = this.$type.context;
          var IsEqual = context.get("=");
          var And = context.get("and");

          this._getRealKeyAttributeInfos().each(function(attrInfo) {

            var cccAtom = cccComplex.getSpecifiedAtom(attrInfo.name);
            if(cccAtom) {
              // TODO: Is this rawValue recovery still needed?
              var value = cccAtom.value === null ? cccAtom.rawValue : cccAtom.value;

              // The Data attribute types for "string", "date", "number" are the same
              // as the Type API aliases of those types.
              var valueType = attrInfo.attr.type;

              var operand = new IsEqual({
                property: attrInfo.attr.name,
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
