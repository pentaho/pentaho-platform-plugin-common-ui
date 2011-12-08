
var pentaho = pentaho || {};

pentaho.ccc = pentaho.ccc || {};

pentaho.visualizations = pentaho.visualizations || [];

pentaho.visualizations.getById = function(id){
  for(var i=0; i< this.length; i++){
    if(this[i].id == id){
      return this[i];
    }
  }
  return null;
}
/*
 Visualization Metadata
 These objects describe the visualizations provided by this library.
 */
pentaho.visualizations.push({
  id: 'ccc_bar',                          // unique identifier
  type: 'barchart',                       // generic type id
  source: 'CCC',                          // id of the source library
  name: 'CCC Column',                     // visible name, this will come from a properties file eventually
  'class': 'pentaho.ccc.CccChart',          // type of the Javascript object to instantiate
  args: {                                 // arguments to provide to the Javascript object
    cccClass: 'pvc.BarChart',
    stacked: false,
    orientation: 'vertical',
    extensionPoints: {
      xAxisLabel_textAngle: -1,
      xAxisLabel_textAlign: "right",
      xAxisLabel_textBaseline: "top"
    }
  },
  propMap: [],
  dataReqs: [                             // dataReqs describes the data requirements of this visualization
    [
      {   id: 'category',             // id of the data element
        dataType: 'string',         // data type - 'string', 'number', 'date', 'boolean', 'any' or a comma separated list
        dataStructure: 'column',    // 'column' or 'row' - only 'column' supported so far
        caption: 'Category',        // visible name
        required: true              // true or false
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Values',
        required: true,
        allowMultiple: true         // true or false
      }
    ]
  ]
});


pentaho.visualizations.push({
  id: 'ccc_barstacked',
  type: 'barchart',
  source: 'CCC',
  name: 'CCC Stacked Column',
  'class': 'pentaho.ccc.CccChart',
  args: {
    cccClass: 'pvc.BarChart',
    stacked: true,
    orientation: 'vertical'  ,
    extensionPoints: {
      xAxisLabel_textAngle: -1,
      xAxisLabel_textAlign: "right",
      xAxisLabel_textBaseline: "top"
    }
  },
  propMap: [],
  dataReqs: [
    [
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'column',
        caption: 'Category',
        required: true
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Values',
        required: true,
        allowMultiple: true
      }
    ]
  ]
});

pentaho.visualizations.push({
  id: 'ccc_horzbar',
  type: 'horzbarchart',
  source: 'CCC',
  name: 'CCC Bar',
  'class': 'pentaho.ccc.CccChart',
  args: {
    cccClass: 'pvc.BarChart',
    stacked: false,
    orientation: 'horizontal',
    extensionPoints: {
      xAxisLabel_textAngle: -1,
      xAxisLabel_textAlign: "right",
      xAxisLabel_textBaseline: "top"
    }
  },
  propMap: [],
  dataReqs: [
    [
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'column',
        caption: 'Category',
        required: true
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Values',
        required: true,
        allowMultiple: true
      }
    ]
  ]
});

pentaho.visualizations.push({
  id: 'ccc_horzbarstacked',
  type: 'horzbarchart',
  source: 'CCC',
  name: 'CCC Stacked Bar',
  'class': 'pentaho.ccc.CccChart',
  args: {
    cccClass: 'pvc.BarChart',
    stacked: true,
    orientation: 'horizontal',
    extensionPoints: {
      xAxisLabel_textAngle: -1,
      xAxisLabel_textAlign: "right",
      xAxisLabel_textBaseline: "top"
    }
  },
  propMap: [],
  dataReqs: [
    [
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'column',
        caption: 'Category',
        required: true
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Values',
        required: true,
        allowMultiple: true
      }
    ]
  ]
});

pentaho.visualizations.push({
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
    [
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'column',
        caption: 'Category',
        required: true
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Values',
        required: true,
        allowMultiple: true
      }
    ]
  ]
});

pentaho.visualizations.push({
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
    [
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'column',
        caption: 'Category',
        required: true
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Values',
        required: true,
        allowMultiple: true
      }
    ]
  ]
});

