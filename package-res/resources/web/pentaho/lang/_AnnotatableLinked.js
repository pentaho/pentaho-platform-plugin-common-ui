/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../lang/Base",
  "../util/arg",
  "../util/object"
], function(Base, arg, O) {

  return Base.extend("pentaho.lang._AnnotatableLinked", {

    constructor: function(spec) {
      var ps = arg.optional(spec, "p");
      this._annots = ps && this._createAnnots(ps);
    },

    _getAnnotsParent: function() {
      return Object.getPrototypeOf(this);
    },

    _createAnnots: function(ps) {
      var proto = this._getAnnotsParent(this);
      // Very weak test...
      if(proto && proto._getAnnots) {
        var baseAnnots = proto._getAnnots(true),
            annots = Object.create(baseAnnots);
        return ps ? O.assignOwnDefined(annots, ps) : annots;
      }

      return ps || {};
    },

    _getAnnots: function(create) {
      return O.getOwn(this, "_annots") ||
        (create ? this._createAnnots() : undefined);
    },

    property: function(name, value) {
      var annots = O.getOwn(this, "_annots");
      if(arguments.length < 2) {
        // Get
        return annots ? annots[name] : undefined;
      }

      // Set
      if(!annots) this._annots = annots = this._createAnnots();
      annots[name] = value;
      return this;
    }
  }, {
    configure: function(inst, config) {
      // TODO: what if inst already has _annots????
      var ps = config.p;
      if(ps) inst._annots = inst._createAnnots(ps);
    },

    //region ISpecifiable implementation helper
    toSpec: function(inst, json) {
      if(!json) json = {};

      var ps = O.getOwn(inst, "_annots"),
          ps2;
      for(var name in ps) {
        if(!ps2) json.p = ps2 = {};
        ps2[name] = ps[name];
      }

      return json;
    }
    //endregion
  });
});