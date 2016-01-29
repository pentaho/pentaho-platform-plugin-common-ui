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
  "module",
  "./Item",
  "../i18n!types",
  "../util/error"
], function(module, Item, bundle, error) {

  "use strict";

  // NOTE: PhantomJS does not like this variable to be named context
  // because it would get into trouble on the context getter, below...
  return function(theContext) {

    /**
     * @name pentaho.type.Value.Meta
     * @class
     * @extends pentaho.type.Item.Meta
     *
     * @classDesc The base _metadata_ class of value types.
     */

    /**
     * @name pentaho.type.Value
     * @class
     * @extends pentaho.type.Item
     * @amd pentaho/type/value
     *
     * @classDesc
     *
     * ### AMD
     *
     * Module Id: `pentaho/type/value`
     *
     * The AMD module returns the type's factory, a
     * {@link pentaho.type.Factory<pentaho.type.Value>}.
     *
     * @description Creates a value instance.
     */
    var Value = Item.extend("pentaho.type.Value", /** @lends pentaho.type.Value# */{

      /**
       * Gets the key of the value.
       *
       * The key of a value identifies it among values of the same concrete type.
       *
       * If two values have the same concrete type and their
       * keys are equal, then it must also be the case that
       * {@link pentaho.type.Value.Meta#areEqual}
       * returns `true` when given the two values.
       * The opposite should be true as well.
       * If two values of the same concrete type have distinct keys,
       * then {@link pentaho.type.Value.Meta#areEqual} should return `false`.
       *
       * The default implementation returns the result of calling `toString()`.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this.toString();
      },

      /**
       * Creates a shallow clone of this value.
       *
       * @return {!pentaho.type.Value} The value clone.
       */
      clone: function() {
        throw error.notImplemented();
      },

      /**
       * Determines if a given value, of the same type, is equal to this one.
       *
       * The given value **must** be of the same concrete type (or the result is undefined).
       *
       * To test equality for any two arbitrary values,
       * in a robust way, use {@link pentaho.type.Value.Meta#areEqual}.
       *
       * If two values are equal, they must have an equal {@link pentaho.type.Value#key}.
       * Otherwise, if they are different, they must have a different `key`.
       *
       * The default implementation returns `true` is the two values
       * have the same `key` and `false` otherwise.
       *
       * @param {!pentaho.type.Value} other A value to test for equality.
       * @return {boolean} `true` if the given value is equal to this one, `false`, otherwise.
       */
      equals: function(other) {
        return this === other || this.key === other.key;
      },

      meta: /** @lends pentaho.type.Value.Meta# */{
        // Note: constructor/_init only called on sub-classes of Value.Meta,
        // and not on Value.Meta itself.
        _init: function() {
          this.base.apply(this, arguments);

          // Block inheritance, with default values
          this._abstract = false;
        },

        id: module.id,

        styleClass: "pentaho-type-value",

        //region list property
        /**
         * Gets a value that indicates if a value is a list value,
         * i.e. if it is or extends {@link pentaho.type.List}.
         *
         * @type boolean
         * @readOnly
         */
        get list() {
          return false;
        },
        //endregion

        //region context property

        // NOTE: any class extended from this one will return the same context...
        /**
         * Gets the context that defined this type class.
         * @type pentaho.type.IContext
         * @override
         */
        get context() {
          // NOTE: PhantomJS does not like this variable to be named context...
          return theContext;
        },
        //endregion

        //region abstract property
        // @type boolean
        // -> boolean, Optional(false)

        // Default value is for `Value.Meta` only.
        // @see Value.Meta#constructor.
        _abstract: true,

        // TODO: Rhino probably gives a syntax error on this.
        // However, cannot use the `get "abstract"()` syntax cause then Phantom JS 1.9.8 starts failing
        get abstract() {
          return this._abstract;
        },

        set abstract(value) {
          // nully is reset, which is false, so !! works well.
          this._abstract = !!value;
        },
        //endregion

        /**
         * Gets a value that indicates if two given values are equal.
         *
         * If both values are {@link Nully}, `true` is returned.
         * If only one is {@link Nully}, `false` is returned.
         * If the values have different constructors, `false` is returned.
         * Otherwise, {@link pentaho.type.Value#equals} is called
         * on `va`, with `vb` as an argument, and its result is returned.
         *
         * @param {pentaho.type.Value|Nully} [va] The first value.
         * @param {pentaho.type.Value|Nully} [vb] The second value.
         *
         * @return {boolean} `true` if two values are equal, `false` otherwise.
         */
        areEqual: function(va, vb) {
          return va === vb || (va == null && vb == null) ||
                 (va != null && vb != null &&
                  (va.constructor === vb.constructor) && va.equals(vb));
        }
      }
    },
    /*classSpec:*/ null,
    /*keyArgs:*/ {
      isRoot: true
    }).implement({
      meta: bundle.structured.value
    });

    return Value;
  };
});
