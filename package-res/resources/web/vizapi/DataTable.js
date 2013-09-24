/*
pentaho.DataTable
pentaho.DataView

Client-side non-visual data tables.

author: James Dixon

*/

pentaho = typeof pentaho == "undefined" ? {} : pentaho;

/****************************************************
    pentaho.DataTable
    A client-side table object. 
****************************************************/

/*
    Constructor.
    jsonTable:      A CDA JSON table object or a Google DataTable JSON object
*/
pentaho.DataTable = function( jsonTable ) {
    this.jsonTable = jsonTable;
    this.className = "pentaho.DataTable";
    if( jsonTable.metadata ) {
        // convert from CDA to DataTable
        this.jsonTable = pentaho.DataTable.convertCdaToDataTable(jsonTable);
    }
}

/*
    convertCdaToDataTable
    Converts a CDA JSON table object to a Google DataTable JSON table object
    
    Input format
    {
        metadata: [
            { colName: 'col1', colType: 'STRING', colLabel: 'Column 1' },
            { colName: 'col2', colType: 'NUMERIC', colLabel: 'Column 2' }
        ],
        resultset: [
            [ 'Row1', 123 ],
            [ 'Row2', 456 ]
        ]
    }
    
    Output format
    {
        cols: [
            { id: 'col1', type: 'string', label: 'Column 1' },
            { id: 'col2', type: 'number', label: 'Column 2' },
        ],
        rows: [
            { c: [ {v: 'Row 1' }, {v: 123} ] },
            { c: [ {v: 'Row 2' }, {v: 456} ] }
        ]
    }
    
    cdaTable:   a CDA JSON table
    returns:    a Google DataTable JSON table object
*/
pentaho.DataTable.convertCdaToDataTable = function( cdaTable ) {

    var cols = [];
    var rows = [];
    
    // create the columns objects
    for(var columnIdx=0; columnIdx<cdaTable.metadata.length; columnIdx++) {
        // create a column object
        col = {
            id: cdaTable.metadata[columnIdx].colName,
            type: cdaTable.metadata[columnIdx].colType.toLowerCase(),
            label: cdaTable.metadata[columnIdx].colLabel
        }
        if(!col.label) {
            col.label = col.id;
        }
        if(col.type == 'numeric') {
            // convert 'numeric' to 'number' to be compatible with Google Charts
            col.type = 'number';
        }
        // add the column to the cols array
        cols.push(col);
    }
    
    // now add the rows
    var cdaData = cdaTable.resultset;
    for(var rowIdx=0; rowIdx<cdaData.length; rowIdx++) {
        // create a cells array
        var cells = [];
        var cdaRow = cdaData[rowIdx];
        for( columnIdx=0; columnIdx<cdaRow.length; columnIdx++ ) {
            // add a value to the cells array
            cells.push({
                v: cdaRow[columnIdx]
            });
        }
        var row = {
            c: cells
        };
        // add the row to the rows array
        rows.push(row);
    }
    
    // returns the finished object
    return {
        cols: cols,
        rows: rows
    };

}

/*
    Add Java classnames in select places so that this data table can be
    deserialized from JSON into Java objects
*/
pentaho.DataTable.prototype.makePostable = function() {
    this.jsonTable["class"] = "org.pentaho.dataservice.DataTable";
    for( var idx=0; idx<this.getNumberOfColumns(); idx++ ) {
        this.jsonTable.cols[idx]["class"] = "org.pentaho.dataservice.Column";
    } 
    for( var idx=0; idx<this.getNumberOfRows(); idx++ ) {
        var cells = this.jsonTable.rows[idx].c;
        if( cells ) {
            for( cellNo=0; cellNo<cells.length; cellNo++ ) {
                if( cells[cellNo] ) {
                    cells[cellNo]["class"] = "org.pentaho.dataservice.Cell";
                }
            }
        }
    }
}

/*
    Returns the underlying JSON table
*/
pentaho.DataTable.prototype.getJsonTable = function() {
    return this.jsonTable;
}
 
/*
    getNumberOfColumns
    returns     The number of columns in the table
*/
pentaho.DataTable.prototype.getNumberOfColumns = function() {
    return this.jsonTable.cols.length;
}

/*
    getNumberOfRows
    returns     The number of rows in the table
*/
pentaho.DataTable.prototype.getNumberOfRows = function() {
    return this.jsonTable.rows.length;
}

