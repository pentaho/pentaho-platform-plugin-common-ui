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
  "./element",
  "../util/error",
  "../util/object",
  "../i18n!types"
], function(module, elemFactory, error, O, bundle) {

  "use strict";

  return function(context) {

    var Element = context.get(elemFactory);

    /**
     * @name pentaho.type.Simple.Meta
     * @class
     * @extends pentaho.type.Element.Meta
     *
     * @classDesc The metadata class of {@link pentaho.type.Simple}.
     */

    /**
     * @name pentaho.type.Simple
     * @class
     * @extends pentaho.type.Element
     * @amd pentaho/type/simple
     *
     * @classDesc The base abstract class of un-structured, indivisible values.
     *
     * ### AMD
     *
     * The AMD module returns the type's factory, a
     * {@link pentaho.type.Factory<pentaho.type.Simple>}.
     *
     * Module Id: `pentaho/type/simple`
     *
     * Simple type example:
     * ```javascript
     * define(["pentaho/type/simple"], function(simpleFactory) {
     *
     *   return function(context) {
     *
     *     var Simple = context.get(simpleFactory);
     *
     *     return Simple.extend({
     *
     *     });
     *   };
     * });
     * ```
     *
     * @description Creates a simple instance.
     */
    var Simple = Element.extend("pentaho.type.Simple", /** @lends pentaho.type.Simple# */{

      constructor: function(spec) {
        if(spec instanceof Object) {

          // A plain object?
          if(spec.constructor === Object) {
            // TODO: more efficient implementation?
            this.extend(spec);

            // Required validation
            if(this._value == null) this.value = null;
            return;
          }

          // Another Simple? Clone or Downcast.
          if(spec instanceof Simple) {
            // Shouldn't be spec === this, but not testing...

            // implicit "downcast" of simple values
            this.value     = spec.value;
            this.formatted = spec.formatted;
            // TODO: generic metadata
            return;
          }
        }

        this.value = spec;
      },

      /**
       * Creates a clone of the simple value.
       *
       * @return {!pentaho.type.Simple} The simple value clone.
       */
      clone: function() {
        var SimpleClass = this.constructor;

        return new SimpleClass(this);
      },

      //region value attribute
      _value: undefined,

      /**
       * Gets the underlying primitive value of the _simple_ value.
       *
       * @type !any
       * @readonly
       */
      get value() {
        return this._value;
      },

      // NOTE: the argument cannot have the same name as the property setter
      // or PhantomJS 1.9.8 will throw a syntax error...
      set value(_) {
        // Value is immutable. Can only be set once.

        // Throws if nully.
        _ = this.meta.cast(_);

        if(this._value == null) {
          // First set
          this._value = _;
        } else if(this._value !== _) {
          throw error.operInvalid("Cannot change the primitive value of a simple value.");
        }
      },

      // configuration alias
      set v(value) {
        this.value = value;
      },
      //endregion

      //region formatted attribute
      _formatted: null,

      /**
       * Gets or sets the formatted value of the property.
       *
       * @type ?string
       */
      get formatted() {
        return this._formatted;
      },

      set formatted(value) {
        this._formatted = nonEmptyString(value);
      },

      // configuration alias
      set f(value) {
        this.formatted = value;
      },
      //endregion

      valueOf: function() {
        return this._value;
      },

      toString: function() {
        var f = this._formatted;
        return f != null ? f : String(this._value);
      },

      /**
       * Gets the key of the simple value.
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
       * The default simple value implementation, returns the result of calling
       * `toString()` on {@link pentaho.type.Simple#value}.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this._value.toString();
      },

      meta: /** pentaho.type.Simple.Meta# */{
        id: module.id,
        "abstract": true,
        styleClass: "pentaho-type-simple",

        //region cast method
        // Configurable in a special way.
        // Setting always sets the core.
        // Getting always gets the wrapper.

        /**
         * Gets or sets the casting function used to convert external values
         * into the value stored in a simple's {@link pentaho.type.Simple#value}
         * property.
         *
         * The casting function is never given a {@link Nully} value.
         *
         * If the casting function returns `null`,
         * an error is then thrown, in its behalf,
         * indicating that it cannot be converted to the type.
         *
         * Set to a {@link Nully} value to reset to the default cast function.
         *
         * The default cast function is the identity function.
         *
         * @type {function(any) : ?any}
         */
        get cast() {
          return castTop;
        },

        // NOTE: the argument cannot have the same name as the property setter
        // or PhantomJS 1.9.8 will throw a syntax error...
        set cast(_) {
          this._cast = _ || castCore;
        },

        _cast: castCore
        //endregion
      }
    }).implement({
      meta: bundle.structured.simple
    });

    return Simple;

    //region cast private methods
    function castTop(value) {
      if(value == null)
        throw new Error(bundle.structured.errors.value.isNull);

      value = this._cast(value);
      if(value == null)
        throw new Error(bundle.format(bundle.structured.errors.value.cannotConvertToType, [this.label]));

      return value;
    }

    function castCore(value) {
      return value;
    }
    //endregion

    function nonEmptyString(value) {
      return value == null ? null : (String(value) || null);
    }
  };
});
