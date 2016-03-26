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
  "./Instance",
  "./valueHelper",
  "../i18n!types",
  "../lang/_AnnotatableLinked",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/text",
  "../util/fun"
], function(Instance, valueHelper, bundle, AnnotatableLinked, arg, error, O, text, F) {

  "use strict";

  var _propType;
  /**
   * @name pentaho.type.Property
   *
   * @class
   * @extends pentaho.type.Instance
   *
   * @classdesc A property of a complex value.
   *
   * The developer is not expected to create instances of this type.
   *
   * @see pentaho.type.Complex
   */

  /**
   * @name pentaho.type.Property.Type
   *
   * @class
   * @extends pentaho.type.Type
   *
   * @implements pentaho.lang.IWithKey
   * @implements pentaho.lang.IListElement
   * @implements pentaho.lang.ICollectionElement
   *
   * @classdesc The type of a property of a complex type.
   *
   * A _property type_ only exists within a _complex type_.
   *
   * @description Creates a property type object.
   *
   * This constructor is used internally by the `pentaho/type` package and
   * should not be used directly.
   *
   * @see pentaho.type.Complex
   */
  var Property = Instance.extend("pentaho.type.Property", /** @lends pentaho.type.Property# */{

    // TODO: value, members?
    // TODO: p -> AnnotatableLinked.configure(this, config);

    type: /** @lends pentaho.type.Property.Type# */{
      // Note: constructor/_init is only called on sub-classes of Property.Type,
      // and not on Property.Type itself.

      /**
       * Initializes a property type object, given a property type specification.
       *
       * @param {pentaho.type.spec.UPropertyType} spec A property name or type specification.
       * @param {!Object} keyArgs Keyword arguments.
       * @param {!pentaho.type.Complex.Type} keyArgs.declaringType The complex type that declares the property.
       * @param {number} keyArgs.index The index of the property within its complex type.
       * @ignore
       */
      constructor: function(spec, keyArgs) {
        // A singular string property with the specified name.
        if(typeof spec === "string") spec = {name: spec};

        this.base(spec, keyArgs);
      },

      /**
       * Setting name and label first allows describing the property in subsequent error messages.
       *
       * Setting label after name ensures that label defaults that are derived from name work the first time.
       *
       * Setting type before value (not included here, so it is processed after type) avoids:
       * 1. checking the new value against the old type (and then again, against the new type)
       * 2. ensures error messages are given in a predicatable order,
       *    independently of the order of properties in an instSpec:
       *   1. is new type a subtype of old type?
       *   2. is new value an instance of the new type?
       *
       * @type string[]
       * @ignore
       */
      extend_order: ["name", "label", "type"],

      /**
       * Performs initialization tasks that take place before the instance is
       * extended with its spec.
       *
       * @param {!pentaho.type.spec.UPropertyType} spec A property name or specification object.
       * @param {!Object} keyArgs Keyword arguments.
       * @param {!pentaho.type.Complex.Type} keyArgs.declaringType The complex type that declares the property.
       * @param {number} keyArgs.index The index of the property within its complex type.
       * @protected
       * @ignore
       */
      _init: function(spec, keyArgs) {

        this.base.apply(this, arguments);

        // TODO: Validate same context as base?

        O.setConst(this, "_declaringType", arg.required(keyArgs, "declaringType", "keyArgs"));

        if(this.isRoot) {
          O.setConst(this, "_index", keyArgs.index || 0);

          // Required stuff
          if(!("name" in spec)) this.name = null; // throws

          // Assume the _default_ type _before_ extend, to make sure `value` can be validated against it.
          var type = spec.type;
          if(type == null || type === "") this.type = "string";
        }
      },

      _postInit: function() {

        this.base.apply(this, arguments);

        if(this.isRoot) {
          // Assuming default values
          if(!O.hasOwn(this, "_label")) this._resetLabel();
        }
      },

      //region IListElement
      /**
       * Gets the singular name of `Property.Type` list-elements.
       * @type string
       * @readonly
       * @default "property"
       */
      elemName: "property",
      //endregion

      //region IWithKey implementation
      /**
       * Gets the singular name of `Property.Type` keys.
       * @type string
       * @readonly
       * @default "name"
       */
      keyName: "name",

      /**
       * Gets the key of the property.
       *
       * The key of a property is its name.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this._name;
      },
      //endregion

      //region attributes

      //region context property
      /**
       * Gets the context of the property prototype.
       *
       * The context of a property is that of
       * the complex type that declares it.
       *
       * @type pentaho.type.Context
       * @readonly
       */
      get context() {
        return this._declaringType.context;
      },
      //endregion

      //region declaringType attribute
      /**
       * Gets the complex type that declares this property type.
       *
       * @type pentaho.type.Complex.Type
       * @readonly
       */
      get declaringType() {
        return this._declaringType;
      },
      //endregion

      //region index attribute
      /**
       * Gets the index of the property in the containing complex type.
       *
       * @type number
       * @readonly
       */
      get index() {
        return this._index;
      },
      //endregion

      //region name attribute
      _name: undefined,

      /**
       * Gets or sets the name of the _property type_.
       *
       * The name of a _property type_ identifies it within
       * its [declaring type]{@link pentaho.type.Property.Type#declaringType}.
       *
       * This attribute must be set when defining a new _property type_,
       * and cannot change afterwards.
       *
       * When set to a non-{@link Nully} and non-{@link String} value,
       * the value is first replaced by the result of calling its `toString` method.
       *
       * @type {!nonEmptyString}
       *
       * @throws {pentaho.lang.ArgumentRequiredError} When set to an empty string or a _nully_ value.
       * @throws {TypeError} When set to a value different from the current one.
       */
      get name() {
        return this._name;
      },

      set name(value) {
        value = nonEmptyString(value);

        if(!value) throw error.argRequired("name");

        // Only stored at the root property type.
        if(this.isRoot) {
          // Cannot change, or throws.
          O.setConst(this, "_name", value);
        } else {
          // Hierarchy consistency
          if(value && value !== this._name)
            throw new TypeError("Sub-properties cannot change the 'name' attribute.");
        }
      },
      //endregion

      //region list attribute
      /**
       * Gets a value that indicates if the property is a _list_.
       *
       * A property is a _list_ property if
       * its [value type]{@link pentaho.type.Property.Type#type} is a list type,
       * i.e., if it is or extends [List]{@link pentaho.type.List}.
       *
       * @type boolean
       * @readonly
       */
      get isList() {
        return this._type.isList;
      },
      //endregion

      //region (value) element type attribute
      /**
       * The base element type of the _singular_ values that the property can hold.
       *
       * When the property is a list property,
       * that list type's element type,
       * {@link pentaho.type.List.Type#of},
       * is returned.
       *
       * Otherwise,
       * {@link pentaho.type.Property.type} is returned.
       *
       * @type !pentaho.type.Element.Type
       * @readonly
       */
      get elemType() {
        var type = this._type;
        return type.isList ? type.of : type;
      },
      //endregion

      //region (value) type attribute
      _type: undefined,

      /**
       * Gets or sets the type of value that properties of this type can hold.
       *
       * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
       * an error is thrown.
       *
       * When set to a {@link Nully} value, the set operation is ignored.
       *
       * Otherwise, the set value is assumed to be an [spec.UTypeReference]{@link pentaho.type.spec.UTypeReference}
       * and is first resolved using [this.context.get]{@link pentaho.type.Context#get}.
       *
       * When set to a _value type_ that is _not_ a
       * [subtype]{@link pentaho.type.Type#isSubtypeOf} of the attribute's current _value type_,
       * an error is thrown.
       *
       * When set and the [value]{@link pentaho.type.Property.Type#value} attribute
       * is _locally_ set, it is checked against the new _value type_,
       * and set to `null`, if it not an instance of it.
       *
       * The default value type is the inherited value type.
       * A root _property type_ has a default _value type_ of [string]{@link pentaho.type.String}.
       *
       * @type {!pentaho.type.Value.Type}
       *
       * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
       * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
       * @throws {pentaho.lang.ArgumentInvalidError} When setting to a _value type_ that is not a subtype
       * of the current _value type_.
       */
      get type() {
        return this._type;
      },

      set type(value) {
        if(this.hasDescendants)
          throw error.operInvalid("Cannot change the value type of a property type that has descendants.");

        if(value == null) return;

        var oldType = this._type;
        var newType = this.context.get(value).type;
        if(newType !== oldType) {
          // Hierarchy/PreviousValue consistency
          if(oldType && !newType.isSubtypeOf(oldType))
            throw error.argInvalid("type", bundle.structured.errors.property.typeNotSubtypeOfBaseType);

          this._type = newType;

          // Set local value to null, if it is not an instance of the new type.
          // Not really needed as the value getter tests the if value is of type.
          // However, this improves performance.
          var dv;
          if(O.hasOwn(this, "_value") && (dv = this._value) && !newType.is(dv)) {
            this._value = null;
          }
        }
      },
      //endregion

      //region value attribute and related methods
      _value: null,

      /**
       * Gets or sets the _default value_ of the _property type_.
       *
       * The _default value_ is the prototype value that properties of this type take,
       * on complex instances,
       * when the property is unspecified or specified as a {@link Nully} value.
       * A [cloned]{@link pentaho.type.Value#clone} value is used each time.
       *
       * The value `null` is a valid _default value_.
       *
       * When got and the _default value_ (local or inherited)
       * is not an instance of the _value type_ (local or inherited),
       * `null` is returned.
       *
       * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
       * an error is thrown.
       *
       * When set to `null`, it is respected.
       *
       * When set to the _control value_ `undefined`, the attribute value is reset,
       * causing it to assume its _default value_:
       *
       * * for [root]{@link pentaho.type.Type#root} _property types_, the _default value_ is `null`
       * * for non-root _property types_, the _default value_ is the _inherited value_,
       *   if it is an instance of the _property type_'s [value type]{@link pentaho.type.Property.Type#type},
       *   or, `null`, otherwise.
       *
       * When set to any other value,
       * it is first converted to the _property type_'s
       * [value type]{@link pentaho.type.Property.Type#type},
       * using its [Value.Type#to]{@link pentaho.type.Value.Type#to} method.
       * The conversion may be impossible and thus an error may be thrown.
       *
       * @type {pentaho.type.Value}
       * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
       * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
       * @throws {Error} When setting to a _default value_ that cannot be converted to the
       * property type's current _value type.
       */
      get value() {
        var value = this._value;
        return value && this._type.is(value) ? value : null;
      },

      set value(_) {
        if(this.hasDescendants)
          throw error.operInvalid("Cannot change the default value of a property type that has descendants.");

        if(_ === undefined) {
          if(this !== _propType) {
            // Clear local value. Inherit base value.
            delete this._value;
          }
        } else {
          this._value = this.toValue(_, /*noDefault:*/true);
        }
      },

      /**
       * Converts the given value or value specification to
       * a value of this property's value type.
       *
       * If the given value is already an instance of the property's value type,
       * it is returned.
       *
       * By default, a {@link Nully} value is converted to
       * (a clone of) the property's default value,
       * {@link pentaho.type.Property.Type#value}.
       *
       * @param {?any} valueSpec A value or value specification.
       * @param {boolean} [noDefault=false] Indicates if {@link Nully} values
       *  should _not_ be converted to the property's default value.
       *
       * @return {?pentaho.type.Value} A value.
       */
      toValue: function(valueSpec, noDefault) {
        if(valueSpec == null) {
          return noDefault ? null : this._freshDefaultValue();
        }

        return this.type.to(valueSpec);
      },

      /**
       * Gets a fresh default value for use in a new `Complex` instance.
       *
       * Ensures that default values are _cloned_ (specially important for lists and complexes).
       * Ensures that list properties always have a non-null default value.
       *
       * @return {pentaho.type.Value} A fresh default value.
       * @private
       */
      _freshDefaultValue: function() {
        var value = this.value;
        return value       ? value.clone()      :
               this.isList ? this.type.create() :
               value;
      },
      //endregion

      //region label attribute
      /**
       * Resets the label of the property.
       *
       * The label of a root property is reset to a capitalization of the `name` attribute.
       * A non-root property inherits the label of its closest ancestor.
       *
       * @ignore
       */
      _resetLabel: function() {
        if(this.isRoot) {
          this._label = text.titleFromName(this.name);
        } else {
          delete this._label;
        }
      },
      //endregion

      //endregion

      //region validation

      /**
       * Determines if this property is valid in a given complex instance.
       *
       * This method first ensures the value of the property is consistent with its type.
       * Afterwards, the cardinality is verified against the attributes
       * {@link pentaho.type.Property.Type#countMin} and {@link pentaho.type.Property.Type#countMax}.
       *
       * @param {pentaho.type.Complex} owner The complex value that owns the property.
       * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
       *
       * @see pentaho.type.Complex#validate
       */
      validate: function(owner) {
        var errors = null;

        if(this.isApplicableEval(owner)) {
          var addErrors = function(newErrors) {
              errors = valueHelper.combineErrors(errors, newErrors);
            };

          // Accessing private state in the name of performance.
          var value = owner._values[this.name];
          if(value) {
            // Not null and surely of the type, so validateInstance can be called.
            // If a list, element validation is done before cardinality validation.
            // If a complex, its properties validation is done before local cardinality validation.
            addErrors(this.type.validateInstance(value));
          }

          var range = this.countRangeEval(owner),
              count = this.isList ? value.count : (value ? 1 : 0);

          if(count < range.min) {
            if(this.isList) {
              addErrors(new Error(bundle.format(
                  bundle.structured.errors.property.countOutOfRange,
                  [this.label, count, range.min, range.max])));
            } else {
              addErrors(new Error(bundle.format(
                  bundle.structured.errors.property.isRequired,
                  [this.label])));
            }
          } else if(count > range.max) {
            addErrors(new Error(bundle.format(
                bundle.structured.errors.property.countOutOfRange,
                [this.label, count, range.min, range.max])));
          }
        }

        return errors;
      },
      //endregion

      //region dynamic & monotonic attributes
      // Configuration support
      /**
       * Defines dynamic, monotonic, inherited attributes of the property type.
       *
       * This setter is used when the developer is extending Property to support new attributes.
       *
       * @type {Object}
       * @ignore
       */
      set _attrs(attrSpecs) {
        Object.keys(attrSpecs).forEach(function(name) {
          this._dynamicMonotonicInheritedAttribute(name, attrSpecs[name]);
        }, this);
      }, // jshint -W078

      /**
       * Defines a "dynamic" attribute and corresponding setter and getter methods.
       *
       * This method is an implementation detail,
       * ans is invoked by {pentaho.type.Property.Type#attrs}
       *
       * @param {String} name
       * @param {Object} spec
       * @private
       * @ignore
       */
      _dynamicMonotonicInheritedAttribute: function(name, spec) {
        var cast = spec.cast,
            // Monotonicity
            // * minimum/default/neutral value
            dv = castAndNormalize(spec.value, cast, null),
            // * effective/monotone value function
            monotoneCombineEvals = spec.combine,

            namePriv = "_" + name,
            namePrivEval = namePriv + "Eval",
            root = this;

        // Default value can be null.
        root[namePriv] = dv;
        root[namePrivEval] = F.constant(dv);

        Object.defineProperty(root, name, {
          /**
           * Gets the _last_ set local value, or `undefined` if there hasn't been one.
           * Only at eval time does inheritance and combination come into play and
           * evaluate into an _effective_ value.
           *
           * @ignore
           */
          get: function() {
            return O.getOwn(this, namePriv);
          },

          /**
           * Combines a given value to the current local or inherited value.
           * Note that getting the value of the attribute always returns just the last set local value.
           *
           * When given a {@link Nully} value, it has no effect.
           *
           * @ignore
           */
          set: function(value) {
            // Cannot change the root value.
            // Letting this here instead of after the descendants test,
            // as otherwise would be very hard to test...
            if(this === root) return;

            if(this.hasDescendants)
              throw error.operInvalid(
                  "Cannot change the '" + name + "' attribute of a property type that has descendants.");

            // Cannot reset, using null or undefined (but can have a null default),
            //  cause it would break **monotonicity**.
            if(value == null) return;

            var fValue;
            if(F.is(value)) {
              fValue = value;
              if(cast) fValue = wrapWithCast(fValue, cast, dv);
            } else {
              // When cast failure is found at static time, we ignore the local value.
              value = castAndNormalize(value, cast, null);
              if(value == null) return;

              fValue = F.constant(value);
            }

            // Store the set value, so that get works consistently with set.
            // When combining with a previous local value, what should be stored in
            // this field? None is correct as the local value.
            // We just store the last set value, but be warned.
            this[namePriv] = value;

            // Create the private evaluate method.
            // Monotonicity requires using the inherited or previous value.
            // `this` is not root, so an ancestor exists.
            // Initially, there's no local namePrivEval,
            //  so this[namePrivEval] evaluates to the ancestor namePrivEval.
            // When ancestor is root, note that its namePrivEval is never null.
            this[namePrivEval] = monotoneCombineEvals(this[namePrivEval], fValue);
          }
        });

        // Handles passing the `owner` argument to the `this` context of the private eval method.
        this[name + "Eval"] = function(owner) {
          return this[namePrivEval].call(owner);
        };
      }
      //endregion
    } // end instance type:
  }).implement({
    type: /** @lends pentaho.type.Property.Type# */{
      _attrs: {
        /**
         * Evaluates the value of the `isRequired` attribute of a property of this type
         * on a given complex value.
         *
         * This method is used to determine the effective
         * [element count range]{@link pentaho.type.Property.Type#countRangeEval} and
         * is not intended to be used directly.
         *
         * @name isRequiredEval
         * @memberOf pentaho.type.Property.Type#
         * @param {pentaho.type.Complex} owner The complex value that owns a property of this type.
         * @return {boolean} The evaluated value of the `isRequired` attribute.
         *
         * @ignore
         */

        /**
         * Gets or sets a value that indicates if properties of this type are required.
         *
         * When a property is of a required _property type_,
         * it is considered **invalid** if its value (in a complex instance) is `null` or,
         * in the case of a [list]{@link pentaho.type.Property.Type#isList} _property type_,
         * it has zero elements.
         *
         * Note that this attribute is taken together with
         * the [countMin]{@link pentaho.type.Property.Type#countMin} attribute
         * to determine the effective [element count range]{@link pentaho.type.Property.Type#countRangeEval}
         * of a _property type_.
         *
         * ### This attribute is *Dynamic*
         *
         * When a _dynamic_ attribute is set to a function,
         * it can evaluate to a different value for each complex instance.
         *
         * When a dynamic attribute is set to a value other than a function or a {@link Nully} value,
         * its value is the same for every complex instance.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, a _property type_ marked as _not required_ can later be marked as _required_.
         * However, a _property type_ marked as _required_ can no longer go back to being _not required_.
         *
         * Because this attribute is also _dynamic_,
         * the actual required values are only known
         * when evaluated for specific complex instances.
         * As such, ensuring monotonic changes is deferred until evaluation.
         * No errors are thrown; non-monotonic changes simply don't take any effect.
         *
         * ### This attribute is *Inherited*
         *
         * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
         *
         * The first set local value must respect the _monotonicity_ property with the inherited value.
         *
         * ### Other characteristics
         *
         * The value got by the attribute is the **last set local, value**, if any -
         * a function, a constant value or `undefined`, when unset.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
         * an error is thrown.
         *
         * The default (root) `isRequired` attribute value is `false`.
         *
         * @name isRequired
         * @memberOf pentaho.type.Property.Type#
         * @type undefined | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
         * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
         *
         * @see pentaho.type.Complex#isRequired
         */
        isRequired: {
          value: false,
          cast:  Boolean,
          combine: function(baseEval, localEval) {
            return function() {
              // localEval is skipped if base is true.
              return baseEval.call(this) || localEval.call(this);
            };
          }
        },

        /**
         * Evaluates the value of the `countMin` attribute of a property of this type
         * on a given complex value.
         *
         * This method is used to determine the effective
         * [element count range]{@link pentaho.type.Property.Type#countRangeEval} and
         * is not intended to be used directly.
         *
         * @name countMinEval
         * @memberOf pentaho.type.Property.Type#
         * @param {pentaho.type.Complex} owner The complex value that owns a property of this type.
         * @return {number} The evaluated value of the `countMin` attribute.
         *
         * @ignore
         */

        /**
         * Gets or sets the minimum number of elements that properties of this type must have.
         *
         * A non-negative integer.
         *
         * Note that this attribute is taken together with
         * the [isRequired]{@link pentaho.type.Property.Type#isRequired} attribute
         * to determine the effective [element count range]{@link pentaho.type.Property.Type#countRangeEval}
         * of a _property type_.
         *
         * ### This attribute is *Dynamic*
         *
         * When a _dynamic_ attribute is set to a function,
         * it can evaluate to a different value for each complex instance.
         *
         * When a dynamic attribute is set to a value other than a function or a {@link Nully} value,
         * its value is the same for every complex instance.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, a _property type_ having a `countMin` of `1` can later be
         * changed to have a `countMin` of `2`.
         * However, a _property type_ having a `countMin` of `2` can no longer go back to
         * have a lower `countMin`, like `0`.
         * The `countMin` attribute can only change to a greater value.
         *
         * Because this attribute is also _dynamic_,
         * the actual `countMin` values are only known
         * when evaluated for specific complex instances.
         * As such, ensuring monotonic changes is deferred until evaluation.
         * No errors are thrown; non-monotonic changes simply don't take any effect.
         *
         * ### This attribute is *Inherited*
         *
         * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
         *
         * The first set local value must respect the _monotonicity_ property with the inherited value.
         *
         * ### Other characteristics
         *
         * The value got by the attribute is the **last set local, value**, if any -
         * a function, a constant value or `undefined`, when unset.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
         * an error is thrown.
         *
         * The default (root) `countMin` attribute value is `0`.
         *
         * @name countMin
         * @memberOf pentaho.type.Property.Type#
         * @type undefined | number | pentaho.type.PropertyDynamicAttribute.<number>
         *
         * @see pentaho.type.Complex#countRange
         */
        countMin: {
          value: 0,
          cast:  castCount,
          combine: function(baseEval, localEval) {
            return function() {
              return Math.max(baseEval.call(this), localEval.call(this));
            };
          }
        },

        /**
         * Evaluates the value of the `countMax` attribute of a property of this type
         * on a given complex value.
         *
         * This method is used to determine the effective
         * [element count range]{@link pentaho.type.Property.Type#countRangeEval} and
         * is not intended to be used directly.
         *
         * @name countMaxEval
         * @memberOf pentaho.type.Property.Type#
         * @param {pentaho.type.Complex} owner The complex value that owns a property of this type.
         * @return {number} The evaluated value of the `countMax` attribute.
         *
         * @ignore
         */

        /**
         * Gets or sets the maximum number of elements that properties of this type can have.
         *
         * A non-negative integer.
         *
         * Note that this attribute is taken together with
         * the [isRequired]{@link pentaho.type.Property.Type#isRequired}
         * and the [countMin]{@link pentaho.type.Property.Type#countMin} attributes
         * to determine the effective [element count range]{@link pentaho.type.Property.Type#countRangeEval}
         * of a _property type_.
         *
         * ### This attribute is *Dynamic*
         *
         * When a _dynamic_ attribute is set to a function,
         * it can evaluate to a different value for each complex instance.
         *
         * When a dynamic attribute is set to a value other than a function or a {@link Nully} value,
         * its value is the same for every complex instance.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, a _property type_ having a `countMax` of `5` can later be
         * changed to have a `countMax` of `3`.
         * However, a _property type_ having a `countMax` of `5` can no longer "go back" to
         * have a greater `countMax`, like `7`.
         * The `countMax` attribute can only change to a lower value.
         *
         * Because this attribute is also _dynamic_,
         * the actual `countMax` values are only known
         * when evaluated for specific complex instances.
         * As such, ensuring monotonic changes is deferred until evaluation.
         * No errors are thrown; non-monotonic changes simply don't take any effect.
         *
         * ### This attribute is *Inherited*
         *
         * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
         *
         * The first set local value must respect the _monotonicity_ property with the inherited value.
         *
         * ### Other characteristics
         *
         * The value got by the attribute is the **last set local, value**, if any -
         * a function, a constant value or `undefined`, when unset.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
         * an error is thrown.
         *
         * The default (root) `countMax` attribute value is `Infinity`.
         *
         * @name countMax
         * @memberOf pentaho.type.Property.Type#
         * @type undefined | number | pentaho.type.PropertyDynamicAttribute.<number>
         *
         * @see pentaho.type.Complex#countRange
         */
        countMax: {
          value: Infinity,
          cast:  castCount,
          combine: function(baseEval, localEval) {
            return function() {
              return Math.min(baseEval.call(this), localEval.call(this));
            };
          }
        },

        /**
         * Evaluates the value of the `isApplicable` attribute of a property of this type
         * on a given owner complex value.
         *
         * @name applicableEval
         * @memberOf pentaho.type.Property.Type#
         * @param {pentaho.type.Complex} owner The complex value that owns a property of this type.
         * @return {boolean} The evaluated value of the `isApplicable` attribute.
         *
         * @ignore
         */

        /**
         * Gets or sets a value or function that indicates if properties of this type are applicable.
         *
         * When a property is not (currently) applicable, then it does not apply,
         * it does not make sense in a certain situation.
         * It may only be applicable when another property of the complex type has a specific value, for example.
         *
         * When a property is not currently applicable, its value is not significant,
         * and, as such, any validations concerning it are not performed.
         *
         * ### This attribute is *Dynamic*
         *
         * When a _dynamic_ attribute is set to a function,
         * it can evaluate to a different value for each complex instance.
         *
         * When a dynamic attribute is set to a value other than a function or a {@link Nully} value,
         * its value is the same for every complex instance.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, a _property type_ marked as _applicable_ can later be marked as _not applicable_.
         * However, a _property type_ marked as _not applicable_ can no longer go back to being _applicable_.
         *
         * Because this attribute is also _dynamic_,
         * the actual `isApplicable` values are only known
         * when evaluated for specific complex instances.
         * As such, ensuring monotonic changes is deferred until evaluation.
         * No errors are thrown; non-monotonic changes simply don't take any effect.
         *
         * ### This attribute is *Inherited*
         *
         * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
         *
         * The first set local value must respect the _monotonicity_ property with the inherited value.
         *
         * ### Other characteristics
         *
         * The value got by the attribute is the **last set local, value**, if any -
         * a function, a constant value or `undefined`, when unset.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
         * an error is thrown.
         *
         * The default (root) `isApplicable` attribute value is `true`.
         *
         * @name isApplicable
         * @memberOf pentaho.type.Property.Type#
         * @type undefined | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>
         *
         * @see pentaho.type.Property.Type#isRequired
         * @see pentaho.type.Complex#isApplicable
         */
        isApplicable: {
          value: true,
          cast:  Boolean,
          combine: function(baseEval, localEval) {
            return function() {
              // localEval is skipped if base is false.
              return baseEval.call(this) && localEval.call(this);
            };
          }
        },

        /**
         * Evaluates the value of the `isReadOnly` attribute of a property of this type
         * on a given owner complex value.
         *
         * @name isReadOnlyEval
         * @memberOf pentaho.type.Property.Type#
         * @param {pentaho.type.Complex} owner The complex value that owns a property of this type.
         * @return {boolean} The evaluated value of the `isReadOnly` attribute.
         *
         * @ignore
         */

        /**
         * Gets or sets a value, or function, that indicates if properties of this type
         * _cannot_ be changed by a user, in a user interface.
         *
         * A property should be set read-only whenever its value is implied/imposed somehow,
         * and thus cannot not be changed, directly, by the user, in a user interface.
         *
         * ### This attribute is *Dynamic*
         *
         * When a _dynamic_ attribute is set to a function,
         * it can evaluate to a different value for each complex instance.
         *
         * When a dynamic attribute is set to a value other than a function or a {@link Nully} value,
         * its value is the same for every complex instance.
         *
         * ### This attribute is *Monotonic*
         *
         * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
         *
         * In this case, a _property type_ marked as _not read-only_ can later be marked as _read-only_.
         * However, a _property type_ marked as _read-only_ can no longer go back to being _not read-only_.
         *
         * Because this attribute is also _dynamic_,
         * the actual `isReadOnly` values are only known
         * when evaluated for specific complex instances.
         * As such, ensuring monotonic changes is deferred until evaluation.
         * No errors are thrown; non-monotonic changes simply don't take any effect.
         *
         * ### This attribute is *Inherited*
         *
         * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
         *
         * The first set local value must respect the _monotonicity_ property with the inherited value.
         *
         * ### Other characteristics
         *
         * The value got by the attribute is the **last set local, value**, if any -
         * a function, a constant value or `undefined`, when unset.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
         * an error is thrown.
         *
         * The default (root) `isReadOnly` attribute value is `false`.
         *
         * @name isReadOnly
         * @memberOf pentaho.type.Property.Type#
         * @type undefined | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>
         *
         * @see pentaho.type.Complex#isReadOnly
         */
        isReadOnly: {
          value: false,
          cast: Boolean,
          combine: function(baseEval, localEval) {
            return function() {
              // localEval is skipped if base is true.
              return baseEval.call(this) || localEval.call(this);
            };
          }
        }
      }, // end attrs:

      /**
       * Evaluates the _element count range_ of a property of this type
       * on a given complex value.
       *
       * The _element count range_ is a conciliation of the _effective value_ of
       * the following attributes:
       *
       * * {@link pentaho.type.Property.Type#isList}
       * * {@link pentaho.type.Property.Type#isRequired}
       * * {@link pentaho.type.Property.Type#countMin}
       * * {@link pentaho.type.Property.Type#countMax}
       *
       * The logic can be best explained by the following simple example function:
       *
       * ```js
       * function evaluateRange(isList, isRequiredEf, countMinEf, countMaxEf) {
       *   var min = countMinEf;
       *   var max = countMaxEf;
       *
       *   if(!isList && min > 1) min = 1;
       *   if(!isList && max > 1) max = 1;
       *
       *   if(isRequiredEf && min < 1) min = 1;
       *
       *   if(max < min) max = min;
       *
       *   return {min: min, max};
       * }
       * ```
       *
       * When the property is _not_ a [list]{@link pentaho.type.Property#isList} property,
       * then both the minimum and maximum values can only be either zero or one.
       *
       * If `isRequired` is true, then the minimum must be greater than or equal to one.
       *
       * The `countMax` value is constrained to be greater than or equal to the minimum.
       *
       * @param {pentaho.type.Complex} owner The complex value that owns a property of this type.
       *
       * @return {pentaho.IRange<number>} The evaluated element count range.
       *
       * @see pentaho.type.Complex#countRange
       */
      countRangeEval: function(owner) {
        var isRequired = this.isRequiredEval(owner),
            countMin = this.countMinEval(owner),
            countMax = this.countMaxEval(owner);

        if(!this.isList) {
          if(countMin > 1) countMin = 1;
          if(countMax > 1) countMax = 1;
        }

        if(isRequired && countMin < 1) countMin = 1;

        if(countMax < countMin) countMax = countMin;

        return {min: countMin, max: countMax};
      }
    } // end type:
  });

  _propType = Property.prototype;

  return Property;

  function nonEmptyString(value) {
    return value == null ? null : (String(value) || null);
  }

  function wrapWithCast(fun, cast, dv) {
    return function() {
      var v = fun.apply(this, arguments);
      return castAndNormalize(v, cast, dv);
    };
  }

  function castCount(v) {
    v = +v;
    if(isNaN(v) || v < 0) return undefined;
    return Math.floor(v);
  }

  function castAndNormalize(v, cast, dv) {
    if(v == null) {
      v = dv;
    } else if(cast) {
      v = cast(v, dv);
      if(v == null)
        v = dv;
    }
    return v;
  }
});