/*
    getColumnType
    columnIdx   The column number (zero based)
    returns     The type of the specified column (number, string, date, boolean
*/
pentaho.DataTable.prototype.getColumnType = function(columnIdx) {
    return this.jsonTable.cols[columnIdx].type;
}

/*
    getColumnId
    columnIdx   The column number (zero based)
    returns     The id of the specified column
*/
pentaho.DataTable.prototype.getColumnId = function(columnIdx) {
    return this.jsonTable.cols[columnIdx].id;
}

/*
    getColumnLabel
    columnIdx   The column number (zero based)
    returns     The label of the specified column
*/
pentaho.DataTable.prototype.getColumnLabel = function(columnIdx) {
    return this.jsonTable.cols[columnIdx].label;
}

/*
    getValue
    columnIdx   The column number (zero based)
    rowIdx      The row number (zero based)
    returns     The value of the specified cell
*/
pentaho.DataTable.prototype.getValue = function(rowIdx,columnIdx) {
    if(!this.jsonTable.rows[rowIdx].c[columnIdx]){
        return null;
    }
    if( this.jsonTable.rows[rowIdx].c[columnIdx].v !== undefined ) {
        // we have a value field so return it
        return this.jsonTable.rows[rowIdx].c[columnIdx].v;
    } else {
        return this.jsonTable.rows[rowIdx].c[columnIdx];
    }
}

/*
    Returns the cell object
*/
pentaho.DataTable.prototype._getCell = function(rowIdx,columnIdx) {
    if(!this.jsonTable.rows[rowIdx].c[columnIdx]){
        return null;
    }
    return this.jsonTable.rows[rowIdx].c[columnIdx];
}


/*
    getFormattedValue
    columnIdx   The column number (zero based)
    rowIdx      The row number (zero based)
    returns     The formatted value of the specified cell
*/
pentaho.DataTable.prototype.getFormattedValue = function(rowIdx,columnIdx) {
    if( !this.jsonTable.rows[rowIdx].c[columnIdx] ) {
        return null;
    }
    else if( this.jsonTable.rows[rowIdx].c[columnIdx].f !== undefined ) {
        // we have a formatted value so return it
        return this.jsonTable.rows[rowIdx].c[columnIdx].f;
    } 
    else if( this.jsonTable.rows[rowIdx].c[columnIdx].v !== undefined ) {
        // we have a value field so return it
        return this.jsonTable.rows[rowIdx].c[columnIdx].v;
    } 
    else if( this.jsonTable.rows[rowIdx].c[columnIdx].v == null ) {
        // we have a null value field so return it
        return null;
    } 
    else {
        return this.jsonTable.rows[rowIdx].c[columnIdx];
    }
}

/*
    getColumnRange
    Returns a range object describing the minimum and maximum values from the specified column
    columnIdx   The column number (zero based)
    options      A keyword arguments object.
    options.key  A function that extracts the values from the column data.
    returns      A range object - { min: 123, max: 456 }.
                 When there is no data, or all data is null or NaN, the returned
                 range object will have both its properties, 'min' and 'max', 
                 with the value undefined.
*/
pentaho.DataTable.prototype.getColumnRange = function(columnIdx, options) {

    var min;
    var max;
    var set = false;
    var key = options && options.key;
    
    for( var rowNo=0; rowNo<this.getNumberOfRows(); rowNo++ ) {
        // get the value from this row
        var value = this.getValue( rowNo, columnIdx );
        if(value != null) {
            if(key){
                value = key(value);
            }
            
            if(!set) {
                min = value;
                max = value;
                set = true;
            } else {
                if( value < min ) {
                    min = value;
                }
                if( value > max ) {
                    max = value;
                }
            }
        }
    }
    
    // return the range 
    var range = {
        min: min,
        max: max
    }
    return range;

}

/*
    getDistinctValues
    Returns an array of the distinct values from the specified column
    columnIdx   The column number (zero based)
    Returns     An array of the distinct values from the specified column
*/
pentaho.DataTable.prototype.getDistinctValues = function(columnIdx) {
    var values = [];
    var valueMap = {};
    var isNumber = this.getColumnType(columnIdx) == 'number';
    for( var rowNo=0; rowNo<this.getNumberOfRows(); rowNo++ ) {
        var value = isNumber ? this.getValue( rowNo, columnIdx ) : this.getFormattedValue( rowNo, columnIdx );
        if( !valueMap[value] ) {
            valueMap[value] = true;
            values.push(value);
        }
    }
    return values;
}

