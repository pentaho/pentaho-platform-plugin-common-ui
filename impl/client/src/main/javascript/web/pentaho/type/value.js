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
  "./instance",
  "./util",
  "./ValidationError",
  "./SpecificationContext",
  "../i18n!types"
], function(module, instanceFactory, typeUtil, ValidationError, SpecificationContext, bundle) {

  "use strict";

  return function(context) {

    var Instance = context.get(instanceFactory);

    // Late bound to break cyclic dependency.
    // Resolved on first use, in pentaho.type.Value.refine.
    var Refinement = null;

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
     * @amd {pentaho.type.Factory<pentaho.type.Value>} pentaho/type/value
     *
     * @classDesc A Value is an abstract class used as a base implementation and unifying type.
     *
     * A Value has a key that uniquely identifies the entity it represents.
     *
     *
     * @description Creates a value instance.
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
       * The key of a value identifies it among values of the same concrete type.
       *
       * Two values of the same concrete type and with the same key represent the same entity.*
       *
       * If two values have the same concrete type and their
       * keys are equal, then it must also be the case that
       * {@link pentaho.type.Value.Type#areEqual}
       * returns `true` when given the two values.
       * The opposite should be true as well.
       * If two values of the same concrete type have distinct keys,
       * then {@link pentaho.type.Value.Type#areEqual} should return `false`.
       *
       * The default implementation returns the result of calling `toString()`.
       *
       * @type {string}
       * @readonly
       */
      get key() {
        return this.toString();
      },

      /**
       * Creates a shallow clone of this value.
       * @name pentaho.type.Value#clone
       * @abstract
       * @function
       * @return {!pentaho.type.Value} The value clone.
       */

      /**
       * Determines if a given value, of the same type, represents the same entity.
       *
       * The given value **must** be of the same concrete type (or the result is undefined).
       *
       * To test equality for any two arbitrary values,
       * in a robust way, use {@link pentaho.type.Value.Type#areEqual}.
       *
       * If two values are equal, they must have an equal {@link pentaho.type.Value#key}.
       * Otherwise, if they are different, they must have a different `key`.
       *
       * The default implementation returns `true` if the two values
       * have the same `key`; or, `false`, otherwise.
       *
       * @param {!pentaho.type.Value} other - A value to test for equality.
       * @return {boolean} `true` if the given value is equal to this one; or, `false`, otherwise.
       */
      equals: function(other) {
        return this === other || this.key === other.key;
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
       */
      get isValid() {
        return !this.validate();
      },

      /**
       * Determines if this value is a **valid instance** of its type.
       *
       * The default implementation does nothing and considers the instance valid.
       * Override to implement a type's specific validation logic.
       *
       * You can use the error utilities in {@link pentaho.type.Util} to
       * help in the implementation.
       *
       * @return {Array.<!pentaho.type.ValidationError>} A non-empty array of errors or `null`.
       *
       * @see pentaho.type.Value#isValid
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
       * @overridable
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
       * Attributes which don't have a JSON-compatible specification are omitted.
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
      type: /** @lends pentaho.type.Value.Type# */{
        id: module.id,
        alias: "value",
        isAbstract: true,

        get isValue() { return true; },

        // region equality
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
         * @return {boolean} `true` if two values are equal; `false`, otherwise.
         */
        areEqual: function(va, vb) {
          return va === vb || (va == null && vb == null) ||
                 (va != null && vb != null &&
                  (va.constructor === vb.constructor) && va.equals(vb));
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
         * 3. Validation is delegated to [validateInstance]{@link pentaho.type.Value.Type#validateInstance}.
         *
         * Use this method when you know nothing about a value.
         * Otherwise, if you know that a value is an instance of this type,
         * you can call [validateInstance]{@link pentaho.type.Value.Type#validateInstance} instead.
         *
         * @param {?any} value - The value to validate.
         *
         * @return {?Array.<!pentaho.type.ValidationError>} A non-empty array of errors or `null`.
         *
         * @see pentaho.type.Value.Type#isValid
         */
        validate: function(value) {
          // 1. Is of type
          if(value == null)
            return [new ValidationError(bundle.structured.errors.value.cannotBeNull)];

          if(!this.is(value))
            return [new ValidationError(bundle.format(bundle.structured.errors.value.notOfType, [this.label]))];

          // 2. Validate further, knowing it is an instance of.
          return this.validateInstance(value);
        },

        /**
         * Determines if a value,
         * that _is an instance of this type_,
         * is also a **valid instance** of this (and its) type.
         *
         * Thus, `this.is(value)` must be true.
         *
         * The default implementation simply calls `value.validate()`.
         *
         * Special types, like [refinement types]{@link pentaho.type.Refinement},
         * perform additional validations on values.
         *
         * @param {!pentaho.type.Value} value - The value to validate.
         *
         * @return {?Array.<!pentaho.type.ValidationError>} A non-empty array of errors or `null`.
         *
         * @see pentaho.type.Value#validate
         * @see pentaho.type.Value.Type#validate
         * @see pentaho.type.spec.IValueTypeProto#validateInstance
         */
        validateInstance: function(value) {
          return value.validate();
        },
        // endregion

        // region serialization
        toSpecInContext: function(keyArgs) {
          if(!keyArgs) keyArgs = {};

          // The type's id or the temporary id in this scope.
          var id = keyArgs && keyArgs.noAlias ? this.id : this.shortId;
          var spec = {id: id || SpecificationContext.current.add(this)};

          // The base type in the **current type hierarchy** (root, ancestor, isRoot).
          var baseType = Object.getPrototypeOf(this);
          var baseRef = baseType.toRefInContext(keyArgs);
          if(baseRef !== "complex")
            spec.base = baseRef;

          this._fillSpecInContext(spec, keyArgs);

          return spec;
        },

        _fillSpecInContext: function(spec, keyArgs) {
          var any = false;

          if(!keyArgs.isJson) {
            any = typeUtil.fillSpecMethodInContext(spec, this, "validateInstance") || any;

            // Instance methods
            var instSpec = {};
            var instance = this.instance;
            var instAny = typeUtil.fillSpecMethodInContext(instSpec, instance, "validate");
            if(instAny) {
              spec.instance = instSpec;
              any = true;
            }
          }

          return this.base(spec, keyArgs) || any;
        }
        // endregion
      }
    }, /** @lends pentaho.type.Value */{

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

      /**
       * Creates a refinement type that refines this one.
       *
       * @see pentaho.type.Refinement.Type#facets
       * @see pentaho.type.Refinement.Type#of
       *
       * @param {string} [name] A name of the refinement type used for debugging purposes.
       * @param {{type: pentaho.type.spec.IRefinementTypeProto}} [instSpec] The refined type instance specification.
       * The available _type_ attributes are those defined by any specified refinement facet classes.
       *
       * @return {Class.<pentaho.type.Refinement>} The refinement type's instance class.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `instSpec` contains any properties other than `type`.
       * The instance interface of refinement types cannot be specified.
       */
      refine: function(name, instSpec) {

        if(typeof name !== "string") {
          instSpec = name;
          name = null;
        }

        // Ugly but effective.
        if(!instSpec) {
          instSpec = {type: {}};
        } else if(!instSpec.type) {
          instSpec.type = {};
        }

        instSpec.type.of = this.type;

        // Resolved on first use to break cyclic dependency.
        if(!Refinement) {
          Refinement = context.get("pentaho/type/refinement");
        }

        return Refinement.extend(name || "", instSpec);
      }
    }, /* keyArgs: */{
      isRoot: true
    }).implement({
      type: bundle.structured.value
    });

    return Value;
  };
});