pentaho.visualizations.push({
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
    [
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'column',
        caption: 'Category',
        required: true
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'X Axis',
        required: true,
        allowMultiple: false
      },
      {   id: 'series2',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Y Axis',
        required: true,
        allowMultiple: true
      }
    ]
  ]
});

pentaho.visualizations.push({
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
    [
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'column',
        caption: 'Slices',
        required: true
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Values',
        required: true
      }
    ]
  ]
});

pentaho.visualizations.push({
  id: 'ccc_heatgrid',
  type: 'heatgrid',
  source: 'CCC',
  name: 'Heat Grid',
  'class': 'pentaho.ccc.CccChart',

  getDropZoneLabel : function (type) {
    if (type == 'ROW') return 'Categories';
    if (type == 'COL') return 'Series';
    if (type == 'NUM') return 'Color/Size measures';
    return '?';
  },

  args: {
    cccClass: 'pvc.HeatGridChart',
    crosstabMode: true,
    normPerBaseCategory: false,
    showValues: true,
    showXScale: true,
    xAxisPosition: "bottom",
    showYScale: true,
    yAxisPosition: "left",

    seriesInRows: false,
    animate: false,

    timeSeries: false,
    timeSeriesFormat: "%Y-%m-%d",
    panelSizeRatio: 0.8,
    orientation: "vertical",
    showValues: false,
    valuesAnchor: "right",
    titlePosition: "top",
    titleSize: 25,
    showXScale: true,
    xAxisPosition: "bottom",
    xAxisSize: 30,
    showYScale: true,
    yAxisPosition: "left",
    yAxisSize: 50,
    xAxisFullGrid: false,
    yAxisFullGrid: false,
    orthoAxisOrdinal: false,
    scalingType: "linear",
    numSD: 2,
    nullColor: "#efc5ad",
    extensionPoints: [],
    valuesAnchor: "right",
    useShapes: true,
    shape: 'circle',
    isMultiValued: true,
    useCompositeAxis:true,
    sizeValIdx:1,
    colorValIdx: 0,
    dataOptions: {
      categoriesCount: 1,
      measuresInColumns: true
    }

  },
  propMap: [],
  dataReqs: [
    [
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'row',
        caption: 'Across',
        required: true
      },
      {   id: 'category',
        dataType: 'string',
        dataStructure: 'column',
        caption: 'Down',
        required: true
      },
      {   id: 'series',
        dataType: 'number',
        dataStructure: 'column',
        caption: 'Values',
        required: true
      }
    ]
  ]
});

/*
 CccChart constructor
 This takes an HTML DOM element as a parameter
 */
pentaho.ccc.CccChart = function( element ) {
  this.element = element;
  this.elementName = element.id;
  this.cdaTable = null;
  this.dataTable = null;
  this.vizOptions = null;
  this.series = [];
  this.selections = [];
  this.currentChartType = null;
  this.categories = [];
}

/*
 draw()

 dataTable   a pentaho.DataTable object with the data to display
 vizOptions  the options for the visualization
 */
