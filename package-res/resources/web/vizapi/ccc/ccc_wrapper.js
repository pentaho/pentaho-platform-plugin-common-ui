pentaho = typeof pentaho != "undefined" ? pentaho : {};

// BEGIN Private Scope
(function(){

pentaho.ccc = pentaho.ccc || {};

pentaho.visualizations = pentaho.visualizations || [];

// TODO: this should belong to the base, as 'geo' depends on this too...
pentaho.visualizations.getById = function(id){
    for(var i = 0; i < this.length ; i++){
        if(this[i].id == id){
            return this[i];
        }
    }
    return null;
};

function defVisualization(viz){
    pentaho.visualizations.push(viz);
}

/*
 Visualization Metadata
 These objects describe the visualizations provided by this library.
 */
var lineStrokeStyle = '#A0A0A0', // #D8D8D8',// #f0f0f0
    baseBarChartArgs = {
    cccClass: 'pvc.BarChart', // Default
    
    legend: true,
    
    panelSizeRatio: 0.6,

    //axisOffset:  0.1,

    //yAxisPosition: 'left',
    yAxisSize:     100,
    yAxisFullGrid: true,
    yAxisEndLine:  true,
    yAxisDomainRoundMode: 'tick',
    yAxisDesiredTickCount: 10,

    xAxisFullGrid: true,
    xAxisSize:     100,
    xAxisEndLine:  true,
    xAxisDesiredTickCount: 10,
    xAxisDomainRoundMode: 'tick',

    extensionPoints: {
        yAxisRule_strokeStyle: lineStrokeStyle,
        yAxisEndLine_strokeStyle: lineStrokeStyle,
        yAxisGrid_strokeWidth:  "2px",
        yAxisGrid_strokeStyle:  lineStrokeStyle,

        xAxisRule_strokeStyle: lineStrokeStyle,
        xAxisEndLine_strokeStyle:  lineStrokeStyle,
        xAxisGrid_strokeWidth: "2px",
        xAxisGrid_strokeStyle: lineStrokeStyle
    },

    tipsySettings: {
        html: true,
        gravity: "c",
        fade: false,
        followMouse:true
    },

    seriesIncludeMeasures: true
};

var baseVertiBarChartArgs = pvc.create(baseBarChartArgs);
pvc.mergeOwn(baseVertiBarChartArgs, {
    legendPosition: 'right',
    legendAlign: 'top',

    // Inherit extension points also!
    extensionPoints: pvc.create(baseBarChartArgs.extensionPoints)
});

pvc.mergeOwn(baseVertiBarChartArgs.extensionPoints, {
    xAxisLabel_textAngle:    -Math.PI/6,
    xAxisLabel_textAlign:    "right",
    xAxisLabel_textBaseline: "top",
    yAxisTicks_strokeStyle:  lineStrokeStyle
});

// -----

var baseHorizBarChartArgs = pvc.create(baseBarChartArgs);
pvc.mergeOwn(baseHorizBarChartArgs, {
    orientation:   'horizontal',
    yAxisSize:       150,
    xAxisSize:       50,
    xAxisPosition: 'top',
    legendPosition: 'right',
    legendAlign:     'middle',
    
    // Inherit extension points also!
    extensionPoints: pvc.create(baseBarChartArgs.extensionPoints)
});

pvc.mergeOwn(baseHorizBarChartArgs.extensionPoints, {
    xAxisTicks_strokeStyle: '#D8D8D8'
});

// ----

defVisualization({
  id: 'ccc_bar',                          // unique identifier
  type: 'barchart',                       // generic type id
  source: 'CCC',                          // id of the source library
  name: 'CCC Column',                     // visible name, this will come from a properties file eventually
  'class': 'pentaho.ccc.CccChart',          // type of the Javascript object to instantiate
  args: pvc.mergeOwn(
            pvc.create(baseVertiBarChartArgs),
            {
            }),
  propMap: [],
  // dataReqs describes the data requirements of this visualization
  dataReqs: [
    {
      name: 'Default',
      reqs : createVizDataReq("Category", "Series", "Value")
    }
  ]
});

defVisualization({
  id: 'ccc_barstacked',
  type: 'barchart',
  source: 'CCC',
  name: 'CCC Stacked Column',
  'class': 'pentaho.ccc.CccChart',
  args: pvc.mergeOwn(
            pvc.create(baseVertiBarChartArgs),
            {
                stacked: true
            }),
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs : createVizDataReq("Category", "Series", "Value")
    }
  ]
});

defVisualization({
  id: 'ccc_horzbar',
  type: 'horzbarchart',
  source: 'CCC',
  name: 'CCC Bar',
  'class': 'pentaho.ccc.CccChart',
  args:  pvc.mergeOwn(
            pvc.create(baseHorizBarChartArgs),
            {
            }),
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs : createVizDataReq("Category", "Series", "Value")
    }
  ]
});

defVisualization({
  id: 'ccc_horzbarstacked',
  type: 'horzbarchart',
  source: 'CCC',
  name: 'CCC Stacked Bar',
  'class': 'pentaho.ccc.CccChart',
  args:  pvc.mergeOwn(
            pvc.create(baseHorizBarChartArgs),
            {
                stacked: true
            }),
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs : createVizDataReq("Category", "Series", "Value")
    }
  ]
});

defVisualization({
  id: 'ccc_barnormalized',
  type: 'barchart',
  source: 'CCC',
  name: 'CCC 100% Stacked Column',
  'class': 'pentaho.ccc.CccChart',
  args: pvc.mergeOwn(
            pvc.create(baseVertiBarChartArgs),
            {
                cccClass: 'pvc.NormalizedBarChart'
            }),
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs : createVizDataReq("Category", "Series", "Value")
    }
  ]
});

defVisualization({
  id: 'ccc_horzbarnormalized',
  type: 'horzbarchart',
  source: 'CCC',
  name: 'CCC 100% Stacked Bar',
  'class': 'pentaho.ccc.CccChart',
  args:  pvc.mergeOwn(
            pvc.create(baseHorizBarChartArgs),
            {
                cccClass: 'pvc.NormalizedBarChart'
            }),
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs : createVizDataReq("Category", "Series", "Value")
    }
  ]
});

defVisualization({
  id: 'ccc_line',
  type: 'linechart',
  source: 'CCC',
  name: 'CCC Line',
  'class': 'pentaho.ccc.CccChart',
  args: {
    cccClass: 'pvc.LineChart',
    stacked: false,
    orientation: 'vertical',
    showDots: true,
    extensionPoints: {
      xAxisLabel_textAngle: -1,
      xAxisLabel_textAlign: "right",
      xAxisLabel_textBaseline: "top"
    }
  },
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs:[
        {   id: 'rows',
          dataType: 'string',
          dataStructure: 'column',
          caption: 'Category',
          required: true
        },
        {   id: 'measures',
          dataType: 'number',
          dataStructure: 'column',
          caption: 'Values',
          required: true,
          allowMultiple: true
        }
      ]
    }
  ]
});

defVisualization({
  id: 'ccc_area',
  type: 'areachart',
  source: 'CCC',
  name: 'CCC Area',
  'class': 'pentaho.ccc.CccChart',
  args: {
    cccClass: 'pvc.StackedAreaChart',
    stacked: true,
    orientation: 'vertical',
    showDots: false
  },
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs :[
        {   id: 'rows',
          dataType: 'string',
          dataStructure: 'column',
          caption: 'Category',
          required: true
        },
        {   id: 'measures',
          dataType: 'number',
          dataStructure: 'column',
          caption: 'Values',
          required: true,
          allowMultiple: true
        }
      ]
    }
  ]
});

