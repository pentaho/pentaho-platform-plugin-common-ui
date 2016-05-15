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
  "./instance",
  "./valueHelper",
  "./SpecificationContext",
  "../i18n!types",
  "../util/error"
], function(module, instanceFactory, valueHelper, SpecificationContext, bundle, error) {

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
    var Value = Instance.extend("pentaho.type.Value", /** @lends pentaho.type.Value# */{

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
       * @type string
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
       * The default implementation returns `true` is the two values
       * have the same `key` and `false` otherwise.
       *
       * @param {!pentaho.type.Value} other A value to test for equality.
       * @return {boolean} `true` if the given value is equal to this one, `false`, otherwise.
       */
      equals: function(other) {
        return this === other || this.key === other.key;
      },

      //region validation

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
       * You can use the error utilities in {@link pentaho.type.valueHelper} to
       * help in the implementation.
       *
       * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
       *
       * @see pentaho.type.Value#isValid
       */
      validate: function() {
        return null;
      },
      //endregion

      //region configuration
      /**
       * Configures this value with a given configuration.
       * @param {?any} config The configuration.
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
       * @param {any} config The configuration.
       * @protected
       * @overridable
       */
      _configure: function(config) {
        // Nothing configurable at this level
      },
      //endregion

      //region serialization
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
       * @param {?boolean} [keyArgs.includeType=false] - Includes the inline type property, `_`, in the specification.
       *
       * @param {boolean} [keyArgs.omitFormatted=false] - Omits the formatted value
       * on [Simple]{@link pentaho.type.Simple} values' specifications.
       *
       * @param {boolean} [keyArgs.preferPropertyArray=false] - Indicates that, if possible,
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
       * @param {Object} [keyArgs.omitProps] - An object whose _own_ property names are the names of
       * the properties of the current complex type to omit from the serialization.
       *
       * Only applies when a complex is output in object form.
       * In array form, all properties are output whatever their value.
       *
       * This argument only applies to complex values and
       * is not passed through to the values of their properties.
       *
       * @return {!pentaho.type.spec.UInstance} A specification of this value.
       */
      //endregion

      /**
       * Gets the type of this instance.
       *
       * @type pentaho.type.Value.Type
       * @readonly
       */
      type: /** @lends pentaho.type.Value.Type# */{
        // Note: constructor/_init only called on sub-classes of Value.Type,
        // and not on Value.Type itself.
        _init: function() {
          this.base.apply(this, arguments);

          // Block inheritance, with default values
          this._isAbstract = false;
        },

        id: module.id,

        styleClass: "pentaho-type-value",

        get isValue() { return true; },

        //region isAbstract property
        // @type boolean
        // -> boolean, Optional(false)

        // Default value is for `Value.Type` only.
        // @see Value.Type#constructor.
        _isAbstract: true,

        /**
         * Gets or sets a value that indicates if this type is abstract.
         *
         * This attribute can only be set once, upon the type definition.
         *
         * @type {boolean}
         * @default false
         */
        get isAbstract() {
          return this._isAbstract;
        },

        set isAbstract(value) {
          // nully is reset, which is false, so !! works well.
          this._isAbstract = !!value;
        },
        //endregion

        //region creation
        //@override
        /**
         * Creates an instance of this type, given an instance specification.
         *
         * If the specified instance specification contains an inline type reference,
         * in property `"_"`, the referenced type is used to create the instance
         * (as long as it is a subtype of this type).
         *
         * If the specified instance specification does not contain an inline type reference
         * the type is assumed to be this type.
         *
         * @see pentaho.type.Type#isSubtypeOf
         * @see pentaho.type.Context#get
         *
         * @example
         * <caption>
         *   Create a complex instance from a specification that contains the type inline.
         * </caption>
         *
         * require(["pentaho/type/Context"], function(Context) {
         *
         *   var context = new Context({application: "data-explorer-101"});
         *   var Value   = context.get("value");
         *
         *   var product = Value.type.create({
         *         _: {
         *           props: ["id", "name", {name: "price", type: "number"}]
         *         },
         *
         *         id:    "mpma",
         *         name:  "Principia Mathematica",
         *         price: 1200
         *       });
         *
         *   // ...
         *
         * });
         *
         * @example
         * <caption>
         *   Create a list instance from a specification that contains the type inline.
         * </caption>
         *
         * require(["pentaho/type/Context"], function(Context) {
         *
         *   var context = new Context({application: "data-explorer-101"});
         *   var Value   = context.get("value");
         *
         *   var productList = Value.type.create({
         *         _: [{
         *           props: ["id", "name", {name: "price", type: "number"}]
         *         }],
         *
         *         d: [
         *           {id: "mpma", name: "Principia Mathematica", price: 1200},
         *           {id: "flot", name: "The Laws of Thought",   price:  500}
         *         ]
         *       });
         *
         *   // ...
         *
         * });
         *
         * @example
         * <caption>
         *   Create an instance from a specification that <b>does not</b> contain the type inline.
         * </caption>
         *
         * require(["pentaho/type/Context"], function(Context) {
         *
         *   var context = new Context({application: "data-explorer-101"});
         *   var ProductList = context.get([{
         *           props: [
         *             "id",
         *             "name",
         *             {name: "price", type: "number"}
         *           ]
         *         }]);
         *
         *   // Provide the default type, in case the instance spec doesn't provide one.
         *   var productList = ProductList.type.create(
         *          [
         *            {id: "mpma", name: "Principia Mathematica", price: 1200},
         *            {id: "flot", name: "The Laws of Thought",   price:  500}
         *         ]);
         *
         *   // ...
         *
         * });
         *
         * @param {pentaho.type.spec.UInstance} [instSpec] An instance specification.
         *
         * @return {!pentaho.type.Value} The created instance.
         *
         * @throws {pentaho.lang.OperationInvalidError} When `instSpec` contains an inline type reference
         * that refers to a type that is not a subtype of this one.
         *
         * @throws {pentaho.lang.OperationInvalidError} When the determined type for the specified `instSpec`
         * is an [abstract]{@link pentaho.type.Value.Type#isAbstract} type.
         */
        create: function(instSpec) {
          // All value types have own constructors.
          // So it is safe to override the base method with a constructor-type only version.

          var Instance = this._getTypeOfInstSpec(instSpec);

          return new Instance(instSpec);
        },

        /**
         * Determines the instance constructor that should be used to build the specified
         * instance specification.
         *
         * @param {pentaho.type.spec.UInstance} instSpec An instance specification.
         *
         * @return {!Class.<pentaho.type.Value>} The instance constructor.
         *
         * @throws {pentaho.lang.OperationInvalidError} When `instSpec` contains an inline type reference
         * that refers to a type that is not a subtype of this type.
         *
         * @throws {pentaho.lang.OperationInvalidError} When the determined type for the specified `instSpec`
         * is not an abstract type.
         *
         * @throws {Error} When `instSpec` contains an inline type reference that is somehow invalid.
         * See {@link pentaho.type.Context#get} for a list of all possible errors.
         *
         * @private
         * @ignore
         */
        _getTypeOfInstSpec: function(instSpec) {
          var Instance, typeSpec;

          // If it is a plain Object, does it have the inline type property, "_"?
          if(instSpec && typeof instSpec === "object" && (typeSpec = instSpec._) && instSpec.constructor === Object) {

            Instance = context.get(typeSpec);

            if(this._assertSubtype(Instance.type).isAbstract) Instance.type._throwAbstractType();

          } else {
            if(this.isAbstract) this._throwAbstractType();

            Instance = this.instance.constructor;
          }

          return Instance;
        },

        /**
         * Asserts that a given type is a subtype of this type.
         *
         * @param {!pentaho.type.Value.Type} subtype The subtype to assert.
         *
         * @return {!pentaho.type.Value.Type} The subtype `subtype`.
         *
         * @throws {pentaho.lang.OperationInvalidError} When `subtype` is not a subtype of this.
         *
         * @private
         * @ignore
         */
        _assertSubtype: function(subtype) {
          if(!subtype.isSubtypeOf(this)) {
            throw error.operInvalid(
                bundle.format(bundle.structured.errors.value.notOfExpectedBaseType, [this._getErrorLabel()]));
          }

          return subtype;
        },

        /**
         * Throws an error complaining the type is abstract an cannot create instances.
         *
         * @throws {pentaho.lang.OperationInvalidError} When this is not an abstract type.
         *
         * @private
         * @ignore
         */
        _throwAbstractType: function() {
          throw error.operInvalid(bundle.format(
              bundle.structured.errors.value.cannotCreateInstanceOfAbstractType, [this._getErrorLabel()]));
        },

        /**
         * Gets a label suitable to identify this type in an error message.
         *
         * @return {string} An error label.
         * @private
         * @ignore
         */
        _getErrorLabel: function() {
          return this.id || this.label; // Never empty - inherits from Value;
        },
        //endregion

        //region equality
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
        },
        //endregion

        //region validation
        /**
         * Determines if a value is a **valid instance** of this type.
         *
         * This method calls [validate]{@link pentaho.type.Value.Type#validate} and
         * returns a boolean value indicating if it returned no errors.
         *
         * The `isValid` method can be seen as a stronger version
         * of {@link pentaho.type.Value.Type#is}.
         *
         * @param {any} value The value to validate.
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
         * @param {?any} value The value to validate.
         *
         * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
         *
         * @see pentaho.type.Value.Type#isValid
         */
        validate: function(value) {
          // 1. Is of type
          if(value == null)
            return [new Error(bundle.structured.errors.value.cannotBeNull)];

          if(!this.is(value))
            return [new Error(bundle.format(bundle.structured.errors.value.notOfType, [this.label]))];

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
         * @param {!pentaho.type.Value} value The value to validate.
         *
         * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
         *
         * @see pentaho.type.Value#validate
         * @see pentaho.type.Value.Type#validate
         * @see pentaho.type.spec.IValueTypeProto#validateInstance
         */
        validateInstance: function(value) {
          return value.validate();
        },
        //endregion

        //region serialization
        toSpecInContext: function(keyArgs) {
          if(!keyArgs) keyArgs = {};

          // The type's id or the temporary id in this scope.
          var spec = {id: this.shortId || SpecificationContext.current.add(this)};

          // The base type in the **current type hierarchy** (root, ancestor, isRoot).
          var baseType = Object.getPrototypeOf(this);
          var baseRef = baseType.toRefInContext(keyArgs);
          if(baseRef !== "complex")
            spec.base = baseRef;

          this._fillSpecInContext(spec, keyArgs);

          return spec;
        },

        // For non-refinement types, serializes the isAbstract attribute
        _fillSpecInContext: function(spec, keyArgs) {
          var any = false;

          if(!this.isRefinement && this.isAbstract) {
            any = true;
            spec.isAbstract = true;
          }

          if(!keyArgs.isJson) {
            any = valueHelper.fillSpecMethodInContext(spec, this, "validateInstance") || any;

            // Instance methods
            var instSpec = {};
            var instance = this.instance;
            var instAny = valueHelper.fillSpecMethodInContext(instSpec, instance, "validate");
            if(instAny) {
              spec.instance = instSpec;
              any = true;
            }
          }

          return this.base(spec, keyArgs) || any;
        }
        //endregion
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
       *
       * @param {string} [name] The name of the created class. Used for debugging purposes.
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
    },
    /*keyArgs:*/{
      isRoot: true
    }).implement({
      type: bundle.structured.value
    });

    return Value;
  };
});