pentaho.ccc.CccChart.prototype.draw = function( dataTable, vizOptions ) {

  // store the incoming parameters for later use
  this.vizOptions = vizOptions;
  this.dataTable = dataTable;

  // store the current highlighted selections
  this.selections = vizOptions.selections;

  // local variables
  var metadata = [];
  var measures = [];
  var strings = [];
  var resultset = [];
  var colors = null;

  // store the series count and the categories
  this.seriesCount = 0;
  this.categories = [];

  //count categories for heatGrid
  var categoriesCount = 0;
  var xAxisLabels = {};
  var yAxisLabels = {};

  // inspect the columns of the DataTable
  title = '';
  for( var colNo=0; colNo<dataTable.getNumberOfColumns(); colNo++) {
    if( dataTable.getColumnType(colNo).toUpperCase() == 'NUMBER' ) {
      measures.push(colNo);
    }
    else if( dataTable.getColumnType(colNo).toUpperCase() == 'STRING' ) {
      if( title ) {
        title += ' and '; // TODO localize
      }
      title += dataTable.getColumnLabel(colNo);
      strings.push(colNo);
    }
  }

  if(vizOptions.cccClass == 'pvc.HeatGridChart'){
    categoriesCount = 0;
    //direct translation
    for( var colNo=0; colNo<dataTable.getNumberOfColumns(); colNo++){
      if(dataTable.getColumnType(colNo) == 'string' ){
        categoriesCount++;
      }
      metadata.push({
        colIndex: colNo,
        colName: dataTable.getColumnId(colNo),//dataTable.getColumnLabel(colNo),
        colLabel:dataTable.getColumnLabel(colNo),
        colType: (dataTable.getColumnType(colNo) == 'number') ? 'NUMERIC' : 'STRING'
      });
      //axis label names:
      var id = dataTable.getColumnId(colNo).split('~');
      var lbl = dataTable.getColumnLabel(colNo).split('~')
      //id= id.length == 0 ? id[0] : id[id.length-2];
      //lbl= lbl.length == 1 ? id[0] : lbl[lbl.length-2];
      for(var i=0;i<id.length;i++){
        yAxisLabels[id[i]] = lbl[i];
      }
    }
    for(var rowNo=0; rowNo<dataTable.getNumberOfRows(); rowNo++) {
      var row = [];
      for( var colNo=0; colNo<dataTable.getNumberOfColumns(); colNo++) {
        var val = dataTable.getValue(rowNo, colNo);
        //(dataTable.getColumnType(colNo) == 'number')?
        //        dataTable.getValue(rowNo, colNo):
        //        dataTable.getFormattedValue(rowNo, colNo);
        if(val == '-'){ val = null;}

        if(dataTable.getColumnType(colNo) != 'number'){//axis label names
          xAxisLabels[dataTable.getValue(rowNo, colNo)] = dataTable.getFormattedValue(rowNo, colNo);
        }

        row.push(val);
      }
      resultset.push(row);
    }

  } else if(vizOptions.cccClass == 'pvc.MetricDotChart') {
    // format the data for a HeatGridChart or MetricDotChart

    // add the category column metadata
    metadata.push({
      colIndex: 0,
      colName: 'Categories',
      colLabel: title,
      colType: 'STRING'
    });

    // add the numeric columns metadata
    for( var measureNo=0; measureNo<measures.length; measureNo++ ) {
      metadata.push({
        colIndex: measureNo+1,
        colName: dataTable.getColumnId(measures[measureNo]),
        colLabel: dataTable.getColumnLabel(measures[measureNo]),
        colType: 'NUMERIC'
      });
    }

    // process the rows
    for(var rowNo=0; rowNo<dataTable.getNumberOfRows(); rowNo++) {
      // concat all of the strings
      var category = '';
      var row = [];
      for( var stringNo=0; stringNo<strings.length; stringNo++ ) {
        if( category ) {
          category += ' ~ ';
        }
        category += dataTable.getFormattedValue( rowNo, strings[stringNo] );
      }
      row.push(category);
      for( var measureNo=0; measureNo<measures.length; measureNo++ ) {
        row.push( dataTable.getValue( rowNo, measures[measureNo] ) );
      }
      resultset.push(row);
    }

  } else if(vizOptions.cccClass == 'pvc.BarChart' || vizOptions.cccClass == 'pvc.LineChart' ||
      vizOptions.cccClass == 'pvc.StackedAreaChart' ) {
    // format the data for a BarChart, LineChart, or StackedAreaChart

    this.seriesCount = measures.length;

    colors = [];
    for( var measureNo=0; measureNo<measures.length; measureNo++ ) {
      colors.push(vizOptions.palette.colors[measureNo]);
    }
    // create the metadata
    metadata.push({
      colIndex: 0,
      colName: 'Series',
      colLabel: 'Series',
      colType: 'STRING'
    });
    metadata.push({
      colIndex: 1,
      colName: 'Category',
      colLabel: 'Category',
      colType: 'STRING'
    });
    metadata.push({
      colIndex: 2,
      colName: 'Value',
      colLabel: 'Value',
      colType: 'NUMERIC'
    });

    // process the rows
    var catMap = {};
    for(var rowNo=0; rowNo<dataTable.getNumberOfRows(); rowNo++) {
      // concat all of the strings
      var category = '';
      var row = [];
      for( var colNo=0; colNo<dataTable.getNumberOfColumns(); colNo++) {
        if( dataTable.getColumnType(colNo).toUpperCase() == 'STRING' ) {
          if( category ) {
            category += ' ~ ';
          }
          category += dataTable.getFormattedValue( rowNo, colNo );
        }
      }
      if(!catMap[category] ) {
        catMap[category] = true;
        this.categories.push(category);
      }

      for( var measureNo=0; measureNo<measures.length; measureNo++ ) {
        var row = [ dataTable.getColumnLabel(measures[measureNo]), category, dataTable.getValue( rowNo, measures[measureNo] ) ];
        resultset.push(row);
      }
    }
  } else if(vizOptions.cccClass == 'pvc.PieChart') {
    // format the data for a PieChart

    this.seriesCount = 1;

    // create the metadata
    metadata.push({
      colIndex: 0,
      colName: 'Category',
      colLabel: title,
      colType: 'STRING'
    });

    metadata.push({
      colIndex: 0,
      colName: 'Value',
      colLabel: 'Value',
      colType: 'NUMERIC'
    });

    // process the rows
    for(var rowNo=0; rowNo<dataTable.getNumberOfRows(); rowNo++) {
      // concat all of the strings
      var category = '';
      var row = [];
      for( var stringNo=0; stringNo<strings.length; stringNo++ ) {
        if( category ) {
          category += ' ~ ';
        }
        category += dataTable.getFormattedValue( rowNo, strings[stringNo] );
      }
      row.push(category);
      row.push( dataTable.getValue( rowNo, measures[0] ) );
      resultset.push(row);
    }

  }

  var myself=this;

  // create the options for the chart
  var opts = {
    canvas: this.elementName,
    animate:false,
    legend: true,
    legendPosition:"bottom",
    legendAlign: "middle",
    showTooltips: true,
    showValues: false,
    clickable: true,
    height: vizOptions.height,
    width: vizOptions.width,
    title: title == "" ? null : title,
    titlePosition: 'top',
    colors: colors ? colors : this.getColors(),
    clickAction: function(s,c, d){
      // handle click events
      if(pentaho && pentaho.events && pentaho.events.trigger ) {
        var table = myself.cdaTable;
        // create a selection object to describe the clicked item
        var selections = [{
          type: 'cell',
          rowId: myself.dataTable.getColumnId(0),
          rowLabel: myself.dataTable.getColumnLabel(0),
          value: d
        }];
        if( myself.vizOptions.cccClass == 'pvc.PieChart' ) {
          selections[0].type = 'row';
          selections[0].column = 1;
          selections[0].columnId = myself.dataTable.getColumnId(1);
          selections[0].columnLabel = myself.dataTable.getColumnLabel(1);
        } else {
          // find the right column
          for( var colNo=0; colNo<myself.dataTable.getNumberOfColumns(); colNo++) {
            if( myself.dataTable.getColumnLabel(colNo) == s ) {
              selections[0].column = colNo;
              selections[0].columnId = myself.dataTable.getColumnId(colNo);
              selections[0].columnLabel = myself.dataTable.getColumnLabel(colNo);
              break;
            }
          }
        }
        for( var rowNo=0; rowNo<myself.dataTable.getNumberOfRows(); rowNo++) {
          if( myself.dataTable.getValue(rowNo,0) == c ) {
            selections[0].row = rowNo;
            selections[0].rowItem = myself.dataTable.getValue(rowNo,0);
            var args = {
              source: myself,
              selections: selections
            };
            // trigger the selection event
            pentaho.events.trigger( myself, "select", args );
            break;
          }
        }
      }
    },
    mouseOverAction: function(a,b,c,d) {
    },
    mouseUpAction: function(a,b,c,d) {
    }
  }


  // create the data options for the chart
  var dataOpts = {crosstabMode: vizOptions.crosstabMode ? vizOptions.crosstabMode : false,
    seriesInRows: false};

  if(vizOptions.cccClass == 'pvc.HeatGridChart')
  {
    var categoryMatches = function(category, dataTableVal){
      return pvc.arrayEquals(category, dataTableVal);
    };
    var seriesMatches = function(series, dataTableVal){//TODO:
      var seriesStr = $.isArray(series)?
          series.join('~'):
          series;
      var idx = dataTableVal.lastIndexOf('~');
      if(idx < 0) {idx = 0;} //dataTableVal.length
      return dataTableVal.substring(0, idx) == seriesStr;
    };

    //use selection event handler instead of clickAction
    opts.clickAction = undefined;

    opts.xAxisGetLabel = function(id){
      return xAxisLabels[id];
    };
    opts.yAxisGetLabel = function(id){
      return yAxisLabels[id];
    };

    //translate ccc selections to report selections; to be processed by selectTriggered@cv_rptReport3
    opts.onSelectionChange = function(cccSelections)
    {
      var numMeasures = cv.getActiveReport().reportDoc.getReportNode().selectNodes("cv:measures/cv:measure").length;
      var selections = [];
      var categoryColNo = 0;
      var seriesRowNo = 0;
      var seriesColStart=categoriesCount;
      for(var i=0; i < cccSelections.length; i++)
      {//ccc selections work on a category x series basis, translate to VizController selections
        var c = cccSelections[i].category;
        var s = cccSelections[i].series;
        var selection = {
          type: 'cell',
          rowLabel: myself.dataTable.getColumnLabel(categoriesCount-1)
        };
        for(var rowNo=0; rowNo<myself.dataTable.getNumberOfRows(); rowNo++)
        {//category -> row
          var categories = [];
          for(var j = categoryColNo;j<categoriesCount;j++){
            categories.push(myself.dataTable.getValue(rowNo,j));
          }
          if(categoryMatches(c, categories))
          {
            selection.row = rowNo;
            var rowItems = [], rowIds = [];
            for(var j = categoryColNo;j<categoriesCount;j++){
              rowItems.push(myself.dataTable.getValue(rowNo,j));
              rowIds.push(myself.dataTable.getColumnId(j));
            }
            selection.rowItem = rowItems;
            selection.rowId = rowIds;
            break;
          }
        }
        for(var colNo=seriesColStart; colNo < myself.dataTable.getNumberOfColumns(); colNo+=numMeasures)
        {//just catch first occurrence
          if(seriesMatches(s, myself.dataTable.getColumnId(colNo))){
            selection.column = colNo;
            //get measure out
            var colId = myself.dataTable.getColumnId(colNo);
            var endSplitIdx = colId.lastIndexOf('~');
            if(endSplitIdx < 0) { endSplitIdx = colId.length-1; }
            selection.columnItem =  colId.substring(0,endSplitIdx).split('~');
            selection.measureId = colId.substring(endSplitIdx+1, colId.length);

            var columnIds = [];
            var columnIdNodes = cv.getActiveReport().reportDoc.getReportNode().selectNodes('cv:columnAttributes/cv:attribute/@formula');
            for(var j = 0;j<columnIdNodes.length;j++){
              columnIds.push(columnIdNodes[j].firstChild.data);
            }
            selection.columnId = columnIds;
            selection.columnLabel = myself.dataTable.getColumnLabel(colNo);
            break;
          }
        }
        if(selection.row != null && selection.column != null){
          selection.value = myself.dataTable.getValue(selection.row,selection.column);
        }
        selections.push(selection);
      }
      var args = {
        source: myself,
        selections: selections
      };
      pentaho.events.trigger( myself, "select", args );
    };//onSelectionChange

    vizOptions.controller.domNode.style.overflow = 'hidden'; //Hide overflow

    opts.customTooltip = function(s,c,d){//TODO:
      var toDrillTitle = yAxisLabels[s[s.length-1]]; // dataTable.getColumnLabel(dataTable.getNumberOfColumns()-1).split('~')[0];
      var tooltip = "<br> Double-click to show " + toDrillTitle;
      return tooltip;
    };

    //drill down on shapes
    opts.doubleClickAction = function(series, category){
      //TODO: no series, no categories
      if(series.length == 0) return;
      //do a 'keep only' on the selected member from the Rows/Category level(s), and 'show next' (drill-down) on
      //the selected member from the Columns/Series level. If there are nested levels in Columns/Series, it should
      //do a 'keep only' on the outer-most member and a 'show next' (drill-down) on the inner-most level.
      var toDrill = series[series.length-1];
      var drillFormula = cv.getActiveReport().reportDoc.getReportNode().selectNodes('cv:columnAttributes/cv:attribute/@formula')[series.length - 1].value;
      var toKeep = null;
      var keepFormula=null;
      if(series.length > 1)
      {
        toKeep = series[series.length-2];
        keepFormula = cv.getActiveReport().reportDoc.getReportNode().selectNodes('cv:columnAttributes/cv:attribute/@formula')[series.length - 2].value;
      }
      else if(category.length > 0){
        toKeep = category[category.length-1];
        keepFormula = cv.getActiveReport().reportDoc.getReportNode().selectNodes('cv:rowAttributes/cv:attribute/@formula')[category.length-1].value;
      }

      var ctx = [];
      var drillCtx = {
        formula: drillFormula,
        member: toDrill,
        caption: toDrill
      };
      var keepCtx = {
        formula: keepFormula,
        member: toKeep,
        caption: toKeep
      };
      if(toKeep != null){
        ctx.push(keepCtx);
      }
      ctx.push(drillCtx);

      cv.getActiveReport().clickChart(ctx, true);
    };

    //drill down on y axis
    opts.yAxisDoubleClickAction =  function (path) {
      var ctxArray = [];
      var rowItems = {};

      var formula = cv.getActiveReport().reportDoc.getReportNode().selectNodes('cv:columnAttributes/cv:attribute/@formula')[path.length - 1].value;
      var ctx = {formula:formula, member:path[path.length-1],
        action: "KEEP_AND_DRILL",
        caption: cv.util.parseMDXExpression(path[path.length-1], false)
      };
      ctxArray.push(ctx);
      cv.getActiveReport().clickChart(ctxArray, true);
    };

    //drill down on x axis
    opts.xAxisDoubleClickAction =  function (path) {
      var ctxArray = [];
      var rowItems = {};

      var formula = cv.getActiveReport().reportDoc.getReportNode().selectNodes('cv:rowAttributes/cv:attribute/@formula')[path.length - 1].value;

      var ctx = {formula:formula, member:path[path.length-1],
        action: "KEEP_AND_DRILL",
        caption: cv.util.parseMDXExpression(path[path.length-1], false)
      };

      ctxArray.push(ctx);
      cv.getActiveReport().clickChart(ctxArray, true);
    };

    //update categories count
    dataOpts.dataOptions = {
      categoriesCount : categoriesCount,
      measuresInColumns: true
    };

    var measureCount = cv.getActiveReport().reportDoc.getReportNode().selectNodes("cv:measures/cv:measure").length;
    if (measureCount < 2) {
      vizOptions.sizeValIdx = null;
      if (measureCount == 0){
        vizOptions.colorValIdx = null;
      }
    }

    //resize
    //fiddle with the axis dimensions

    //get depth and breadth
    var measureCount = cv.getActiveReport().reportDoc.getReportNode().selectNodes("cv:measures/cv:measure").length;
    var categoriesDepth = cv.getActiveReport().reportDoc.getReportNode().selectNodes('cv:rowAttributes/cv:attribute').length;
    var seriesDepth = cv.getActiveReport().reportDoc.getReportNode().selectNodes('cv:columnAttributes/cv:attribute').length;
    var categoriesBreadth = this.dataTable.getNumberOfRows() - 1;
    var seriesBreadth = (this.dataTable.getNumberOfColumns() - categoriesDepth)/measureCount;

    var MAX_AXIS_SIZE = 300,
        MIN_LEVEL_HEIGHT = 30,
        MAX_LEVEL_HEIGHT = 200,
        MAX_AXIS_RATIO = 0.35;
    var width = vizOptions.width,
        height = vizOptions.height;

    var xyChartRatio = categoriesBreadth / seriesBreadth;
    var currRatio = width/height;

    //min desirable sizes according to depth
    var minXAxisSize = Math.min(MAX_AXIS_SIZE, categoriesDepth * MIN_LEVEL_HEIGHT);
    var minYAxisSize = Math.min(MAX_AXIS_SIZE, seriesDepth * MIN_LEVEL_HEIGHT);
    var maxXAxisSize = Math.min(MAX_AXIS_SIZE, categoriesDepth * MAX_LEVEL_HEIGHT, height * MAX_AXIS_RATIO);
    var maxYAxisSize = Math.min(MAX_AXIS_SIZE, seriesDepth * MAX_LEVEL_HEIGHT, width * MAX_AXIS_RATIO);

    var xAxisSize, yAxisSize;
    if(xyChartRatio > currRatio){//lock width
      var extraHeight = height - width / xyChartRatio ;
      yAxisSize = minYAxisSize;

      xAxisSize = Math.min(extraHeight, maxXAxisSize) ;
      xAxisSize = Math.max(xAxisSize, minXAxisSize);
    }
    else if (xyChartRatio < currRatio){//lock height
      var extraWidth = width - height * xyChartRatio;
      xAxisSize = minXAxisSize;

      yAxisSize = Math.min(extraWidth, maxYAxisSize);
      yAxisSize = Math.max(yAxisSize, minYAxisSize);
    }
    vizOptions.xAxisSize = xAxisSize;
    vizOptions.yAxisSize = yAxisSize;


  }//heatgrid

  // copy options from the visualization metadata to the chart options
  for( x in vizOptions ) {
    if( x != 'cccClass' && x != 'crosstabMode' && x != 'extensionPoints') {
      opts[x] = vizOptions[x];
    }
  }
  if( vizOptions.extensionPoints ) {
    opts.extensionPoints = {};
    for( x in vizOptions.extensionPoints ) {
      opts.extensionPoints[x] = vizOptions.extensionPoints[x];
    }
  }

  // create the CDA table
  this.cdaTable = {
    metadata: metadata,
    resultset: resultset
  };

  while(this.element.firstChild) {
    this.element.removeChild(this.element.firstChild);
  }

  // TODO -if we don't recreate a new chart it does not display new data, fix this...
  // if( this.currentChartType != vizOptions.cccClass ) {
  this.chart = eval("new "+vizOptions.cccClass+"(opts)");

  this.currentChartType = vizOptions.cccClass;
  // }

  this.chart.setData($.extend(true, {}, this.cdaTable),dataOpts);
  this.chart.render();

}