defVisualization({
  id: 'ccc_scatter',
  type: 'scatter',
  source: 'CCC',
  name: 'CCC Scatter',
  'class': 'pentaho.ccc.CccChart',
  args: {
    cccClass: 'pvc.MetricDotChart',
    showDots: true,
    yAxisSize: 30,
    xAxisSize: 30,
    xAxisFullGrid: true,
    yAxisFullGrid: true
  },
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs :[
        {   id: 'rows',
          dataType: 'string',
          dataStructure: 'column',
          caption: 'Category',
          required: true
        },
        {   id: 'x',
          dataType: 'number',
          dataStructure: 'column',
          caption: 'X Axis',
          required: true,
          allowMultiple: false
        },
        {   id: 'y',
          dataType: 'number',
          dataStructure: 'column',
          caption: 'Y Axis',
          required: true,
          allowMultiple: true
        }
      ]
    }
  ]
});

defVisualization({
  id: 'ccc_pie',
  type: 'piechart',
  source: 'CCC',
  name: 'CCC Pie Chart',
  'class': 'pentaho.ccc.CccChart',
  args: {
    cccClass: 'pvc.PieChart'
  },
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs :[
        {   id: 'rows',
          dataType: 'string',
          dataStructure: 'column',
          caption: 'Slices',
          required: true
        },
        {   id: 'measures',
          dataType: 'number',
          dataStructure: 'column',
          caption: 'Values',
          required: true
        }
      ]
    }
  ]
});

defVisualization({
  id: 'ccc_heatgrid',
  type: 'heatgrid',
  source: 'CCC',
  name: 'Heat Grid',
  'class': 'pentaho.ccc.CccChart',

  args: {
    cccClass: 'pvc.HeatGridChart',
    crosstabMode: true,
    normPerBaseCategory: false,
    showXScale: true,
    xAxisPosition: "bottom",
    showYScale: true,
    yAxisPosition: "left",

    seriesInRows: false,

    timeSeries: false,
    panelSizeRatio: 0.8,
    orientation: "vertical",
    showValues: false,
    valuesAnchor: "right",
    titlePosition: "top",
    titleSize: 25,
    xAxisSize: 30,
    yAxisSize: 50,
    xAxisFullGrid: false,
    yAxisFullGrid: false,
    orthoAxisOrdinal: false,
    scalingType: "linear",
    numSD: 2,
    nullColor: "#efc5ad",
    extensionPoints: [],
    useShapes: true,
    shape: 'square',
    isMultiValued: true,
    useCompositeAxis:true,
    colorValIdx: 0,
    sizeValIdx:  1,
    ctrlSelectMode: false,
    tipsySettings: {
        html: true,
        gravity: "c",
        fade: false,
        followMouse:true,
        opacity: 1
    }
  },
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs :[
        {
            id: 'rows',
            dataType: 'string',
            dataStructure: 'row',
            caption: 'X-Axis',
            required: true,
            allowMultiple: true
        },
        {
            id: 'columns',
            dataType: 'string',
            dataStructure: 'column',
            caption: 'Y-Axis',
            required: true,
            allowMultiple: true
        },
        {
            id: 'color',
            dataType: 'number',
            dataStructure: 'column',
            caption: 'Color By',
            required: true,
            allowMultiple: false
        },
        {
            id: 'size',
            dataType: 'number',
            dataStructure: 'column',
            caption: 'Size By',
            required: false,
            allowMultiple: false
        },
        {
          id: 'pattern',
          dataType: 'string',
          values: ["GRADIENT", "3-COLOR", "5-COLOR"],
          ui: {
            labels: ["Gradient", "3 Steps", "5 Steps"],
            group: "options",
            type: 'combo',
            caption: "Pattern"
          }
        },

        {
          id: 'colorSet',
          dataType: 'string',
          values: ["ryg", "ryb", "blue", "gray"],
          ui: {
            labels: ["Red, Yellow, Green", "Red, Yellow, Blue", "Blue Scale", "Gray Scale"],
            group: "options",
            type: 'combo',
            caption: "Color"
          }
        },


        {
          id: 'reverseColors',
          dataType: 'boolean',
          ui: {
            label: "Reverse Colors",
            group: "options",
            type: 'checkbox'
          }
        },
        {
          id: 'shape',
          dataType: 'string',
          values: ["square", "circle"],
          ui: {
            labels: ["Square", "Circle"],
            group: "options",
            type: 'combo',
            caption: "Shape"
          }
        }
      ]
    }
  ]
});


defVisualization({
  id: 'ccc_bulletchart',
  type: 'bulletchart',
  source: 'CCC',
  name: 'Bullet Chart',
  'class': 'pentaho.ccc.CccChart',

  args: {
    cccClass: 'pvc.BulletChart',
    crosstabMode: true,
    showValues: true,
    showXScale: true,
    xAxisPosition: "bottom",
    showYScale: true,
    yAxisPosition: "left",
    legendPosition: "bottom",
    seriesInRows: true,
    

    bulletTitle: 'Test for title',
    bulletSubtitle: 'Test for subtitle',
    bulletMeasures: [],

    // TODO: Constant bullets markers and ranges?
    bulletMarkers: ["7500"],
    bulletRanges:  ["3000", "6500", "9000"],

    bulletMargin: 50,

    timeSeries: false,
    timeSeriesFormat: "%Y-%m-%d",
    panelSizeRatio: 0.8,
    orientation: "vertical",
    valuesAnchor: "right",
    titlePosition: "top",
    titleSize: 25,
    xAxisSize: 30,
    yAxisSize: 50,
    xAxisFullGrid: false,
    yAxisFullGrid: false,
    orthoAxisOrdinal: false,
    scalingType: "linear",
    numSD: 2,

    extensionPoints: [["bulletRuleLabel_font","7pt sans"]],
    normPerBaseCategory: true,
    useShapes: true,
    useCompositeAxis:true
  },
  propMap: [],
  dataReqs: [
    {
      name: 'Default',
      reqs :[
        {
            id: 'rows',
            dataType: 'string',
            dataStructure: 'row',
            caption: 'Across',
            required: true
        },
        {
            id: 'columns',
            dataType: 'string',
            dataStructure: 'column',
            caption: 'Down',
            required: true
        },
        {
            id: 'measures',
            dataType: 'number',
            dataStructure: 'column',
            caption: 'Values',
            required: true
        }
      ]
    }
  ]
});

/*
 CccChart constructor
 Takes an HTML DOM element as a parameter
 */
pentaho.ccc.CccChart = function(element) {
    /**
    * The axes' names.
    * NOTE that they are in the order to be tested
    * for being chosen as the drilling axis.
    */
    this._keyAxes = ['column', 'row'];
    
    // _allAxes includes the non-key 'measure' axis
    this._allAxes = this._keyAxes.slice(0);
    this._allAxes.push('measure');
    
    this._element = element;
    this._elementName = element.id;

    this._cdaTable = null;  // CDA DataTable
    this._metadata  = null;
    this._resultset = null;

    this._dataTable = null; // Analyzer DataTable
    
    this._rowDtColIndexes = null;
    this._otherDtColIndexes = null;
    
    this._vizOptions  = null;
    this._originalVizOptions = null;
    this._dataOptions = null;

    this._selections = null;

    this._currentChartType = null;

    this._colors = null;
    this._title = null;
}

/*
 draw()

 dataTable   a pentaho.DataTable object with the data to display
 vizOptions  the options for the visualization
 */
