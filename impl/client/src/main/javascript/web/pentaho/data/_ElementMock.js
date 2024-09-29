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
  "../lang/Base"
], function(Base) {

  "use strict";

  return Base.extend({
    constructor: function(dataTable, rowIdx) {
      this.table = dataTable;
      this.rowIdx = rowIdx;

      this.$type = {
        has: function(property) {
          return dataTable.model.attributes.get(property) != null;
        }
      };
    },

    getv: function(property) {
      return this.table.getValue(this.rowIdx, this.table.getColumnIndexByAttribute(property));
    },

    getf: function(property) {
      return this.table.getFormattedValue(this.rowIdx, this.table.getColumnIndexByAttribute(property));
    }
  });
});
