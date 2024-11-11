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
  "./Row",
  "../_WithStructure",
  "../_WithCellTupleBase",
  "../../lang/List",
  "../../util/object"
], function(Row, WithStructure, WithCellTupleBase, List, O) {

  return List.extend("pentaho.data._plain.RowList", {

    constructor: function(keyArgs) {
      WithStructure.call(this, keyArgs);
      WithCellTupleBase.call(this, keyArgs);

      this.base(keyArgs);
    },

    // region IListElement
    elemName: "row",
    // endregion

    // region List implementation
    _cachedKeyArgs: null,

    elemClass: Row,

    _cast: function(spec, index, keyArgs) {
      return Row.to(spec, this._buildKeyArgs(keyArgs));
    },

    _buildKeyArgs: function(keyArgs) {
      return keyArgs
        ? O.setPrototypeOf({rows: this}, keyArgs)
        : (this._cachedKeyArgs || (this._cachedKeyArgs = {rows: this}));
    },
    // endregion

    _onStructurePositionAdded: function() {
      this.cellTupleBase._onStructurePositionAdded();
      this.forEach(function(row) { row._onStructurePositionAdded(); });
    }
  })
  .implement(WithStructure, WithCellTupleBase);
});