/*
    getDistinctFormattedValues
    Returns an array of the distinct formatted values from the specified column
    columnIdx   The column number (zero based)
    Returns     an array of the distinct formatted values from the specified column
*/
pentaho.DataTable.prototype.getDistinctFormattedValues = function(columnIdx) {
    var values = [];
    var valueMap = {};
    for( var rowNo=0; rowNo<this.getNumberOfRows(); rowNo++ ) {
        var value = this.getFormattedValue( rowNo, columnIdx );
        if( !valueMap[value] ) {
            valueMap[value] = true;
            values.push(value);
        }
    }
    return values;
}

/*
    getFilteredRows
    Filters the rows of the table using the specified filter(s). Returns an array of the row numbers
    that met the filter criteria. The result can be passed to DataView.setRows to get a filtered table
    
    To filter on column 0 == 'France'
    var rows = dataTable.getFilteredRows({ column: 0, value: 'France' })
    var view = new pentaho.DataView( dataTable );
    view.setRows(rows)
    
    To combine France and Germany
    var rows = dataTable.getFilteredRows({ column: 0, combine: [{values:['France','Germany']}] })
    var view = new pentaho.DataView( dataTable );
    view.setRows(rows)
    
    Returns     an array of row nummbers of the rows that met the filter requirements
*/
pentaho.DataTable.prototype.getFilteredRows = function(filters) {
    var rows = [];
    var comboMap = {};
    for( var rowNo=0; rowNo<this.getNumberOfRows(); rowNo++ ) { // check each row
        for( var filterNo=0; filterNo<filters.length; filterNo++ ) { // check each filter
            if( filters[filterNo].value ) {
                // this is a 'filter by value'
                if( this.getValue( rowNo, filters[filterNo].column ) == filters[filterNo].value ) {
                    // this row passes the filter requirements, add the row number to the rows array
                    rows.push( rowNo );
                }
            }
            if( filters[filterNo].combinations ) {
                // this is a 'local combination of rows'
                var value = this.getValue( rowNo, filters[filterNo].column );
                var combinations = filters[filterNo].combinations;
                var combined = false;
                for( combinationNo=0; combinationNo<combinations.length; combinationNo++ ) {
                    // check the values
                    for( valueNo=0; valueNo<combinations[combinationNo].values.length; valueNo++ ) {
                        if( value == combinations[combinationNo].values[valueNo] ) {
                            // found something to combine
                            if( comboMap[combinationNo] ) {
                                comboMap[combinationNo][1].push( rowNo );
                            } else {
                                // this is a new one
                                var row = ['combine',[]];
                                row[1].push( rowNo );
                                rows.push( row );
                                comboMap[combinationNo] = row;
                            }
                            combined = true;
                        }
                    }
                }
                if( !combined ) {
                    rows.push( rowNo );
                }
            }
        }
    }
    return rows;
}

/*
    setColumnProperty
    Sets a column property

    columnIndex The index of the column to set the property on
    name        The name of the property
    value       The value of the property
*/
pentaho.DataTable.prototype.setColumnProperty = function(columnIndex, name, value) {
    if( columnIndex >= 0 && columnIndex < this.jsonTable.cols.length) {
        this.jsonTable.cols[columnIndex][name] = value;
    }
}

/*
    getColumnProperty
    Returns a column property

    columnIndex The index of the column to set the property on
    name        The name of the property

    Return      The value of the property
*/
pentaho.DataTable.prototype.getColumnProperty = function(columnIndex, name) {
    if( columnIndex >= 0 && columnIndex < this.jsonTable.cols.length) {
        return this.jsonTable.cols[columnIndex][name];
    }
    return null;
}

/****************************************************
    pentaho.DataView
    A client-side data view object.
    Provides a way to access a subset of a DataTable.
    You can reduce the rows and/or columns of the
    underlying DataTable
****************************************************/

/*
    Constructor
    dataTable:  A DataTable object to base this view on
*/
pentaho.DataView = function( dataTable ) {
    this.dataTable = dataTable;
    this.rows = null;
    this.columns = null;
    this.className = "pentaho.DataView";
}

/*
    setRows
    Sets the row numbers of the rows to have in the view.
    The row numbers do not have to match the order of the
    underlying table.
    If this function is not called this DataView will include
    all the rows of the underlying DataTable.
    All of the row numbers must be within the range of valid
    row numbers for the DataTable.
    
    rows    An array of row numbers
*/
pentaho.DataView.prototype.setRows = function(rows) {
    this.rows = rows;
}