pentaho.ccc.CccChart.prototype.draw = function(dataTable, vizOptions) {
    // Reset support fields
    this._metadata  = [];
    this._resultset = [];
    this._cdaTable = null;

    this._colors = null;

    // ----------------------
    
    this._dataTable  = dataTable;
    this._crossTable = null;
    
    this._rowDtColIndexes = null;
    this._otherDtColIndexes = null;

    // ----------------------
    
    this._vizHelper = cv.pentahoVisualizationHelpers[vizOptions.customChartType];
    
    this._initializeOptions(vizOptions);

    this._initializeAxesMetadata();

    this._buildCrossTable();

    this._readData();

    this._prepareOptions();

    this._renderChart();
};

/*
 * INIT OPTIONS
 */

pentaho.ccc.CccChart.prototype._initializeOptions = function(vizOptions){
    // Store a copy of the incoming parameters, for later use, in #resize
    this._originalVizOptions = $.extend({}, vizOptions);

    // Make a copy
    vizOptions = this._vizOptions = $.extend({}, vizOptions);

    // Recover non user-overriden chart args extension points
    // * userDefinedProperties smash chart args' extension points...
    var chartArgsExtPoints = this.controller.currentViz.args.extensionPoints;
    if(chartArgsExtPoints){
        var vizExtPoints = vizOptions.extensionPoints;
        vizOptions.extensionPoints = pvc.mergeOwn(
                                        pvc.create(chartArgsExtPoints),
                                        vizExtPoints);
    }

    // store the current highlighted selections
    this._selections = vizOptions.selections;

    return vizOptions;
};

/*
 * INIT METADATA
 */

// -------------
// Axis are: row, column and measure.
function AxisInfo(axis, formulaInfos){
    this.id = axis;

    this.formulasInfo = formulaInfos;
    
    this.depth = this.formulasInfo.length;

    this.formulas = this.formulasInfo.map(function(formInfo){
        // Ovewrite axis id with corresponding AxisInfo instance
        formInfo.axis = this;

        return formInfo.formula;
    }, this);

    /**
     * Map of axis values to labels.
     */
    this.valueLabel = {};
}

AxisInfo.prototype.getAxisLabel = function(){
    return this.formulasInfo.map(function(formInfo){ return formInfo.label; }, this)
                .join(" and "); // TODO localize
};

pentaho.ccc.CccChart.prototype._initializeAxesMetadata = function(){
    var myself = this;

    /**
     * Index of FormulaInfo by formula:
     *   formula -> formulaInfo
     *
     * Filled by #indexFormula declared below.
     */
    this._formulasInfo = {};
    
    /**
     * Create an AxisInfo for each axis.
     *
     * Index AxisInfo by axis: axis -> AxisInfo.
     *
     * Index FormulaInfo by formula and id.
     *
     * Create CHART axis field:
     *   this._rowAxis     = ...
     *   this._columnAxis  = ...
     *   this._measureAxis = ...
     */
    this._allAxesInfo = pv.dict(this._allAxes, function(axis){
        var axisInfo = new AxisInfo(axis, myself._vizHelper.getAxisFormulasInfo(axis));
        
        myself["_" + axisInfo.id + "Axis"] = axisInfo;

        axisInfo.formulasInfo.forEach(indexFormula, myself);
        
        return axisInfo;
    });
    
    /* @instance */
    function indexFormula(formInfo){
        var form = formInfo.formula,
            id   = formInfo.id;

        // NOTE: when interaction is disabled...formula and id aren't available in every axis type...
        
        // Index by formula
        if(form){
            this._formulasInfo[form] = formInfo;
        }

        if(id && form !== id){
            assert(formInfo.axis.id === 'measure', "Must be a measure");

            // Index ALSO by formula id.
            this._formulasInfo[id] = formInfo;
        }
    }

    // The chart title is the conjuction of every row axis formula's label.
    this._title = this._rowAxis.getAxisLabel();
};

pentaho.ccc.CccChart.prototype._buildCrossTable = function(){
    
    // row := {
    //   keyValues: row values Array,
    //   children: [],
    //   childrenByKey: joinedKeyVals -> {
    //      keyValues: column values Array,
    //
    //      measures: [
    //          {v: measure 0 value, f: formatted value},
    //          ...
    //      ]
    //   }
    // };
    
    var dataTable  = this._dataTable,
        dtColCount = dataTable.getNumberOfColumns(),
        dtRowCount = dataTable.getNumberOfRows();
    
    assert(dtColCount > 0, "DataTable must have at least one column");

    // Indexes of DataTable columns with the values of row axis formulas
    // By construction: the first R columns.
    this._rowDtColIndexes  = pv.range(this._rowAxis.depth);

    assert(this._rowDtColIndexes.length > 0, "There must exist at least one row axis formula.");

    // All other columns (!row axis formulas)
    this._otherDtColIndexes = pv.range(this._rowAxis.depth, dtColCount);

    // -------------
    
    this._crossTable = {
        children:      [],
        childrenByKey: {}
    };
    
    if(dtRowCount === 0){
        return;
    }
    
    var otherDtColsInfo = this._otherDtColIndexes.map(function(tc){
        var dtColId = this._dataTable.getColumnId(tc),
            dtColParts = dtColId.split('~'),
            colValsJoined,
            meaId;
            
        if(dtColParts.length > 1){
            meaId = dtColParts.pop();
            colValsJoined = dtColParts.join('~');
        } else {
            meaId = dtColParts[0];
            colValsJoined = '';
        }
        
        // Obtain the formula corrsponding to the id.
        var meaIndex = this._formulasInfo[meaId].index;

        // Store labels for each value of a formula in the columns axis
        if(colValsJoined){
            // Includes measure, but we don't use it
            var joinedLabels = dataTable.getColumnLabel(tc),
                colLabels = joinedLabels.split("~");

            if(colLabels.length > 1){
                colLabels.pop();
            }

            dtColParts.forEach(function(colVal, level){
                this._columnAxis.valueLabel[colVal] = colLabels[level];
            }, this);

            // Also allow getting a label for the joined value.
            // Depending on the chart, the joined value or
            // the component values are used for obtaining labels.
            this._columnAxis.valueLabel[colValsJoined] = colLabels.join(" ~ ");
        }

        return {
            column: tc,
            measureIndex: meaIndex,
            keyValues: dtColParts,
            key: colValsJoined
        };
    }, this);

    // Also, collect the label of each row value
    for(var tr = 0 ; tr < dtRowCount ; tr++){
        var rowLabels = [],
            rowVals = this._rowDtColIndexes.map(function(tc){
            var rowVal = this._getTableValue(tr, tc),
                rowLabel = rowVal == null ?
                            "-" :
                            dataTable.getFormattedValue(tr, tc);

            this._rowAxis.valueLabel[rowVal] = rowLabel;
            rowLabels.push(rowLabel);
            
            return rowVal;
        }, this);

        var crossRow = {
            key:       rowVals.join('~'),
            keyValues: rowVals,
            children:      [],
            childrenByKey: {}
        };

        // Also allow getting a label for the joined value.
        // Depending on the chart, the joined value or
        // the component values are used for obtaining labels.
        this._rowAxis.valueLabel[crossRow.key] = rowLabels.join(" ~ ");

        this._crossTable.children.push(crossRow);
        this._crossTable.childrenByKey[crossRow.key] = crossRow;
        
        otherDtColsInfo.forEach(function(dtColInfo){
            var crossCol = crossRow.childrenByKey[dtColInfo.key];
            if(!crossCol){
                crossCol = {
                    key:       dtColInfo.key,
                    keyValues: dtColInfo.keyValues,
                    measures:  []
                };

                crossRow.children.push(crossCol);
                crossRow.childrenByKey[crossCol.key] = crossCol;
            }

            var tc = dtColInfo.column,
                value = this._getTableValue(tr, tc);
            
            var measure = {
                v: value,
                f: value == null ? "-" : dataTable.getFormattedValue(tr, tc)
            };

            crossCol.measures[dtColInfo.measureIndex] = measure;
        }, this);
    }
};

