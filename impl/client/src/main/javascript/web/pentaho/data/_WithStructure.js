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
  "../lang/Base",
  "../util/arg"
], function(Base, arg) {

  return Base.extend("pentaho.data._WithStructure", {
    constructor: function(keyArgs) {
      this._structure = arg.required(keyArgs, "structure", "keyArgs");
    },

    // region IWithStructure implementation
    get structure() {
      return this._structure;
    }
    // endregion
  });
});
