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
  "module",
  "./SpecificationContext",
  "pentaho/lang/Base"
], function(module, SpecificationContext, Base) {

  "use strict";

  return Base.extend(module.id, /** @lends pentaho.type.SpecificationScope# */{

    /**
     * @alias SpecificationScope
     * @memberOf pentaho.type
     * @class
     * @implements {pentaho.lang.IDisposable}
     *
     * @amd pentaho/type/SpecificationScope
     *
     * @classDesc A class that manages the
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
    constructor: function(context) {
      var current = SpecificationContext.current;
      var isOwn = false;
      if(context) {
        SpecificationContext.current = context;
      } else if(!(context = current)) {
        isOwn = true;
        SpecificationContext.current = context = new SpecificationContext();
      }

      this.__isOwn = isOwn;
      this.__context = context;
      this.__previous = current;
    },

    /**
     * Gets the associated specification context.
     *
     * @type {pentaho.type.SpecificationContext}
     */
    get specContext() {
      return this.__context;
    },

    /**
     * Disposes of the specification scope.
     *
     * If this scope created its specification context, it disposes of it, as well.
     *
     * If there was a previous specification context before this one,
     * it is restored.
     */
    dispose: function() {
      var context = this.__context;
      if(context) {
        this.__context = null;

        // This removes the context from being current.
        if(this.__isOwn) context.dispose();

        // Restore the previous current scope, if any.
        var previous = this.__previous;
        if(previous) {
          if(previous !== context) SpecificationContext.current = previous;
          this.__previous = null;
        }
      }
    }
  });
});
