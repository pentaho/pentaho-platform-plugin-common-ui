/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "pentaho/lang/Base",
  "pentaho/util/object",
  "pentaho/lang/ArgumentRequiredError",
  "pentaho/lang/ArgumentInvalidError"
], function(module, Base, O, ArgumentRequiredError, ArgumentInvalidError) {

  "use strict";

  // TODO: This class does not have unit tests.

  var O_isProtoOf = Object.prototype.isPrototypeOf;

  return Base.extend(module.id, /** @lends pentaho.typeInfo.impl.Service# */{

    /**
     * @classDesc Implementation of the `typeInfo.IService` interface.
     *
     * @alias Service
     * @memberOf pentaho.typeInfo.impl
     * @class
     * @implements pentaho.typeInfo.IService
     * @private
     */
    constructor: function() {
      /**
       * A map of type declarations by type id and alias.
       *
       * @type {Object.<string, pentaho.typeInfo.spec.IDeclaration>}
       * @private
       */
      this.__declById = {};
    },

    /** @inheritDoc */
    configure: function(spec) {
      var declsNew = [];
      var declsNewById = {};
      var declsLateRef = {};
      var declById = this.__declById;

      O.eachOwn(spec, declareOnePre, this);
      O.eachOwn(declsLateRef, validateDefined, this);
      declsNew.forEach(declareOnePost, this);

      function declareOnePre(decl, id) {
        if(!id)
          throw new ArgumentRequiredError("id");

        if(O.hasOwn(declById, id))
          throw new ArgumentInvalidError("id", "A type with the id '" + id + "' is already defined.");

        var alias = (decl && decl.alias) || null;

        if(O.hasOwn(declById, id) || O.hasOwn(declsNewById, id))
          throw new ArgumentInvalidError("id", "A type with the id '" + id + "' is already defined.");

        // base may or may not be registered as a type by now.
        // validate in a 2nd pass.
        var base = (decl && decl.base) || null;

        if(base) declsLateRef[base] = 1;

        var declNew = {
          id: id,
          alias: alias,
          base: base,
          subs: []
        };

        declsNew.push(declNew);

        declsNewById[id] = declNew;
        if(alias) declsNewById[alias] = declNew;
      }

      function validateDefined(dummy, id) {
        if(!O.hasOwn(declById, id) && !O.hasOwn(declsNewById, id))
          throw new ArgumentInvalidError("id", "A type with the id '" + id + "' is not defined.");
      }

      function declareOnePost(declNew) {
        var base = declNew.base;
        if(base) {
          var baseDecl = declNew.base = declById[base] || declsNewById[base];

          // assert baseDecl
          declNew = O.setPrototypeOf(declNew, baseDecl);

          baseDecl.subs.push(declNew);
        }

        declById[declNew.id] = declNew;
        if(declNew.alias) declById[declNew.alias] = declNew;
      }
    },

    /** @inheritDoc */
    declare: function(id, decl) {
      if(!id)
        throw new ArgumentRequiredError("id");

      var decls = {};
      decls[id] = decl;

      this.configure(decls);
    },

    __get: function(idOrAlias) {
      return O.getOwn(this.__declById, idOrAlias);
    },

    /** @inheritDoc */
    getAliasOf: function(idOrAlias) {
      var decl = this.__get(idOrAlias);
      if(decl) return decl.alias;
    },

    /** @inheritDoc */
    getIdOf: function(aliasOrId) {
      var decl = this.__get(aliasOrId);
      if(decl) return decl.id;
    },

    /** @inheritDoc */
    getBaseOf: function(idOrAlias) {
      var base;
      var decl = this.__get(idOrAlias);
      if(decl) return (base = decl.base) ? base.id : null;
    },

    /** @inheritDoc */
    isSubtypeOf: function(idOrAliasSub, idOrAliasBase) {
      var declSub = this.__get(idOrAliasSub);
      var declBase = this.__get(idOrAliasBase);

      if(declSub && declBase) return declSub === declBase || O_isProtoOf.call(declBase, declSub);
    },

    /** @inheritDoc */
    getSubtypesOf: function(idOrAliasBase, keyArgs) {
      var declBase = this.__get(idOrAliasBase);
      if(!declBase) return;

      var results = [];

      if(O.getOwn(keyArgs, "includeSelf")) {
        results.push(declBase.id);
      }

      var isRecursive = O.getOwn(keyArgs, "includeDescendants", false);

      collectSubtypesOfRecursive(declBase);

      return results;

      function collectSubtypesOfRecursive(declParent) {
        var subs = declParent.subs;
        if(subs.length) {
          subs.forEach(function(declChild) {
            results.push(declChild.id);
            if(isRecursive) {
              collectSubtypesOfRecursive(declChild);
            }
          });
        }
      }
    }
  });
});
