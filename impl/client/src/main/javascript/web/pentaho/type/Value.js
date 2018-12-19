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
  "pentaho/module!_",
  "./Instance",
  "./changes/Transaction",
  "./util",
  "./ValidationError",
  "./SpecificationContext",
  "pentaho/util/object",
  "pentaho/util/arg",
  "pentaho/util/error",
  "pentaho/i18n!types"
], function(module, Instance, Transaction, typeUtil, ValidationError, SpecificationContext, O, arg, error, bundle) {

  "use strict";

  var TYPE_DEFAULT_BASE = "pentaho/type/Complex";

  /**
   * @name pentaho.type.ValueType
   * @class
   * @extends pentaho.type.Type
   * @implements {pentaho.lang.ISpecifiable}
   *
   * @classDesc The base type class of value types.
   *
   * Value types can be singular or plural ({@link pentaho.type.ValueType#isList|isList}).
   * A Value type should not be instantiated if it is {@link pentaho.type.ValueType#isAbstract|abstract}.
   *
   * For more information see {@link pentaho.type.Value}.
   */

  /**
   * @name pentaho.type.Value
   * @abstract
   * @class
   * @extends pentaho.type.Instance
   * @implements {pentaho.lang.IConfigurable}
   * @implements {pentaho.lang.ISpecifiable}
   * @amd pentaho/type/Value
   *
   * @classDesc The base, abstract class of [instances]{@link pentaho.type.Instance} which
   * are the _value of_ [properties]{@link pentaho.type.Property}.
   *
   * A `Value` has a key that uniquely identifies the entity it represents.
   *
   * @description Creates a `Value` instance.
   * @constructor
   * @param {?pentaho.type.spec.Value} [spec] A value specification.
   *
   * @see pentaho.type.spec.IValue
   * @see pentaho.type.spec.IValueType
   */
  var Value = Instance.extend(/** @lends pentaho.type.Value# */{

    /**
     * Gets the key of the value.
     *
     * The key of a value must identify it among values of the same concrete type.
     * Two values of the same concrete type and with the same key represent the same entity.
     *
     * If two values have the same concrete type and their
     * keys are equal, then it must also be the case that {@link pentaho.type.Value#equals} returns `true`.
     * The opposite should be true as well.
     * If two values of the same concrete type have distinct keys,
     * then it must be the case that {@link pentaho.type.Value#equals} returns `false`.
     *
     * The default implementation returns the result of calling `toString()`.
     *
     * @type {string}
     * @readonly
     *
     * @see pentaho.type.Value#equals
     */
    get $key() {
      return this.toString();
    },

    /**
     * Creates a shallow clone of this value.
     * @name pentaho.type.Value#clone
     * @abstract
     * @method
     * @return {pentaho.type.Value} The value clone.
     */

    /**
     * Determines if a given value represents the same entity.
     *
     * This method checks if the given value is identical to this one.
     * Otherwise, if not {@link Nully} and has the same constructor,
     * execution is delegated to this value's [_equals]{@link pentaho.type.Value#_equals} method.
     *
     * @param {pentaho.type.Value} other - A value to test for equality.
     *
     * @return {boolean} `true` if the given value is equal to this one; or, `false`, otherwise.
     *
     * @see pentaho.type.Value#_equals
     *
     * @final
     */
    equals: function(other) {
      return this === other ||
          (other != null && (this.constructor === other.constructor) && this._equals(other));
    },

    /**
     * Gets a value that indicates if a given distinct, non-null value of the same type represents the same entity.
     *
     * The default implementation considers two values equal if they have the equal keys.
     *
     * @param {pentaho.type.Value} other - A distinct value to test for equality.
     *
     * @return {boolean} `true` if the given value is equal to this one; `false`, otherwise.
     *
     * @protected
     *
     * @see pentaho.type.Value#equals
     * @see pentaho.type.Value#$key
     */
    _equals: function(other) {
      return this.$key === other.$key;
    },

    /**
     * Gets a value that indicates if a given equal value has the same content as this one.
     *
     * This method must only be called if the [equals]{@link pentaho.type.Value#equals} method returns `true`.
     *
     * The default implementation returns `false`.
     *
     * @param {pentaho.type.Value} other - An equal value to test for content-equality.
     *
     * @return {boolean} `true` if the given value is equal in content to this one; `false`, otherwise.
     *
     * @see pentaho.type.Value#equals
     */
    equalsContent: function(other) {
      return false;
    },

    // region validation

    /**
     * Determines if this value is a valid.
     *
     * This attribute calls [validate]{@link pentaho.type.Value#validate} and
     * returns a boolean value indicating if it returned no errors.
     *
     * @type {boolean}
     * @readonly
     * @final
     */
    get $isValid() {
      return this.validate() == null;
    },

    /**
     * Determines if this value is valid.
     *
     * The default implementation does nothing and considers the instance valid.
     * Override to implement a type's specific validation logic.
     *
     * You can use the error utilities in {@link pentaho.type.Util} to
     * help in the implementation.
     *
     * @return {Array.<pentaho.type.ValidationError>} A non-empty array of errors or `null`.
     *
     * @final
     *
     * @see pentaho.type.Value#$isValid
     */
    validate: function() {
      return null;
    },

    /**
     * Ensures that the value is valid,
     * and throws the first validation error
     * if it is not.
     *
     * This method calls the [validate]{@link pentaho.type.Value#validate} method.
     *
     * @throws {pentaho.type.ValidationError} When the value is not valid,
     * the first error returned by the `validate` method.
     * @final
     */
    assertValid: function() {
      var errors = this.validate();
      if(errors != null) {
        throw errors[0];
      }
    },
    // endregion

    // region configuration
    /**
     * Configures this value with a given configuration.
     *
     * This method ensures a transaction exists and then delegates to
     * [_configure]{@link pentaho.type.Value#_configure}.
     *
     * For more information on the semantics of configuration,
     * see [Complex#_configure]{@link pentaho.type.Complex#_configure}
     * and [List#_configure]{@link pentaho.type.List#_configure}.
     *
     * @param {*} config - The value configuration.
     *
     * @throws {TypeError} When the value would be changed and
     * its type is [read-only]{@link pentaho.type.ValueType#isReadOnly}.
     *
     * @final
     *
     * @see pentaho.type.Element#configureOrCreate
     * @see pentaho.type.Complex#_configure
     * @see pentaho.type.List#_configure
     */
    configure: function(config) {

      if(config != null && config !== this) {

        Transaction.enter().using(function(scope) {

          this._configure(config);

          scope.accept();
        }, this);
      }
    },

    /**
     * Configures this value with a given distinct and non-{@link Nully} configuration.
     *
     * This method can only be called when there is an ambient transaction.
     *
     * The default implementation throws an error if this value's type is
     * [read-only]{@link pentaho.type.ValueType#isReadOnly}.
     *
     * @param {!*} config - The distinct, non-{@link Nully} configuration.
     *
     * @throws {TypeError} When the value would be changed and
     * its type is [read-only]{@link pentaho.type.ValueType#isReadOnly}.
     *
     * @protected
     *
     * @see pentaho.type.Value#configure
     * @see pentaho.type.Complex#_configure
     * @see pentaho.type.List#_configure
     */
    _configure: function(config) {
      if(this.$type.isReadOnly) {
        throw new TypeError("Type '" + this.$type.id + "' is read-only.");
      }
    },
    // endregion

    // region serialization
    /**
     * Creates a specification that describes this value.
     *
     * If an [ambient specification context]{@link pentaho.type.SpecificationContext.current},
     * currently exists, it is used to manage the serialization process.
     * Otherwise, one is created and set as current.
     * Then, the actual work is delegated to {@link pentaho.type.Instance#toSpecInContext}.
     *
     * @name pentaho.type.Value#toSpec
     * @method
     *
     * @param {?object} [keyArgs] - The keyword arguments object.
     * Passed to every value and type serialized within this scope.
     *
     * Please see the documentation of value subclasses for information on additional, supported keyword arguments.
     *
     * @param {?boolean} [keyArgs.isJson=false] - Generates a JSON-compatible specification.
     * Attributes which do not have a JSON-compatible specification are omitted.
     *
     * @param {?pentaho.type.Type} [keyArgs.declaredType] The base type of this value's storage location.
     * If the value does not have this exact type, its inline type property must be included
     * in the specification. Otherwise, it can be omitted.
     * When unspecified, the inline type property is only included if `forceType` is `true`.
     *
     * @param {?boolean} [keyArgs.forceType=false] Forces inclusion of the inline type property, `_`,
     * in the specification.
     *
     * @param {boolean} [keyArgs.omitFormatted=false] Omits the formatted value
     * on [Simple]{@link pentaho.type.Simple} values' specifications.
     *
     * @param {boolean} [keyArgs.preferPropertyArray=false] Indicates that, if possible,
     * array form is used for [Complex]{@link pentaho.type.Complex} values' specifications.
     *
     * The array form of a complex value cannot be used when its type must be inlined.
     *
     * @param {boolean} [keyArgs.includeDefaults=false] - When `true`, all of the properties of
     * [Complex]{@link pentaho.type.Complex} values are serialized.
     * When `false`, the default, only properties whose value is different from their default value
     * are serialized.
     *
     * Only applies to complex values that are serialized in object form.
     * In array form, all of the properties of complex values are serialized independently of their value.
     *
     * @param {?object} [keyArgs.omitProps] An object whose _own_ property names with a _truthy_ value
     * are the names of the properties of the current complex type to omit from the serialization.
     *
     * Only applies when a complex is output in object form.
     * In array form, all properties are output whatever their value.
     *
     * This argument only applies to complex values and
     * is not passed through to the values of their properties.
     *
     * @return {?pentaho.type.spec.Instance} A specification of this value.
     */
    // endregion

    /**
     * Gets the type of this instance.
     *
     * @type {pentaho.type.ValueType}
     * @readonly
     */
    $type: /** @lends pentaho.type.ValueType# */{
      id: module.id,

      isAbstract: true,

      /** @inheritDoc */
      get isValue() {
        return true;
      },

      /**
       * Gets a value that indicates if this type is an _entity_ type.
       *
       * An _entity_ type is an [element]{@link pentaho.type.ElementType} type
       * that represents a _business_ entity whose identity is reflected
       * by the [$key]{@link pentaho.type.Value#$key} property.
       *
       * [Simple]{@link pentaho.type.Simple} types are inherently entity types.
       * [Complex]{@link pentaho.type.Complex} types can set this property to true,
       * and override the `$key` property, to become entity types.
       *
       * @type {boolean}
       * @readOnly
       * @see pentaho.type.Value#$key
       */
      get isEntity() { return false; },
      // endregion

      // region isReadOnly attribute
      /**
       * Gets a value that indicates
       * whether this type, and all of the types of any contained values, cannot be changed, from the outside.
       *
       * [Simple]{@link pentaho.type.Simple} types are inherently read-only.
       *
       * A [Complex]{@link pentaho.type.Complex} type can be _marked_ read-only when defined.
       * All of the properties of a read-only complex type are
       * implicitly marked [read-only]{@link pentaho.type.PropertyType#isReadOnly}.
       * When the [valueType]{@link pentaho.type.PropertyType#valueType} of a property
       * is an element type, it must be a read-only type.
       * When the `valueType` of a property is a list type, then its
       * [element type]{@link pentaho.type.ListType#of} must be read-only.
       *
       * [List]{@link pentaho.type.List} types are never, a priori, and directly read-only.
       * However, if a property of a complex type is read-only and has a list value type,
       * then the value of the property itself, the list instance,
       * is marked [read-only]{@link pentaho.type.List#$isReadOnly}.
       *
       * The default implementation returns `false`.
       *
       * @type {boolean}
       * @readOnly
       */
      get isReadOnly() {
        return false;
      },
      // endregion

      // region equality
      /**
       * Gets a value that indicates if two given values are considered equal.
       *
       * Two values are considered equal if they represent the same real-world entity.
       *
       * The execution proceeds as follows:
       * 1. If either of the values is {@link Nully}, then they're equal only if both are {@link Nully};
       * 2. Otherwise, execution is delegated to the first value's {@link pentaho.type.Value#equals} method.
       *
       * @param {pentaho.type.Value|undefined} valueA - The first value.
       * @param {pentaho.type.Value|undefined} valueB - The second value.
       *
       * @return {boolean} `true` if two values are equal; `false`, otherwise.
       *
       * @see pentaho.type.Value#$key
       * @see pentaho.type.Value#equals
       * @final
       */
      areEqual: function(valueA, valueB) {

        return (valueA == null || valueB == null)
          ? (valueA == null && valueB == null)
          : valueA.equals(valueB);
      },

      /**
       * Gets a value that indicates if two values are *equal* and *content-equal*.
       *
       * Checks that both values are [equals]{@link pentaho.type.Value#equals}
       * and [equalsContent]{@link pentaho.type.Value#equalsContent}.
       *
       * @param {*} valueA - The first value.
       * @param {*} valueB - The second value.
       *
       * @return {boolean} `true` if two values are considered equal and content-equal; `false`, otherwise.
       *
       * @final
       */
      areEqualContent: function(valueA, valueB) {
        return this.areEqual(valueA, valueB) && valueA.equalsContent(valueB);
      },

      /**
       * Gets a value that indicates if all of the elements of two lists of the same type are *content-equal*.
       *
       * @param {pentaho.type.List} listA - One list instance.
       * @param {pentaho.type.List} listB - Another list instance.
       *
       * @return {boolean} `true` if the elements of the two lists are content-equal; `false`, otherwise.
       *
       * @final
       */
      areEqualContentElements: function(listA, listB) {

        var areAll = true;

        listA.each(function(valueA, index) {
          var valueB = listB.at(index);
          if(!this.areEqualContent(valueA, valueB)) {
            areAll = false;
            // break;
            return false;
          }
        }, this);

        return areAll;
      },

      // region value specification

      /**
       * Normalizes a given value specification.
       *
       * Usually, "deserialization" is handled in a type's constructor.
       * However,
       * for proper handling of the [configure]{@link pentaho.type.Value#configure} operation,
       * the Type API needs to normalize new value specifications to decide whether it can
       * [configure]{@link pentaho.type.Complex#configure} operations an existing instance
       * instead of constructing a new one. This, obviously, has to be done outside of a constructor.
       *
       * For example, some complex types can serialize as a single _string_ if only its _main_ property is specified.
       * In such cases, this method would return a normal, object, generic specification containing the given value
       * as the value of the main property.
       *
       * This method calls the [_normalizeInstanceSpec]{@link pentaho.type.ValueType#_normalizeInstanceSpec}
       * when the specified value specification is not {@link Nully}.
       *
       * @param {*} instSpec - The value specification.
       *
       * @return {?object} The normalized value specification or `null`
       *
       * @final
       *
       * @see pentaho.type.ValueType#_normalizeInstanceSpec
       */
      normalizeInstanceSpec: function(instSpec) {
        return instSpec != null ? this._normalizeInstanceSpec(instSpec) : null;
      },

      /**
       * Actually normalizes a given non-{@link Nully} value specification.
       *
       * Override this method to improve the Type API support for types that have a
       * non-generic serialization format.
       *
       * The default implementation simply returns the given value specification.
       *
       * @param {!*} instSpec - The value specification.
       *
       * @return {!*} The normalized value specification.
       *
       * @protected
       *
       * @see pentaho.type.ValueType#normalizeInstanceSpec
       */
      _normalizeInstanceSpec: function(instSpec) {
        return instSpec;
      },

      /**
       * Gets a value that indicates if a given normalized value specification has any key information.
       *
       * The default implementation returns `false`.
       *
       * @param {object} instSpec - The entity normalized specification.
       *
       * @return {boolean} `true` if the specification contains key information; `false`, otherwise.
       *
       * @see pentaho.type.ValueType#isEntity
       * @see pentaho.type.ValueType#normalizeInstanceSpec
       * @see pentaho.type.Value#$key
       */
      hasNormalizedInstanceSpecKeyData: function(instSpec) {
        return false;
      },
      // endregion

      // region serialization
      _toSpecInContextCore: function(keyArgs) {

        var id = SpecificationContext.current.add(this);

        var spec = {id: id};

        // The base type in the **current type hierarchy** (root, ancestor, isRoot).
        var baseType = Object.getPrototypeOf(this);
        if(baseType.id !== TYPE_DEFAULT_BASE) {
          spec.base = baseType.toSpecInContext(keyArgs);
        }

        this._fillSpecInContext(spec, keyArgs);

        return spec;
      }
      // endregion
    }
  }, /* classDesc: */{}, /* keyArgs: */{
    isRoot: true
  })
  .localize({$type: bundle.structured.Value})
  .configure({$type: module.config});

  return Value;
});