/*
 setHighlights
 Sets the items on the chart that should be highlighted
 */
pentaho.ccc.CccChart.prototype.setHighlights = function( selections ) {
  this.selections = selections;
  if( this.dataTable && this.vizOptions ) {
    //disabled   this.draw(this.dataTable, this.vizOptions);
  }
}

/*
 getColors
 Returns the colors to use. This needs to take into account selected and unselected items.
 */
pentaho.ccc.CccChart.prototype.getColors = function() {

  var paletteMap = this.vizOptions.metrics[0].paletteMap;
  var colors = null;
  if(paletteMap) {
    colors = [];
    for(var rowNo=0; rowNo<this.dataTable.getNumberOfRows(); rowNo++) {
      var item = this.dataTable.getValue(rowNo,0);
      if( this.selections && this.selections.length > 0) {
        var done = false;
        for( var selIdx=0; selIdx<this.selections.length; selIdx++) {
          if( (this.selections[selIdx].type == 'row' && this.selections[selIdx].rowItem == item) ||
              (this.selections[selIdx].type == 'column' && this.selections[selIdx].colId == this.dataTable.getColumnId(1))) {
            colors.push( paletteMap[ item ] );
            done = true;
            break;
          }
        }
        if(!done) {
          // this item is not selected, so make it grey
          colors.push( "#bbbbbb" );
        }
      } else {
        colors.push( paletteMap[ item ] );
      }
    }
  }
  return colors;
}

/*
 getOutputParameters
 Returns the output parameters of the chart
 */
pentaho.ccc.CccChart.prototype.getOutputParameters = function() {

  var params = [];
  if (this.vizOptions.cccClass == 'pvc.PieChart') {
    params.push( [
      this.dataTable.getColumnId( 0 ),
      true,
      this.dataTable.getColumnId( 0 )
    ] );
  } else {
    for( var colNo=0; colNo<this.dataTable.getNumberOfColumns(); colNo++ ) {
      params.push( [
        this.dataTable.getColumnId( colNo ),
        true,
        this.dataTable.getColumnId( colNo )
      ] );
    }
  }

  return params;

}

pentaho.ccc.CccChart.prototype.resize = function(width, height){
  this.vizOptions.width = width;
  this.vizOptions.height = height;

  this.draw(this.dataTable, this.vizOptions);
}

