
/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "./AbstractTable",
  "./Model",
  "./_plain/Table",
  "./_cross/Table",
  "../util/arg"
], function(AbstractTable, Model, PlainTable, CrossTable, arg) {

  // Map of CDA lowercase colType to DataTable type
  var COLTYPE_CDA_DT = {
    "numeric": "number",
    "integer": "number"
  };

  var Table = AbstractTable.extend("pentaho.data.Table", /** @lends pentaho.data.Table# */{
    /**
     * @alias Table
     * @memberOf pentaho.data
     * @class
     * @extends pentaho.data.AbstractTable
     *
     * @classdesc The `Table` class implements a type of table that directly stores data.
     *
     * ### AMD
     *
     * To obtain the constructor of this class,
     * require the module `"pentaho/data/Table"`.
     *
     * @example <caption>Creating a table from a table specification</caption>
     *
     *     require("pentaho/data/Table", function(Table) {
     *       var plainTable = new Table({
     *         model: [
     *           {name: "family", type: "string", label: "Family"},
     *           {name: "sales",  type: "number", label: "Sales"},
     *         ],
     *         rows: [
     *           {c: [{v: "plains", f: "Plains"}, 12300000]},
     *           {c: [{v: "cars",   f: "Cars"},   {v: 456000}]}
     *         ]
     *       });
     *
     *       // ...
     *     });
     *
     * @example <caption>Creating a table from a plain JavaScript object in CDA format</caption>
     *
     *     require("pentaho/data/Table", function(Table) {
     *       var table = new Table({
     *         metadata: [
     *           {colName: "col1", colType: "STRING",  colLabel: "Column 1"},
     *           {colName: "col2", colType: "NUMERIC", colLabel: "Column 2"}
     *         ],
     *         resultset: [
     *           ["Row1", 123],
     *           ["Row2", 456]
     *         ]
     *       });
     *
     *       // ...
     *     });
     *
     * @example <caption>Creating a table from another</caption>
     *
     *     require("pentaho/data/Table", function(Table) {
     *       // ...
     *
     *       var table = new Table(tableOrView);
     *
     *       // ...
     *     });
     *
     * @description Creates a table given a source of data.
     *
     * A `Table` can be constructed empty, or from either:
     * * a {@link pentaho.data.AbstractTable} object,
     *   in which case its data is copied,
     * * a specification of a table in _plain_ format
     * * a specification of a table in _crossed_ format
     * * a specification of table in _plain CDA_ format,
     * * a string which is the JSON serialization of one of the above three formats.
     *
     * When a table is loaded with data in a _crossed_ format,
     * it exposes a somewhat distorted view of that data.
     * This is only supported only for legacy reasons.
     *
     * It is advisable to immediately convert a table loaded with data in _crossed_ format
     * to a table with the same data,
     * but in a _plain_ format,
     * by using the {@link pentaho.data.Table#toPlainTable} method.
     *
     * @param {string|pentaho.data.spec.ITable|pentaho.data.AbstractTable} [table]
     *    An instance of {@link pentaho.data.AbstractTable},
     *    a table specification, or
     *    a JSON specification string.
     *
     * @amd pentaho/data/Table
     */
    constructor: function(table) {
      var tableSpec = this._readTableArgument(table),
          modelSpec = tableSpec.model,
          TableImplemClass = tableSpec.layout ?  CrossTable : PlainTable;

      this.model = Model.to(modelSpec);
      this.implem = new TableImplemClass(tableSpec, {model: this.model});
    },

    /** @inheritdoc */
    getCell: function(rowIndex, colIndex) {
      return this.implem.getCell(rowIndex, colIndex);
    },

    //region ITableReadOnly
    // table
    /** @inheritdoc */
    getNumberOfColumns: function() {
      return this.implem.getNumberOfColumns();
    },

    /** @inheritdoc */
    getNumberOfRows: function() {
      return this.implem.getNumberOfRows();
    },

    // columns
    /** @inheritdoc */
    getColumnAttribute: function(colIndex) {
      return this.implem.getColumnAttribute(colIndex);
    },

    /** @inheritdoc */
    getColumnType: function(colIndex) {
      return this.implem.getColumnType(colIndex);
    },

    /** @inheritdoc */
    getColumnId: function(colIndex) {
      return this.implem.getColumnId(colIndex);
    },

    /** @inheritdoc */
    getColumnLabel: function(colIndex) {
      return this.implem.getColumnLabel(colIndex);
    },

    // cells
    /** @inheritdoc */
    getValue: function(rowIndex, colIndex) {
      return this.implem.getValue(rowIndex, colIndex);
    },

    /** @inheritdoc */
    getFormattedValue: function(rowIndex, colIndex) {
      return this.implem.getFormattedValue(rowIndex, colIndex);
    },

    /** @inheritdoc */
    getLabel: function(rowIndex, colIndex) {
      return this.implem.getLabel(rowIndex, colIndex);
    },
    //endregion

    //region ITable
    /** @inheritdoc */
    addColumn: function(colSpec, keyArgs) {
      return this.implem.addColumn(colSpec, keyArgs);
    },

    /** @inheritdoc */
    addRow: function(rowSpec, keyArgs) {
      return this.implem.addRow(rowSpec, keyArgs);
    },
    //endregion

    // =====
    // TABLE

    _readTableArgument: function(table) {
      if(!table) return {cols: []};

      if(table instanceof AbstractTable) return table.toSpec();

      // NOTE: `eval` is used instead of `JSON.parse` to be tolerant of Analyzer's comment headers...
      // This is an undocumented feature. Don't depend on it, cause it may change anytime.
      if(typeof table === "string") table = eval('(' + table + ')');

      return table.metadata ? Table.convertJsonCdaToTableSpec(table) : table;
    },

    get isCrossTable() {
      return this.implem instanceof CrossTable;
    },

    get isPlainTable() {
      return this.implem instanceof PlainTable;
    },

    /**
     * Gets a table with the same data but with a plain structure.
     *
     * If this object is already a table with a plain structure,
     * it is returned directly.
     *
     * Otherwise, a new `Table` instance is created
     * with a specification obtained by calling
     * {@link pentaho.data.Table#toSpecPlain},
     * with the same keyword arguments,
     * and is returned.
     *
     * @return {pentaho.data.Table} A table with a plain structure.
     * @see pentaho.data.Table#toSpecPlain
     */
    toPlainTable: function() {
      if(this.isPlainTable) return this;

      // assert this.isCrossTable

      return new Table(this.toSpecPlain({shareModel: true}));
    },

    /**
     * Gets a table specification with the same data but with a plain structure.
     *
     * If this table has a plain structure,
     * the result of calling
     * {@link pentaho.data.Table#toSpec}
     * with the same keyword arguments is returned.
     *
     * Otherwise,
     * the cross-table structure is mapped to a plain structure
     * by using a standard mapping.
     * The columns of the plain table will be, in order:
     * 1. one column per "crossed-row" attribute
     * 2. one column per "crossed-column" attribute
     * 3. one column per "crossed-measure" attribute
     *
     * @param {Object} [keyArgs] Keyword arguments.
     * @param {boolean} [keyArgs.shareModel=false] Indicates that
     *    the model of the resulting specification will be
     *    the model object itself and not its specification.
     * @return {pentaho.data.spec.IPlainTable} A plain-structure specification of the table.
     * @see pentaho.data.Table#toPlainTable
     */
    toSpecPlain: function(keyArgs) {
      return this._toSpec(keyArgs, true);
    },

    //region ISpecifiable implementation
    /**
     * Creates a specification of the table.
     *
     * @param {Object} [keyArgs] Keyword arguments.
     * @param {boolean} [keyArgs.shareModel=false] Indicates that
     *    the model of the resulting specification will be
     *    the model object itself and not its specification.
     *
     * @return {pentaho.data.spec.ITable} A specification of the table.
     */
    toSpec: function(keyArgs) {
      return this._toSpec(keyArgs, false);
    },
    //endregion

    _toSpec: function(keyArgs, asPlain) {
      var tableSpec = (!asPlain || this.isPlainTable)
          ? this.implem.toSpec(keyArgs)
          : this.implem.toSpecPlain(keyArgs);

      tableSpec.model = arg.optional(keyArgs, "shareModel") ? this.model : this.model.toSpec();
      return tableSpec;
    }
  }, /** @lends pentaho.data.Table */{
    /**
     * Converts a table in JSON _CDA_ format to JSON _DataTable_ format.
     *
     * @example <caption>Converting JSON from CDA to data table format</caption>
     *
     *   require("pentaho/data/Table", function(Table) {
     *     var cdaTableSpec = {
     *        metadata: [
     *          {colName: "country", colType: "STRING",  colLabel: "Country"},
     *          {colName: "sales",   colType: "NUMERIC", colLabel: "Sales"  }
     *        ],
     *        resultset: [
     *          ["Portugal", 12000],
     *          ["Ireland",   6000]
     *        ]
     *     };
     *
     *     var tableSpec = {
     *       model: [
     *         {name: "country", type: "string", label: "Country"},
     *         {name: "sales",   type: "number", label: "Sales"  },
     *       ],
     *       rows: [
     *         {c: [{v: "Portugal"}, {v: 12000}]},
     *         {c: [{v: "Ireland" }, {v:  6000}]}
     *       ]
     *     };
     *
     *     expect(Table.convertJsonCdaToTableSpec(cdaTableSpec)).toEqual(tableSpec);
     *   });
     *
     * @param {Object} cdaTable A table object in _CDA_ format.
     * @return {Object} A table object in _data table_ format.
     * @see pentaho.data.AbstractTable#toJsonCda
     */
    convertJsonCdaToTableSpec: function(cdaTable) {
      var cdaCols = cdaTable.metadata,
          cdaRows = cdaTable.resultset,
          C = cdaCols.length,
          R = cdaRows.length,
          attrSpecs = new Array(C),
          rowSpecs = new Array(R),
          j;

      // Columns
      j = -1;
      while(++j < C) {
        var cdaCol  = cdaCols[j],
            colType = String(cdaCol.colType || 'string').toLowerCase();

        if(COLTYPE_CDA_DT.hasOwnProperty(colType))
          colType = COLTYPE_CDA_DT[colType];

        attrSpecs[j] = {
          name:  cdaCol.colName,
          type:  colType,
          label: cdaCol.colLabel || cdaCol.colName
        };
      }

      // Rows
      var i = -1;
      while(++i < R) {
        var cdaRow = cdaRows[i], cellSpecs = new Array(C);

        // Copy cells
        j = C;
        while(j--) {
          var v = cdaRow[j];
          cellSpecs[j] = v == null ? null : // direct null
              (typeof v === 'object') && ('v' in v) ? v : // direct cell
              {v: v, f: null}; // value to cell
        }

        rowSpecs[i] = {c: cellSpecs};
      }

      return {model: attrSpecs, rows: rowSpecs};
    }
  });

  return Table;
});
