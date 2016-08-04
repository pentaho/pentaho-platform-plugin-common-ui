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

    // cells
    getValue: function(rowIndex, colIndex) {
      return this.getCell(rowIndex, colIndex).value;
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
