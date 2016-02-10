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
*
*/
define([
  "./AbstractTable",
  "./Table",
  "./TableView",
  "../util/arg",
  "../util/error"
], function(AbstractDataTable, Table, TableView, arg, error) {
  // NOTE: This needs unit-testing before being documented publicly.

  TableView.implement({
    /*
     * Computes a trend of a given type and adds the
     * result to a new column in the table.
     *
     * For data views,
     * this method creates the trend in the _root_ `Table`,
     * and makes the created trend column visible in the intervening views.
     *
     * @method createTrend
     * @for AbstractTable
     * @param {Object} trendArgs A keyword arguments object.
     * @param {String} trendArgs.type  The type of trend to create; possible values: 'linear'.
     * @param {Number} trendArgs.x     The index of the "x" value column; can be a numeric or string column.
     * @param {Number} trendArgs.y     The index of the "y" value column; must be of a column of type 'number'.
     * @param {String} trendArgs.name  The name of the new trend column; defaults to the type of trend plus the suffix "Trend".
     * @param {String} trendArgs.label The label of the new trend column; defaults to the trend name, when specified, or to the default label of the trend type.
     * @return {Number} The index of the added trend column.
     */
    createTrend: function(trendArgs) {
      var trendIndex = this._source.createTrend(trendArgs);
      return this._columns.push(trendIndex) - 1;
    }
  });

  Table.implement({
      createTrend: function(trendArgs) {
        // Argument validation
        // ===================

        if(!(trendArgs instanceof Object)) throw error.argRequired('trendArgs');

        // # TrendType

        var trendType = trendArgs.type;
        if(!trendType) throw error.argRequired('trendArgs.type');

        trendType = '' + trendType; // toString

        var trendInfo = trends_get(trendType, /*assert*/ true);

        // # x

        var colCount = this.getNumberOfColumns();

        var xIndex = arg.required(trendArgs, "x", "trendArgs");

        xIndex = +xIndex; // toNumber
        if(isNaN(xIndex)) throw error.argInvalidType("trendArgs.x", "number");

        if(xIndex < 0 || xIndex >= colCount) throw error.argOutOfRange("trendArgs.x");

        // can be numeric or string

        // # y

        var yIndex = arg.required(trendArgs, "y", "trendArgs");

        yIndex = +yIndex; // toNumber
        if(isNaN(yIndex)) throw error.argInvalidType("trendArgs.y", "number");

        if(yIndex < 0 || yIndex >= colCount) throw error.argOutOfRange("trendArgs.y");

        if(this.getColumnType(yIndex) !== 'number')
          throw error.argInvalid("trendArgs.y", "Must be a numeric column.");

        // xIndex may be equal to yIndex...

        // # name and label

        var trendName  = trendArgs.name  || (trendType + "Trend");

        var trendLabel = trendArgs.label || (trendArgs.name ?  trendName : trendInfo.label);

        // # custom options

        var trendOptions = trendArgs.options || {};

        // Create Trend Column
        // ===================

        // Create the trend column.
        // Am I a View or a Table?
        this.model.attributes.add({
          name: trendName,
          type: "number",
          label: trendLabel
        });
        var trendIndex = this.addColumn(trendName);

        // ----

        var me = this;

        var isXDiscrete = this.getColumnType(xIndex) !== 'number';

        var rowIndexesEnumtor = this.getRowIndexEnumerator();

        var getX = isXDiscrete ?
            null : // means: "use *index* as X value"
            function(i) { return me.getValue(i, xIndex); };

        var getY = function(i) { return me.getValue(i, yIndex); };

        var options = Object.create(trendOptions);
        options.rows = rowIndexesEnumtor;
        options.x = getX;
        options.y = getY;

        var trendModel = trendInfo.model(options);

        // Not enough points to interpolate?
        // Every row's trend column already has the value null.
        if(!trendModel) return false;

        var i = -1,
            R = this.getNumberOfRows();
        while(++i < R) {
          var trendX = getX ? getX(i) : i,
              trendY = trendX != null ? trendModel.sample(trendX, getY(i), i) : null;

          this.getCell(i, trendIndex).value = trendY;
        }

        return true;
      }
  });

  AbstractDataTable.implement({

    /* getRowIndexEnumerator
     *
     * Obtains an enumerator for the row index of the data table.
     */
    getRowIndexEnumerator: function() {
      var index = -1,
          count = this.getNumberOfRows(),
          enumtor = {
            item: undefined, next: function() {
              if(index < count - 1) {
                enumtor.item = ++index; // the row index
                return true;
              }

              if(enumtor.item) enumtor.item = undefined;

              return false;
            }
          };

      return enumtor;
    }
  });

  /* trendType -> trendInfo */
  var _trends = {};

  /* define
   * Defines a trend type given its specification.
   *
   * type The type of trend to define.
   * spec The trend specification object.
   * spec.label A name for the type of trend; defaults to the capitalized trend type with the suffix "Trend".
   * spec.model A function that given a series of points computes a trend model.
   */
  function trends_define(type, spec){
    if(!type) throw error.argRequired("type");

    type = '' + type; // to string

    if(!spec) throw error.argRequired("spec");

    // ----

    var model = arg.required(spec, "model", "spec");
    if(typeof model !== 'function') throw error.argInvalidType("spec.model", "function");

    // ----

    var label = spec.label;
    if(!label) label = type.charAt(0).toUpperCase() + type.substr(1) + " Trend";

    _trends[type] = {
      type:  type,
      label: label,
      model: model
    };
  };

  /* get
   * Obtains the trend info object of a given trend type.
   *
   * type The type of trend desired.
   * assert If an error should be thrown if the trend type is not defined.
   */
  function trends_get(type, assert) {
    if(!type) throw error.argRequired("type");

    var trendInfo = _trends.hasOwnProperty(type) ? _trends[type] : null;
    if(!trendInfo && assert)
      throw error.argInvalid("type", "There is no trend type named '" + type + "'.");

    return trendInfo;
  };

  /* types
   * Obtains an array with the names of all defined trend types.
   */
  function trends_types() {
    return Object.keys(_trends);
  }

  return {
    types:  trends_types,
    define: trends_define,
    get:    trends_get
  };
});
