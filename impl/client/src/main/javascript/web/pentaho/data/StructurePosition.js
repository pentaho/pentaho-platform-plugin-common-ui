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
  "./_OfAttribute",
  "../lang/Base",
  "../util/arg"
], function(OfAttribute, Base, arg) {

  var StructurePosition = Base.extend("pentaho.data.StructurePosition", {

    // keyArgs: ordinal
    constructor: function(keyArgs) {
      this._ord = arg.required(keyArgs, "ordinal", "keyArgs");
    },

    // region IListElement
    elemName: "structure position",
    // endregion

    // region IWithKey implementation
    keyName: "name",

    get key() {
      return this._attr.key;
    },
    // endregion

    // region IWithOrdinal implementation
    get ordinal() {
      return this._ord;
    },
    // endregion

    // region IOfAttribute abstract implementation
    get attribute() {
      throw new Error("abstract");
    },
    // endregion

    // region ISpecifiable implementation
    toSpec: function(json) {
      if(this._attr) {
        if(!json) json = {};
        json.attr = this._attr.name;
      }
      return json;
    }
    // endregion
  });

  // --------

  // Declared in Structure, to break AMD cyclic dependency with Attribute.
  //
  // StructurePosition.to = function() { ... }

  // --------

  StructurePosition.Adhoc = StructurePosition.extend("pentaho.data.StructurePosition.Adhoc", {

    // keyArgs: attribute, ordinal
    constructor: function(keyArgs) {
      OfAttribute.call(this, keyArgs);

      this.base(keyArgs);
    }
  })
  .implement(OfAttribute);

  return StructurePosition;
});
