/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
