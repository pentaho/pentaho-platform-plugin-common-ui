/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "../util/object",
  "../util/error"
], function(Base, O, error) {

  "use strict";

  var ambientSpecContext = null;

  /**
   * @name pentaho.type.SpecificationContext
   * @class
   * @implements pentaho.lang.IDisposable
   *
   * @amd pentaho/type/SpecificationContext
   *
   * @classDesc A `SpecificationContext` object holds information that is
   * shared during the serialization (or conversion to specification) of an instance or type.
   *
   * Specifically, a specification context tracks the temporary ids assigned to referenced anonymous types.
   *
   * The **ambient specification context** is accessible through
   * [SpecificationContext.current]{@link pentaho.type.SpecificationContext.current}.
   *
   * Methods like
   * [Instance#toSpec]{@link pentaho.type.Instance#toSpec},
   * [Type#toSpec]{@link pentaho.type.Type#toSpec} and
   * [Type#toRef]{@link pentaho.type.Type#toRef},
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
  var SpecificationContext = Base.extend(/** @lends pentaho.type.SpecificationContext# */{

    constructor: function() {
      /**
       * The type specifications already described in the context.
       *
       * @type {Object.<string, Object>}
       * @private
       */
      this._typeSpecsByUid = {};

      /**
       * The next number that will be used to build a temporary id.
       *
       * @type {number}
       * @private
       */
      this._nextId = 1;
    },

    /**
     * Gets the id of a type, if it has one, or its temporary id within this context, if not.
     *
     * If the given type is anonymous and also hasn't been added to this context, `null` is returned.
     *
     * @param {pentaho.type.Type} type The type.
     *
     * @return {?nonEmptyString} The id of the type within this context, or `null`.
     */
    getIdOf: function(type) {
      return type.id || O.getOwn(this._typeSpecsByUid, type.uid) || null;
    },

    /**
     * Adds a type to the context and returns its own or temporary id.
     *
     * If the given type is not anonymous, its id is returned.
     * Else, if the anonymous type had already been added to the context,
     * its temporary id is returned.
     * Else, the anonymous type is added to the context
     * and a temporary id is generated for it and returned.
     *
     * @param {pentaho.type.Type} type The type to add.
     *
     * @return {nonEmptyString} The id of the type within this context.
     */
    add: function(type) {
      var id = type.id, uid;
      if(!id && !(id = O.getOwn(this._typeSpecsByUid, (uid = type.uid)))) {
        id = "_" + (this._nextId++);
        this._typeSpecsByUid[uid] = id;
      }

      return id;
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
    }
  });

  return SpecificationContext;
});
