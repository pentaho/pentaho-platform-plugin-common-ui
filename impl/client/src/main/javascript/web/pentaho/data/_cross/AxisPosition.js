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
  "../../lang/Base",
  "../../util/arg"
], function(Base, arg) {

  return Base.extend("pentaho.data._cross.AxisPosition", {

    // spec: cells
    // keyArgs: ordinal
    constructor: function(spec, keyArgs) {
      this._cells = arg.required(spec, "cells", "spec");
      this._ord   = arg.required(keyArgs, "ordinal", "keyArgs");
    },

    // region IListElement
    elemName: "axis position",
    // endregion

    // region IWithKey implementation
    keyName: "key",

    get key() {
      return this._cells.key;
    },
    // endregion

    // region IWithOrdinal implementation
    get ordinal() {
      return this._ord;
    },
    // endregion

    get cells() {
      return this._cells;
    },
    // endregion

    // region ISpecifiable implementation
    toSpec: function() {
      return this._cells.toSpec();
    }
    // endregion
  });
});