/*
    setColumns
    Sets the column numbers to have in the view.
    The column numbers do not have to match the order of the
    columns in the underlying table.
    If this function is not called this DataView will include
    all the columns of the underlying DataTable.
    All of the columns numbers must be within the range of valid
    columns numbers for the DataTable.
    
    columns    An array of columns numbers
*/
pentaho.DataView.prototype.setColumns = function(columns) {
    this.columns = columns;
}

/*
    getColumnRange
    Returns a range object describing the minimum and maximum values from the specified column
    columnIdx   The column number (zero based)
    options      A keyword arguments object.
    options.key  A function that extracts the values from the column data.
    returns      A range object - { min: 123, max: 456 }.
                 When there is no data, or all data is null or NaN, the returned
                 range object will have both its properties, 'min' and 'max', 
                 with the value undefined.
*/
pentaho.DataView.prototype.getColumnRange = function(columnIdx, options) {

    var min;
    var max;
    var set = false;
    var key = options && options.key;
    
    for( var rowNo=0; rowNo<this.getNumberOfRows(); rowNo++ ) {
        var value = this.getValue( rowNo, columnIdx );
        if(value != null) {
            if(key){
                value = key(value);
            }
            
            if(!set) {
                min = value;
                max = value;
                set = true;
            } else {
                if( value < min ) {
                    min = value;
                }
                if( value > max ) {
                    max = value;
                }
            }
        }
    }
    var range = {
        min: min,
        max: max
    }
    return range;

}

/*
    getDistinctValues
    Returns an array of the distinct values from the specified column
    columnIdx   The column number (zero based)
    Returns     An array of the distinct values from the specified column
*/
pentaho.DataView.prototype.getDistinctValues = function(columnIdx) {
    var values = [];
    var valueMap = {};
    for( var rowNo=0; rowNo<this.getNumberOfRows(); rowNo++ ) {
        var value = this.getValue( rowNo, columnIdx );
        if( !valueMap[value] ) {
            valueMap[value] = true;
            values.push(value);
        }
    }
    return values;
}

/*
    getDistinctFormattedValues
    Returns an array of the distinct formatted values from the specified column
    columnIdx   The column number (zero based)
    Returns     an array of the distinct formatted values from the specified column
*/
pentaho.DataView.prototype.getDistinctFormattedValues = function(columnIdx) {
    var values = [];
    var valueMap = {};
    for( var rowNo=0; rowNo<this.getNumberOfRows(); rowNo++ ) {
        var value = this.getFormattedValue( rowNo, columnIdx );
        if( !valueMap[value] ) {
            valueMap[value] = true;
            values.push(value);
        }
    }
    return values;
}

/*
    hideColumns
    Removes columns from the view.
    The list of column numbers to hide must be in ascending order so the indexes don't shift as we delete.
    
    columns     An array of column numbers to hide
*/
pentaho.DataView.prototype.hideColumns = function(columns) {
    tmpCols = [];
    for( var columnIdx=0; columnIdx < this.getNumberOfColumns(); columnIdx++ ) {
        tmpCols.push( columnIdx );
    }
    for( var idx=columns.length-1; idx> -1; idx-- ) {
        tmpCols.splice(columns[idx],1)
    }
    this.columns = tmpCols;
}

/*
    getNumberOfRows
    returns     The number of rows in the table
*/
pentaho.DataView.prototype.getNumberOfRows = function() {
    return this.rows == null ? this.dataTable.getNumberOfRows() : this.rows.length;
}

/*
    getNumberOfColumns
    returns     The number of columns in the table
*/
pentaho.DataView.prototype.getNumberOfColumns = function() {
    return this.columns == null ? this.dataTable.getNumberOfColumns() : this.columns.length;
}

/*
    getColumnId
    columnIdx   The column number (zero based)
    returns     The id of the specified column
*/
pentaho.DataView.prototype.getColumnId = function(columnIdx) {
    return this.columns == null ? this.dataTable.getColumnId(columnIdx) : this.dataTable.getColumnId(this.columns[columnIdx]);
}

/*
    getColumnLabel
    columnIdx   The column number (zero based)
    returns     The label of the specified column
*/
pentaho.DataView.prototype.getColumnLabel = function(columnIdx) {
    return this.columns == null ? this.dataTable.getColumnLabel(columnIdx) : this.dataTable.getColumnLabel(this.columns[columnIdx]);
}