pentaho.ccc.CccChart.prototype._getAxisValueLabel = function(axis, value){
    switch(axis){
        case 'column':  return this._columnAxis.valueLabel[value];
        case 'row':     return this._rowAxis.valueLabel[value];
        case 'measure': return value.f; // Must be a measure cell!
    }
    throw new Error("Invalid axis: '" + axis + "'");
};

/* DataTable related */
pentaho.ccc.CccChart.prototype._getTableValue = function(tr, tc) {
    var value = this._dataTable.getValue(tr, tc);
    return value === '-' ? null : value;
};

/*
 * READ DATA
 */

pentaho.ccc.CccChart.prototype._readData = function() {
    // Create the data options for the chart
    this._dataOptions = {
        crosstabMode: !!this._vizOptions.crosstabMode,
        seriesInRows: false
    };

    switch(this._vizOptions.cccClass){
        case 'pvc.HeatGridChart':
            this._readDataHeatGrid();
            break;

        case 'pvc.BarChart':
        case 'pvc.NormalizedBarChart':
        case 'pvc.LineChart':
        case 'pvc.StackedAreaChart':
            this._readDataRelational();
            break;

        case 'pvc.MetricDotChart':
            // All numeric value columns
            this._readDataCrosstabSingleCategory();
            break;

        case 'pvc.PieChart':
            assert(this._otherDtColIndexes.length === 1, "Only one series supported");
            // Single numeric value column
            this._readDataCrosstabSingleCategory();
            break;

        case 'pvc.BulletChart':
            this._readDataBullet();
            break;
    }

    // Create the CDA table
    this._cdaTable = {
        metadata:  this._metadata,
        resultset: this._resultset
    };
};

/**
 * Creates a CCC resultset in pure CROSSTAB format.
 *
 * Data passes through as it comes, being simply translated to CDA format.
 */
pentaho.ccc.CccChart.prototype._readDataCrosstab = function() {
    var dataTable = this._dataTable,
        colCount = dataTable.getNumberOfColumns(),
        rowCount = dataTable.getNumberOfRows();

    // Direct translation
    for(var tc = 0 ; tc < colCount ; tc++){
        this._addCdaMetadata(
                dataTable.getColumnId(tc),
                dataTable.getColumnLabel(tc),
                writeCccColumnDataType(dataTable.getColumnType(tc)));
    }

    this._resultset = createTable(rowCount, colCount, this._getTableValue, this);
};

/**
 * Creates a CDA resultset in CROSSTAB format
 * with a single aggregated category column.
 * 
 * 1    - Category - aggregated row axis columns
 * 2..N - Series X - value of 'other' columns
 */
pentaho.ccc.CccChart.prototype._readDataCrosstabSingleCategory = function(){
    var dataTable = this._dataTable,
        rowCount = dataTable.getNumberOfRows();
        
    // Add the aggregate category column metadata
    this._addCdaMetadata('Categories', this._title, 'STRING');

    // Add the numeric columns metadata
    this._otherDtColIndexes.forEach(function(tc){
        //assert(writeCccColumnDataType(dataTable.getColumnType(tc)) === 'NUMERIC');

        this._addCdaMetadata(
                dataTable.getColumnId(tc),
                dataTable.getColumnLabel(tc),
                writeCccColumnDataType(dataTable.getColumnType(tc)));
    }, this);

    // Build the rows
    for(var tr = 0 ; tr < rowCount ; tr++){

        var row = [this._aggregateRowAxisForTableRow(tr)];

        // Add other columns' values
        this._otherDtColIndexes.forEach(function(tc){
            row.push(this._getTableValue(tr, tc));
        }, this);

        this._resultset.push(row);
    }
};

/**
 * Creates a CDA resultset in a single-value RELATIONAL format.
 * Only rows with a non-null value are added to the resultset.
 * 
 * 1 - Category - aggregated row axis columns
 * 2 - Series   - label of 'other' DataTable columns
 * 3 - Value    - value of corresponding 'other' DataTable column
 */
pentaho.ccc.CccChart.prototype._readDataRelational = function() {
    // format the data for a BarChart, LineChart, or StackedAreaChart

     var dataTable = this._dataTable,
         rowCount = dataTable.getNumberOfRows();

    var seriesCount = this._otherDtColIndexes.length;

    // Take the first seriesCount colors from the palette
    this._colors = this._vizOptions.palette.colors.slice(0, seriesCount);

    // Create the metadata
    this._addCdaMetadata('Series',   'Series',   'STRING');
    this._addCdaMetadata('Category', 'Category', 'STRING');
    this._addCdaMetadata('Value',    'Value',    'NUMERIC');

    if(rowCount > 0){
        var seriesLabels = this._otherDtColIndexes.map(function(tc){
            return dataTable.getColumnLabel(tc);
        });

        // process the rows
        for(var tr = 0; tr < rowCount ; tr++) {

            var category = this._aggregateRowAxisForTableRow(tr);

            for(var i = 0 ; i < seriesCount ; i++){
                var tc = this._otherDtColIndexes[i];

                var value = this._getTableValue(tr, tc);
                if(value != null){
                    this._resultset.push([
                        seriesLabels[i],
                        category,
                        value
                    ]);
                }
            }
        }
    }
};

/**
 * Creates a CCC resultset in pure CROSSTAB format.
 * Fills data-related options.
 */
pentaho.ccc.CccChart.prototype._readDataHeatGrid = function(){
    this._readDataCrosstab();

    var measureCount = this._measureAxis.depth;

    // Clear size and color indexes,
    //  if there aren't enough measures.
    // TODO
    if(measureCount < 2){
        this._vizOptions.sizeValIdx = null;
        if(measureCount < 1){
            this._vizOptions.colorValIdx = null;
        }
    }
    
    // Update data options
    this._dataOptions.dataOptions = {
        categoriesCount: this._rowAxis.depth,

        // Whenever there are measures,
        //  they are mixed in the columns
        measuresInColumns: measureCount > 0
    };
};

/**
 * Creates a CDA resultset in a custom RELATIONAL format.
 *
 * 1    - Category - aggregated row axis columns
 * 2    - Series   - label of 'other' DataTable columns
 * 3    - Value    - numeric value of corresponding 'other' DataTable column
 * 4    - Marker   - marker numeric value of corresponding 'other' DataTable column
 * 5..R - Range r  - range numeric value, taken from vizOptions.bulletRanges
 */
