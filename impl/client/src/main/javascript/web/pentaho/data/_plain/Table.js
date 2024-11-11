/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "../Structure",
  "./RowList",
  "../../lang/Base",
  "../../util/arg",
  "../../util/error"
], function(Structure, RowList, Base, arg, error) {

  return Base.extend("pentaho.data._plain.Table", {

    // keyArgs: model
    constructor: function(spec, keyArgs) {
      if(!spec) throw error.argRequired("spec");

      // When cols are unspecified (nully), create columns' structure from model.
      this.model = arg.required(keyArgs, "model", "keyArgs");

      // Convenience field for `rows.structure`.
      this.cols = Structure.to(spec.cols || this.model.attributes.slice(), {model: this.model});

      this.rows = RowList.to(spec.rows || [], {structure: this.cols});
    },

    getCell: function(rowIndex, colIndex) {
      return this.rows[rowIndex].cells[colIndex];
    },

    // region ITableReadOnly implementation
    getNumberOfColumns: function() {
      return this.cols.length;
    },

    getNumberOfRows: function() {
      return this.rows.length;
    },

    // columns
    getColumnAttribute: function(colIndex) {
      return this.cols[colIndex].attribute;
    },

    getColumnType: function(colIndex) {
      return this.getColumnAttribute(colIndex).type;
    },

    getColumnId: function(colIndex) {
      return this.getColumnAttribute(colIndex).name;
    },

    getColumnLabel: function(colIndex) {
      return this.getColumnAttribute(colIndex).label;
    },

    isColumnKey: function(colIndex) {
      return this.getColumnAttribute(colIndex).isKey;
    },

    getColumnHierarchyName: function(colIndex) {
      return this.getColumnAttribute(colIndex).hierarchyName;
    },

    getColumnHierarchyOrdinal: function(colIndex) {
      return this.getColumnAttribute(colIndex).hierarchyOrdinal;
    },

    // cells
    getValue: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).value;
    },

    getValueKey: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).key;
    },

    getFormattedValue: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).toString();
    },

    getLabel: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).label;
    },
    // endregion

    // region ITable
    addColumn: function(colSpec, keyArgs) {
      var j = this.cols.add(colSpec, keyArgs).ordinal;

      this.rows._onStructurePositionAdded();

      return j;
    },

    addRow: function(rowSpec, keyArgs) {
      var i = this.rows.length;

      this.rows.add(rowSpec, keyArgs);

      return i;
    },
    // endregion

    // region ISpecifiable implementation
    toSpec: function(keyArgs) {
      return {
        cols: this.cols.toSpec(keyArgs),
        rows: this.rows.toSpec()
      };
    }
    // endregion
  });
});
