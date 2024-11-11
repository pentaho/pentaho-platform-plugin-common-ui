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

  var Row = Base.extend("pentaho.data._plain.Row", {
    constructor: function(spec, keyArgs) {
      this.c = arg.required(keyArgs, "rows").toCellTuple(spec.c || [], keyArgs);
    },

    get cells() {
      return this.c;
    },

    // region ISpecifiable implementation
    toSpec: function() {
      return {
        c: this.c.toSpec()
      };
    },
    // endregion

    _onStructurePositionAdded: function() {
      this.c._onStructurePositionAdded();
    }
  }, {
    // keyArgs: rows
    to: function(spec, keyArgs) {
      if(spec instanceof Row) return spec;

      // directly a cell tuple?
      if(spec instanceof Array) spec = {c: spec};

      return new this(spec, keyArgs);
    }
  });

  return Row;
});
