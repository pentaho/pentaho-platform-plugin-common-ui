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
define([
    "cdf/lib/CCC/def",
    "cdf/lib/CCC/pvc",
    "cdf/lib/CCC/cdo",
      "cdf/lib/CCC/protovis",
    "../axes/Axis",
    "../util",
    "../../../eventsManager",
    "css!../tipsy"
], function(def, pvc, cdo, pv, Axis, util, vizEvents) {

    var ruleStrokeStyle = "#808285",  // #D8D8D8',  // #f0f0f0
        lineStrokeStyle = "#D1D3D4";  // "#D1D3D4"; //'#A0A0A0'; // #D8D8D8',// #f0f0f0

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

        // Multichart
        multiChartMax: 50,

        // Legend
        legend:  true,
        legendPosition: 'right',
        legendSizeMax:  '60%',
        legendPaddings: 10,
        legendItemPadding: {left: 1, right: 1, top: 2, bottom: 2}, // width: 2, height: 4
        legendClickMode: 'toggleSelected',
        color2AxisLegendClickMode: 'toggleSelected', // for plot 2 (lines in bar/line combo)
        color3AxisLegendClickMode: 'toggleSelected', // for trends

        // Axes
        axisSizeMax:      '50%',
        axisTitleSizeMax: '20%',
        orthoAxisGrid:    true,
        continuousAxisLabelSpacingMin: 1.1, // em

        // Title
        titlePosition: 'top',

        // Interactivity
        interactive:    true,
        animate:        false,
        clickable:      true,
        selectable:     true,
        hoverable:      false,
        ctrlSelectMode: false,
        clearSelectionMode: 'manual',
        tooltipEnabled: true,
        tooltip: {
            className:    "common-ui-ccc-viz",
            delayIn:      200,
            delayOut:     80,
            offset:       2,
            html:         true,
            gravity:      'nw',
            fade:         false,
            followMouse:  true,
            useCorners:   true,
            arrowVisible: false,
            opacity:      1
        },

        // Plot
        valuesVisible: false,

        // Data
        ignoreNulls: false,
        groupedLabelSep: "~",

        crosstabMode:  true,
        isMultiValued: true,
        seriesInRows:  false,
        dataOptions: {
            //categoriesCount:   1, set in code
            measuresInColumns: true
        },

        // TODO: stop using the extension points map
        extensionPoints: {
            axisRule_strokeStyle:   ruleStrokeStyle,
            axisTicks_strokeStyle:  lineStrokeStyle,
            dot_lineWidth: 1.5,
            legendArea_lineWidth:   1,
            legendArea_strokeStyle: '#c0c0c0',
            legendLabel_textDecoration: null,
            legendDot_fillStyle:    legendShapeColorProp,
            legendDot_strokeStyle:  legendShapeColorProp,
            legend2Dot_fillStyle:   legendShapeColorProp,
            legend2Dot_strokeStyle: legendShapeColorProp
        }
    };

    return def.type()
        .init(function(element) {
            this._element     = element;
            this._elementName = element.id;
        })
        .add({
            _options: baseOptions,

            _hideNullMembers: false,

            _rolesToCccDimensionsMap: {
                'columns':  'series',
                'rows':     'category',
                'multi':    'multiChart',
                'measures': 'value'
            },

            _keyAxesIds: ['column', 'row'],
            _axesIds:    ['column', 'row', 'measure'],

            // This takes creation time dependencies into account.
            // It works right now. If it doesn't scale,
            // then some parts of axes initialization must me taken out
            // of the axes class or split into more initialization phases.
            _axesCreateOrderIds: ['row', 'measure', 'column'],

            // This is the order in which fields
            // are laid out in the CCC's virtual item.
            // Indexes of readers are relative to this layout.
            _cccVirtualItemAxesLayout: ['column', 'row', 'measure'],

            // Measure roles that do not show the role in the tooltip.
            _noRoleInTooltipMeasureRoles: {'measures': true},

            // Do not show percent in front of an analyzer "percent measure" gem.
            _noPercentInTootltipForPercentGems: false,

            _multiRole: 'multi',

            _discreteColorRole: 'columns',

            _useLabelColor: true,

            /* Viz API INTERFACE  */

            /**
             * Instructs the visualization to draw itself with
             * supplied data and options.
             */
            draw: function(dataTable, vizOptions) {
                // CDA table
                this._metadata  = [];
                this._resultset = null;

                // Pentaho/Google data table
                this._dataTable = dataTable;

                /* TEST
                vizOptions.memberPalette = {
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

                // ---------------

                this._initOptions(vizOptions);

                this._processDataTable();

                this._initAxes();

                // ---------------

                var rowDepth = this.axes.row.depth;
                this.options.dataOptions.categoriesCount = rowDepth;

                this._hasMultiChartColumns = this.axes.row.hasMulti || this.axes.column.hasMulti;

                // ---------------

                this._readUserOptions(this.options, vizOptions);

                // ---------------

                this._readData();

                this._configure();

                this._prepareLayout(this.options);

                this._render();
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

            _doResize: function(width, height) {
                if(this._chart) {
                    var options = this._chart.options;

                    def.set(options, 'width', width, 'height', height);

                    this._prepareLayout(options);

                    this._chart.render(true, true, false);
                }
            },

            // Sets the items on the chart that should be highlighted
            setHighlights: function(selections) {
                this._selections = selections;

                if(!this._ownChange) { // reentry control
                    if(!selections || selections.length == 0) {
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
            /* Returns the output parameters of the chart. */
            getOutputParameters: function() {
                var params = [];
                if(this._cccClass == 'PieChart') {
                    params.push([
                            this._dataTable.getColumnId( 0 ),
                            true,
                            this._dataTable.getColumnId( 0 )
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

            /* HELPERS  */

            _initOptions: function(vizOptions) {
                // Make a copy
                vizOptions = this._vizOptions = def.copy(vizOptions);

                // TODO: Analyzer dependency alert!!
                this._vizHelper = cv.pentahoVisualizationHelpers[vizOptions.customChartType];

                // Store the current selections
                this._selections = vizOptions.selections;

                // Recursively inherit this class' shared options
                var options = this.options = def.create(this._options);
                def.set(
                    options,
                    'canvas',          this._elementName,
                    'height',          vizOptions.height || 400,
                    'width',           vizOptions.width  || 400,
                    'dimensionGroups', {},
                    'dimensions',      {},
                    'visualRoles',     {},
                    'readers',         [],
                    'calculations',    []);
            },

            _message: function(msgId, args) {
                return this._vizHelper.message(msgId, args);
            },

            _setNullInterpolationMode: function(options, value) {
            },

            _readUserOptions: function(options, vizOptions) {
                // Apply vizOptions to extension points and others
                var extPoints = options.extensionPoints;

                var value = vizOptions.backgroundFill;
                if(value && value !== 'NONE') {
                    var fillStyle;
                    if(value === 'GRADIENT') {
                        if(this._hasMultiChartColumns) {
                            // Use the first color with half of the saturation
                            var bgColor = pv.color(vizOptions.backgroundColor).rgb();
                            bgColor = pv.rgb(
                                    ~~((255 + bgColor.r) / 2), // ~~ <=> Math.floor
                                    ~~((255 + bgColor.g) / 2),
                                    ~~((255 + bgColor.b) / 2),
                                    bgColor.a);

                            fillStyle = bgColor;
                        } else {
                            fillStyle = 'linear-gradient(to top, ' +
                                        vizOptions.backgroundColor + ', ' +
                                        vizOptions.backgroundColorEnd + ')';
                        }
                    } else {
                        fillStyle = vizOptions.backgroundColor;
                    }

                    extPoints.base_fillStyle = fillStyle;
                }

                value = vizOptions.labelColor;
                if(value !== undefined) {
                    extPoints.axisLabel_textStyle =
                    extPoints.axisTitleLabel_textStyle = value;
                }

                value = ('' + vizOptions.showLegend) === 'true';
                options.legend = value;
                if(value) {
                    value = vizOptions.legendColor;
                    if(value !== undefined) extPoints.legendLabel_textStyle = value;

                    // TODO: ignoring white color cause analyzer has no on-off for the legend bg color
                    // and always send white. When the chart bg color is active it
                    // would not show through the legend.
                    value = vizOptions.legendBackgroundColor;
                    if(value && value.toLowerCase() !== "#ffffff")
                        extPoints.legendArea_fillStyle = value;

                    value = vizOptions.legendPosition;
                    if(value) options.legendPosition = value.toLowerCase();


                    if(vizOptions.legendSize)
                        options.legendFont = util.readFont(vizOptions, 'legend');
                }

                value = vizOptions.lineWidth;
                if(value !== undefined) {
                    extPoints.line_lineWidth  = +value;      // + -> to number
                    var radius = 3 + 6 * ((+value) / 8); // 1 -> 8 => 3 -> 9,
                    extPoints.dot_shapeSize = radius * radius;

                    extPoints.plot2Line_lineWidth = extPoints.line_lineWidth;
                    extPoints.plot2Dot_shapeSize  = extPoints.dot_shapeSize;
                }

                value = vizOptions.maxChartsPerRow;
                if(value !== undefined)
                    options.multiChartColumnsMax = +value; // + -> to number

                value = vizOptions.emptyCellMode;
                if(value) {
                    switch(value) {
                        case 'GAP':    value = 'none';   break;
                        case 'ZERO':   value = 'zero';   break;
                        case 'LINEAR': value = 'linear'; break;
                    }

                    this._setNullInterpolationMode(options, value);
                }

                value = vizOptions.multiChartRangeScope;
                if(value) {
                    switch(value) {
                        case 'GLOBAL': value = 'global'; break;
                        case 'CELL':   value = 'cell';   break;
                    }

                    options.numericAxisDomainScope = value;
                }

                // build style for pv
                if(vizOptions.labelSize) {
                    var labelFont = util.readFont(vizOptions, 'label');

                    options.axisTitleFont =
                    options.axisFont = labelFont;

                    if(this._hasMultiChartColumns) {
                        var labelFontSize   = util.readFontSize(vizOptions, 'label');
                        var labelFontFamily = util.readFontFamily(vizOptions, 'label');
                        options.titleFont = (labelFontSize + 2) + "px " + labelFontFamily;
                    }
                }

                var sizeByNegativesMode = vizOptions.sizeByNegativesMode;
                options.sizeAxisUseAbs = sizeByNegativesMode === 'USE_ABS';
            },

            _processDataTable: function() {
                // Data truncation can affect also the structure of data.
                // If the query returns more than 100x100 rowsxcols,
                // requested measure formulas may be suppressed.
                // Filter measures not returned in this._dataTable
                //
                // Note that there is no guarantee that
                // when a given measure is not present with a given col value
                // it will not show up in the next col value
                // When no row has a value in a given column, the column is omitted...
                //
                // Note that measure gems that are in no *chart* gem bar (not mapped)
                // and that do not have hideInChart=true may appear here as columns.
                // These are ignored (meaRole === 'undefined').
                //
                // Measure columns of the same col values group may come in any order...
                // and even in different orders across column groups.

                var dataTable = this._dataTable;
                var dtColCount = dataTable.getNumberOfColumns();
                var roleToCccDimMap = this._rolesToCccDimensionsMap;
                var colGroups = [];
                var colGroupsByColValues = {};

                /*
                 * meaRoleId -> {
                 *   groupIndex: 0, // Global order of measure roles within a column group
                 *   index: 0       // Column index of a measure role's first appearance
                 * }
                 */
                var measureRolesInfo     = {};
                var measureRolesInfoList = [];

                // id -> { gem info }
                var measuresInfo = {};
                var measuresInfoList = [];

                var rowsInfoList = [];
                var columnsInfoList = [];

                var tc = 0;
                var colId, splitColId;

                // I - Row gems
                while(tc < dtColCount) {
                    colId = dataTable.getColumnId(tc);
                    splitColId = splitColGroupAndMeasure(colId);

                    // Found first measure column?
                    if(!processRowColumn.apply(this, splitColId)) break;

                    // next
                    tc++;
                }

                // First measure column
                if(tc < dtColCount) {

                    // II - Column gems
                    // Collects column gems' roles from the first col~mea column.
                    processColumnsInfo.call(this, splitColId[0]);

                    // III - Row gems
                    while(true) {
                        processMeasureColumn.apply(this, splitColId);

                        // next
                        if(++tc >= dtColCount) break;

                        colId = dataTable.getColumnId(tc);
                        splitColId = splitColGroupAndMeasure(colId);
                    }
                }

                // Sort measure roles
                measureRolesInfoList.sort(function(infoa, infob) {
                    return def.compare(infoa.groupIndex, infob.groupIndex) ||
                           def.compare(infoa.index,      infob.index); // tie breaker
                });

                // Reassign role group indexes
                measureRolesInfoList.forEach(function(roleInfo, index) {
                    roleInfo.groupIndex = index;
                });

                // Publish
                this._measureRolesInfo = measureRolesInfo;
                this._measureRolesInfoList = measureRolesInfoList;
                this._colGroups = colGroups;
                this._measuresInfo = measuresInfo;

                this._axesGemsInfo = {
                    'measure': measuresInfoList,
                    'row':     rowsInfoList,
                    'column':  columnsInfoList
                };


                /* HELPER functions */

                function processRowColumn(colGroupValues, meaId) {
                    // Found the first measure column?
                    // => It isn't a "row" column
                    if(/\[MEASURE:(\d+)\]$/.test(meaId)) return false;

                    // When "Member properties" are shown in a member gem,
                    // additional columns are added to the data table,
                    // that are to be ignored.
                    // These columns have no column role.
                    // We transform them to 'undefined' role
                    // which is the role value that unmapped measure columns
                    // already have.
                    var rolesAndLevels = getColumnRolesAndLevels(dataTable, tc);

                    // A row gem
                    rowsInfoList.push({
                        id:      colId,
                        formula: colId,
                        label:   dataTable.getColumnLabel(tc),
                        axis:    'row',
                        role:    rolesAndLevels ? rolesAndLevels[0].id : 'undefined',
                        index:   rowsInfoList.length
                    });

                    return true; // It is a "row" column
                }

                // Column Roles are the same in every col~measure column.
                // So we collect them from the first one.
                function processColumnsInfo(colGroupValues) {
                    if(colGroupValues) {
                        var rolesAndLevels = getColumnRolesAndLevels(dataTable, tc);
                        var colValues = colGroupValues.split('~');

                        colValues.forEach(function(colValue, index) {
                            var roleAndLevel = rolesAndLevels[index];
                            columnsInfoList.push({
                                id:      roleAndLevel.level,
                                formula: roleAndLevel.level,
                                label:   undefined, // not in data table
                                axis:    'column',
                                role:    roleAndLevel.id,
                                index:   index
                            });
                        });
                    }
                }

                function processMeasureColumn(colGroupValues, id) {

                    var meaInfo = def.getOwn(measuresInfo, id), roleAndLevel;

                    /* New measure? */
                    if(!meaInfo) {
                        // TODO - last() ?
                        roleAndLevel = getColumnRolesAndLevels(dataTable, tc).pop();

                        // NOTE: roleAndLevel.level == [Measures].[MeasuresLevel],
                        // which is not the formula...
                        meaInfo = {
                            id:      id,
                            formula: undefined, // not in data table
                            label:   splitColGroupAndMeasure(dataTable.getColumnLabel(tc))[1],
                            axis:    'measure',
                            role:    roleAndLevel.id,
                            index:   measuresInfoList.length,
                            isUnmapped: roleAndLevel.id === 'undefined'
                        };

                        measuresInfo[id] = meaInfo;
                        measuresInfoList.push(meaInfo);
                    }

                    /* New column group? */
                    var colGroup = def.getOwn(colGroupsByColValues, colGroupValues);
                    if(!colGroup) {
                        colGroup = {
                            index:      tc,
                            encValues:  colGroupValues,
                            values:     colGroupValues ? colGroupValues.split('~') : [],
                            measureIds: [id]
                        };

                        colGroupsByColValues[colGroupValues] = colGroup;
                        colGroups.push(colGroup);
                    } else {
                        colGroup.measureIds.push(id);
                    }

                    /* Role */
                    var currMeaIndex = (tc - colGroup.index);
                    var meaRoleInfo  = def.getOwn(measureRolesInfo, meaInfo.role);
                    if(!meaRoleInfo) {
                        meaRoleInfo = {
                            id:         roleAndLevel.id,
                            cccDimName: meaInfo.isUnmapped
                                        ? null
                                        : (roleToCccDimMap[roleAndLevel.id] ||
                                           def.assert("Must map to CCC all measure roles that the data table contains.")),
                            groupIndex: currMeaIndex,
                            index:      tc // first index where role appears (for tie break, see .sort above)
                        };

                        measureRolesInfo[meaInfo.role] = meaRoleInfo;
                        measureRolesInfoList.push(meaRoleInfo);

                    } else if(currMeaIndex > meaRoleInfo.groupIndex) {
                        meaRoleInfo.groupIndex = currMeaIndex;
                    }
                }
            },

            _initAxes: function() {
                // formula, id -> gem
                this.gemsMap = {};

                // roleId -> axis
                this.axisByRole = {};

                // axisId -> Axis
                this.axes = {};

                this._gemCountColumnReportAxis = 0;
                this._measureDiscrimGem = null;

                // Create and configure Axis's
                this._axesCreateOrderIds.forEach(createAxis, this);

                var virtualItemIndex = 0;
                var cccDimNamesSet = {};
                this._cccVirtualItemAxesLayout.forEach(function(axisId) {
                    virtualItemIndex = this.axes[axisId].configure(virtualItemIndex, cccDimNamesSet);
                }, this);

                function createAxis(axisId) {
                    var axis = Axis.create(this, axisId);

                    axis.gems.forEach(indexGem, this);

                    this.axes[axisId] = axis;

                    var boundRoleList = axis.boundRolesIdList;
                    if(boundRoleList) {
                        boundRoleList.forEach(function(roleId) {
                            !def.hasOwn(this.axisByRole, roleId) ||
                                def.assert("A role cannot be in more than one axis");
                            this.axisByRole[roleId] = axis;
                        }, this);
                    }
                }

                /* @instance */
                function indexGem(gem) {
                    var form = gem.formula,
                        id   = gem.id;

                    // NOTE: when interaction is disabled...
                    // formula and id aren't available in every axis type...

                    // Index by formula
                    if(form) this.gemsMap[form] = gem;

                    if(id && form !== id) this.gemsMap[id] = gem;

                    if(gem.reportAxis === 'column')  this._gemCountColumnReportAxis++;

                    if(gem.isMeasureDiscrim) this._measureDiscrimGem = gem;
                }
            },

            _readData: function() {
                this._readDataCrosstab();
            },

            /**
             * Creates a CCC resultset in CROSSTAB format.
             *
             * Data passes through mostly as it comes;
             * it's simply translated to CDA format.
             */
            _readDataCrosstab: function() {
                var dataTable = this._dataTable,
                    colCount = dataTable.getNumberOfColumns(),
                    rowCount = dataTable.getNumberOfRows();

                // Direct translation
                for(var tc = 0 ; tc < colCount ; tc++) {
                    addCdaMetadata(
                        this._metadata,
                        dataTable.getColumnId(tc),
                        dataTable.getColumnLabel(tc),
                        writeCccColumnDataType(dataTable.getColumnType(tc)));
                }

                var table = this._resultset = new Array(rowCount);
                for(var tr = 0; tr < rowCount; tr++) {
                    var row = new Array(colCount);

                    tc = -1;
                    while(++tc < colCount) row[tc] = this._dataTable.getCell(tr, tc);

                    table[tr] = row;
                }
            },

            _configure: function() {
                var options = this.options,
                    vizOptions = this._vizOptions;

                // By default hide overflow, otherwise,
                // resizing the window frequently ends up needlessly showing scrollbars.
                // TODO: is it ok to access "vizOptions.controller.domNode" ?
                vizOptions.controller.domNode.style.overflow = 'hidden'; // Hide overflow

                var colorScaleKind = this._getColorScaleKind();
                if(colorScaleKind) this._configureColor(colorScaleKind);

                if((this.options.legend = this._showLegend())) this._configureLegend();

                if(this._hasMultiChartColumns) this._configureMultiChart();

                this._configureTrends();
                this._configureSorts();
                this._configureFormats();
                this._configureLabels(options, vizOptions);

                options.axisFont = util.defaultFont(options.axisFont, 12);
                options.axisTitleFont = util.defaultFont(options.axisTitleFont, 12);

                if(!this._vizHelper.isInteractionEnabled()) {
                    options.interactive = false;
                } else {
                    if(options.tooltipEnabled) this._configureTooltip();

                    if((options.selectable = this._canSelect())) this._configureSelection();

                    this._configureDoubleClick();
                }
            },

            _getColorScaleKind: function() { return 'discrete'; },

            _configureColor: function(colorScaleKind) {
                var options = this.options,
                    vizOptions = this._vizOptions;

                switch(colorScaleKind) {
                    case 'discrete':
                        options.colors = this._getDiscreteColorScale();
                        break;

                    case 'continuous':
                        options.colorScaleType = vizOptions.colorScaleType;
                        options.colors = vizOptions.colors;
                        break;
                }
            },

            _getDiscreteColorScale: function() {
                var memberPalette = this._vizOptions.memberPalette,
                    colorScale = memberPalette && this._getDiscreteColorScaleCore(memberPalette);
                return colorScale || this._getDefaultDiscreteColorScale();
            },

            _getDefaultDiscreteColorScale: function() {
                return this._vizOptions.palette.colors.slice();
            },

            _getDiscreteColorScaleCore: function(memberPalette) {
                var colorRoleId = this._discreteColorRole;
                if(colorRoleId) {
                    // 1 - The CCC color role is not being explicitly set, so whatever goes to the series role is used by the color role
                    // 2 - When a measure discrim is used and there is only one measure, the CCC dim name of the discriminator is
                    //      not of the "series" group; so in this case, there's no discriminator in the key

                    var colorAxis = this.axisByRole[colorRoleId],
                        colorGems = (colorAxis
                            ? colorAxis.gemsByRole[colorRoleId]
                                  .filter(function(gem) { return !gem.isMeasureDiscrim; })
                            : []),
                        C = colorGems.length,
                        M;

                    if(this._cccClass == "PieChart") {
                        // When multiple measures exist,
                        // the pie chart shows them as multiple charts
                        // and if these would affect color,
                        // each small chart would have a single color.
                        M = 0;
                    } else {
                        M = this.axes.measure.genericMeasuresCount;
                    }

                    if(C > 0 || M > 0) {
                        // var keyIncludesDiscrim = (M > 1);
                        // var useMeasureGems = (C === 0) || (M > 1);

                        var isSunburst = this._cccClass === "SunburstChart",
                            colorMap;
                        if(M <= 1) {
                            if(C > 0) {
                                // Use color gems
                                if(isSunburst) {
                                    for(var i in colorGems) {
                                        var map = memberPalette[colorGems[i].formula];
                                        if(map) {

                                            // Instantiate ColorMap
                                            if(!colorMap) colorMap = {};

                                            // Copy map values to ColorMap
                                            // All color maps are joined together and there will be no
                                            // value collisions because the key is prefixed with the name
                                            // of the category
                                            for(var j in map) colorMap[j] = map[j];
                                        }
                                    }
                                } else {
                                    colorMap = memberPalette[colorGems[C - 1].formula];
                                }
                            } else {
                                // Use measures (M === 1)

                                /*
                                 * "[Measures].[MeasuresLevel]": {
                                 *    "[MEASURE:0]": "violet",
                                 *    "[MEASURE:1]": "orange"
                                 * }
                                 */

                                colorMap = memberPalette['[Measures].[MeasuresLevel]'];
                                var c = colorMap && colorMap[this.axes.measure.gems[0].id];
                                return c ? pv.colors([c]) : null;
                            }
                        } else {
                            // Use measures (M > 1)
                            // When C > 0, assumes the measure discriminator is always placed at the end:
                            //   "[Markets].[APAC]~[MEASURE:0]"
                            colorMap  = memberPalette['[Measures].[MeasuresLevel]'];
                        }

                        // Is there a color map for the chosen hierarchy?
                        if(colorMap || isSunburst) {
                            // Convert colorMap colors to pv.color.
                            for(var p in colorMap)
                                if(colorMap.hasOwnProperty(p))
                                    colorMap[p] = pv.color(colorMap[p]);

                            var defaultScale = pv.colors(this._getDefaultDiscreteColorScale()),
                                scaleFactory;
                            if(!isSunburst) {
                                scaleFactory = function() {
                                    return function(compKey) {
                                      if(compKey) {
                                            var keys = compKey.split("~"),
                                                key  = keys[keys.length - 1];
                                            return colorMap[key] || defaultScale(key);
                                        }
                                    };
                                };
                            } else {
                                // Sunburst Level 1 Wedge Key: "[Department].[VAL]"
                                // Sunburst Level 2 Wedge Key: "[Department].[VAL]~[Region].[USA]"
                                // colorMap= {
                                //  "[Region].[USA]" : "#FF00FF"
                                //  "[Department].[USA]" : "#AAFF00"
                                // }
                                scaleFactory = function() {
                                    return function(compKey) {
                                        if(compKey) {
                                            var keys     = compKey.split("~"),
                                                level    = keys.length - 1,
                                                keyLevel = keys[level];

                                            // Obtain color for most specific key from color map.
                                            // If color map has no color and it is the 1st level,
                                            //  then reserve a color from the default color scale.
                                            // Otherwise, return undefined,
                                            //  meaning that a derived color should be used.
                                            return def.getOwn(colorMap, keyLevel) ||
                                                (level ? undefined : defaultScale(keyLevel));
                                        }
                                    };
                                };
                            }

                            return function() {
                                return def.copy(scaleFactory(), defaultScale);
                            };
                        }
                    }
                }
            },

            _configureTrends: function() {
                var options = this.options,
                    vizOptions = this._vizOptions;

                var trendType = (this._supportsTrends ? vizOptions.trendType : null) || 'none';
                switch(trendType) {
                    case 'none':
                    case 'linear':
                        break;
                    default:
                        trendType = 'none';
                }

                options.trendType = trendType;
                if(trendType !== 'none') {
                    var trendName = vizOptions.trendName;
                    if(!trendName)
                        trendName = this._message('dropZoneLabels_TREND_NAME_' + trendType.toUpperCase());

                    options.trendLabel = trendName;

                    var value = vizOptions.trendLineWidth;
                    if(value !== undefined) {
                        var extPoints = options.extensionPoints;

                        extPoints.trendLine_lineWidth  = +value;      // + -> to number
                        var radius = 3 + 6 * ((+value) / 8); // 1 -> 8 => 3 -> 9,
                        extPoints.trendDot_shapeSize = radius * radius;
                    }
                }
            },

            _configureSorts: function() {
                var sliceOrder = this._vizOptions.sliceOrder;
                if(sliceOrder) this.options.sliceOrder = sliceOrder;
            },

            _configureFormats: function() {
                var fz = this._vizOptions.formatInfo;
                if(fz) {
                    var numberStyle = {
                        currency: fz.currencySymbol,
                        decimal:  fz.decimalPlaceholder,
                        group:    fz.thousandSeparator
                    };

                    this.options.format = {
                        number:  {style: numberStyle},
                        percent: {style: numberStyle, mask: this.options.format.percent}
                    };

                    var dims = this.options.dimensions,
                        meaAxis = this.axes.measure,
                        gemsByRole = meaAxis.gemsByRole;

                    def.eachOwn(meaAxis.boundRoles, function(one, roleName) {
                        // NOTE: As multiple measure gems can be in the same role (gem bar),
                        // and each measure role goes into a single CCC dimension (plus the measureDiscrim)
                        // (as when both Sales and Quantity are placed on the "Measure" gem bar),
                        // it follows that only the format of one of these can be specified.
                        var gem  = gemsByRole[roleName][0],
                            mask = fz[gem.id];
                        if(mask) {
                            var dimName = gem.cccDimName,
                                dim = dims[dimName] || (dims[dimName] = {});
                            dim.format = mask;
                        }
                    });
                }
            },

            _configureLabels: function(options, vizOptions) {
                var valuesAnchor  = vizOptions.labelsOption,
                    valuesVisible = !!valuesAnchor && valuesAnchor !== 'none';

                options.valuesVisible = valuesVisible;
                if(valuesVisible) {
                    this._configureLabelsAnchor(options, vizOptions);

                    options.valuesFont = util.defaultFont(util.readFont(vizOptions, 'label'));

                    if(this._useLabelColor)
                        options.extensionPoints.label_textStyle = vizOptions.labelColor;
                }
            },

            _configureLabelsAnchor: function(options, vizOptions) {
                options.valuesAnchor = vizOptions.labelsOption;
            },

            _configureMultiChart: function() {
                var options = this.options;

                // Let the vertical scrollbar show up if necessary
                var containerStyle = this._vizOptions.controller.domNode.style;
                containerStyle.overflowX = 'hidden';
                containerStyle.overflowY = 'auto';

                // Very small charts can't be dominated by text...
                //options.axisSizeMax = '30%';

                var titleFont = util.defaultFont(options.titleFont, 12);
                if(titleFont && !(/black|(\bbold\b)/i).test(titleFont))
                    titleFont = "bold " + titleFont;

                options.smallTitleFont = titleFont;

                var multiChartOverflow = this._vizOptions.multiChartOverflow;
                if(multiChartOverflow)
                    options.multiChartOverflow = multiChartOverflow.toLowerCase();
            },

            _configureTooltip: function() {
                var me = this;
                this.options.tooltipFormat = function(scene) {
                    return me._getTooltipText(scene.datum, this);
                };
            },

            _canSelect: function() {
                if(!this.options.selectable) return false;

                // Selection is disabled if 2 or more reportAxis='column' gems exist
                if(this._gemCountColumnReportAxis >= 2) return false;

                return true;
            },

            _configureSelection: function() {
                var me = this;
                this.options.userSelectionAction = function(cccSelections) {
                    return me._onUserSelection(cccSelections);
                };
                this.options.selectionChangedAction = function(cccSelections) {
                    me._onSelectionChanged(cccSelections);
                };
            },

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

            _showLegend: function() {
                if(!this.options.legend) return false;

                if(this.axes.measure.genericMeasuresCount > 1) return true;

                var colAxis = this.axes.column,
                    cccColDimGroup = this._rolesToCccDimensionsMap[colAxis.defaultRole];

                if(!cccColDimGroup || colAxis.realDepth > 0) return true;

                return false;
            },

            _configureLegend: function() {
                var options = this.options;

                options.legendFont = util.defaultFont(options.legendFont, 10);

                var legendPosition = options.legendPosition,
                    isTopOrBottom = legendPosition === 'top' || legendPosition === 'bottom';

                if(this._hasMultiChartColumns && !isTopOrBottom) {
                    options.legendAlignTo  = 'page-middle';
                    options.legendKeepInBounds = true; // ensure it is not placed off-page

                    // Ensure that legend margins is an object.
                    // Preseve already specifed margins.
                    // CCC's default adds a left or right 5 px margin,
                    // to separate the legend from the content area.
                    var legendMargins = options.legendMargins;
                    if(legendMargins) {
                        if(typeof(legendMargins) !== 'object')
                            legendMargins = options.legendMargins = {all: legendMargins};
                    } else {
                        legendMargins = options.legendMargins = {};
                        var oppositeSide = pvc.BasePanel.oppositeAnchor[legendPosition];
                        legendMargins[oppositeSide] = 5;
                    }

                    legendMargins.top = 20;
                }

                // Calculate 'legendAlign' default value
                if(!('legendAlign' in options))
                    options.legendAlign = isTopOrBottom ? 'center' : 'middle';
            },

            _parseDisplayUnits: function(displayUnits) {
                if(displayUnits) {
                    var match = displayUnits.match(/^UNITS_(\d+)$/);
                    if(match) {
                        // UNITS_0 -> 1
                        // UNITS_1 -> 100
                        // UNITS_2 -> 1000
                        // ...
                        var exponent = +match[1]; // >= 0  // + <=> Number( . )  conversion
                        if(exponent > 0) return Math.pow(10, exponent); // >= 100
                    }
                }

                return 1;
            },

            // Logic that depends on width and height
            _prepareLayout: function(options) {
                // TODO: Assumes vertical scrollbar!
                // Account for the width of the *possible* scrollbar
                if(this._hasMultiChartColumns && pv.renderer() !== 'batik')
                    options.width -= 17;
            },

            _render: function() {
                while(this._element.firstChild)
                    this._element.removeChild(this._element.firstChild);

                var ChartClass = pvc[this._cccClass];

                this._chart = new ChartClass(this.options);
                this._chart.setData({
                    metadata:  this._metadata,
                    resultset: this._resultset
                });

                this._chart.render();
            },

            /* INTERACTIVE - TOOLTIPS */

            _getTooltipText: function(complex, context) {
                var tooltipLines = [], msg;

                this._axesIds.forEach(function(axisId) {
                    this.axes[axisId].buildHtmlTooltip(tooltipLines, complex, context);
                }, this);

                if(!complex.isVirtual) {
                    msg = this._vizHelper.getDoubleClickTooltip();
                    if(msg) tooltipLines.push(msg);
                }

                /* Add selection information */
                // Not the data point count, but the selection count (a single column selection may select many data points).
                //var selectedCount = this._chart && this._chart.data.selectedCount();
                var selections = this._vizOptions.controller.highlights,
                    selectedCount = selections && selections.length;
                if(selectedCount) {
                    var msgId = selectedCount === 1 ?
                                'chartTooltipFooterSelectedSingle' :
                                'chartTooltipFooterSelectedMany';

                    msg = this._message(msgId, [selectedCount]);

                    tooltipLines.push(msg);
                }

                return tooltipLines.join('<br />');
            },

            /* INTERACTIVE - SELECTION */

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

                    key = selection.__cccKey = keys.join('||');
                }

                return key;
            },

            _doesSharedSeriesSelection: function() {
                return this._gemCountColumnReportAxis === 1;
            },

            _onSelectionChanged: function(selectedDatums) {

                if(!this.options.selectable) return;

                // Convert to array of analyzer cell or column selection objects
                var selectionExcludesMulti = this._selectionExcludesMultiGems(),
                    selections = [],
                    selectionsByKey = {};

                if(this._doesSharedSeriesSelection()) {
                    selectedDatums.forEach(function(datum) {
                        if(!datum.isVirtual) {
                            var selection = {type: 'column'};

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
                    vizEvents.trigger(this, "select", {
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
                var filterSelectionMaxCount = this._vizOptions['filter.selection.max.count'] || 200,
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

                    this._vizHelper.showConfirm(
                        [
                            'infoExceededMaxSelectionItems',
                            filterSelectionMaxCount
                        ],
                        'SELECT_ITEM_LIMIT_REACHED');
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
                 * this._gemCountColumnReportAxis :
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
                 *     // Datums whose series is 'Europe' or 'Australia',
                 *     // and whose category is 2001 or 2002
                 *     {series: ['Europe', 'Australia'], category: [2001, 2002]},
                 *
                 *     // Union'ed with
                 *
                 *     // Datums whose series is 'America'
                 *     {series: 'America'},
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

                    if(!this._gemCountColumnReportAxis) {
                        // Include axis="row" dimensions
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

            /* INTERACTIVE - DOUBLE-CLICK */

            _onDoubleClick: function(complex) {
                var selection = this._complexToCellSelection(complex, this._selectionExcludesMultiGems());
                vizEvents.trigger(this, "doubleclick", {
                    source:        this,
                    selections:    [selection]
                    // TODO: Analyzer needs to know whether this double click is coming from a chart data point or an axis.
                    // For axis use case, please identify the gembar and include only those gems that are in this gembar into the selection.
                    // For chart data point use case, please pass all gems across gembars into the selection
                    // gembar: rows
                });

                return true;
            },

            /* UTILITY */

            /**
             * Converts a complex to an analyzer cell selection.
             *
             * An analyzer cell selection has the following structure:
             * {
             *    type:     'cell',
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
                var selection = {type: 'cell'};

                /* Add each axis' formulas to the selection */
                this._axesIds.forEach(function(axisId) {
                    this.axes[axisId].fillCellSelection(selection, complex, selectionExcludesMulti);
                }, this);

                return selection;
            }
        });

    function addCdaMetadata(metadata, colName, colLabel, colType) {
        metadata.push({
            colIndex: metadata.length,
            colName:  colName,
            colLabel: colLabel,
            colType:  colType
        });
    }

    function writeCccColumnDataType(colType) {
        switch(colType) {
            case 'string': return 'STRING';
            case 'number': return 'NUMERIC';
        }

        throw new Error("Unsupported data type");
    }

    function splitColGroupAndMeasure(colGroupAndMeasure) {
        var sepIndex = colGroupAndMeasure.lastIndexOf('~');

        // MeasureName has precedence,
        // so we may end up with no column group value (and C = 0).
        return (sepIndex < 0)
            ? ['', colGroupAndMeasure]
            : [
                colGroupAndMeasure.substring(0, sepIndex),
                colGroupAndMeasure.substring(sepIndex + 1)
            ];
    }

    function getColumnRolesAndLevels(dataTable, tc) {
        var dataReq = dataTable.getColumnProperty(tc, 'dataReq');
        if(dataReq) {
            return def.array.to(dataReq).map(function(item) {
              // NOTE: in IE, unbound columns do not come with an "undefined" role id ??
                if(!item.id) item.id = 'undefined';
                return item;
            });
        }
    }
});