pentaho.ccc.CccChart.prototype._readDataBullet = function() {
    var dataTable   = this._dataTable,
        rowCount    = dataTable.getNumberOfRows(),
        measureCols = this._otherDtColIndexes,
        seriesCount = this._otherDtColIndexes.length,
        vizOptions  = this._vizOptions;

    this._dataOptions.seriesInRows = true;

    this._addCdaMetadata('Category', 'Category', 'STRING' );
    this._addCdaMetadata('Series',   'Series',   'STRING' );
    this._addCdaMetadata('Value',    'Value',    'NUMERIC');
    this._addCdaMetadata('Marker',   'Marker',   'NUMERIC');

    if (vizOptions.bulletRanges) {
        for (var i = 0, R = vizOptions.bulletRanges.length; i < R ; i++){
            this._addCdaMetadata('Range'  + i, 'Range ' + i, 'NUMERIC');
        }
    }
    
    var measuresCount = this._measureAxis.depth;

    // Process the rvar measuresCount = this._measureAxis.depth;ows
    for(var tr = 0 ; tr < rowCount ; tr++){
      
        var category = this._aggregateRowAxisForTableRow(tr);

        for(var s = 0 ; s < seriesCount ; s += measuresCount) {
            // Measures should be defined in pairs
            // Each Value measure followed by a Marker measure:
            //  <ValueMeasure1, MarkerMeasure1>,
            //  <ValueMeasure2, MarkerMeasure2>,
            //  ...
            //  <ValueMeasureN [, MarkerMeasureN]>
            for(var m = 0 ; m < measuresCount ; m += 2) {
                var valueColIndex  = s + m,
                    markerColIndex = valueColIndex + 1,
                    tc = measureCols[valueColIndex],
                    dtColParts = dataTable.getColumnId(tc).split('~');

                dtColParts.pop();
                
                var row = [
                        // Normal relational part
                        category, // aggregated category
                        dtColParts.join('~'), // series label
                        this._getTableValue(tr, tc),  // series value - may be null...is it ok?

                        // Marker - may be missing on the last measure pair
                        m + 1 < measuresCount ?
                            this._getTableValue(tr, measureCols[markerColIndex]) :
                            vizOptions.bulletMarkers[0] // TODO: 7500
                    ];

                // Dynamic columns
                var bulletRanges = vizOptions.bulletRanges;
                if (bulletRanges){
                    bulletRanges.forEach(function(rangeValue){
                        row.push(rangeValue);
                    });
                }

                this._resultset.push(row);
            }
        }
    }
};

pentaho.ccc.CccChart.prototype._aggregateRowAxisForTableRow = function(tr) {
    // Concat all of the string columns
    var values = this._rowDtColIndexes.map(function(tc){
        return this._getTableValue(tr, tc);
    }, this);

    return values.join('~');
};

pentaho.ccc.CccChart.prototype._addCdaMetadata = function(colName, colLabel, colType) {
    this._metadata.push({
        colIndex: this._metadata.length,
        colName:  colName,
        colLabel: colLabel,
        colType:  colType
    });
};


/*
 * PREPARE OPTIONS
 */

pentaho.ccc.CccChart.prototype._prepareOptions = function(){
    var vizOptions = this._vizOptions;

    var myself = this;
    var options = this.options = {
        canvas:  this._elementName,
        animate: false,

        legend:  true,
        legendPosition: "bottom",
        
        titlePosition:  "top",

        showTooltips: true,
        showValues:   false,

        clickable:    true,
        selectable:   true,
        
        title:  this._title == "" ? null : this._title,
        colors: this.getColors(),

        clickAction: null,

        mouseOverAction: function(){},

        mouseUpAction: function(){},

        getCategoryLabel: function(value){
            return myself._getAxisValueLabel('row', value);
        },

        getSeriesLabel: function(value){
            return myself._getAxisValueLabel('column', value);
        }
    };

    // NOTE: When interaction is disabled, these come undefined...
    vizOptions.height = vizOptions.height || 300;
    vizOptions.width  = vizOptions.width  || 300;
        
    // ------------
    
    // Vertical Margin
    // @see #_renderChart
    this._vMargin = Math.round(0.06 * vizOptions.height);
    vizOptions.height -= this._vMargin;

    // ------------

    switch(this._vizOptions.cccClass){
        case 'pvc.HeatGridChart':
            this._prepareOptionsHeatGrid();
            this._prepareLayoutHeatGrid();
            break;

        case 'pvc.BulletChart':
            this._prepareOptionsBullet();
            this._prepareLayoutBullet();
            break;

        case 'pvc.BarChart':
        case 'pvc.NormalizedBarChart':
            this._prepareOptionsBar();
            break;
    }

    // --------------------
    
    // Copy options from the visualization metadata to the chart options
    for(var x in vizOptions){
        if(!this._shouldSkipVizOption(x)){
            var v = vizOptions[x];

            // Change 'x' and/or 'v'
            switch(x){
                case 'legendPosition':
                    v = v && v.toLowerCase();
                    break;

                case 'showLegend':
                    v = (('' + v) === 'true');
                    break;

                case 'legendSize':
                case 'lineWidth':
                    v = parseFloat(v);
                    break;
            }

            options[x] = v;
        }
    }

    if(!this._vizHelper.isInteractionEnabled()){
        options.showTooltips = false;
        options.clickable    = false;
        options.selectable   = false;
    }

    // Calculate 'legendAlign' default value
    if(!('legendAlign' in options)){
        var legendPosition = options.legendPosition;

        if(legendPosition === 'top' || legendPosition === 'bottom'){
            options.legendAlign = 'center';
        } else {
            options.legendAlign = 'middle';
        }
    }

    var vizExtPoints = vizOptions.extensionPoints;
    if(vizExtPoints){
        var extPoints = options.extensionPoints = {};
        for(var y in vizExtPoints) {
            extPoints[y] = vizExtPoints[y];
        }
    }
};


pentaho.ccc.CccChart.prototype._prepareOptionsHeatGrid = function() {
    var myself = this,
        options = this.options;

    options.selectionChangedAction = function(cccSelections){
        myself._notifyCccSelectionChanged(cccSelections);
    };

    // Drill down on shapes
    options.doubleClickAction = function(s, c){
        return myself._drillDown(myself._readCccAxesValues(s, c));
    };

    // Drill down on y axis
    options.yAxisDoubleClickAction = function (d){
        return myself._drillDown(myself._readCccAxesValues(d.path, null));
    };

    // Drill down on x axis
    options.xAxisDoubleClickAction = function (d) {
        return myself._drillDown(myself._readCccAxesValues(null, d.path));
    };
    
    options.customTooltip = function(s, c){
        return myself._getTooltipText(myself._readCccAxesValues(s, c));
    };
};

pentaho.ccc.CccChart.prototype._prepareLayoutHeatGrid = function() {
    var vizOptions = this._vizOptions;

    // TODO: is it ok to access "vizOptions.controller.domNode" ?
    vizOptions.controller.domNode.style.overflow = 'hidden'; // Hide overflow

    var measureCount = this._measureAxis.depth,
        catsDepth    = this._rowAxis.depth,
        sersDepth    = this._columnAxis.depth,
        catsBreadth  = Math.max(1, this._dataTable.getNumberOfRows() - 1),
        sersBreadth  = this._dataTable.getNumberOfColumns() - catsDepth;

    if(measureCount > 0){
        sersBreadth /= measureCount;
    }

    var width  = vizOptions.width,
        height = vizOptions.height,
        currRatio = width / height,
        xyChartRatio = catsBreadth / sersBreadth;

    // Min desirable sizes according to depth
    var MAX_AXIS_SIZE    = 300,
        MIN_LEVEL_HEIGHT = 70,
        MAX_LEVEL_HEIGHT = 200,
        MAX_AXIS_RATIO   = 0.35;

    var minXAxisSize = Math.min(MAX_AXIS_SIZE, catsDepth * MIN_LEVEL_HEIGHT),
        minYAxisSize = Math.min(MAX_AXIS_SIZE, sersDepth * MIN_LEVEL_HEIGHT),
        maxXAxisSize = Math.min(MAX_AXIS_SIZE, catsDepth * MAX_LEVEL_HEIGHT, height * MAX_AXIS_RATIO),
        maxYAxisSize = Math.min(MAX_AXIS_SIZE, sersDepth * MAX_LEVEL_HEIGHT, width  * MAX_AXIS_RATIO);

    var xAxisSize,
        yAxisSize;
    if(xyChartRatio > currRatio){ // lock width
        var extraHeight = height - width / xyChartRatio;

        yAxisSize = minYAxisSize;

        xAxisSize = Math.min(extraHeight, maxXAxisSize);
        xAxisSize = Math.max(xAxisSize,   minXAxisSize);
    } else if (xyChartRatio < currRatio){ // lock height
        var extraWidth = width - height * xyChartRatio;

        xAxisSize = minXAxisSize;

        yAxisSize = Math.min(extraWidth, maxYAxisSize);
        yAxisSize = Math.max(yAxisSize,  minYAxisSize);
    }

    // ------------------

    // Update Axes sizes
    vizOptions.xAxisSize = xAxisSize;
    vizOptions.yAxisSize = yAxisSize;
};


