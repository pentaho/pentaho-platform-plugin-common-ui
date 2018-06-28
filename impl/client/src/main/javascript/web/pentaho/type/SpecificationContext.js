/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/util/error"
], function(module, Base, O, error) {

  "use strict";

  var ambientSpecContext = null;
  var idTemporaryPrefix = "_:";
  var reIdTemporaryPrefix = /^_:/;

  /**
   * @name pentaho.type.SpecificationContext
   * @class
   * @implements pentaho.lang.IDisposable
   *
   * @amd pentaho/type/SpecificationContext
   *
   * @classDesc A class that holds information that is
   * shared during the serialization (or conversion to specification) of instances and types.
   *
   * Specifically, a specification context tracks the temporary identifiers assigned to referenced anonymous types.
   *
   * The **ambient specification context** is accessible through
   * [SpecificationContext.current]{@link pentaho.type.SpecificationContext.current}.
   *
   * Methods like
   * [Instance#toSpec]{@link pentaho.type.Instance#toSpec} and
   * [Type#toSpec]{@link pentaho.type.Type#toSpec}
   * use the ambient specification context, when set,
   * to provide context to the serialization process.
   * When not set, these create a new specification context and
   * set it as current.
   *
   * Managing the ambient specification context is best handled implicitly,
   * by delegating to a [SpecificationScope]{@link pentaho.type.SpecificationScope} instance.
   *
   * @constructor
   * @description Creates a `SpecificationContext`.
   */
  var SpecificationContext = Base.extend(module.id, /** @lends pentaho.type.SpecificationContext# */{

    constructor: function() {
      /**
       * The type infos of anonymous types already described in the context,
       * indexed by type unique identifier.
       *
       * @type {Object.<string, Object>}
       * @private
       */
      this.__typeInfosByUid = {};

      /**
       * The type infos of anonymous types already described in the context,
       * indexed by a temporary identifier.
       *
       * @type {Object.<string, Object>}
       * @private
       */
      this.__typeInfosByTid = {};

      /**
       * The next number that will be used to build a temporary identifier.
       *
       * @type {number}
       * @private
       */
      this.__nextId = 1;
    },

    /**
     * Gets the identifier of a type, if it has one; or, its temporary identifier within this context, if not.
     *
     * If the given type is anonymous and also has not been added to this context, `null` is returned.
     *
     * @param {pentaho.type.Type} type - The type.
     *
     * @return {?nonEmptyString} The identifier of the type within this context, or `null`.
     */
    getIdOf: function(type) {
      var id = type.id;
      if(!id) {
        var typeInfo = O.getOwn(this.__typeInfosByUid, type.uid);
        if(typeInfo) id = typeInfo.id;
      }
      return id;
    },

    /**
     * Gets a type given its temporary identifier in this specification context.
     *
     * @param {nonEmptyString} tid - The temporary identifier.
     *
     * @return {pentaho.type.Type} The type with the given temporary identifier, if any; or, `null`.
     */
    get: function(tid) {
      var typeInfo = O.getOwn(this.__typeInfosByTid, tid);
      return typeInfo ? typeInfo.type : null;
    },

    /**
     * Adds a type to the context and returns its own or temporary identifier.
     *
     * If the given type is not anonymous, its identifier is returned.
     * Else, if the anonymous type had already been added to the context,
     * its temporary identifier is returned.
     * Else, the anonymous type is added to the context
     * and a temporary identifier is either given, or automatically generated and returned.
     *
     * @param {pentaho.type.Type} type - The type to add.
     * @param {?nonEmptyString} [tid] The temporary identifier to use when adding.
     *
     * @return {nonEmptyString} The identifier of the type within this context.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `type` is being added and
     * `tid` is already the temporary identifier assigned to another type.
     */
    add: function(type, tid) {
      var id = type.id;
      if(id) return id;

      var uid = type.uid;
      var typeInfo = O.getOwn(this.__typeInfosByUid, uid);
      if(typeInfo) return typeInfo.id;

      // Get a temporary id.
      if(tid) {
        if(O.hasOwn(this.__typeInfosByTid, tid)) {
          throw error.argInvalid("tid", "The temporary id is already being used by another type.");
        }
      } else {
        // Get the first available temporary id.
        // The loop is only needed to make the code robust,
        // due to tids also being provided from the outside...
        // In practice, the spec context is either used for serialization,
        // where all ids are generated, or for deserialization, where all ids are given...
        do {
          tid = idTemporaryPrefix + (this.__nextId++);
        } while(O.hasOwn(this.__typeInfosByTid, tid));
      }

      this.__typeInfosByUid[uid] = this.__typeInfosByTid[tid] = {type: type, id: tid};

      return tid;
    },

    /**
     * Disposes this specification context.
     *
     * If this is the ambient specification context, it is cleared.
     */
    dispose: function() {
      if(ambientSpecContext === this) {
        ambientSpecContext = null;
      }
    }
  }, /** @lends pentaho.type.SpecificationContext */{

    /**
     * Gets or sets the ambient specification context.
     *
     * @type {pentaho.type.SpecificationContext}
     */
    get current() {
      return ambientSpecContext;
    },

    set current(specContext) {
      if(specContext && !(specContext instanceof SpecificationContext))
        throw error.argInvalidType("current", "pentaho.type.SpecificationContext", typeof specContext);

      ambientSpecContext = specContext || null;
    },

    /**
     * Determines if a given type identifier is temporary.
     *
     * @param {string} id - The identifier to check.
     * @return {boolean} `true` if the identifier is temporary; `false, otherwise.
     *
     * @see pentaho.type.SpecificationContext.idTemporaryPrefix
     */
    isIdTemporary: function(id) {
      return !!id && reIdTemporaryPrefix.test(id);
    },

    /**
     * The prefix of temporary identifiers.
     *
     * @type {nonEmptyString}
     * @readOnly
     * @see pentaho.type.SpecificationContext.isIdTemporary
     * @default "_:"
     */
    get idTemporaryPrefix() {
      return idTemporaryPrefix;
    }
  });

  return SpecificationContext;
});
