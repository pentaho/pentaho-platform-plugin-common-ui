/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "require",
  "pentaho/module!",
  "./Element",
  "./util",
  "pentaho/util/object",
  "pentaho/util/error",
  "pentaho/util/fun",
  "pentaho/util/text",
  "pentaho/i18n!types"
], function(localRequire, module, Element, typeUtil, O, error, F, textUtil, bundle) {

  "use strict";

  var TYPE_NAMESPACE = "pentaho/type/";
  var TYPE_STRING = TYPE_NAMESPACE + "String";
  var TYPE_BOOLEAN = TYPE_NAMESPACE + "Boolean";
  var TYPE_NUMBER = TYPE_NAMESPACE + "Number";

  var numberType = null;
  var stringType = null;
  var booleanType = null;

  /**
   * @name pentaho.type.SimpleType
   * @class
   * @extends pentaho.type.ElementType
   *
   * @classDesc The type class of {@link pentaho.type.Simple}.
   */

  /**
   * @name pentaho.type.Simple
   * @class
   * @extends pentaho.type.Element
   * @amd pentaho/type/Simple
   *
   * @classDesc The base, abstract class of unstructured values.
   *
   * @description Creates a simple instance.
   * @constructor
   * @param {pentaho.type.spec.Simple} [spec] A simple specification.
   *
   * @see pentaho.type.Complex
   * @see pentaho.type.spec.ISimple
   * @see pentaho.type.spec.ISimpleType
   */
  var Simple = Element.extend(/** @lends pentaho.type.Simple# */{

    constructor: function(spec) {
      var value;
      var formatted;

      if(spec instanceof Object) {
        // A plain object?
        if(spec.constructor === Object) {
          if((value = spec.value) === undefined) {
            value = spec.v;
          }
          if((formatted = spec.formatted) === undefined) {
            formatted = spec.f;
          }
        } else if(spec instanceof Simple) {
          // Implicit "downcast" of simple values.
          value = spec.value;
          formatted = spec.formatted;
        } else {
          value = spec;
        }
      } else {
        value = spec;
      }

      /**
       * Gets the underlying JavaScript value represented by the _simple_ value.
       *
       * @name pentaho.type.Simple#value
       * @type {!any}
       * @readonly
       */
      O.setConst(this, "value", this.$type.toValue(value));

      /**
       * Gets the formatted value of the property.
       *
       * @name pentaho.type.Simple#formatted
       * @type {?nonEmptyString}
       * @readonly
       */
      O.setConst(this, "formatted", textUtil.nonEmptyString(formatted));
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

    /**
     * Gets the underlying primitive value of the _simple_ value.
     *
     * @return {!any} The underlying value.
     */
    valueOf: function() {
      return this.value;
    },

    /**
     * Gets a string that represents the current _simple_ value.
     *
     * @return {String} The string representation.
     */
    toString: function() {
      var f = this.formatted;
      return f != null ? f : String(this.value);
    },

    /**
     * Gets the key of the simple value.
     *
     * The default simple value implementation, returns the result of calling
     * `toString()` on {@link pentaho.type.Simple#value}.
     *
     * @type {string}
     * @readonly
     * @see pentaho.type.SimpleType#isEntity
     */
    get $key() {
      return this.value.toString();
    },

    /**
     * Gets the content key of the simple value.
     *
     * @type {string}
     * @readonly
     */
    get $contentKey() {
      return this.$key + (this.formatted !== null ? (" [" + this.formatted + "]") : "");
    },

    /**
     * Gets a value that indicates if a given distinct, non-null value of the same type represents the same entity.
     *
     * This method checks if the primitive value of one is equal to the primitive value of the other.
     *
     * @param {!pentaho.type.Simple} other - A distinct value to test for equality.
     *
     * @return {boolean} `true` if the given value is equal to this one; `false`, otherwise.
     *
     * @protected
     * @override
     * @final
     *
     * @see pentaho.type.Value#equals
     */
    _equals: function(other) {
      return this.value === other.value;
    },

    /**
     * Gets a value that indicates if a given equal value has the same content as this one.
     *
     * This method checks if the [formatted]{@link pentaho.type.Simple#formatted} value of the
     * given value is the same as that of this one.
     *
     * @param {!pentaho.type.Simple} other - An equal simple value to test for content-equality.
     *
     * @return {boolean} `true` if the given value is equal in content to this one; `false`, otherwise.
     *
     * @override
     * @final
     */
    equalsContent: function(other) {
      return this.formatted === other.formatted;
    },

    // TODO: consider creating a key counterpart for order: `ordinal` to use in comparisons.

    /**
     * Compares this element to a distinct, non-equal element of the same type according to its relative order.
     *
     * This method compares the primitive value of this value with that of `other` by delegating to
     * the [comparePrimitiveValues]{@link pentaho.type.SimpleType#comparePrimitiveValues} method.
     *
     * @param {!pentaho.type.Simple} other - The other value.
     *
     * @return {number} `-1` if this value is _before_ `other`; `1` if this value is _after_ `other`;
     * `0`, otherwise.
     *
     * @protected
     * @see pentaho.type.SimpleType#comparePrimitiveValues
     */
    _compare: function(other) {
      return this.$type.comparePrimitiveValues(this.value, other.value);
    },

    // region serialization
    /** @inheritDoc */
    toSpecInContext: function(keyArgs) {
      if(!keyArgs) keyArgs = {};

      var addFormatted = !keyArgs.omitFormatted && this.formatted !== null;

      var type = this.$type;

      var declaredType = keyArgs.declaredType;
      var includeType = !!keyArgs.forceType;
      if(!includeType && declaredType) {
        // Abstract foo = (MyNumber 1)
        if(type !== declaredType) {
          if(stringType === null) {
            stringType = localRequire(TYPE_STRING).type;
            numberType = localRequire(TYPE_NUMBER).type;
            booleanType = localRequire(TYPE_BOOLEAN).type;
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
        value = this.value;
      }

      // Plain objects cannot be output without cell format or would not be recognized
      // properly by the constructor code.
      var isPlainObject = value.constructor === Object;

      // Don't need a cell/object spec?
      if(!(isPlainObject || addFormatted || includeType))
        return value;

      // Need one. Ensure _ is the first property
      /* jshint laxbreak:true*/
      var spec = (includeType || (declaredType && type !== declaredType))
        ? {_: type.toSpecInContext(keyArgs), v: value}
        : {v: value};

      if(addFormatted) spec.f = this.formatted;

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
     * @return {JsonValue} A JSON-compatible representation of value.
     *
     * @protected
     */
    _toJSONValue: function(keyArgs) {
      return this.value;
    },
    // endregion

    $type: /** pentaho.type.SimpleType# */{
      id: module.id,
      isAbstract: true,

      // @override
      get isSimple() { return true; },

      // region isEntity attribute
      /**
       * Gets a value that indicates if this type is an _entity_ type.
       *
       * [Simple]{@link pentaho.type.Simple} types are inherently entity types.
       * This property is _final_ and always returns `true`.
       *
       * @type {boolean}
       * @readOnly
       * @override
       * @final
       * @see pentaho.type.Value#$key
       */
      get isEntity() {
        return true;
      },
      // endregion

      // region isReadOnly attribute
      /**
       * Gets a value that indicates
       * whether this type cannot be changed, from the outside.
       *
       * [Simple]{@link pentaho.type.Simple} types are inherently read-only.
       * This property is _final_ and always returns `true`.
       * Moreover, simple values are immutable.
       *
       * @type {boolean}
       * @readOnly
       * @override
       * @final
       */
      get isReadOnly() {
        return true;
      },
      // endregion

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
       * @final
       */
      toValue: function(value) {
        if(value == null) throw error.argRequired("value");

        value = this.cast(value);
        if(value == null)
          throw error.argInvalid(
            "value",
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

      /**
       * Compares two primitive values according to their order.
       *
       * If primitive values are numbers or {@link Date} objects, numeric order is used.
       * Otherwise, their string representations are compared using lexicographical ordering.
       *
       * @param {!any} valueA - The first value.
       * @param {!any} valueB - The second value.
       *
       * @return {number} `-1` if `valueA` is _before_ `valueB`; `1` is `valueA` is _after_ `valueB`; `0`, otherwise.
       */
      comparePrimitiveValues: function(valueA, valueB) {
        return F.compare(valueA, valueB);
      },

      /** @inheritDoc */
      hasNormalizedInstanceSpecKeyData: function(instSpec) {
        return instSpec.value !== undefined || instSpec.v !== undefined;
      },

      /** @inheritDoc */
      createLike: function(value, config) {
        // 1. config.formatted
        // 2. config.f
        // 3. value.formatted
        var formatted = config.formatted;
        if(formatted === undefined && (formatted = config.f) === undefined) {
          formatted = value.formatted;
        }

        var SimpleClass = value.constructor;
        return new SimpleClass({value: value.value, formatted: formatted});
      },

      // region serialization

      /** @inheritDoc */
      _normalizeInstanceSpec: function(instSpec) {

        if(instSpec instanceof Object) {

          if(instSpec.constructor === Object) {
            return instSpec;
          }

          if(instSpec instanceof Simple) {
            // Copy, Downcast, Discard type info...
            return {
              value: instSpec.value,
              formatted: instSpec.formatted
            };
          }
        }

        return {value: instSpec};
      },

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
  })
  .localize({$type: bundle.structured.Simple})
  .configure({$type: module.config});

  return Simple;
});
