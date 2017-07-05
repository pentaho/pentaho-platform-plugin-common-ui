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
  "./mixins/discreteDomain",
  "../i18n!types",
  "../lang/_AnnotatableLinked",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/text"
], function(module, instanceFactory, typeUtil, ValidationError, discreteDomainFactory, bundle, AnnotatableLinked,
            arg, error, O, text) {

  "use strict";

  var _defaultTypeMid = "string";

  return function(context) {

    var Instance = context.get(instanceFactory);

    var _propType;

    /**
     * @name pentaho.type.Property.Type
     *
     * @class
     * @extends pentaho.type.Type
     * @extends pentaho.type.mixins.DiscreteDomain.Type
     *
     * @abstract
     *
     * @implements pentaho.lang.IWithKey
     * @implements pentaho.lang.IListElement
     * @implements pentaho.lang.ICollectionElement
     *
     * @classDesc The type of a property of a complex type.
     *
     * A _property type_ only exists within a _complex type_.
     *
     * @description Creates a property type object.
     *
     * @see pentaho.type.Complex
     */

    /**
     * @name pentaho.type.Property
     *
     * @class
     * @extends pentaho.type.Instance
     * @extends pentaho.type.mixins.DiscreteDomain
     *
     * @abstract
     * @amd {pentaho.type.Factory<pentaho.type.Property>} pentaho/type/property
     *
     * @classDesc The class of properties of complex values.
     *
     * @description This class was not designed to be constructed directly.
     *
     * @see pentaho.type.Complex
     */

    var Property = Instance.extend(/** @lends pentaho.type.Property# */{

      // TODO: value, members?
      // TODO: p -> AnnotatableLinked.configure(this, config);

      type: /** @lends pentaho.type.Property.Type# */{
        // Note: constructor/_init is only called on sub-classes of Property.Type,
        // and not on Property.Type itself.

        id: module.id,
        alias: "property",
        isAbstract: true,
        styleClass: null,

        // Break inheritance
        _label: null,
        _description: null,

        /**
         * Setting name and label first allows describing the property in subsequent error messages.
         *
         * Setting label after name ensures that label defaults that are derived from name will work the first time.
         *
         * Setting type before value (not included here, so it is processed after type) avoids:
         * 1. Checking the new value against the old type (and then again, against the new type)
         * 2. Ensures error messages are given in a predictable order,
         *    independently of the order of properties in an instSpec:
         *   a. Is new type a subtype of old type?
         *   b. Is new value an instance of the new type?
         *
         * @type string[]
         * @ignore
         */
        extend_order: ["name", "label", "type"],

        /**
         * Gets a value that indicates if the type is under construction.
         * Certain operations are allowed only during construction.
         *
         * @type {boolean}
         * @private
         */
        __isConstructing: false,

        // TODO: Not validating property value type must descend from Value.Type.
        // Could probably solve by assuming a Property.Type default of Value.

        /**
         * Performs initialization tasks that take place before the instance is
         * extended with its spec.
         *
         * @param {!pentaho.type.spec.UPropertyTypeProto} spec - A property name or specification object.
         * @param {!Object} keyArgs - Keyword arguments.
         * @param {!pentaho.type.Complex.Type} keyArgs.declaringType - The complex type that declares the property.
         * @param {number} keyArgs.index - The index of the property within its complex type.
         *
         * @protected
         */
        _init: function(spec, keyArgs) {

          this.base.apply(this, arguments);

          this.__isConstructing = true;

          // TODO: Not validating same context as base.

          // Abstract Property types don't yet have an associated declaringType.
          // e.g. Property.extend()
          var declaringType = keyArgs && keyArgs.declaringType;
          if(declaringType) {
            if(declaringType.context !== context)
              throw error.argInvalid("declaringType", "Invalid context");

            O.setConst(this, "_declaringType", declaringType);

            if(this.isRoot) {
              O.setConst(this, "_index", keyArgs.index || 0);

              // Required stuff
              if(!("name" in spec)) this.name = null; // throws

              // Assume the _default_ type _before_ extend, to make sure `value` can be validated against it.
              if(!spec.valueType && (this._valueType === _propType._valueType))
                this.valueType = _defaultTypeMid;
            }
          }
        },

        /** @inheritDoc */
        _postInit: function() {

          this.base.apply(this, arguments);

          if(this.isRoot) {
            // Assuming default values
            if(!O.hasOwn(this, "_label")) this._resetLabel();

            this._createValueAccessor();
          }

          this.__isConstructing = false;
        },

        // region IListElement
        /**
         * Gets the singular name of `Property.Type` list-elements.
         * @type string
         * @readonly
         * @default "property"
         */
        elemName: "property", // endregion

        // region IWithKey implementation
        /**
         * Gets the singular name of `Property.Type` keys.
         * @type {string}
         * @readonly
         * @default "name"
         */
        keyName: "name",

        /**
         * Gets the key of the property.
         *
         * The key of a property is its name.
         *
         * @type {string}
         * @readonly
         */
        get key() {
          return this._name;
        }, // endregion

        // region attributes

        get isProperty() { return true; },

        // region declaringType attribute
        /**
         * Gets the complex type that declares this property type.
         *
         * @type {pentaho.type.Complex.Type}
         * @readonly
         */
        get declaringType() {
          return this._declaringType;
        },
        // endregion

        // region index attribute
        /**
         * Gets the index of the property in the containing complex type.
         *
         * @type {number}
         * @readonly
         */
        get index() {
          return this._index;
        },
        // endregion

        // region name attribute
        _name: undefined,

        /**
         * Gets or sets the name of the _property type_.
         *
         * The name of a _property type_ identifies it within
         * its [declaring type]{@link pentaho.type.Property.Type#declaringType}.
         *
         * ### Set
         *
         * This attribute must be set when defining a new _property type_,
         * and cannot be changed afterwards.
         *
         * When set to a non-{@link Nully} and non-{@link String} value,
         * the value is first replaced by the result of calling its `toString` method.
         *
         * @type {!nonEmptyString}
         *
         * @throws {pentaho.lang.ArgumentRequiredError} When set to an empty string or a _nully_ value.
         * @throws {TypeError} When set to a value different from the current one.
         *
         * @see pentaho.type.spec.IPropertyTypeProto#name
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
            /* eslint no-lonely-if: 0 */
            // Hierarchy consistency
            if(value && value !== this._name)
              throw new TypeError("Sub-properties cannot change the 'name' attribute.");
          }
        },
        // endregion

        // region alias attribute
        _nameAlias: undefined,

        /**
         * Gets or sets the alias for the name of the _property type_.
         *
         * The alias for the name of a _property type_ is an alternative identifier for serialization purposes.
         *
         * ### Set
         *
         * This attribute can only be set when defining a new _property type_,
         * and cannot be changed afterwards.
         *
         * When set to a non-{@link Nully} and non-{@link String} value,
         * the value is first replaced by the result of calling its `toString` method.
         *
         * @type {!nonEmptyString}
         *
         * @throws {TypeError} When attempting to set a value and the property is not a root property.
         * @throws {pentaho.lang.ArgumentRequiredError} When set to an empty string or a _nully_ value.
         * @throws {TypeError} When set to a value different from the current one.
         *
         * @see pentaho.type.spec.IPropertyTypeProto#nameAlias
         */
        get nameAlias() {
          return this._nameAlias;
        },

        set nameAlias(value) {
          if(!this.isRoot)
            throw new TypeError("The 'nameAlias' attribute can only be assigned to a root property.");

          value = nonEmptyString(value);

          if(!value) throw error.argRequired("nameAlias");

          // Cannot change, or throws.
          O.setConst(this, "_nameAlias", value);
        }, // endregion

        // region list attribute
        /**
         * Gets a value that indicates if the property is a _list_.
         *
         * A property is a _list_ property if
         * its [value type]{@link pentaho.type.Property.Type#valueType} is a list type,
         * that is, if it is or extends [List]{@link pentaho.type.List}.
         *
         * @type {boolean}
         * @readonly
         */
        get isList() {
          return this._valueType.isList;
        },
        // endregion

        // region (value) element type attribute
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
         * @type {!pentaho.type.Element.Type}
         * @readonly
         */
        get elemType() {
          var valueType = this._valueType;
          return valueType.isList ? valueType.of : valueType;
        },
        // endregion

        // region valueType attribute

        // NOTE: see at the end of the class declaration: valueType = "value";
        _valueType: undefined,

        /**
         * Gets or sets the type of value that properties of this type can hold.
         *
         * If the _value type_ is a [list]{@link pentaho.type.Value.Type#isList} type,
         * then this property will be a _list_ (or multiple-elements) property;
         * otherwise, this property will be an _element_ (or single-element) property.
         *
         * ### Get
         *
         * The _default value type_ is the _inherited value type_.
         *
         * A root _property type_ has a default _value type_ of [string]{@link pentaho.type.String}.
         *
         * ### Set
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
         * ### Relation to `value` attribute
         *
         * When set and the [value]{@link pentaho.type.Property.Type#value} attribute
         * is _locally_ set, it is checked against the new _value type_,
         * and set to `null`, if it's not an instance of it.
         *
         * @type {!pentaho.type.Value.Type}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
         * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
         * @throws {pentaho.lang.OperationInvalidError} When setting on an existing property from configuration.
         * @throws {pentaho.lang.ArgumentInvalidError} When setting to a _value type_ that is not a subtype
         * of the current _value type_.
         *
         * @see pentaho.type.spec.IPropertyTypeProto#valueType
         */
        get valueType() {
          return this._valueType;
        },

        set valueType(value) {
          if(this.hasDescendants)
            throw error.operInvalid("Cannot change the value type of a property type that has descendants.");

          if(!this.__isConstructing && context.isConfiguring)
            throw error.operInvalid("Cannot change the value type of an existing property type from configuration.");

          if(value == null) return;

          var oldType = this._valueType;
          // Prevent using "value", inherited from abstract base classes, as a default base class.
          // However, allow configuring a root property, by sub-classing its current, own, type.
          var defaultBaseType = this.isRoot ? O.getOwn(this, "_valueType") : oldType;
          var newType = context.get(value, {defaultBase: defaultBaseType}).type;
          if(newType !== oldType) {
            // Hierarchy/PreviousValue consistency
            if(oldType && !newType.isSubtypeOf(oldType))
              throw error.argInvalid("valueType", bundle.structured.errors.property.typeNotSubtypeOfBaseType);

            this._valueType = newType;

            // Set local value to null, if it is not an instance of the new type.
            // Not really needed as the value getter tests the if value is of type.
            // However, this improves performance.
            var dv;
            if(O.hasOwn(this, "_defaultValue") && (dv = this._defaultValue) && !newType.is(dv)) {
              this._defaultValue = null;
            }
          }
        },
        // endregion

        // region value attribute and related methods
        _defaultValue: undefined,

        /**
         * Gets or sets the _default value_ of properties of this type.
         *
         * The _default value_ is the "prototype" value that properties of this type take,
         * on complex instances,
         * when the property is unspecified or specified as a {@link Nully} value.
         * A [cloned]{@link pentaho.type.Value#clone} value is used each time.
         *
         * The value `null` is a valid _default value_.
         *
         * ### Get
         *
         * When got and the _default value_ (local or inherited)
         * is not an instance of the _defaultValue type_ (local or inherited),
         * `null` is returned.
         *
         * ### Set
         *
         * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
         * an error is thrown.
         *
         * When set to `null`, it is respected.
         *
         * When set to the _control value_ `undefined`, the attribute value is reset,
         * causing it to assume its default value (yes, the default value of the _default value_ attribute...):
         *
         * * for [root]{@link pentaho.type.Type#root} _property types_, the default value is `null`
         * * for non-root _property types_, the default value is the _inherited value_,
         *   if it is an instance of the _property type_'s [valueType]{@link pentaho.type.Property.Type#valueType};
         *   or, `null`, otherwise.
         *
         * When set to any other value,
         * it is first converted to the _property type_'s
         * [valueType]{@link pentaho.type.Property.Type#valueType},
         * using its [Value.Type#to]{@link pentaho.type.Value.Type#to} method.
         * The conversion may be impossible and thus an error may be thrown.
         *
         * @type {pentaho.type.Value}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
         * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
         *
         * @throws {Error} When setting to a _default value_ that cannot be converted to the
         * property type's current `valueType`.
         *
         * @see pentaho.type.spec.IPropertyTypeProto#value
         */
        get defaultValue() {
          var value = this._defaultValue;
          return value && this._valueType.is(value) ? value : null;
        },

        set defaultValue(_) {
          if(this.hasDescendants)
            throw error.operInvalid("Cannot change the default value of a property type that has descendants.");

          if(_ === undefined || (_ === null && this.isRoot)) {
            if(this !== _propType) {
              // Clear local value. Inherit base value.
              delete this._defaultValue;
            }
          } else {
            this._defaultValue = this.toValue(_, /* noDefault: */true);
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
         * @param {?any} valueSpec - A value or value specification.
         * @param {boolean} [noDefault=false] Indicates if {@link Nully} values
         *  should _not_ be converted to the property's default value.
         *
         * @return {?pentaho.type.Value} A value.
         */
        toValue: function(valueSpec, noDefault) {
          if(valueSpec == null) {
            return noDefault ? null : this.__freshDefaultValue();
          }

          return this.isList
              ? this._valueType.to(valueSpec, this.__listCreateKeyArgs || this.__buildListCreateKeyArgs())
              : this._valueType.to(valueSpec);
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
        __freshDefaultValue: function() {
          var dv = this.defaultValue;
          return dv
              ? dv.clone()
              : (this.isList
                  ? this._valueType.create(null, this.__listCreateKeyArgs || this.__buildListCreateKeyArgs())
                  : dv);
        },

        __listCreateKeyArgs: null,

        __buildListCreateKeyArgs: function() {
          return (this.__listCreateKeyArgs = {
            isBoundary: this._isBoundary,
            isReadOnly: this._isReadOnly
          });
        },
        // endregion

        // region label attribute
        /**
         * Resets the label of the property.
         *
         * The label of a root property is reset to a capitalization of the `name` attribute.
         * A non-root property inherits the label of its closest ancestor.
         *
         * @private
         */
        _resetLabel: function() {
          this._labelSet = false;

          if(this.isRoot) {
            this._label = text.titleFromName(this.name);
          } else {
            delete this._label;
          }
        },
        // endregion

        // region isReadOnly attribute
        // TODO: shouldn't this only be settable on the root property??
        _isReadOnly: false,

        /**
         * Gets or sets whether the value of properties of this type can be changed.
         *
         * If the _value type_ is a [list]{@link pentaho.type.Value.Type#isList} type,
         * then this property effectively makes the list read-only.
         *
         * ### Get
         *
         * The _default read-only_ value is the _inherited read-only_ value.
         *
         * A root _property type_ has a default _read-only_ value of `false`.
         *
         * ### Set
         *
         * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
         * an error is thrown.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * Otherwise, the set value is converted to boolean, by using {@link Boolean}.
         *
         * This property is monotonic. Once set to `true`, it can no longer be set to `false`.
         *
         * @type {boolean}
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
         * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
         */
        get isReadOnly() {
          return this._isReadOnly;
        },

        set isReadOnly(value) {
          // Cannot change the root value.
          // Testing this here, instead of after the descendants test,
          // because, otherwise, it would be very hard to test.
          if(this === _propType) return;

          if(this.hasDescendants)
            throw error.operInvalid("Cannot change the isReadOnly attribute of a property type that has descendants.");

          if(value != null && !!value) {
            this._isReadOnly = true;
          }
        },
        // endregion

        // region isBoundary
        _isBoundary: false,

        /**
         * Gets or sets whether the property is a _boundary property_.
         *
         * A _boundary property_ identifies the limits of the aggregate of its
         * [declaring type]{@link pentaho.type.Property.Type#declaringType}.
         *
         * If the _value type_ is a [list]{@link pentaho.type.Value.Type#isList} type,
         * then this property sets its lists as [boundary lists]{@link pentaho.type.List#isBoundary}.
         *
         * The validity of the object with a _boundary property_
         * is not affected by the validity of the property's value (or values).
         * Also, changes within its value(s) do not bubble through it.
         *
         * Boundary properties do not cause their values to hold inverse references to the property holder.
         * This means that, in objects connected by boundary properties, only the property holders prevent
         * their values from being garbage collected, and not the other way round.
         * On the contrary, non-boundary properties form object aggregates that can only be garbage-collected
         * as a whole.
         *
         * ### Get
         *
         * The default value is `false`.
         *
         * ### Set
         *
         * Only a _root property type_ can set its boundary attribute.
         * When set on a _non-root property type_, an error is thrown.
         *
         * When set and the root property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
         * an error is thrown.
         *
         * When set to a {@link Nully} value, the set operation is ignored.
         *
         * Otherwise, the set value is converted to boolean, by using {@link Boolean}.
         *
         * @type {boolean}
         * @default false
         *
         * @throws {pentaho.lang.OperationInvalidError} When set on a non-root property type.
         *
         * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
         * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
         */
        get isBoundary() {
          return this._isBoundary;
        },

        set isBoundary(value) {
          // Cannot change the root value.
          // Testing this here, instead of after the descendants test,
          // because, otherwise, it would be very hard to test.
          if(this === _propType) return;

          if(!this.isRoot)
            throw error.operInvalid("Cannot only change the isBoundary attribute on a root property type.");

          if(this.hasDescendants)
            throw error.operInvalid("Cannot change the isBoundary attribute of a property type that has descendants.");

          if(value != null) {
            this._isBoundary = !!value;
          }
        },
        // endregion

        // endregion

        // region property accessor
        _createValueAccessor: function() {
          var instance = this._declaringType.instance;
          var name = this._name;

          if(!(name in instance)) {
            Object.defineProperty(instance, name, {
              configurable: true,

              get: function() {
                return this.getv(name);
              },

              set: function(value) {
                this.set(name, value);
              }
            });
          }
        },
        // endregion

        // region validation

        /**
         * Determines if this property is valid on a given complex instance.
         *
         * If this property is not a [boundary]{@link pentaho.type.Property.Type#isBoundary} property,
         * this method validates the value of the property itself.
         *
         * Afterwards, the cardinality is verified against the attributes
         * {@link pentaho.type.Property.Type#isRequired},
         * {@link pentaho.type.Property.Type#countMin} and
         * {@link pentaho.type.Property.Type#countMax}.
         *
         * @param {!pentaho.type.Complex} owner - The complex value that owns the property.
         *
         * @return {pentaho.type.ValidationError|Array.<pentaho.type.ValidationError>} An error,
         * a non-empty array of errors or `null`.
         *
         * @see pentaho.type.Complex#validate
         */
        validateOn: function(owner) {
          var errors = null;

          if(this.isApplicableOn(owner)) {
            var addErrors = function(newErrors) {
              errors = typeUtil.combineErrors(errors, newErrors);
            };

            var value = owner._getByType(this);
            if(value) {
              // Intrinsic value validation.
              if(!this.isBoundary) {
                // If a list, element validation is done before cardinality validation.
                // If a complex, its properties' validation is done before local cardinality validation.
                addErrors(value.validate());
              }

              // Extrinsic/Contextual value validation.
              addErrors(this._validateValueOn(owner, value));
            }

            // Extrinsic/Contextual value validation.

            // Cardinality validation
            var range = this.countRangeOn(owner);
            var count = this.isList ? value.count : (value ? 1 : 0);
            if(count < range.min) {
              if(this.isList) {
                addErrors(new ValidationError(
                  bundle.get("errors.property.countOutOfRange", [this.label, count, range.min, range.max])));
              } else {
                addErrors(new ValidationError(
                  bundle.get("errors.property.isRequired", [this.label])));
              }
            } else if(count > range.max) {
              addErrors(new ValidationError(
                bundle.get("errors.property.countOutOfRange", [this.label, count, range.min, range.max])));
            }
          }

          return errors;
        },

        /**
         * Validates the given non-null value in the context of this property.
         *
         * The base implementation calls
         * [_collectElementValidators]{@link pentaho.type.Property.Type#_collectElementValidators}
         * to obtain the list of currently applicable element validators.
         * Then, each element is validated against the list of collected validators.
         *
         * When overriding this method,
         * the error utilities in {@link pentaho.type.Util} can be used to help in the implementation.
         *
         * @param {!pentaho.type.Complex} owner - The complex value that owns the property.
         * @param {!pentaho.type.Value} value - The value to validate.
         *
         * @return {pentaho.type.ValidationError|Array.<pentaho.type.ValidationError>} An error,
         * a non-empty array of errors or `null`.
         *
         * @protected
         */
        _validateValueOn: function(owner, value) {
          var errors = null;

          if(!this.isList || value.count > 0) {

            var validators = null;
            var addValidator = function(validator) {
              (validators || (validators = [])).push(validator);
            };

            this._collectElementValidators(addValidator, owner, value);

            if(validators) {
              var validateElem = function(elem, index) {
                validators.forEach(function(validator) {
                  errors = typeUtil.combineErrors(errors, validator.call(this, owner, elem, index));
                });
              };

              if(this.isList) {
                value.each(validateElem, this);
              } else {
                validateElem.call(this, value, 0);
              }
            }
          }
          return errors;
        },

        /**
         * Called each time a property value is validated to collect the list of element validators.
         *
         * When overriding this method, be sure to also call the base implementation.
         *
         * @param {function() : void} addValidator - The function to call to register an element validator.
         * @param {!pentaho.type.Complex} owner - The complex value that owns the property.
         * @param {!pentaho.type.Value} value - The value whose elements will be validated.
         *
         * @protected
         */
        _collectElementValidators: function(addValidator, owner, value) {
        },
        // endregion

        // region serialization
        /** @inheritDoc */
        toSpecInContext: function(keyArgs) {

          if(!keyArgs) keyArgs = {};

          // no id and no base
          var spec = {};
          var baseType;

          var valueTypeRef = this._valueType.toRefInContext(keyArgs);

          // # Abstract Property Types
          //
          // Classes like Property or Property.extend() are *abstract*
          // and are base classes of actual property type roots.
          //
          // The base of a subtype of Property is either Property or a subtype of it
          // and needs to be output, with a type reference.
          //
          // If Property itself is serialized, the id needs to be included...
          //
          // The default `base` of a root property type is Property
          // and so, in this case, `base` can be omitted.
          //
          var isAbstract = !this._declaringType;
          if(isAbstract) {
            // The id, if any, needs to be included.
            // Property has an id. Subtypes of it may not have.
            var shortId = this.shortId;
            if(shortId) spec.id = shortId;

            // `ancestor` only works from root property types downwards.
            baseType = Object.getPrototypeOf(this);
            spec.base = baseType.toRefInContext(keyArgs);

            // Abstract Property classes don't have declaring type or `name`.

            // The default value type of abstract properties is value
            if(valueTypeRef !== "value") spec.type = valueTypeRef;

            this._fillSpecInContext(spec, keyArgs);
          } else {
            // Non-abstract property types are always anonymous and defined as part of the
            // declaring complex type's definition => no id.
            var count = 0;

            if(this.isRoot) {
              // The default `base` of a root property is Property.Type,
              // and is omitted if this is the case.
              // Again, the ancestor of a root property is null, and would not work in this case.
              baseType = Object.getPrototypeOf(this);
              if(baseType !== _propType) {
                spec.base = baseType.toRefInContext(keyArgs);
                count++;
              }
            }
            // else
            // Non-abstract, non-root property types
            // have `base` always equal to the _declaring type's base type_ corresponding property type,
            // so it is never included.

            // Always have a name.
            spec.name = this._name;
            count++;

            // The default value type of non-abstract properties is string
            if(valueTypeRef !== "string") {
              spec.type = valueTypeRef;
              count++;
            }

            // If there are no attributes besides `name`
            if(!this._fillSpecInContext(spec, keyArgs) && count === 1) {
              return this._name;
            }
          }

          return spec;
        },

        /** @inheritDoc */
        _fillSpecInContext: function(spec, keyArgs) {

          var any = this.base(spec, keyArgs);

          // Custom attributes
          var defaultValue = O.getOwn(this, "_defaultValue");
          if(defaultValue !== undefined) {
            any = true;
            if(defaultValue) {
              keyArgs.declaredType = this._valueType;
              spec.defaultValue = defaultValue.toSpecInContext(keyArgs);
            } else {
              spec.defaultValue = null;
            }
          }

          return any;
        }
        // endregion
      }
    }, /** @lends pentaho.type.Property */{
      type: /** @lends pentaho.type.Property.Type */{
        /** @inheritDoc */
        _extend: function(name, instSpec, classSpec, keyArgs) {

          // Accept typeSpec as being the property name.
          if(typeof instSpec === "string") {
            instSpec = {name: instSpec};
          }

          return this.base(name, instSpec, classSpec, keyArgs);
        }
      }
    }).implement({
      type: /** @lends pentaho.type.Property.Type# */{
        dynamicAttributes: {
          /**
           * Evaluates the value of the `isRequired` attribute of a property of this type
           * on a given complex value.
           *
           * This method is used to determine the effective
           * [element count range]{@link pentaho.type.Property.Type#countRangeOn} and
           * is not intended to be used directly.
           *
           * @name isRequiredOn
           * @memberOf pentaho.type.Property.Type#
           * @param {!pentaho.type.Complex} owner - The complex value that owns a property of this type.
           * @return {boolean} The evaluated value of the `isRequired` attribute.
           *
           * @see pentaho.type.Property.Type#isRequired
           */

          /**
           * Gets or sets a value that indicates if properties of this type are required.
           *
           * When a property is of a required _property type_,
           * it is considered **invalid** if its value (in a complex instance) is `null`; or,
           * in the case of a [list]{@link pentaho.type.Property.Type#isList} _property type_,
           * it has zero elements.
           *
           * Note that this attribute is taken together with
           * the [countMin]{@link pentaho.type.Property.Type#countMin} attribute
           * to determine the effective [element count range]{@link pentaho.type.Property.Type#countRangeOn}
           * of a _property type_.
           *
           * ### This attribute is *Dynamic*
           *
           * When a _dynamic_ attribute is set to a function,
           * it can evaluate to a different value for each complex instance.
           *
           * When a _dynamic_ attribute is set to a value other than a function or a {@link Nully} value,
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
           * This behavior ensures that monotonic changes are deferred until evaluation.
           * No errors are thrown; non-monotonic changes simply do not take effect.
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
           * @type {undefined | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>}
           *
           * @throws {pentaho.lang.OperationInvalidError} When setting and the property already has
           * [descendant]{@link pentaho.type.Type#hasDescendants} properties.
           *
           * @see pentaho.type.Complex#isRequired
           * @see pentaho.type.spec.IPropertyTypeProto#isRequired
           */
          isRequired: {
            value: false,
            cast: Boolean,
            combine: function(baseEval, localEval) {
              return function(propType) {
                // localEval is skipped if base is true.
                return baseEval.call(this, propType) || localEval.call(this, propType);
              };
            }
          },

          /**
           * Evaluates the value of the `countMin` attribute of a property of this type
           * on a given complex value.
           *
           * This method is used to determine the effective
           * [element count range]{@link pentaho.type.Property.Type#countRangeOn} and
           * is not intended to be used directly.
           *
           * @name countMinOn
           * @memberOf pentaho.type.Property.Type#
           * @param {!pentaho.type.Complex} owner - The complex value that owns a property of this type.
           * @return {number} The evaluated value of the `countMin` attribute.
           *
           * @see pentaho.type.Property.Type#countMin
           */

          /**
           * Gets or sets the minimum number of elements that properties of this type must have.
           *
           * A non-negative integer.
           *
           * Note that this attribute is taken together with
           * the [isRequired]{@link pentaho.type.Property.Type#isRequired} attribute
           * to determine the effective [element count range]{@link pentaho.type.Property.Type#countRangeOn}
           * of a _property type_.
           *
           * ### This attribute is *Dynamic*
           *
           * When a _dynamic_ attribute is set to a function,
           * it can evaluate to a different value for each complex instance.
           *
           * When a _dynamic_ attribute is set to a value other than a function or a {@link Nully} value,
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
           * This behavior ensures that monotonic changes are deferred until evaluation.
           * No errors are thrown; non-monotonic changes simply do not take effect.
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
           * @type {undefined | number | pentaho.type.PropertyDynamicAttribute.<number>}
           *
           * @see pentaho.type.Complex#countRange
           *
           * @see pentaho.type.spec.IPropertyTypeProto#countMin
           */
          countMin: {
            value: 0,
            cast: castCount,
            combine: function(baseEval, localEval) {
              return function(propType) {
                return Math.max(baseEval.call(this, propType), localEval.call(this, propType));
              };
            }
          },

          /**
           * Evaluates the value of the `countMax` attribute of a property of this type
           * on a given complex value.
           *
           * This method is used to determine the effective
           * [element count range]{@link pentaho.type.Property.Type#countRangeOn} and
           * is not intended to be used directly.
           *
           * @name countMaxOn
           * @memberOf pentaho.type.Property.Type#
           * @param {!pentaho.type.Complex} owner - The complex value that owns a property of this type.
           * @return {number} The evaluated value of the `countMax` attribute.
           *
           * @see pentaho.type.Property.Type#countMax
           */

          /**
           * Gets or sets the maximum number of elements that properties of this type can have.
           *
           * A non-negative integer.
           *
           * Note that this attribute is taken together with
           * the [isRequired]{@link pentaho.type.Property.Type#isRequired}
           * and the [countMin]{@link pentaho.type.Property.Type#countMin} attributes
           * to determine the effective [element count range]{@link pentaho.type.Property.Type#countRangeOn}
           * of a _property type_.
           *
           * ### This attribute is *Dynamic*
           *
           * When a _dynamic_ attribute is set to a function,
           * it can evaluate to a different value for each complex instance.
           *
           * When a _dynamic_ attribute is set to a value other than a function or a {@link Nully} value,
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
           * This behavior ensures that monotonic changes are deferred until evaluation.
           * No errors are thrown; non-monotonic changes simply do not take any effect.
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
           * a function, a constant value; or, `undefined`, when unset.
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
           * @type {undefined | number | pentaho.type.PropertyDynamicAttribute.<number>}
           *
           * @see pentaho.type.Complex#countRange
           * @see pentaho.type.spec.IPropertyTypeProto#countMax
           */
          countMax: {
            value: Infinity,
            cast: castCount,
            combine: function(baseEval, localEval) {
              return function(propType) {
                return Math.min(baseEval.call(this, propType), localEval.call(this, propType));
              };
            }
          },

          /**
           * Evaluates the value of the `isApplicable` attribute of a property of this type
           * on a given owner complex value.
           *
           * @name isApplicableOn
           * @memberOf pentaho.type.Property.Type#
           * @param {!pentaho.type.Complex} owner - The complex value that owns a property of this type.
           * @return {boolean} The evaluated value of the `isApplicable` attribute.
           *
           * @see pentaho.type.Property.Type#isApplicable
           */

          /**
           * Gets or sets a value or function that indicates if properties of this type are applicable.
           *
           * When a property is not (currently) applicable, then it does not apply,
           * as it does not make sense in a certain situation.
           * It may only be applicable when another property of the complex type has a specific value, for example.
           *
           * When a property is not currently applicable, its value is not significant
           * and, as such, any validations concerning it are not performed.
           *
           * ### This attribute is *Dynamic*
           *
           * When a _dynamic_ attribute is set to a function,
           * it can evaluate to a different value for each complex instance.
           *
           * When a _dynamic_ attribute is set to a value other than a function or a {@link Nully} value,
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
           * This behavior ensures that monotonic changes are deferred until evaluation.
           * No errors are thrown; non-monotonic changes simply do not take any effect.
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
           * a function, a constant value; or, `undefined`, when unset.
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
           * @type {undefined | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>}
           *
           * @see pentaho.type.Property.Type#isRequired
           * @see pentaho.type.Complex#isApplicable
           * @see pentaho.type.spec.IPropertyTypeProto#isApplicable
           */
          isApplicable: {
            value: true,
            cast: Boolean,
            combine: function(baseEval, localEval) {
              return function(propType) {
                // localEval is skipped if base is false.
                return baseEval.call(this, propType) && localEval.call(this, propType);
              };
            }
          },

          /**
           * Evaluates the value of the `isEnabled` attribute of a property of this type
           * on a given owner complex value.
           *
           * @name isEnabledOn
           * @memberOf pentaho.type.Property.Type#
           * @param {!pentaho.type.Complex} owner - The complex value that owns a property of this type.
           * @return {boolean} The evaluated value of the `isEnabled` attribute.
           *
           * @see pentaho.type.Property.Type#isEnabled
           */

          /**
           * Gets or sets a value, or function, that indicates if properties of this type
           * _can_ be changed by a user, in a user interface.
           *
           * A property should be set disabled whenever its value is implied/imposed somehow,
           * and thus cannot be changed directly by the user through a user interface.
           *
           * ### This attribute is *Dynamic*
           *
           * When a _dynamic_ attribute is set to a function,
           * it can evaluate to a different value for each complex instance.
           *
           * When a _dynamic_ attribute is set to a value other than a function or a {@link Nully} value,
           * its value is the same for every complex instance.
           *
           * ### This attribute is *Monotonic*
           *
           * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
           *
           * In this case, a _property type_ marked as _enabled_ can later be marked as _not enabled_.
           * However, a _property type_ marked as _not enabled_ can no longer go back to being _enabled_.
           *
           * Because this attribute is also _dynamic_,
           * the actual `isEnabled` values are only known
           * when evaluated for specific complex instances.
           * This behavior ensures that monotonic changes are deferred until evaluation.
           * No errors are thrown; non-monotonic changes simply do not take any effect.
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
           * a function, a constant value; or, `undefined`, when unset.
           *
           * When set to a {@link Nully} value, the set operation is ignored.
           *
           * When set and the property already has [descendant]{@link pentaho.type.Type#hasDescendants} properties,
           * an error is thrown.
           *
           * The default (root) `isEnabled` attribute value is `true`.
           *
           * @name isEnabled
           * @memberOf pentaho.type.Property.Type#
           * @type {undefined | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>}
           *
           * @see pentaho.type.Complex#isEnabled
           * @see pentaho.type.spec.IPropertyTypeProto#isEnabled
           */
          isEnabled: {
            value: true,
            cast: Boolean,
            combine: function(baseEval, localEval) {
              return function(propType) {
                // localEval is skipped if base is false.
                return baseEval.call(this, propType) && localEval.call(this, propType);
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
         * @param {pentaho.type.Complex} owner - The complex value that owns a property of this type.
         *
         * @return {pentaho.IRange<number>} The evaluated element count range.
         *
         * @see pentaho.type.Complex#countRange
         */
        countRangeOn: function(owner) {
          var isRequired = this.isRequiredOn(owner);
          var countMin = this.countMinOn(owner);
          var countMax = this.countMaxOn(owner);

          if(!this.isList) {
            if(countMin > 1) countMin = 1;
            if(countMax > 1) countMax = 1;
          }

          if(isRequired && countMin < 1) countMin = 1;

          if(countMax < countMin) countMax = countMin;

          return {min: countMin, max: countMax};
        }
      }
    }).implement({
      type: /** @lends pentaho.type.Property.Type# */{
        // These are applied last so that mixins see any of the methods above as base implementations.
        mixins: [discreteDomainFactory]
      }
    });

    _propType = Property.type;

    // Root property valueType.
    _propType.valueType = "value";

    return Property;
  };

  function nonEmptyString(value) {
    return value == null ? null : (String(value) || null);
  }

  function castCount(v) {
    v = +v;
    if(isNaN(v) || v < 0) return;// undefined;
    return Math.floor(v);
  }
});
