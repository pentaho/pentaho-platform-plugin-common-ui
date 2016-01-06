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
  "./_OfAttribute",
  "../lang/Base",
  "../util/arg"
], function(OfAttribute, Base, arg) {

  var StructurePosition = Base.extend("pentaho.data.StructurePosition", {

    // keyArgs: ordinal
    constructor: function(keyArgs) {
      this._ord = arg.required(keyArgs, "ordinal", "keyArgs");
    },

    //region IListElement
    elemName: "structure position",
    //endregion

    //region IWithKey implementation
    keyName: "name",

    get key() {
      return this._attr.key;
    },
    //endregion

    //region IWithOrdinal implementation
    get ordinal() {
      return this._ord;
    },
    //endregion

    //region IOfAttribute abstract implementation
    get attribute() {
      throw new Error("abstract");
    },
    //endregion

    //region ISpecifiable implementation
    toSpec: function(json) {
      if(this._attr) {
        if(!json) json = {};
        json.attr = this._attr.name;
      }
      return json;
    }
    //endregion
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