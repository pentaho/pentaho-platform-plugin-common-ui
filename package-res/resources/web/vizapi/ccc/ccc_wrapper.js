
var pentaho = pentaho || {};

pentaho.ccc = pentaho.ccc || {};

pentaho.visualizations = pentaho.visualizations || [];

pentaho.visualizations.push({
    id: 'ccc_bar',
    type: 'barchart',
    migrationTypex: 'VERTICAL_BAR',
    source: 'CCC',
    name: 'CCC Column',
    class: 'pentaho.ccc.CccChart',
    args: {
        cccClass: 'pvc.BarChart',
        stacked: false,
        orientation: 'vertical'
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
    id: 'ccc_barstacked',
    type: 'barchart',
    migrationTypex: 'VERTICAL_BAR',
    source: 'CCC',
    name: 'CCC Stacked Column',
    class: 'pentaho.ccc.CccChart',
    args: {
        cccClass: 'pvc.BarChart',
        stacked: true,  
        orientation: 'vertical'  
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
    migrationTypex: 'VERTICAL_BAR',
    source: 'CCC',
    name: 'CCC Bar',
    class: 'pentaho.ccc.CccChart',
    args: {
        cccClass: 'pvc.BarChart',
        stacked: false,
        orientation: 'horizontal'
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
    migrationTypex: 'VERTICAL_BAR',
    source: 'CCC',
    name: 'CCC Stacked Bar',
    class: 'pentaho.ccc.CccChart',
    args: {
        cccClass: 'pvc.BarChart',
        stacked: true,
        orientation: 'horizontal'
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
    migrationTypex: 'VERTICAL_BAR',
    source: 'CCC',
    name: 'CCC Line',
    class: 'pentaho.ccc.CccChart',
    args: {
        cccClass: 'pvc.LineChart',
        stacked: false,
        orientation: 'vertical',
        showDots: true
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
    migrationTypex: 'VERTICAL_BAR',
    source: 'CCC',
    name: 'CCC Area',
    class: 'pentaho.ccc.CccChart',
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
    class: 'pentaho.ccc.CccChart',
    args: {
        cccClass: 'pvc.MetricDotChart'
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
    migrationType: 'MULTIPLE_PIE',
    source: 'CCC',
    name: 'CCC Pie Chart',
    class: 'pentaho.ccc.CccChart',
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
    name: 'CCC Heat Grid',
    class: 'pentaho.ccc.CccChart',
    args: {
        cccClass: 'pvc.HeatGridChart',
        crosstabMode: true,
        normPerBaseCategory: false,
        showValues: true,
        showXScale: true,
        xAxisPosition: "bottom",
        showYScale: true,
        yAxisPosition: "left"
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

pentaho.ccc.CccChart = function( element ) {
    this.element = element;
    this.elementName = element.id;
    this.cdaTable = null;
    this.dataTable = null;
    this.vizOptions = null;
    this.series = [];
    this.selections = [];
    this.currentChartType = null;
}

pentaho.ccc.CccChart.prototype.draw = function( dataTable, vizOptions ) {
    this.vizOptions = vizOptions;
    this.dataTable = dataTable;
    
    this.selections = vizOptions.selections;
    
    var metadata = [];
    var measures = [];
    var strings = [];
    var resultset = [];
    var colors = null;
    
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

    if(vizOptions.cccClass == 'pvc.HeatGridChart' || vizOptions.cccClass == 'pvc.MetricDotChart') {

        metadata.push({
            colIndex: 0,
            colName: 'Categories',
            colLabel: title,
            colType: 'STRING'
        });
        
        for( var measureNo=0; measureNo<measures.length; measureNo++ ) {
            metadata.push({
                colIndex: measureNo+1,
                colName: dataTable.getColumnId(measures[measureNo]),
                colLabel: dataTable.getColumnLabel(measures[measureNo]),
                colType: 'NUMERIC'
            });            
        }
        
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
        // convert the data into right format

        colors = [];
        for( var measureNo=0; measureNo<measures.length; measureNo++ ) {
            colors.push(vizOptions.palette.colors[measureNo]);
        }        
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
            for( var measureNo=0; measureNo<measures.length; measureNo++ ) {
                var row = [ dataTable.getColumnLabel(measures[measureNo]), category, dataTable.getValue( rowNo, measures[measureNo] ) ];
                resultset.push(row);
            }
        }
    } else if(vizOptions.cccClass == 'pvc.PieChart') { 
        
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
        
    this.cdaTable = {
        metadata: metadata,
        resultset: resultset
    };

    var myself=this;
    
    var opts = {
      canvas: this.elementName,
      animate:false,
      legend: true,
      legendPosition:"right",
      legendAlign: "middle",
      showTooltips: true,
      showValues: false,
      clickable: true,
      title: title,
      titlePosition: 'top',
      colors: colors ? colors : this.getColors(),
      clickAction: function(s,c, d){
        if(pentaho && pentaho.events && pentaho.events.trigger ) {
            var table = myself.cdaTable;
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
    
    var dataOpts = {crosstabMode: vizOptions.crosstabMode ? vizOptions.crosstabMode : false,
        seriesInRows: false};

    for( x in vizOptions ) {
        if( x != 'cccClass' && x != 'crosstabMode' ) {
            opts[x] = vizOptions[x];
        }
    }

    if( vizOptions.cccClass == 'pvc.BarChart' || vizOptions.cccClass == 'pvc.LineChart') {

        opts.extensionPoints = {
            xAxisLabel_textAngle: -1,
            xAxisLabel_textAlign: "right",
            xAxisLabel_textBaseline: "top",
          }
    }
    else if (vizOptions.cccClass == 'pvc.PieChart') {
    }
    else if (vizOptions.cccClass == 'pvc.MetricDotChart') {
        opts.showDots = true,
        opts.yAxisSize = 30,
        opts.xAxisSize = 30,
        opts.xAxisFullGrid = true,
        opts.yAxisFullGrid = true
    }
    
    if( this.currentChartType != vizOptions.cccClass ) {
        eval( 'this.chart = new '+vizOptions.cccClass+'(opts)' );
        this.currentChartType = vizOptions.cccClass;
    }
    
    this.chart.setData($.extend(true, {}, this.cdaTable),dataOpts);
    this.chart.render();

}

pentaho.ccc.CccChart.prototype.setHighlights = function( selections ) {
    this.selections = selections;
    if( this.dataTable && this.vizOptions ) {
        this.draw(this.dataTable, this.vizOptions);
    }
}

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
