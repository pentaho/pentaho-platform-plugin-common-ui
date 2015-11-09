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
  "./Row",
  "../_WithStructure",
  "../_WithCellTupleBase",
  "../List",
  "../../_utils"
], function(Row, WithStructure, WithCellTupleBase, List, utils) {

  function RowList(keyArgs) {
    WithStructure.call(this, keyArgs);
    WithCellTupleBase.call(this, keyArgs);
    List.call(this, keyArgs);
  }

  utils.inherit(RowList, List, WithStructure, WithCellTupleBase, {

    //region IListElement
    elemName: "row",
    //endregion

    //region List implementation
    _cachedKeyArgs: null,

    elemClass: Row,

    _cast: function(spec, index, keyArgs) {
      return Row.to(spec, this._buildKeyArgs(keyArgs));
    },

    _buildKeyArgs: function(keyArgs) {
      return keyArgs
        ? utils.setBase({rows: this}, keyArgs)
        : (this._cachedKeyArgs || (this._cachedKeyArgs = {rows: this}));
    },
    //endregion

    _onStructurePositionAdded: function() {
      this.cellTupleBase._onStructurePositionAdded();
      this.forEach(function(row) { row._onStructurePositionAdded(); });
    }
  });

  RowList.to = function(rowSpecs, keyArgs) {
    if(!(rowSpecs instanceof Array)) throw utils.error.argInvalid("rowSpecs", "Not an array");

    return utils.setClass(rowSpecs, RowList, keyArgs);
  };

  return RowList;
});