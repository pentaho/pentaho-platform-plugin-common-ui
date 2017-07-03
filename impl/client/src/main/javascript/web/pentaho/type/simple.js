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
  "./element",
  "./util",
  "../util/object",
  "../util/error",
  "../util/fun",
  "../i18n!types"
], function(module, elemFactory, typeUtil, O, error, F, bundle) {

  "use strict";

  return function(context) {

    var Element = context.get(elemFactory);
    var numberType;
    var stringType;
    var booleanType;
    var objectType;

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
     * @amd {pentaho.type.Factory<pentaho.type.Simple>} pentaho/type/simple
     *
     * @classDesc The base, abstract class of unstructured values.
     *
     * @description Creates a simple instance.
     * @constructor
     * @param {pentaho.type.spec.USimple} [spec] A simple specification.
     *
     * @see pentaho.type.Complex
     * @see pentaho.type.spec.ISimple
     * @see pentaho.type.spec.ISimpleProto
     * @see pentaho.type.spec.ISimpleTypeProto
     */
    var Simple = Element.extend(/** @lends pentaho.type.Simple# */{

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

      // region value attribute
      _value: undefined,

      /**
       * Gets the underlying JavaScript value represented by the _simple_ value.
       *
       * @type {!any}
       * @readonly
       */
      get value() {
        return this._value;
      },

      set value(_) {
        // Value is immutable. Can only be set once.

        // Throws if nully.
        _ = this.type.toValue(_);

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
      }, // jshint -W078
      // endregion

      // region formatted attribute
      _formatted: null,

      /**
       * Gets or sets the formatted value of the property.
       *
       * @type {?string}
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
      }, // jshint -W078
      // endregion

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
       * @type {string}
       * @readonly
       */
      get key() {
        return this._value.toString();
      },

      /**
       * Determines if a given value, of the same type, represents the same entity with the same content.
       *
       * The given value **must** be of the same concrete type (or the result is undefined).
       *
       * If two values are equal, they must have an equal [key]{@link pentaho.type.Simple#key},
       * [value]{@link pentaho.type.Simple#value}, [formatted value]{@link pentaho.type.Simple#formatted}.
       *
       * @param {!pentaho.type.Simple} other - A simple value to test for equality.
       * @return {boolean} `true` if the given simple value is equal to this one; `false`, otherwise.
       */
      equalsContent: function(other) {
        if(!this.equals(other)) return false;

        // TODO: generic metadata
        return this._value === other._value && this._formatted === other._formatted;
      },

      // region configuration

      // TODO: unify constructor, cloning and configuration code somehow?

      /**
       * Configures this value with a given configuration.
       *
       * If `config` is {@link Nully}, it is ignored.
       *
       * If `config` is a plain object, its properties, `v`, `f`, `value` and `formatted`
       * are set on this simple's corresponding properties. It is an error if the properties `v` or `value`
       * contain a primitive value which is different from of this simple.
       *
       * If `config` is another simple value, it can be of any simple type.
       * However, its primitive value must be the same as that of this simple.
       * If the formatted value of `config` is not {@link Nully}, it updates this simple's formatted value.
       *
       * An error is thrown if `config` is of another type.
       *
       * @name configure
       * @memberOf pentaho.type.Simple#
       *
       * @param {Object|pentaho.type.Simple} config - The configuration.
       *
       * @return {!pentaho.type.Simple} This instance.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `config` is not either a plain object or a simple value.
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
        if(other !== this) {

          // TODO: same simple class?
          // Implicit "downcast" of simple values.

          // Inits or ensures value is the same (and throws otherwise).
          this.value = other.value;
          var f = other.formatted;
          if(f != null) {
            this.formatted = f;
          }
        }
      },

      _configureFromObject: function(config) {
        // TODO: more efficient implementation?
        this.extend(config);
      },
      // endregion

      // region serialization
      /** @inheritDoc */
      toSpecInContext: function(keyArgs) {
        if(!keyArgs) keyArgs = {};

        var addFormatted = !keyArgs.omitFormatted && !!this._formatted;

        var type = this.type;

        var declaredType = keyArgs.declaredType;
        var includeType = !!keyArgs.forceType;
        if(!includeType && declaredType) {
          // Abstract foo = (MyNumber 1)
          if(type !== declaredType) {
            if(!stringType) {
              stringType = context.get("string").type;
              numberType = context.get("number").type;
              booleanType = context.get("boolean").type;
            }

            if(!(declaredType.isAbstract && (type === stringType || type === numberType || type === booleanType))) {
              includeType = true;
            }
          }
        }

        var value;
        if(keyArgs.isJson) {
          value = this._toJSONValue(keyArgs);
          // Failed?
          if(value == null) return null;

        } else {
          value = this._value;
        }

        // Plain objects cannot be output without cell format or would not be recognized
        // properly by the constructor code.
        if(!objectType) objectType = context.get("object").type;

        var isPlainObject = type.isSubtypeOf(objectType) && (value.constructor === Object);

        // Don't need a cell/object spec?
        if(!(isPlainObject || addFormatted || includeType))
          return value;

        // Need one. Ensure _ is the first property
        /* jshint laxbreak:true*/
        var spec = (includeType || (declaredType && type !== declaredType))
            ? {_: type.toRefInContext(keyArgs), v: value}
            : {v: value};

        if(addFormatted) spec.f = this._formatted;

        return spec;
      },

      /**
       * Converts the [value]{@link pentaho.type.Simple#value} of the simple instance
       * to a JSON-compatible representation.
       *
       * The default implementation returns [value]{@link pentaho.type.Simple#value} itself.
       * Override to implement a custom JSON format for this simple value type.
       *
       * @param {!Object} keyArgs - The keyword arguments object.
       * Please see the documentation of subclasses for information on additional, supported keyword arguments.
       *
       * @return {UJsonValue} A JSON-compatible representation of value.
       *
       * @protected
       */
      _toJSONValue: function(keyArgs) {
        return this._value;
      },
      // endregion

      type: /** pentaho.type.Simple.Type# */{
        id: module.id,
        alias: "simple",
        isAbstract: true,

        get isSimple() { return true; },

        // region cast method
        /**
         * Converts an external value to the type stored by the simple type
         * in its [value]{@link pentaho.type.Simple#value} property.
         *
         * This method validates that the given value is not {@link Nully}.
         * Then, it delegates the actual conversion to the [cast]{@link pentaho.type.Simple#cast} method.
         * Any user errors thrown by the `cast` method itself are thrown back to this method's caller.
         * However, if the `cast` method returns a {@link Nully} value,
         * this method then throws an error, in its behalf,
         * informing that the given value cannot be converted to this type.
         *
         * @param {!any} value - The value to convert.
         * @return {!any} The converted value.
         *
         * @throws {pentaho.lang.ArgumentRequiredError} When the given value is {@link Nully}.
         *
         * @throws {pentaho.lang.ArgumentInvalidTypeError} When the given value cannot be converted
         *  to the internal value type supported by the simple type.
         *
         * @throws {pentaho.lang.UserError} When the value cannot be converted for some reason.
         * Thrown by the [cast]{@link pentaho.type.Simple#cast} method.
         *
         * @sealed
         */
        toValue: function(value) {
          if(value == null) throw error.argRequired("value");

          value = this.cast(value);
          if(value == null)
            throw error.argInvalid("value",
                bundle.format(bundle.structured.errors.value.cannotConvertToType, [this.label]));

          return value;
        },

        /**
         * Converts a non-{@link Nully} external value to the type stored by the simple type,
         * in its [value]{@link pentaho.type.Simple#value} property.
         *
         * The given value is never a {@link Nully} value.
         *
         * When `null` is returned, it is considered that the conversion is not possible.
         * For informing on the actual reason why the conversion is not possible,
         * throw an [UserError]{@link pentaho.lang.UserError} instead.
         *
         * The default implementation is the identity function.
         *
         * @param {!any} value - The value to convert.
         *
         * @return {?any} The converted value or `null`, when not possible to convert.
         *
         * @throws {pentaho.lang.UserError} When the value cannot be converted for some reason.
         */
        cast: function(value) {
          return value;
        },
        // endregion

        // region equality and comparison
        /**
         * Gets a value that indicates if two distinct, non {@link Nully} simple values are, nonetheless,
         * considered equal.
         *
         * The default implementation considers two values equal if the
         * primitive value of one is equal to the primitive value of the other.
         * If both values are simple values, then they must have the same constructor.
         *
         * @param {any} va - The first value.
         * @param {any} vb - The second value.
         *
         * @return {boolean} `true` if two simple values are considered equal; `false`, otherwise.
         *
         * @protected
         */
        _areEqual: function(va, vb) {
          if((va instanceof Simple) && (vb instanceof Simple)) {
            if(va.constructor !== vb.constructor) {
              return false;
            }
          }
          return va.valueOf() === vb.valueOf();
        },

        /**
         * Gets a value that indicates if one simple value of this type is considered equal to a distinct,
         * non-nully value, but possibly not a value instance.
         *
         * The default implementation considers two values equal if the
         * primitive value of one is equal to the primitive value of the other.
         * If `vb` is also a simple value, then it must have the same constructor as `va`.
         *
         * @param {!pentaho.type.Value} va - The value instance.
         * @param {any} vb - The other value.
         *
         * @return {boolean} `true` if two values are considered equal; `false`, otherwise.
         *
         * @protected
         *
         * @see pentaho.type.Simple.Type#_areEqual
         */
        _isEqual: function(va, vb) {
          if(vb instanceof Simple) {
            if(va.constructor !== vb.constructor) {
              return false;
            }
          }
          return va._value === vb.valueOf();
        },

        // TODO: consider creating a key counterpart for order: `ordinal` to use in comparisons.

        /**
         * Compares two non-equal, non-{@link Nully} values according to their order.
         *
         * If both values are simple values and their constructors are different,
         * then they're assumed to have the same order.
         * Otherwise, the two values are compared by the natural ascending order of their primitive value.
         * If both primitive values are numbers or {@link Date} objects, numeric order is used.
         * Otherwise, their string representations are compared in lexicographical order.
         *
         * @param {any} va - The first value.
         * @param {any} vb - The second value.
         *
         * @return {number} `-1` if `va` is considered _before_ `vb`; `1` is `va` is considered _after_ `vb`;
         * `0`, otherwise.
         *
         * @protected
         */
        _compare: function(va, vb) {
          // Dunno how to compare apples and bananas.
          if((va instanceof Simple) && (vb instanceof Simple)) {
            if(va.constructor !== vb.constructor) {
              return 0;
            }
          }

          return this._compareValues(va.valueOf(), vb.valueOf());
        },

        /**
         * Compares two primitive values according to their order.
         *
         * @param {any} va - The first value.
         * @param {any} vb - The second value.
         *
         * @return {number} `-1` if `va` is considered _before_ `vb`; `1` is `va` is considered _after_ `vb`;
         * `0`, otherwise.
         *
         * @protected
         */
        _compareValues: function(va, vb) {
          return fun.compare(va, vb);
        },
        // endregion

        // region serialization
        /** @inheritDoc */
        _fillSpecInContext: function(spec, keyArgs) {

          var any = this.base(spec, keyArgs);

          if(!keyArgs.isJson) {
            any = typeUtil.fillSpecMethodInContext(spec, this, "cast") || any;
          }

          return any;
        }
        // endregion
      }
    }).implement(/** @lends pentaho.type.Simple# */{
      type: bundle.structured.simple
    });

    // override the documentation to specialize the argument types.
    /**
     * Creates a subtype of this one.
     *
     * For more information on class extension, in general,
     * see {@link pentaho.lang.Base.extend}.
     *
     * @name extend
     * @memberOf pentaho.type.Simple
     * @method
     *
     * @param {string} [name] The name of the created class; used for debugging purposes.
     * @param {pentaho.type.spec.ISimpleProto} [instSpec] The instance specification.
     * @param {Object} [classSpec] The static specification.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * @return {!Class.<pentaho.type.Simple>} The new simple instance subclass.
     *
     * @see pentaho.type.Value.extend
     */

    return Simple;

    /**
     * Returns `null` when given a {@link Nully} value; or, a String, otherwise.
     *
     * @param {*} value The value to be verified
     * @return {?String} A non-empty string.
     */
    function nonEmptyString(value) {
      return value == null ? null : (String(value) || null);
    }
  };
});