pentaho.ccc.CccChart.prototype._prepareOptionsBar = function() {
    var myself = this,
        options = this.options;

    options.customTooltip = function(s, c){
        return myself._getTooltipText(myself._readCccAxesValues(s, c));
    };

    // Use selection event handler instead of clickAction
    options.selectionChangedAction = function(cccSelections){
        myself._notifyCccSelectionChanged(cccSelections);
    };
    
    // Drill down on shapes
    options.doubleClickAction = function(s, c){
        if(myself._drillDown(myself._readCccAxesValues(s, c))){
            // TODO really needed?
            // needed for content linking
            // onDoubleClickHeatGrid.call(this, s, c);
        }
    };
};


pentaho.ccc.CccChart.prototype._prepareOptionsBullet = function() {
    var myself = this,
        options = this.options;

    options.legend = false;
    
     // Drill down on shapes
    options.axisDoubleClickAction = function(d){
        var c = d.title,
            s = d.subtitle;

        if(myself._drillDown(myself._readCccAxesValues(s, c))){
            // TODO really needed?
            // needed for content linking
            // onDoubleClickHeatGrid.call(this, s, c);
        }
    };
    
    options.clickAction = function (c, s) {
        myself._notifySelectionChanged(
            [ myself._convertKeysSelectionCccToAnalyzer(s, c) ]);
    };
};

pentaho.ccc.CccChart.prototype._prepareLayoutBullet = function(){
    var vizOptions = this._vizOptions;

    var isVertical = vizOptions.orientation == 'vertical';
    if (this._resultset.length > 20) {
        vizOptions.bulletSize = 10;
        vizOptions.bulletSpacing = isVertical ? 60 : 20;
    } else if (this._resultset.length > 10) {
        vizOptions.bulletSize = 15;
        vizOptions.bulletSpacing = isVertical ? 80 : 30;
    } else {
        vizOptions.bulletSize = 20;
        vizOptions.bulletSpacing = isVertical ? 120 : 50;
    }

    var totalSpace = (2 + vizOptions.bulletSize + vizOptions.bulletSpacing) *
                     this._resultset.length;

    // TODO: vizOptions.controller.domNode
    if (isVertical) {
        if (totalSpace > vizOptions.width) {
            vizOptions.controller.domNode.style.overflowX = 'auto';
            vizOptions.controller.domNode.style.overflowY = 'hidden';

            vizOptions.width = totalSpace;
        }
    } else {
        if (totalSpace > vizOptions.height) {
            vizOptions.controller.domNode.style.overflowY = 'auto';
            vizOptions.controller.domNode.style.overflowX = 'hidden';

            vizOptions.height = totalSpace;
        }
    }
};


// TODO - probably the skip logic should be inverted,
// this would be specified in terms of inclusion of CCC options.
pentaho.ccc.CccChart.prototype._shouldSkipVizOption = function(option){
    return (option in skipVizOtions);
};

/**
 * Set of visualization options that
 * should not be copied to the CCC options.
 */
var skipVizOtions = pv.dict([
        'cccClass',
        'crosstabMode',
        'extensionPoints',
        'action',
        'autoRange',
        'backgroundColorEnd',
        'backgroundFill',
        'chartType',
        'controller',
        'customChartType',
        'displayUnits',

        'labelSize',
        'labelStyle',

        'legendBackgroundColor',
        'legendColor',
        'legendFontFamily',
        'legendStyle',

         // NOTE: analyzer's legendSize is more like a "legentFontSize",
         // while CCC's is the legend panel's size (width or height)
        'legendSize',

        'lineShape',
        'maxChartsPerRow',
        'maxValues',
        'metrics',
        'palette',
        'selections',
        'seriesIncludeMeasures'
    ],
    function(){ return true; });

    
/*
 * RENDER
 */

pentaho.ccc.CccChart.prototype._renderChart = function(){

    while(this._element.firstChild) {
        this._element.removeChild(this._element.firstChild);
    }

    // TODO - if we don't recreate a new chart it does not display new data, fix this...
    // if( this._currentChartType != vizOptions.cccClass ) {
    this._currentChartType = this._vizOptions.cccClass;

    var chartClass = eval("(" + this._currentChartType + ")"); // TODO - get rid of eval

    this._chart = new chartClass(this.options);
    this._chart.setData($.extend(true, {}, this._cdaTable), this._dataOptions);
    this._chart.render();

    // NOTE: 'vertical' is default, so can be missing
    // Change the margin of the svg element
    // The HG chart comes with another firstChild... (?)
    var element = this._element.firstChild;
    while(element && (element.tagName.toLowerCase()) !== 'svg'){
        element = element.nextSibling;
    }

    if(element){
        // TODO: chart re-render because of series visibility changes looses this...
        if(this.options.orientation === 'horizontal'){
            element.style.marginBottom = this._vMargin + 'px';
        } else {
            element.style.marginTop = this._vMargin + 'px';
        }
    }
};

// -----------------------------
// INTERACTIVE / CLIENT-SIDE ONLY
pentaho.ccc.CccChart.prototype._readCccAxesValues = function(s, c){
    // Ensure arrays
    var rowVals = readCccValue(c),
        colVals = readCccValue(s);

    // TODO: this options is really needed
    // or can be infered from the way data is sent?
    if(colVals && this._vizOptions.seriesIncludeMeasures){
        // Remove the last element from series,
        // because it's the measure's name
        colVals.pop();
    }

    var axesVals = {
        row:     rowVals,
        column:  colVals,
        measure: null // filled below, after "absolutization"
    };

    /**
     * Ensure key axes values are absolute
     */
    this._keyAxes.forEach(function(axis){
        var vals = axesVals[axis];
        if(vals){
            axesVals[axis] = this._buildMdxAbsoluteValues(this._allAxesInfo[axis], vals);
        }
    }, this);

    // Array of measure cells: {v:..., f:...}, or null
    axesVals.measure = this._getCrossCell(axesVals.row, axesVals.column);

    return axesVals;
};

pentaho.ccc.CccChart.prototype._getCrossCell = function(rowVals, colVals){
    if(!rowVals || !colVals){
        return null;
    }

    var result = this._crossTable.childrenByKey[rowVals.join('~')];
    if(result){
        result = result.childrenByKey[colVals.join('~')];
    }
    
    return result && result.measures;
};

/*
 * TOOLTIPS
 */

// NOTE: tooltips are NOT rendered when interaction is disabled,
//  because showTooltips is set to false.
pentaho.ccc.CccChart.prototype._getTooltipText = function(axesVals){
    /**
     * Array of HTML lines which constitute the tooltip.
     * @see describeAxis
     */
    var tooltipLines = [];

    /**
     * Add tooltip lines with the pairs "form: value" for each of the roles.
     */
    this._allAxes.forEach(function(axis){
        describeAxis.call(this, this._allAxesInfo[axis], axesVals[axis]);
    }, this);

    /**
     * Add drill-down information to the tooltip.
     */
    var drillDownInfo = this._getDrillDownInfo(axesVals);
    if(drillDownInfo){
        tooltipLines.push(
            "<div class='tipsy-footer'>Double-click to show " +
                escapeHtml(this._vizHelper.getFormulaLabel(drillDownInfo.directChild)) +
            "</div>");
    }

    /**
     * Join tooltip lines with HTML line breaks.
     */
    return tooltipLines.join('<br />');
    
    /** @instance */
    function describeAxis(axisInfo, values){
        axisInfo.formulasInfo.forEach(function(formInfo, index){
            var value = pvc.nullTo(
                            this._getAxisValueLabel(axisInfo.id, values[index]),
                            "-");
            
            // ex: "Line: Ships"
            tooltipLines.push(escapeHtml(formInfo.label) + ': ' + escapeHtml(value));
        }, this);
    }
};