/*
    getColumnType
    columnIdx   The column number (zero based)
    returns     The type of the specified column (number, string, date, boolean
*/
pentaho.DataView.prototype.getColumnType = function(columnIdx) {
    return this.columns == null ? this.dataTable.getColumnType(columnIdx) : this.dataTable.getColumnType(this.columns[columnIdx]);
}

/*
    getValue
    columnIdx   The column number (zero based)
    rowIdx      The row number (zero based)
    returns     The value of the specified cell
*/
pentaho.DataView.prototype.getValue = function(rowNo, colNo) {
    var rowIdx = this.rows == null ? rowNo : this.rows[rowNo];
    var colIdx = this.columns == null ? colNo : this.columns[colNo];
    if( rowIdx.length && rowIdx[0] == 'combine' ) {
        // this is a combined row

        var type = this.getColumnType(colNo);
        var value 
        for( var idx=0; idx<rowIdx[1].length; idx++ ) {
            if( idx == 0 ) {
                value = this.dataTable.getValue(rowIdx[1][idx], colIdx);
            }
            else if( type == 'string' ) {
                value += ' + '+this.dataTable.getValue(rowIdx[1][idx], colIdx);
            }
            else if( type == 'number' ) {
                value += this.dataTable.getValue(rowIdx[1][idx], colIdx);
            }
        }
        return value;
    }
    return this.dataTable.getValue(rowIdx, colIdx);
}

pentaho.DataView.prototype._getCell = function(rowNo, colNo) {
    var rowIdx = this.rows == null ? rowNo : this.rows[rowNo];
    var colIdx = this.columns == null ? colNo : this.columns[colNo];
    return this.dataTable._getCell(rowIdx, colIdx);
}

/*
    getFormattedValue
    columnIdx   The column number (zero based)
    rowIdx      The row number (zero based)
    returns     The formatted value of the specified cell
*/
pentaho.DataView.prototype.getFormattedValue = function(rowNo, colNo) {
    var rowIdx = this.rows == null ? rowNo : this.rows[rowNo];
    var colIdx = this.columns == null ? colNo : this.columns[colNo];
    if( rowIdx.length && rowIdx[0] == 'combine' ) {
        // this is a combined row

        var type = this.getColumnType(colNo);
        var value 
        for( var idx=0; idx<rowIdx[1].length; idx++ ) {
            if( idx == 0 ) {
                value = this.dataTable.getFormattedValue(rowIdx[1][idx], colIdx);
            }
            else if( type == 'string' ) {
                value += ' + '+this.dataTable.getFormattedValue(rowIdx[1][idx], colIdx);
            }
            else if( type == 'number' ) {
                value += this.dataTable.getFormattedValue(rowIdx[1][idx], colIdx);
            }
        }
        return value;
    }
    return this.dataTable.getFormattedValue(rowIdx, colIdx);
}

/*
    toDataTable
    Converts this view into a DataTable that has its own copy of the
    underlying data.
    The column metadata and the rows are copied into the new object.
    
    Returns:    A DataTable
*/
pentaho.DataView.prototype.toDataTable = function() {

    var cols = [];
    for( var colIdx=0; colIdx<this.getNumberOfColumns(); colIdx++ ) {
        col = {
            type: this.getColumnType(colIdx),
            id:  this.getColumnId(colIdx),
            label: this.getColumnLabel(colIdx)
        }
        cols.push(col);
    }
    
    var rows = [];
    for( var rowIdx=0; rowIdx<this.getNumberOfRows(); rowIdx++ ) {
        cells = [];
        for( var colIdx=0; colIdx<this.getNumberOfColumns(); colIdx++ ) {
            var cell = this._getCell(rowIdx, colIdx);
            cells.push(cell);
        }
        row = {
            c: cells
        };
        rows.push( row );
    }
    
    var json = { cols: cols, rows: rows };
    
    var table = new pentaho.DataTable(json);
    return table;

}

/*
    setColumnProperty
    Sets a column property

    columnIndex The index of the column to set the property on
    name        The name of the property
    value       The value of the property
*/
pentaho.DataView.prototype.setColumnProperty = function(columnIndex, name, value) {
    this.dataTable.setColumnProperty(columnIndex, name, value);
}

