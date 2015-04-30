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
  "./AbstractDataTable",
  "./DataTable",
  "./DataView"
], function(AbstractDataTable, DataTable, DataView) {
  /**
   * @module common-ui.vizapi.data
   */

  function argRequired(name) {
    return new Error("Argument '" + name + "' is required.");
  }

  function argInvalid(name, text) {
    return new Error("Argument '" + name + "' is invalid." + (text ? (" " + text) : ""));
  }

  // NOTE: This needs unit-testing before being documented publicly.

  /*
   * Computes a trend of a given type and adds the
   * result to a new column in the table.
   *
   * For data views,
   * this method creates the trend in the _root_ `DataTable`,
   * and makes the created trend column visible in the intervening views.
   *
   * @method createTrend
   * @for AbstractDataTable
   * @param {Object} trendArgs A keyword arguments object.
   * @param {String} trendArgs.type  The type of trend to create; possible values: 'linear'.
   * @param {Number} trendArgs.x     The index of the "x" value column; can be a numeric or string column.
   * @param {Number} trendArgs.y     The index of the "y" value column; must be of a column of type 'number'.
   * @param {String} trendArgs.name  The name of the new trend column; defaults to the type of trend plus the suffix "Trend".
   * @param {String} trendArgs.label The label of the new trend column; defaults to the trend name, when specified, or to the default label of the trend type.
   * @return {Number} The index of the added trend column.
   */

  DataView.prototype.createTrend = function(trendArgs) {
    var trendIndex = this._source.createTrend(trendArgs);
    return this._columns.push(trendIndex) - 1;
  };

  DataTable.prototype.createTrend = function(trendArgs) {
    // Argument validation
    // ===================

    if(!(trendArgs instanceof Object)) throw argRequired('trendArgs');

    // # TrendType

    var trendType = trendArgs.type;
    if(!trendType) throw argRequired('trendArgs.type');

    trendType = '' + trendType; // toString

    var trendInfo = trends_get(trendType, /*assert*/ true);

    // # x

    var colCount = this.getNumberOfColumns();

    var xIndex = trendArgs.x;
    if(xIndex == null) throw argRequired('trendArgs.x');

    xIndex = +xIndex; // toNumber
    if(isNaN(xIndex)) throw argInvalid('trendArgs.x', "Not a number.");

    if(xIndex < 0 || xIndex >= colCount) throw argInvalid('trendArgs.x', "Out of range.");

    // can be numeric or string

    // # y

    var yIndex = trendArgs.y;
    if(yIndex == null)
      throw argRequired('trendArgs.y');

    yIndex = +yIndex; // toNumber
    if(isNaN(yIndex))
      throw argInvalid('trendArgs.y', "Not a number.");

    if(yIndex < 0 || yIndex >= colCount)
      throw argInvalid('trendArgs.y', "Out of range.");

    if(this.getColumnType(yIndex) !== 'number')
      throw argInvalid('trendArgs.y', "Must be a numeric column.");

    // xIndex may be equal to yIndex...

    // # name and label

    var trendName  = trendArgs.name  ||
                     (trendType + "Trend");

    var trendLabel = trendArgs.label ||
                     (trendArgs.name ?  trendName : trendInfo.label);

    // # custom options

    var trendOptions = trendArgs.options || {};

    // Create Trend Column
    // ===================

    // TODO: Use setCell method when available.

    // Create the trend column.
    // Am I a DataView or a DataTable?
    var trendIndex = this.addColumn({
      id:    trendName,
      type:  'number',
      label: trendLabel
    });

    var table = this._jsonTable;
    var me = this;

    // ----

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

    dojo.forEach(table.rows, function(row, i){
      var trendX = getX ? getX(i) : i,
          trendY = trendX != null ? trendModel.sample(trendX, getY(i), i) : null;

      row.c[trendIndex] = {v: trendY};
    });

    return true;
  };

  /* getRowIndexEnumerator
   *
   * Obtains an enumerator for the row index of the data table.
   */
  AbstractDataTable.prototype.getRowIndexEnumerator = function() {
    var index = -1,
        count = this.getNumberOfRows(),
        enumtor = {
          item: undefined,
          next: function() {
              if(index < count - 1) {
                  enumtor.item = ++index; // the row index
                  return true;
              }

              if(enumtor.item) enumtor.item = undefined;

              return false;
          }
        };

    return enumtor;
  };

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
    if(!type) throw argRequired('type');

    type = '' + type; // to string

    if(!spec) throw argRequired('spec');

    // ----

    var model = spec.model;
    if(!model) throw argRequired('spec.model');
    if(typeof model !== 'function') throw argInvalid('spec.model', "Not a function");

    // ----

    var label = spec.label;
    if(!label) label = type.chartAt(0).toUpperCase() + type.substr(1) + " Trend";

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
    if(!type) throw argRequired('type');

    var trendInfo = _trends.hasOwnProperty(type) ? _trends[type] : null;
    if(!trendInfo && assert)
      throw argInvalid('type', "There is no trend type named '" + type + "'.");

    return trendInfo;
  };

  /* types
   * Obtains an array with the names of all defined trend types.
   */
  function trends_types() {
    // TODO: replace with dojo or JavaScript's Object.keys implementation...

    var ret = [];
    for(var p in _trends)
      if(Object.prototype.hasOwnProperty.call(_trends, p))
        ret.push(p);

    return ret;
  }

  return {
    types:  trends_types,
    define: trends_define,
    get:    trends_get
  };
});
