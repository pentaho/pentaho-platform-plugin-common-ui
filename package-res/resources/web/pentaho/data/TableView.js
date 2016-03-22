
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
  "./Table",
  "../lang/_Annotatable",
  "../util/error"
], function(AbstractTable, Table, Annotatable, error) {

  return AbstractTable.extend("pentaho.data.TableView", /** @lends pentaho.data.TableView# */{
    /**
     * @alias TableView
     * @memberOf pentaho.data
     * @class
     * @extends pentaho.data.AbstractTable
     *
     * @classdesc The `View` class implements a type of table that
     * exposes a subset of the rows and/or columns of a source table.
     *
     * ### AMD
     *
     * To obtain the constructor of this class,
     * require the module `"pentaho/data/TableView"`.
     *
     * ### Remarks
     *
     * A view does not directly store data.
     * Instead it lets data of its source table to show through.
     *
     * A view can selectively show rows and/or columns from its source table
     * through use of the
     * {@link pentaho.data.TableView#setSourceRows} and
     * {@link pentaho.data.TableView#setSourceColumns} methods,
     * respectively.
     *
     * Columns can also be hidden by using the
     * {@link pentaho.data.TableView#hideColumns} method,
     * a variant that preserves already hidden columns.
     *
     * A view allows to directly change the source table's data
     * to a certain extent — it is not a read-only view of the source table.
     *
     * Views can be nested to any level.
     *
     * Views are only valid while the columns and/or rows of their source table does not change.
     * The exception to this rule is when the changes to the source table originate from
     * **local** calls to one of the
     * {@link pentaho.data.AbstractTable#addRow} or
     * {@link pentaho.data.AbstractTable#addColumn} methods.
     *
     * @description Creates a table view, given a source table or view.
     *
     * @param {pentaho.data.AbstractTable} table The source table or view.
     */
    constructor: function(table) {
      if(!table) throw error.argRequired("table");

      this._source = table;

      this.model = table.model;

      this._rows    = null;
      this._columns = this._getSourceColumns();
    },

    //region View Source
    /**
     * Gets the view's source table.
     *
     * @return {pentaho.data.AbstractTable} The source table.
     */
    getSourceTable: function() {
      return this._source;
    },

    /**
     * Gets the view's **root** source table.
     *
     * @return {pentaho.data.Table} The root source table.
     */
    getRootSourceTable: function() {
      var source = this._source;
      while(source instanceof TableView) source = source._source;
      return source;
    },

    /**
     * Sets the indexes of the visible source columns.
     *
     * The column indexes do not have to match the order of columns in the source table.
     * However, these must be within the range of valid source column indexes.
     *
     * If this method is not called or is called with a `null` or `undefined` value in the `columns` argument,
     * all of the source columns are made visible.
     *
     * @param {number[]} [columns] An array of source column indexes.
     *
     * @return {pentaho.data.TableView} The view.
     */
    setSourceColumns: function(columns) {
      this._columns = columns ? columns.slice() : this._getSourceColumns();
      return this;
    },

    /**
     * Gets the indexes of the visible source columns.
     *
     * Do **NOT** modify the returned array directly.
     *
     * @return {number[]} The array of source column indexes.
     */
    getSourceColumns: function() {
      return this._columns;
    },

    /**
     * Sets the indexes of the source rows to show in the view.
     *
     * The row indexes do not have to match the order of rows in the source table.
     *
     * If this method is not called, or is called with a `null` or `undefined` value,
     * all of the source rows are included.
     *
     * The row indexes must be within the range of valid row indexes of the source table.
     *
     * @param {number[]} [rows] An array of source row indexes.
     * @return {pentaho.data.TableView} This view.
     */
    setSourceRows: function(rows) {
      this._rows = rows || null;
      return this;
    },

    /**
     * Gets the indexes of the visible source rows.
     *
     * Do **NOT** modify the returned array directly.
     *
     * @return {number[]|null} The array of source row indexes or `null`, if one has not been set.
     */
    getSourceRows: function() {
      return this._rows;
    },

    /**
     * Gets the source column index corresponding to a given view column index.
     *
     * @param {number} colIndex The view column index.
     * @return {number} The source column index.
     */
    getSourceColumnIndex: function(colIndex) {
      return this._columns[colIndex];
    },

    /**
     * Gets the source row index corresponding to a given view row index.
     *
     * @param {number} rowIndex The view row index.
     * @return {number} The source row index.
     */
    getSourceRowIndex: function(rowIndex) {
      return this._rows ? this._rows[rowIndex] : rowIndex;
    },
    //endregion

    /** @inheritdoc */
    getCell: function(rowIndex, colIndex) {
      return this._source.getCell(this.getSourceRowIndex(rowIndex), this.getSourceColumnIndex(colIndex));
    },

    //region ITableReadOnly
    // table
    /** @inheritdoc */
    getNumberOfColumns: function() {
      return this._columns.length;
    },

    /** @inheritdoc */
    getNumberOfRows: function() {
      return this._rows ? this._rows.length : this._source.getNumberOfRows();
    },

    // columns
    /** @inheritdoc */
    getColumnAttribute: function(colIndex) {
      return this._source.getColumnAttribute(this.getSourceColumnIndex(colIndex));
    },

    /** @inheritdoc */
    getColumnType: function(colIndex) {
      return this._source.getColumnType(this.getSourceColumnIndex(colIndex))
    },

    /** @inheritdoc */
    getColumnId: function(colIndex) {
      return this._source.getColumnId(this.getSourceColumnIndex(colIndex))
    },

    /** @inheritdoc */
    getColumnLabel: function(colIndex) {
      return this._source.getColumnLabel(this.getSourceColumnIndex(colIndex))
    },

    // cells
    /** @inheritdoc */
    getValue: function(rowIndex, colIndex) {
      return this._source.getValue(this.getSourceRowIndex(rowIndex), this.getSourceColumnIndex(colIndex));
    },

    /** @inheritdoc */
    getFormattedValue: function(rowIndex, colIndex) {
      return this._source.getFormattedValue(this.getSourceRowIndex(rowIndex), this.getSourceColumnIndex(colIndex));
    },

    /** @inheritdoc */
    getLabel: function(rowIndex, colIndex) {
      return this._source.getLabel(this.getSourceRowIndex(rowIndex), this.getSourceColumnIndex(colIndex));
    },
    //endregion

    //region ITable
    /** @inheritdoc */
    addColumn: function(colSpec, keyArgs) {
      var colIndex = this._source.addColumn(colSpec, keyArgs);
      return this._columns.push(colIndex) - 1;
    },

    /** @inheritdoc */
    addRow: function(rowSpec, keyArgs) {
      // TODO: missing addRow implementation?
      throw new Error("Not implemented");
    },
    //endregion

    /**
     * Gets an array with all of the source column indexes.
     *
     * @ignore
     *
     * @return {number[]} An array of source column indexes.
     */
    _getSourceColumns: function() {
      var j = this._source.getNumberOfColumns(),
          cols = new Array(j);

      while(j--) cols[j] = j;

      return cols;
    },

    /**
     * Hides source columns, given their **source** indexes.
     *
     * A column that is already hidden can be specified.
     *
     * @param {number[]} columns An array of source column indexes to ensure hidden.
     * @return {pentaho.data.TableView} This view.
     */
    hideColumns: function(columns) {
      var cols = this._columns;
      if(cols.length) {
        var hideColsMap = {},
            j;

        // Index the indexes of the specified columns to be hidden.
        j = columns.length;
        while(j--)  hideColsMap[columns[j]] = 1;

        // Remove those indexes from the current visible columns.
        j = cols.length;
        while(j--)
          if(hideColsMap[cols[j]] === 1)
            cols.splice(j, 1);
      }

      return this;
    },

    /**
     * Gets a `Table` loaded with the
     * data accessible through the view's visible rows and columns.
     *
     * This is method is convenience for abbreviating:
     *
     *    require("pentaho/data/Table", function(Table) {
     *      // ...
     *
     *      var table = new Table(thisView.toSpec());
     *
     *      // ...
     *    });
     *
     * @return {pentaho.data.Table} A `Table` with the data of the view.
     */
    toDataTable: function() {
      return new Table(this.toSpec());
    },

    //region ISpecifiable implementation
    /**
     * Creates a specification of the view, in _plain table_ format.
     *
     * This implementation creates a specification
     * not of the views own properties but of the data it shows through.
     * The resulting specification can be used to create a `Table`.
     *
     * The resulting model will have one attribute per distinct view column.
     *
     * @return {pentaho.data.spec.IPlainTable} A specification of the view.
     */
    toSpec: function() {
      // For a cross-table, defines as many model attributes as there are distinct col groups...
      var C = this.getNumberOfColumns(),
          attrSpecs = new Array(C),
          j = -1;

      while(++j < C) {
        var colId = this.getColumnId(j),
            colAttr = this.getColumnAttribute(j),
            attrSpec;

        if(!colAttr) {
          // crossTab with xM === 0
          attrSpec = {
            name: colId,
            label: this.getColumnLabel(j),
            type: "string"
          };
        } else {
          attrSpec = colAttr.toSpec();
          if(colId !== colAttr.name) {
            // crossTab
            attrSpec.name = colId;
            attrSpec.label = this.getColumnLabel(j);
          }
        }

        attrSpecs[j] = attrSpec;
      }

      // Reuse this model's metadata.
      var modelSpec = Annotatable.toSpec(this.model, {attrs: attrSpecs});

      return {
          model: modelSpec,
          rows: this._getJsonRows()
        };
    },

    _getJsonRows: function() {
      var C = this.getNumberOfColumns(),
          R = this.getNumberOfRows(),
          plainRows = new Array(R),
          i = -1;

      while(++i < R) {
        var j = C,
            cells = new Array(C);

        while(j--) cells[j] = this.getCell(i, j).toSpec();

        plainRows[i] = {c: cells};
      }

      return plainRows;
    }
    //endregion
  });
});
