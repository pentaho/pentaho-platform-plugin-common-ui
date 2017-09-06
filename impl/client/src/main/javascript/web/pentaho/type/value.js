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
  "./util",
  "./ValidationError",
  "./SpecificationContext",
  "../util/object",
  "../util/arg",
  "../util/error",
  "../i18n!types"
], function(module, typeUtil, ValidationError, SpecificationContext, O, arg, error, bundle) {

  "use strict";

  return ["instance", function(Instance) {

    /**
     * @name pentaho.type.Value.Type
     * @class
     * @extends pentaho.type.Type
     * @implements pentaho.lang.ISpecifiable
     *
     * @classDesc The base type class of value types.
     *
     * Value types can be singular or plural ({@link pentaho.type.Value.Type#isList|isList}).
     * A Value type should not be instantiated if it is {@link pentaho.type.Value.Type#isAbstract|abstract}.
     *
     * For more information see {@link pentaho.type.Value}.
     */

    /**
     * @name pentaho.type.Value
     * @abstract
     * @class
     * @extends pentaho.type.Instance
     * @implements pentaho.lang.IConfigurable
     * @implements pentaho.lang.ISpecifiable
     * @amd {pentaho.type.spec.UTypeModule<pentaho.type.Value>} pentaho/type/value
     *
     * @classDesc The base, abstract class of [instances]{@link pentaho.type.Instance} which
     * are the _value of_ [properties]{@link pentaho.type.Property}.
     *
     * A `Value` has a key that uniquely identifies the entity it represents.
     *
     * @description Creates a `Value` instance.
     * @constructor
     * @param {pentaho.type.spec.UValue} [spec] A value specification.
     *
     * @see pentaho.type.spec.IValue
     * @see pentaho.type.spec.IValueProto
     * @see pentaho.type.spec.IValueTypeProto
     */
    var Value = Instance.extend(/** @lends pentaho.type.Value# */{

      /**
       * Gets the key of the value.
       *
       * The key of a value must identify it among values of the same concrete type.
       * Two values of the same concrete type and with the same key represent the same entity.
       *
       * The default implementation returns the result of calling `toString()`.
       *
       * @type {string}
       * @readonly
       *
       * @see pentaho.type.Value#equals
       * @see pentaho.type.Value.Type#areEqual
       */
      get $key() {
        return this.toString();
      },

      /**
       * Creates a shallow clone of this value.
       * @name pentaho.type.Value#clone
       * @abstract
       * @method
       * @return {!pentaho.type.Value} The value clone.
       */

      /**
       * Determines if a given value, of the same type, represents the same entity.
       *
       * The default implementation delegates the operation to the
       * [_isEqual]{@link pentaho.type.Value.Type#_isEqual} method.
       *
       * @param {any} other - A value to test for equality.
       * @return {boolean} `true` if the given value is equal to this one; or, `false`, otherwise.
       *
       * @see pentaho.type.Value#$key
       * @see pentaho.type.Value.Type#areEqual
       * @final
       */
      equals: function(other) {
        return this === other || (other != null && this.$type._isEqual(this, other));
      },

      // region validation

      /**
       * Determines if this value is a **valid instance** of its type.
       *
       * This attribute calls [validate]{@link pentaho.type.Value#validate} and
       * returns a boolean value indicating if it returned no errors.
       *
       * @type {boolean}
       * @readonly
       * @final
       */
      get $isValid() {
        return !this.validate();
      },

      /**
       * Determines if this value is a **valid instance** of its type.
       *
       * The default implementation delegates to {@link pentaho.type.Value.Type#_validate}.
       *
       * @return {Array.<pentaho.type.ValidationError>} A non-empty array of errors or `null`.
       *
       * @see pentaho.type.Value#$isValid
       * @final
       */
      validate: function() {
        return this.$type.validate(this);
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
        if(errors) throw errors[0];
      },
      // endregion

      // region configuration
      /**
       * Configures this value with a given configuration.
       * @param {?any} config - The configuration.
       * @return {!pentaho.type.Value} This instance.
       * @final
       */
      configure: function(config) {
        if(config != null) this._configure(config);
        return this;
      },

      /**
       * Configures this value with a given _non-nully_ configuration.
       *
       * The default implementation does nothing.
       *
       * @param {any} config - The configuration.
       * @protected
       */
      _configure: function(config) {
        // Nothing configurable at this level
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
       * @param {Object} [keyArgs] - The keyword arguments object.
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
       * @param {Object} [keyArgs.omitProps] An object whose _own_ property names with a _truthy_ value
       * are the names of the properties of the current complex type to omit from the serialization.
       *
       * Only applies when a complex is output in object form.
       * In array form, all properties are output whatever their value.
       *
       * This argument only applies to complex values and
       * is not passed through to the values of their properties.
       *
       * @return {!pentaho.type.spec.UInstance} A specification of this value.
       */
      // endregion

      /**
       * Gets the type of this instance.
       *
       * @type pentaho.type.Value.Type
       * @readonly
       */
      $type: /** @lends pentaho.type.Value.Type# */{
        id: module.id,
        alias: "value",
        isAbstract: true,

        /** @inheritDoc */
        get isValue() {
          return true;
        },

        // region equality
        /**
         * Gets a value that indicates if two given values are considered equal.
         *
         * Two values are considered equal if they represent the same real-world entity.
         *
         * If two values are considered equal,
         * their value instances must have an equal [key]{@link pentaho.type.Value#$key}.
         * Conversely, if they are considered different,
         * their value instances must have a different `$key`.
         *
         * If the values are identical as per JavaScript's `===` operator, `true` is returned.
         * If both values are {@link Nully}, `true` is returned.
         * If only one is {@link Nully}, `false` is returned.
         * Otherwise, the operation is delegated to the {@link pentaho.type.Value#_areEqual} method.
         *
         * @param {any} va - The first value.
         * @param {any} vb - The second value.
         *
         * @return {boolean} `true` if two values are considered equal; `false`, otherwise.
         *
         * @see pentaho.type.Value#$key
         * @see pentaho.type.Value.Type#_areEqual
         * @see pentaho.type.Value.Type#_isEqual
         */
        areEqual: function(va, vb) {
          return va === vb || (va == null && vb == null) || (va != null && vb != null && this._areEqual(va, vb));
        },

        /**
         * Gets a value that indicates if two distinct, non-{@link Nully} values are, nonetheless, considered equal.
         *
         * The default implementation checks if one of the values is a value instance, and, if so,
         * delegates the operation to its type's {@link pentaho.type.Value#_isEqual} method.
         *
         * @param {!any} va - The first value.
         * @param {!any} vb - The second value.
         *
         * @return {boolean} `true` if two values are considered equal; `false`, otherwise.
         *
         * @protected
         *
         * @see pentaho.type.Value.Type#areEqual
         */
        _areEqual: function(va, vb) {
          return (va instanceof Value) ? va.$type._isEqual(va, vb) :
                 (vb instanceof Value) ? vb.$type._isEqual(vb, va) :
                 false;
        },

        /**
         * Gets a value that indicates if one instance of this type is considered equal to a distinct,
         * non-nully value, but possibly not a value instance.
         *
         * The default implementation considers two values equal if
         * they have the same constructor and equal keys.
         *
         * @param {!pentaho.type.Value} va - The value instance.
         * @param {any} vb - The other value.
         *
         * @return {boolean} `true` if two values are considered equal; `false`, otherwise.
         *
         * @protected
         *
         * @see pentaho.type.Value.Type#areEqual
         */
        _isEqual: function(va, vb) {
          return (va.constructor === vb.constructor) && (va.$key === vb.$key);
        },
        // endregion

        // region validation
        /**
         * Determines if a value is a **valid instance** of this type.
         *
         * This method calls [validate]{@link pentaho.type.Value.Type#validate} and
         * returns a boolean value indicating if it returned no errors.
         *
         * The `isValid` method can be seen as a stronger version
         * of {@link pentaho.type.Value.Type#is}.
         *
         * @param {any} value - The value to validate.
         *
         * @return {boolean} `true` if the value is a valid instance of this type, `false` if not.
         * @final
         */
        isValid: function(value) {
          return !this.validate(value);
        },

        /**
         * Determines if a value is a **valid instance** of this type.
         *
         * Validation of `value` proceeds as follows:
         * 1. If it is {@link Nully}, an error is returned
         * 2. If it does not satisfy [is]{@link pentaho.type.Value.Type#is}, an error is returned
         * 3. Validation is delegated to [_validate]{@link pentaho.type.Value.Type#_validate}.
         *
         * @param {?any} value - The value to validate.
         *
         * @return {Array.<pentaho.type.ValidationError>} A non-empty array of errors or `null`.
         *
         * @see pentaho.type.Value#validate
         * @see pentaho.type.Value.Type#isValid
         * @see pentaho.type.Value.Type#_validate
         *
         * @final
         */
        validate: function(value) {
          if(value == null)
            return [new ValidationError(bundle.structured.errors.value.cannotBeNull)];

          if(!this.is(value))
            return [new ValidationError(bundle.format(bundle.structured.errors.value.notOfType, [this.label]))];

          return value.$type._validate(value);
        },

        /**
         * Determines if a value,
         * that **is an instance of this type**,
         * is also a **valid instance** of this type.
         *
         * Thus, `this === value.$type` must be true.
         *
         * The default implementation does nothing and considers the instance valid.
         * Override to implement a type's specific validation logic.
         *
         * You can use the error utilities in {@link pentaho.type.Util} to
         * help in the implementation.
         *
         * @param {!pentaho.type.Value} value - The value to validate.
         *
         * @return {Array.<pentaho.type.ValidationError>} A non-empty array of errors or `null`.
         *
         * @protected
         *
         * @see pentaho.type.Value.Type#validate
         */
        _validate: function(value) {

          // assert this === value.$type

          return null;
        },
        // endregion

        // region serialization
        toSpecInContext: function(keyArgs) {
          if(!keyArgs) keyArgs = {};

          // The type's id or the temporary id in this scope.
          var spec = {id: this.__id || SpecificationContext.current.add(this)};

          // The base type in the **current type hierarchy** (root, ancestor, isRoot).
          var baseType = Object.getPrototypeOf(this);
          var baseRef = baseType.toRefInContext(keyArgs);
          if(baseRef !== "complex") {
            spec.base = baseRef;
          }

          this._fillSpecInContext(spec, keyArgs);

          return spec;
        }
        // endregion
      }
    }, /* classDesc: */{}, /* keyArgs: */{
      isRoot: true
    }).implement({
      $type: bundle.structured.value
    });

    // override the documentation to specialize the argument types.
    /**
     * Creates a subtype of this one.
     *
     * For more information on class extension, in general,
     * see {@link pentaho.lang.Base.extend}.
     *
     * @name extend
     * @memberOf pentaho.type.Value
     * @method
     *
     * @param {string} [name] The name of the created class; used for debugging purposes.
     * @param {pentaho.type.spec.IValueProto} [instSpec] The instance specification.
     * @param {Object} [classSpec] The static specification.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * @return {!Class.<pentaho.type.Value>} The new value instance subclass.
     *
     * @see pentaho.type.Instance.extend
     */

    return Value;
  }];
});