/*
    getColumnProperty
    Returns a column property

    columnIndex The index of the column to set the property on
    name        The name of the property

    Return      The value of the property
*/
pentaho.DataView.prototype.getColumnProperty = function(columnIndex, name) {
    return this.dataTable.getColumnProperty(columnIndex, name);
};

/* TRENDS */

(function(){

    function argRequired(name){
        return new Error("Argument '" + name + "' is required.");
    }
    
    function argInvalid(name, text){
        return new Error("Argument '" + name + "' is invalid." + (text ? (" " + text) : ""));
    }
    
    /* createTrend
     * Computes a trend of a given type and adds the 
     * result to a new column in the data table.
     *  
     * trendArgs Keyword arguments
     * trendArgs.type  The type of trend to create; possible values: 'linear'
     * trendArgs.x     The index of the "x" value column; can be a numeric or string column
     * trendArgs.y     The index of the "y" value column; must be of a column of type 'number'
     * trendArgs.name  The name of the new trend column; defaults to the type of trend plus the suffix "Trend"
     * trendArgs.label The label of the new trend column; defaults to the trend name, if specified, or the default label of the trend type.
     * 
     */
    pentaho.DataView.prototype.createTrend = 
    pentaho.DataTable.prototype.createTrend = function(trendArgs){
        
        // Validate arguments
        
        if(!(trendArgs instanceof Object)){
            throw argRequired('trendArgs');
        }
        
        // ----
        
        var trendType = trendArgs.type;
        if(!trendType){
            throw argRequired('trendArgs.type');
        }
        
        trendType = '' + trendType; // toString
        
        var trendInfo = pentaho.trends.get(trendType, /*assert*/ true);
        
        // -----
        
        var colCount = this.getNumberOfColumns();
        
        var xIndex = trendArgs.x;
        if(xIndex == null){
            throw argRequired('trendArgs.x');
        }
        
        xIndex = +xIndex; // toNumber
        if(isNaN(xIndex)){
            throw argInvalid('trendArgs.x', "Not a number.");
        }
        
        if(xIndex < 0 || xIndex >= colCount){
            throw argInvalid('trendArgs.x', "Out of range.");
        }
        
        // can be numeric or string
        
        // -----
        
        var yIndex = trendArgs.y;
        if(yIndex == null){
            throw argRequired('trendArgs.y');
        }
        
        yIndex = +yIndex; // toNumber
        if(isNaN(yIndex)){
            throw argInvalid('trendArgs.y', "Not a number.");
        }
        
        if(yIndex < 0 || yIndex >= colCount){
            throw argInvalid('trendArgs.y', "Out of range.");
        }
        
        if(this.getColumnType(yIndex) !== 'number'){
            throw argInvalid('trendArgs.y', "Must be a numeric column.");
        }
        
        // xIndex may be equal to yIndex...
        
        // ----
        
        var trendName  = trendArgs.name  ||
                         (trendType + "Trend");
        
        var trendLabel = trendArgs.label ||
                         (trendArgs.name ?  trendName : trendInfo.label);
        
        // ----
        
        var trendOptions = trendArgs.options || {};
        
        // ----
        
        // Create the trend column. 
        //   Am I a DataView or a DataTable?
        var table = (this.dataTable || this).jsonTable;
        var trendIndex = table.cols.length; 
        table.cols.push({
            type:  'number',
            id:    trendName,
            label: trendLabel
        });
        
        // ----
        
        var isXDiscrete = this.getColumnType(xIndex) !== 'number';
        
        var rowIndexesEnumtor = this.getRowIndexEnumerator();
        
        var me = this;
        
        var funX = isXDiscrete ? 
            null : // means: "use *index* as X value"
            function(i){
                return me.getValue(i, xIndex);
            };
        
        var funY = function(i){
                return me.getValue(i, yIndex);
            };
        
        var options = Object.create(trendOptions);
        options.rows = rowIndexesEnumtor;
        options.x = funX;
        options.y = funY;
        
        var trendModel = trendInfo.model(options);
        if(!trendModel){
            // Not enough points to interpolate...
            // Fill every row's trend column with null
            dojo.forEach(table.rows, function(row){
                row.c[trendIndex] = {v: null};
            });
            
            return false;
        }
        
        dojo.forEach(table.rows, function(row, i){
            var trendX = funX ? funX(i) : i;
            var trendY = trendX != null ?
                trendModel.sample(trendX, funY(i), i) : 
                null;
            
            row.c[trendIndex] = {v: trendY};
        });
        
        return true;
    };

    /* getRowIndexEnumerator
     * 
     * Obtains an enumerator for the row index of the data table. 
     */
    pentaho.DataView.prototype.getRowIndexEnumerator = 
    pentaho.DataTable.prototype.getRowIndexEnumerator = function(){
        var index = -1;
        var count = this.getNumberOfRows();
        var enumtor = {
            item: undefined,
            next: function(){
                if(index < count - 1){
                    enumtor.item = ++index; // the row index
                    return true;
                }
                
                if(enumtor.item) {
                    enumtor.item = undefined; 
                }
                
                return false;
            }
        };
        
        return enumtor;
    };
        
    /* trendType -> trendInfo */
    var _trends = {};
    
    pentaho.trends = {};
    
    /* define
     * Defines a trend type given its specification.
     * 
     * type The type of trend to define.
     * spec The trend specification object.
     * spec.label A name for the type of trend; defaults to the capitalized trend type with the suffix "Trend".
     * spec.model A function that given a series of points computes a trend model.
     * 
     */
    pentaho.trends.define = function(type, spec){
        if(!type){
            throw argRequired('type');
        }
        
        type = '' + type; // to string
        
        if(!spec){
            throw argRequired('spec');
        }
        
        // ----
        
        var model = spec.model;
        if(!model){
            throw argRequired('spec.model');
        }
        
        if(typeof model !== 'function'){
            throw argInvalid('spec.model', "Not a function");
        }
        
        // ----
        
        var label = spec.label;
        if(!label){
            label = type.chartAt(0).toUpperCase() + type.substr(1) + " Trend";
        }
        
        var trendInfo = {
           type:  type,
           label: label,
           model: model
        };
        
        _trends[type] = trendInfo;
    };
    
    /* get
     * Obtains the trend info object of a given trend type.
     * 
     * type The type of trend desired.
     * assert If an error should be thrown if the trend type is not defined.
     */
    pentaho.trends.get = function(type, assert){
        if(!type){
            throw argRequired('type');
        }
        
        var trendInfo = _trends.hasOwnProperty(type) ? _trends[type] : null;
        if(!trendInfo && assert){
            throw argInvalid('type', "There is no trend type named '" + type + "'.");
        }
        
        return trendInfo;
    };
    
    /* types
     * Obtains an array with the names of all defined trend types.
     */
    pentaho.trends.types = function(){
        // TODO: replace with dojo or JavaScript's Object.keys implementation...
        
        var ret = [];
        for(var p in _trends){
            if(Object.prototype.hasOwnProperty.call(_trends, p)){
                ret.push(p);
            }
        }

        return ret;
    };
    
    // --------------------
    
    function parseNum(value){
        return value != null ? (+value) : NaN;  // to Number works for dates as well
    }
  
    pentaho.trends.define('linear', {
        label: 'Linear trend',
        model: function(options){
            var rowsQuery = options.rows;
            var funX = options.x;
            var funY = options.y;
            
            var i = 0;
            var N = 0;
            var sumX  = 0;
            var sumY  = 0;
            var sumXY = 0;
            var sumXX = 0;
            
            while(rowsQuery.next()){
                var row = rowsQuery.item;
                
                // Ignore null && NaN values
                var x = funX ? parseNum(funX(row)) : i; // use the index itself for discrete stuff
                if(!isNaN(x)){
                    var y = parseNum(funY(row));
                    if(!isNaN(y)){
                        N++;
                        
                        sumX  += x;
                        sumY  += y;
                        sumXY += x * y;
                        sumXX += x * x;
                    }
                }
                
                i++; // Discrete nulls must still increment the index
            }
            
            // y = alpha + beta * x
            var alpha, beta;
            if(N >= 2){
                var avgX  = sumX  / N;
                var avgY  = sumY  / N;
                var avgXY = sumXY / N;
                var avgXX = sumXX / N;
            
                // When N === 1 => den = 0
                var den = (avgXX - avgX * avgX);
                if(den === 0){
                    beta = 0;
                } else {
                    beta = (avgXY - (avgX * avgY)) / den;
                }
                
                alpha = avgY - beta * avgX;
                
                return {
                    alpha: alpha,
                    beta:  beta,
                    
                    reset: function(){},
                    
                    // y = alpha + beta * x
                    sample: function(x){
                        return alpha + beta * (+x);
                    }
                };
            }
        }
    });
    
}());