/*
 * SELECTION
 */
pentaho.ccc.CccChart.prototype._notifySelectionChanged = function(selections){
    pentaho.events.trigger(this, "select", {
        source:        this,
        selections:    selections,
        selectionMode: "REPLACE"
    });
};

pentaho.ccc.CccChart.prototype._notifyCccSelectionChanged = function(cccSelections){
    this._notifySelectionChanged(this._convertSelectionsCccToAnalyzer(cccSelections));
};


/**
 * Converts CCC selections to Analyzer selections.
 * Used on selection changed and on axes' drill down.
 *
 * A CCC selection is an instance of pvc.Datum.
 * Its relevant part has the structure:
 * {
 *   elem: {
 *      series:   { value: ["[Time].[2003]", "[Time].[2003].[QTR4]"] }
 *      category: { value: ["[Markets].[EMEA]", "[Order Status].[Resolved]"] }
 *   }
 *
 *   value: array
 * }
 *
 * axesVals:
 * {
 *     column:  s,
 *     row:     c,
 *     measure: v
 * }
 * 
 * A corresponding Analyzer selection would have the
 * following structure:
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
pentaho.ccc.CccChart.prototype._convertSelectionsCccToAnalyzer = function(cccSelections){
    return cccSelections.map(this._convertSelectionCccToAnalyzer, this);
};

pentaho.ccc.CccChart.prototype._convertSelectionCccToAnalyzer = function(cccSelection){
    return this._convertKeysSelectionCccToAnalyzer(
                        cccSelection.elem.series.absValue,
                        cccSelection.elem.category.absValue);
};

pentaho.ccc.CccChart.prototype._convertKeysSelectionCccToAnalyzer = function(s, c){
    /**
     * Values for each axis.
     * Convert CCC selection to an axesVals.
     */
    var axesVals = this._readCccAxesValues(s, c);

    return this._convertAxesValuesToAnalyzerSelection(axesVals);
};

pentaho.ccc.CccChart.prototype._convertAxesValuesToAnalyzerSelection = function(axesVals){
    /**
     * The Analyzer cell-selection object.
     */
    var selection = {type: 'cell'};

    /**
     * Add each key axis info to 'selection'.
     */
    this._keyAxes.forEach(addKeyAxisSelectionInfo, this);

    /**
     * Add a description of the selected values.
     * Currently, Analyzer discards selection.value
     */
    selection.value = axesVals.measure.map(function(cell){ return cell.f; })
                        .join(" ~ ");

    return selection;

    // --------------
    // Helper functions

    /** @instance */
    function addKeyAxisSelectionInfo(axis){
        var axisInfo = this._allAxesInfo[axis],
            vals = axesVals[axis];

        if(vals && vals.length){
            // Dummy property, just to force Analyzer to read the axis info
            selection[axis] = true;
            selection[axis + 'Id'] = axisInfo.formulas;
            selection[axis + 'Item'] = this._buildMdxAbsoluteValues(axisInfo, vals);
            selection[axis + 'Label'] = this._getAxisValueLabel(axis, vals[vals.length - 1]);
        }
    }
};

/*
 * DRILLING
 */
pentaho.ccc.CccChart.prototype._drillDown = function(axesVals){
    /**
     * Information about the axis and formula to drill on.
     */
    var drillInfo = this._getDrillDownInfo(axesVals);
    if(!drillInfo){
        // Drilling is disabled OR Nothing to drill on.
        // A double-click is sent to support "content linking".
        pentaho.events.trigger(this, "doubleclick", {
            source:     this,
            selections: [this._convertAxesValuesToAnalyzerSelection(axesVals)]
        });

        return false;
    }

    /**
     * The context for the click action.
     * Stores 'KEEP' and 'KEEP_AND_DRILL' instructions.
     * @see useFormula
     */
    var actionContext = [];

    /**
     * The set of hierarchy names
     * already included in 'actionContext'.
     *
     * Only one instruction per dimension hierarchy is generated.
     * Each instruction fixes the value of 
     * the deepest used formula of a hierarchy
     * to the MDX absolute value present in 'axesVals'.
     * @see keep
     * @see useFormula
     */
    var usedHierarchiesSet = {};

    /* Drill on drillInfo.axis */
    keepAndDrill.call(this, drillInfo);

    /**
     * Keep values from hierarchies other than the drilled one.
     */
    this._keyAxes.forEach(function(axis){
        var vals = axesVals[axis];
        if(vals){
            keep.call(this, this._allAxesInfo[axis].formulasInfo, vals);
        }
    }, this);
    
    // --------------

    // Maintains other existing filters
    var keepGem = true;
    this._vizHelper.click(actionContext, keepGem);

    return true;

    // ----------------
    // Helper methods

    /** @instance */
    function keepAndDrill(drillInfo){
        return useFormula.call(this, drillInfo.formulaInfo, drillInfo.values, 'KEEP_AND_DRILL');
    }

    /** @instance */
    function keep(formsInfo, vals){
        formsInfo.forEach(function(formInfo){
            // Only include formulas of a given hierarchy once
            if(!(formInfo.hierarchy in usedHierarchiesSet)){
                // Find the most specific formula in forms, of this hierarchy
                var deepestInfo = this._getDeepestIncludedLevelOfHierarchy(formInfo, vals.length);

                useFormula.call(this, deepestInfo.formulaInfo, vals, 'KEEP');
            }
        }, this);
    }

    /** @instance */
    function useFormula(formInfo, vals, action){
        usedHierarchiesSet[formInfo.hierarchy] = true;
        
        var axisInfo = formInfo.axis,
            hvalue = this._buildMdxAbsoluteValue(axisInfo, formInfo.index, vals);

        actionContext.push({
            action:  action,
            formula: formInfo.formula,
            member:  hvalue,
            caption: escapeHtml(formInfo.axis.valueLabel[hvalue])
        });
    }
};

pentaho.ccc.CccChart.prototype._getDrillDownInfo = function(axesVals){
    if(!this._vizHelper.isDrillEnabled()){
        return null;
    }

    /**
     * The axis to drill on.
     */
    for(var i = 0 ; i < this._keyAxes.length ; i++){
        var axis = this._keyAxes[i],
            vals = axesVals[axis],
            V;

        if(vals && (V = vals.length)){
            var axisInfo = this._allAxesInfo[axis];
            if(axisInfo.depth === V){
                // Drill on the *hierarchy* of the last form in the axis
                var formsInfo = axisInfo.formulasInfo,
                    formInfo  = formsInfo[V - 1];

                // Find the most specific formula of the hierarchy of 'form'
                // that does not exceed the available values.
                var drillInfo = this._getDeepestIncludedLevelOfHierarchy(formInfo, V);
                if(drillInfo && drillInfo.directChild){
                    // Make deepestInfo into a drillInfo.
                    drillInfo.values = vals;
                    return drillInfo;
                }
            }
        }
    }

    return null;
};

/**
 * Finds the formula in 'forms',
 * that is of the same hierarchy of the form 'hierarchyForm',
 * and is the deepest.
 * If 'maxDepth' is specified, then, additionally,
 * that form must have an index in 'forms' that is less than 'maxDepth'.
 *
 * Returns the following information, about the found form, if any:
 * <pre>
 * var deepestInfo = {
 *    formulaInfo: the deepest formula info object
 *    directChild: "[child formula]" // the direct child formula of .formula, if any
 * };
 * </pre>
 */
