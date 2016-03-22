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
  "module",
  "./element",
  "../util/object",
  "../util/error",
  "../i18n!types"
], function(module, elemFactory, O, error, bundle) {

  "use strict";

  return function(context) {

    var Element = context.get(elemFactory);

    /**
     * @name pentaho.type.Simple.Type
     * @class
     * @extends pentaho.type.Element.Type
     *
     * @classDesc The type class of {@link pentaho.type.Simple}.
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
            this._configureFromObject(spec);

            // Required validation
            if(this._value == null) this.value = null;
            return;
          }

          // Another Simple? Clone or Downcast.
          if(spec instanceof Simple) {
            this._configureFromSimple(spec);
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
        _ = this.type.cast(_);

        if(this._value == null) {
          // First set
          this._value = _;
        } else if(this._value !== _) {
          throw error.argInvalid("value", bundle.structured.errors.value.cannotChangeValue);
        }
      },

      /**
       * Configuration alias that sets the underlying primitive value of the _simple_ value.
       * {@link pentaho.type.Simple#value}
       *
       * @ignore
       */
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

      /**
       * Configuration alias that sets the formatted value of the property
       * {@link pentaho.type.Simple#formatted}
       *
       * @ignore
       */
      set f(value) {
        this.formatted = value;
      },
      //endregion

      /**
       * Gets the underlying primitive value of the _simple_ value.
       *
       * @return {*} The underlying value.
       */
      valueOf: function() {
        return this._value;
      },

      /**
       * Returns a string that represents the current _simple_ value.
       *
       * @return {String} The string representation.
       */
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
       * {@link pentaho.type.Value.Type#areEqual}
       * returns `true` when given the two values.
       * The opposite should be true as well.
       * If two values of the same concrete type have distinct keys,
       * then {@link pentaho.type.Value.Type#areEqual} should return `false`.
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

      //region configuration
      /**
       * Configures this simple value with a given configuration.
       *
       *
       * @name configure
       * @memberOf pentaho.type.Simple#
       * @param {?any} config The configuration.
       * @return {!pentaho.type.Simple} This instance.
       */

      // TODO: unify constructor, cloning and configuration code somehow?

      /**
       * Configures this value with a given _non-nully_ configuration.
       *
       * The default implementation does nothing.
       *
       * @param {any} config The configuration.
       * @override
       */
      _configure: function(config) {
        // Nothing configurable at this level
        if(config instanceof Object) {
          // A plain object?
          if(config.constructor === Object) {
            this._configureFromObject(config);
            return;
          }

          // Another Simple? Clone or Downcast.
          if(config instanceof Simple) {
            this._configureFromSimple(config);
            return;
          }
        }

        throw error.argInvalidType("config", ["Object", "pentaho.type.Simple"], typeof config);
      },

      _configureFromSimple: function(other) {
        // TODO: same simple class?
        if(other !== this) {
          // implicit "downcast" of simple values
          this.value     = other.value; // inits or ensures value is the same (and throws otherwise)
          this.formatted = other.formatted;
          // TODO: generic metadata
        }
      },

      _configureFromObject: function(config) {
        // TODO: more efficient implementation?
        this.extend(config);
      },
      //endregion

      type: /** pentaho.type.Simple.Type# */{
        id: module.id,
        isAbstract: true,
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
      type: bundle.structured.simple
    });

    return Simple;

    //region cast private methods
    /**
     * Wrapper cast function {@link pentaho.type.Simple.Type#cast}
     */
    function castTop(value) {
      if(value == null)
        throw error.argRequired("value");

      value = this._cast(value);
      if(value == null)
        throw error.argInvalid("value", bundle.format(bundle.structured.errors.value.cannotConvertToType, [this.label]));

      return value;
    }

    /**
     * Default identity cast function
     */
    function castCore(value) {
      return value;
    }
    //endregion

    /**
     * Returns `null` when given a {@link Nully} value and a String otherwise
     *
     * @param value   {*} The value to be verified
     * @return {?String}
     */
    function nonEmptyString(value) {
      return value == null ? null : (String(value) || null);
    }
  };
});
