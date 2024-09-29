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

    // region List implementation
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
    // endregion

    getByOrdinalOrName: function(ordinalOrName, assertExists) {
      return typeof ordinalOrName === "string" ? this.get(ordinalOrName, assertExists) : this[ordinalOrName];
    },

    ordinalOf: function(attrName) {
      var structPos = this.get(attrName);
      return structPos ? structPos.ordinal : -1;
    },

    // region ISpecifiable implementation
    toSpec: function(keyArgs) {
      return this.map(
          arg.optional(keyArgs, "shareModel", false)
              ? structurePositionAttribute
              : structurePositionAttributeName);
    }
    // endregion
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
