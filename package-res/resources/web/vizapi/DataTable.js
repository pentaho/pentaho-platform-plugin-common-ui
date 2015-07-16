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
  "pentaho/visual/data/DataTable",
  "pentaho/visual/data/DataView",
  "pentaho/visual/data/trends"
], function(DataTable, DataView, trends) {

  /*global pentaho:true*/

  pentaho = typeof pentaho == "undefined" ? {} : pentaho;

  // --------

  pentaho.DataTable = function() {

    DataTable.apply(this, arguments);

    this.jsonTable = this._jsonTable;
    this.className = "pentaho.DataTable";
  };

  pentaho.DataTable.prototype = new DataTable();
  pentaho.DataTable.prototype.constructor = pentaho.DataTable;

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
  };

  // Version with combinations support
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
  };

  // --------

  pentaho.DataView = function() {

    DataView.apply(this, arguments);

    this.dataTable = this._source;
    this.rows = this._rows;
    this.columns = this._columns;
    this.className = "pentaho.DataView";
  }

  pentaho.DataView.prototype = Object.create(DataView.prototype);
  pentaho.DataView.prototype.constructor = pentaho.DataView;

  pentaho.DataView.prototype.setRows = function(rows) {
    DataView.prototype.setRows.apply(this, arguments);
    this.rows = this._rows;
    return this;
  };

  pentaho.DataView.prototype.setColumns = function(columns) {
    DataView.prototype.setColumns.apply(this, arguments);
    this.columns = this._columns;
    return this;
  };

  // -------

  pentaho.trends = trends;
});
