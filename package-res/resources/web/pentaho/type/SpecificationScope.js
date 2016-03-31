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
  "./SpecificationContext",
  "../lang/Base",
  "../util/object"
], function(SpecificationContext, Base, O) {

  "use strict";

  /**
   * @name pentaho.type.SpecificationScope
   * @class
   * @implements pentaho.lang.IDisposable
   *
   * @amd pentaho/type/SpecificationScope
   *
   * @classDesc The `SpecificationScope` class handles management of the
   * [ambient specification context]{@link pentaho.type.SpecificationContext.current}.
   *
   * @constructor
   * @description Creates a `SpecificationScope`.
   *
   * If a specification context is given, it is used and set as the ambient specification context.
   * Otherwise, if an ambient specification context exists, that context is used.
   * Otherwise, a new specification context is created and set as
   * the ambient specification context.
   * In this case, when the scope is disposed, the created context is disposed as well.
   *
   * @param {pentaho.type.SpecificationContext} [context] A specification context to use.
   */
  var SpecificationScope = Base.extend(/** @lends pentaho.type.SpecificationScope# */{

    constructor: function(context) {
      var current = SpecificationContext.current;
      var isOwn = false;
      if(context) {
        SpecificationContext.current = context;
      } else if(!(context = current)) {
        isOwn = true;
        SpecificationContext.current = context = new SpecificationContext();
      }

      this._isOwn = isOwn;
      this._context = context;
      this._previous = current;
    },

    /**
     * Gets the associated specification context.
     *
     * @ype {!pentaho.type.SpecificationContext}
     */
    get specContext() {
      return this._context;
    },

    /**
     * Disposes the specification scope.
     *
     * If this scope created its specification context, it disposes it, as well.
     *
     * If there was a previous specification context before this one,
     * it is restored.
     */
    dispose: function() {
      var context = this._context;
      if(context) {
        this._context = null;

        // This removes the context from being current.
        if(this._isOwn) context.dispose();

        // Restore the previous current scope, if any.
        var previous = this._previous;
        if(previous) {
          if(previous !== context) SpecificationContext.current = previous;
          this._previous = null;
        }
      }
    }
  });

  return SpecificationScope;
});
