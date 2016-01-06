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
  "./Attribute",
  "./StructurePosition",
  "../lang/Collection",
  "../util/arg",
  "../util/error",
  "../util/object"
], function(Attribute, StructurePosition, Collection, arg, error, O) {

  var Structure = Collection.extend("pentaho.data.Structure", {

    // keyArgs: model
    constructor: function(keyArgs) {
      this._model = arg.required(keyArgs, "model", "keyArgs");

      this.base(keyArgs);
    },

    //region List implementation
    _cachedKeyArgs: null,

    elemClass: StructurePosition,

    // add, keyArgs
    _cast: function(spec, index, keyArgs) {
      return StructurePosition.to(spec, this._buildKeyArgs(keyArgs, index));
    },

    _buildKeyArgs: function(keyArgs, ordinal) {
      // Local properties' options take precedence.
      if(keyArgs)
        return O.setPrototypeOf({
            model: this._model,
            ordinal: ordinal
          }, keyArgs);

      var ka = this._cachedKeyArgs || (this._cachedKeyArgs = {
            model: this._model,
            ordinal: 0
          });
      ka.ordinal = ordinal;
      return ka;
    },
    //endregion

    getByOrdinalOrName: function(ordinalOrName, assertExists) {
      return typeof ordinalOrName === "string" ? this.get(ordinalOrName, assertExists) : this[ordinalOrName];
    },

    ordinalOf: function(attrName) {
      var structPos = this.get(attrName);
      return structPos ? structPos.ordinal : -1;
    },

    //region ISpecifiable implementation
    toSpec: function(keyArgs) {
      return this.map(
          arg.optional(keyArgs, "shareModel", false)
              ? structurePositionAttribute
              : structurePositionAttributeName);
    }
    //endregion
  });

  function structurePositionAttribute(pos) { return pos.attribute; }
  function structurePositionAttributeName(pos) { return pos.attribute.name; }

  // Declared here and not in StructurePosition.js, to break AMD cyclic dependency with Attribute.
  // keyArgs: model, ordinal
  StructurePosition.to = function(spec, keyArgs) {
    if(!spec) throw error.argRequired("spec");

    var model = arg.required(keyArgs, "model", "keyArgs");
    var attr = getAttributeFromSpec(spec, model);
    if(!attr) throw error.argRequired("spec.attr");

    return attr.toStructurePositionOf(keyArgs);
  };

  // spec:
  //   "attrName"
  //   Attribute
  //   {attr: attrName | Attribute}
  function getAttributeFromSpec(spec, model) {
    if(!spec) return null;

    var attr = getAttributeByStringOrInstance(spec, model);
    if(!attr && spec.attr)
      attr = getAttributeByStringOrInstance(spec.attr, model);

    return attr;
  }

  function getAttributeByStringOrInstance(nameOrAttr, model) {
    if(typeof nameOrAttr === "string") return model.attributes.getExisting(nameOrAttr);
    if(nameOrAttr instanceof Attribute) return nameOrAttr;
    return null;
  }

  return Structure;
});