pentaho.ccc.CccChart.prototype._getDeepestIncludedLevelOfHierarchy = function(formInfo, maxDepth){
    var excludeChildren = false,
        
        // All the forms from the hierarchy of 'formInfo'
        // Some may not be included in 'formInfo.axis.formulas'.
        hForms  = this._vizHelper.getHierarchyFormulas(formInfo.formula, false, excludeChildren),

        // A map with the index of each form in 'forms'
        formsIndexes = pv.numerate(formInfo.axis.formulas);

    for(var i = hForms.length - 1 ; i >= 0  ; i--){
        var hFormIndex = formsIndexes[hForms[i]];

        if(hFormIndex != null && hFormIndex < maxDepth){
            // Belongs to the axis' forms
            return {
                formulaInfo: formInfo.axis.formulasInfo[hFormIndex],
                directChild: hForms[i + 1] || null
                //hierarchyFormulas: hForms
            };
        }
    }

    return null;
};

pentaho.ccc.CccChart.prototype._buildMdxAbsoluteValues = function(axisInfo, vals){
    return vals.map(function(/** @ignore */val, index){
        return this._buildMdxAbsoluteValue(axisInfo, index, vals);
    }, this);
};

pentaho.ccc.CccChart.prototype._buildMdxAbsoluteValue = function(
                    axisInfo,
                    targetIndex,
                    vals){

    var targetVal = vals[targetIndex];

    // Empty value or
    // already an MDX absolute value?
    if(targetVal == null ||
       targetVal === ''  ||
       targetVal.charAt(0) === "["){
        return targetVal;
    }

    var targetFormInfo = axisInfo.formulasInfo[targetIndex],
        hierarchy = targetFormInfo.hierarchy,
        forms  = axisInfo.formulas,
        // Hierarchy id already comes in brackets
        mdxVals = [ hierarchy ];

    // Traverse all ascendant formulas up to and including 'targetFormInfo.formula'
    var excludeChildren = true;
    this._vizHelper.getHierarchyFormulas(targetFormInfo.formula, false, excludeChildren)
        .forEach(function(levelForm){
            var index = forms.indexOf(levelForm);
            if(index >= 0){
                mdxVals.push("[" + vals[index] + "]");
            }
            // Assume the value is not relevant :-/ ??
        });

    return mdxVals.join(".");
};

/*
 setHighlights
 Sets the items on the chart that should be highlighted
 */
pentaho.ccc.CccChart.prototype.setHighlights = function(selections) {
    if(!this._ownChange){ // reentry control
        this._selections = selections;
        if(this._chart.clearSelections && (!selections || selections.length == 0)){
            // will cause selectionChangedAction being called
            this._ownChange = true;
            try{
                this._chart.clearSelections();
            } finally{
                this._ownChange = false;
            }
        }

//        if(this._dataTable && this._vizOptions) {
//        //disabled   this.draw(this._dataTable, this._vizOptions);
//        }
    }
};

// TODO: what's this for? Column/Bar?
/*
 getOutputParameters
 Returns the output parameters of the chart.
 */
pentaho.ccc.CccChart.prototype.getOutputParameters = function() {

    var params = [];
    if (this._vizOptions.cccClass == 'pvc.PieChart') {
        params.push( [
            this._dataTable.getColumnId( 0 ),
            true,
            this._dataTable.getColumnId( 0 )
        ]);
    } else {
        for(var j = 0 ; j < this._dataTable.getNumberOfColumns() ; j++) {
            params.push( [
                this._dataTable.getColumnId(j),
                true,
                this._dataTable.getColumnId(j)
            ]);
        }
    }

    return params;
};

pentaho.ccc.CccChart.prototype.resize = function(width, height){
    var vizOptions = this._originalVizOptions;

    vizOptions.width  = width;
    vizOptions.height = height;

    this.draw(this._dataTable, vizOptions);
};

// TODO - is the current selection accounting needed?
/*
 getColors
 Returns the colors to use.
 This needs to take into account selected and unselected items.
 */
pentaho.ccc.CccChart.prototype.getColors = function() {
    if(this._colors){
        return this._colors;
    }

    var colors = null;

    var paletteMap = this._vizOptions.metrics[0].paletteMap;
    if(paletteMap) {
        colors = [];
        for(var r = 0 ; r < this._dataTable.getNumberOfRows() ; r++) {
            var item = this._dataTable.getValue(r,0);
            if(this._selections && this._selections.length > 0) {
                var done = false;
                for(var selIdx = 0 ; selIdx < this._selections.length ; selIdx++) {
                    var selection = this._selections[selIdx];
                    if((selection.type == 'row'    && selection.rowItem == item) ||
                       (selection.type == 'column' && selection.colId == this._dataTable.getColumnId(1))) {
                        colors.push(paletteMap[item]);
                        done = true;
                        break;
                    }
                }

                if(!done) {
                    // this item is not selected, so make it grey
                    colors.push( "#bbbbbb" );
                }

            } else {
                colors.push(paletteMap[item]);
            }
        }
    }

    return colors;
};

// @private
// @static
function readCccValue(v){
    if(v != null && !(v instanceof Array)){
        // Ensure grouped values/attributes are correctly turned into arrays
        v = ('' + v).split('~');
    }

    return v;
}

// @private
// @static
function writeCccColumnDataType(colType){
    switch(colType){
        case 'string': return 'STRING';
        case 'number': return 'NUMERIC';
    }

    throw new Error("Unsupported data type");
}

// @private
// @static
function createTable(rowCount, colCount, readCellValue, context){
    var table = new Array(rowCount);
    for(var tr = 0; tr < rowCount; tr++) {
        var row = new Array(colCount);

        for(var tc = 0 ; tc < colCount ; tc++){
            row[tc] = readCellValue.call(context, tr, tc);
        }

        table[tr] = row;
    }

    return table;
}

// @private
// @static
// from cv.util.escapeHtml
function escapeHtml(str, noSingleQuotes){
    str = str.replace(/&/gm, "&amp;")
             .replace(/</gm, "&lt;")
             .replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");

    if(!noSingleQuotes){
        str = str.replace(/'/gm, "&#39;");
    }
    
    return str;
}

// @private
// @static
function assert(condition, conditionMessage){
    if(!condition){
        var message = "Assertion failed.";
        if(conditionMessage != null){
            message += "\n\"" + conditionMessage + "\"";
        }

        throw new Error(message);
    }
}

// from pentaho / cv
function createVizDataReq(rowLabel, columnLabel, measureLabel, hasMulti) {
    var json = [
      { id: 'rows',
        dataType: 'string',
        dataStructure: 'column',
        caption: rowLabel,
        required: true,
        allowMultiple: true,
        zoneId: "rowAttributes",
        defaultAppend: true
      },
      { id: 'columns',
        dataType: 'string',
        dataStructure: 'column',
        caption: columnLabel,
        required: false,
        allowMultiple: true,
        zoneId:"rowAttributes" // Only pivot table should use the columnAttribute zone
      },
      { id: 'measures',
        dataType: 'number',
        dataStructure: 'column',
        caption: measureLabel,
        required: true,
        allowMultiple: true,
        zoneId: "measures",
        defaultAppend: true
      }
    ];
    if (hasMulti)
      json.push({ id: 'multi',
        dataType: 'string',
        dataStructure: 'column',
        caption: cvCatalog['dropZoneLabels_MULTI_CHART'],
        allowMultiple: false,
        required: false,
        zoneId: "rowAttributes"
      });
    return json;
}

})(); // END Private Scope