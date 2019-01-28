/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
  "./Value",
  "./Element",
  "./Property",
  "./PropertyTypeCollection",
  "./util",
  "./mixins/Container",
  "./action/ComplexChangeset",
  "pentaho/lang/ActionResult",
  "pentaho/lang/UserError",
  "pentaho/util/object",
  "pentaho/util/error",
  "pentaho/i18n!types",

  // Pre-loads.
  "./List",
  "./standardSimple"
], function(module, Value, Element, Property, PropertyTypeCollection, typeUtil,
            ContainerMixin, ComplexChangeset, ActionResult, UserError,
            O, error, bundle) {

  "use strict";

  var O_hasOwn = Object.prototype.hasOwnProperty;
  var PROP_VALUE_DEFAULT = 0;
  var PROP_VALUE_SPECIFIED = 1;

  // TODO: self-recursive complexes won't work if we don't handle them specially:
  // Component.parent : Component
  // Will cause requiring Component during it's own build procedure...
  // Need to recognize requests for the currently being built _top-level_ complex in a special way -
  // the one that cannot be built and have a module id.

  var valueType = Value.type;

  /**
   * @name pentaho.type.ComplexType
   * @class
   * @extends pentaho.type.ElementType
   *
   * @classDesc The base type class of complex types.
   *
   * For more information see {@link pentaho.type.Complex}.
   */

  /**
   * @name pentaho.type.Complex
   * @class
   * @extends pentaho.type.Element
   * @extends pentaho.type.mixins.Container
   *
   * @amd pentaho/type/Complex
   *
   * @classDesc The base class of structured values.
   *
   * Example complex type:
   * ```js
   * define(["pentaho/type/Complex"], function(Complex) {
   *
   *   return Complex.extend({
   *     $type: {
   *       props: [
   *         {name: "name", valueType: "string", label: "Name"},
   *         {name: "categories", valueType: ["string"], label: "Categories"},
   *         {name: "price", valueType: "number", label: "Price"}
   *       ]
   *     }
   *   });
   * });
   * ```
   *
   * @description Creates a complex instance.
   *
   * When a derived class overrides the constructor and creates additional instance properties,
   * the {@link pentaho.type.Complex#_initClone} method should also be overridden to copy those properties.
   *
   * @constructor
   * @param {pentaho.type.spec.Complex} [spec] A complex specification.
   *
   * @see pentaho.type.Simple
   * @see pentaho.type.spec.IComplex
   * @see pentaho.type.spec.IComplexType
   */
  var Complex = Element.extend(/** @lends pentaho.type.Complex# */{

    // NOTE 1: neither `Value` or `Instance` do anything in their constructor,
    // so, in the name of performance, we're purposely not calling base.

    // NOTE 2: keep the constructor code synced with #clone !
    constructor: function(spec, keyArgs) {

      // Ensure compiler gets a stable properties layout.

      this._initContainer();

      this._initProperties(spec);
    },

    /**
     * Initializes the properties of the complex instance from a the given specification.
     *
     * @param {pentaho.type.spec.Complex} [spec] A complex specification.
     * @protected
     */
    _initProperties: function(spec) {

      // Create `Property` instances (not quite...).
      var propTypes = this.$type.__getProps();
      var L = propTypes.length;
      var readSpec = !spec ? undefined : (Array.isArray(spec) ? __readSpecByIndex : __readSpecByNameOrAlias);

      var values = {};
      var valuesState = {};

      // These need to be set before any defaultValue function is evaluated.
      this.__values = values;
      this.__valuesState = valuesState;

      var propType;
      var value;
      var name;
      var i = -1;
      while(++i < L) {
        propType = propTypes[i];
        name = propType.name;

        value = readSpec && readSpec(spec, propType);

        valuesState[name] = value == null ? PROP_VALUE_DEFAULT : PROP_VALUE_SPECIFIED;
        values[name] = value = propType.toValueOn(this, value);

        if(value != null && value.__addReference) {
          this.__initPropertyValueRelation(propType, value);
        }
      }
    },

    /**
     * Initializes the relation between a this complex and its container value.
     *
     * If `this` instance is being newed up or cloned while there is an ambient transaction,
     * it should not cease to exist if the txn is rejected,
     * nor should its construction time property values be restored to... what? default values?
     * So, references added should also not be subject to the ambient transaction.
     *
     * Lists have special semantics: isBoundary applies to the relation between the list and its elements.
     * Adding/Removing elements in an isList and isBoundary property
     * still generates events in the containing complex.
     * We could, however, not addRef if the prop (and, thus, the list) is also isReadOnly?
     *
     * @param {pentaho.type.PropertyType} propType - The property type.
     * @param {pentaho.type.mixins.Container} value - The container value.
     *
     * @private
     */
    __initPropertyValueRelation: function(propType, value) {

      if(propType.isList || !propType.isBoundary) {
        value.__addReference(this, propType);
      }
    },

    // region equality
    /**
     * Gets the key of the complex value.
     *
     * The default complex implementation returns the value of the [$uid]{@link pentaho.type.Complex#$uid} property.
     *
     * @type {string}
     * @readOnly
     */
    get $key() {
      return this.$uid;
    },

    /**
     * Gets a value that indicates if a given equal value has the same content as this one.
     *
     * This method checks if the values of all of the properties are equal and content-equal.
     *
     * @param {pentaho.type.Complex} other - An equal complex value to test for content-equality.
     *
     * @return {boolean} `true` if the given value is equal in content to this one; `false`, otherwise.
     *
     * @override
     */
    equalsContent: function(other) {

      var isEqual = true;

      // eslint-disable-next-line consistent-return
      this.$type.each(function(propType) {

        var propValue = this.get(propType);
        var propValueOther = other.get(propType);

        // List instances are never `equals`. Only their elements are checked.

        isEqual = propType.isList
          ? valueType.areEqualContentElements(propValue, propValueOther)
          : valueType.areEqualContent(propValue, propValueOther);

        if(!isEqual) {
          // break;
          return false;
        }
      }, this);

      return isEqual;
    },
    // endregion

    // region As Raw
    /**
     * Gets the value of a property.
     *
     * If the specified property is not defined and `sloppy` is `true`, `undefined` is returned.
     *
     * A list property always has a non-null value, possibly an empty list, but never `null`.
     * An element property _can_ have a `null` value.
     *
     * @see pentaho.type.Complex#getv
     * @see pentaho.type.Complex#getf
     *
     * @param {string|pentaho.type.PropertyType} [name] The property name or type object.
     * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
     *
     * @return {pentaho.type.Value|Nully} The value of the property, or a {@link Nully} value.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
     * name `name` is not defined.
     */
    get: function(name, sloppy) {
      var pType = this.$type.get(name, sloppy);
      if(pType) return this.__getAmbientByType(pType);
    },

    /**
     * Gets a value that indicates if a given property has assumed a default value.
     *
     * @param {string|pentaho.type.PropertyType} [name] The property name or type object.
     * @return {boolean} Returns `true` if the property has been defaulted; `false`, otherwise.
     */
    isDefaultedOf: function(name) {
      var pType = this.$type.get(name);
      return this.__getAmbientStateByType(pType) === PROP_VALUE_DEFAULT;
    },

    // @internal friend PropertyType
    __getAmbientByType: function(pType) {
      // List values are never changed directly, only within,
      // so there's no need to waste time asking the changeset for changes.
      return (pType.isList ? this : (this.__cset || this)).__getByName(pType.name);
    },

    __getAmbientStateByType: function(pType) {
      return (this.__cset || this).__getStateByName(pType.name);
    },

    // @internal
    // ATTENTION: This method's name and signature must be in sync with that of ComplexChangeset#__getByName
    __getByName: function(name) {
      return this.__values[name];
    },

    __getStateByName: function(name) {
      return this.__valuesState[name];
    },

    /**
     * Gets the _primitive value_ of the value of a property.
     *
     * This method reads the value of the property by calling [Complex#get]{@link pentaho.type.Complex#get}.
     *
     * When the latter does not return a {@link Nully} value,
     * the result of the value's `valueOf()` method is returned.
     *
     * For a [Simple]{@link pentaho.type.Simple} type, this corresponds to returning
     * its [value]{@link pentaho.type.Simple#value} attribute.
     * For [Complex]{@link pentaho.type.Complex} and [List]{@link pentaho.type.List} types,
     * this corresponds to the value itself.
     *
     * @param {string|pentaho.type.PropertyType} name - The property name or type object.
     * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
     *
     * @return {*|pentaho.type.Complex|pentaho.type.List|Nully} The primitive value of a `Simple`,
     *  the `Complex` or `List` value itself, or a {@link Nully} value.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
     * name `name` is not defined.

     * @see pentaho.type.Complex#get
     * @see pentaho.type.Complex#getf
     */
    getv: function(name, sloppy) {
      var v1 = this.get(name, sloppy); // Is undefined or nully.
      return v1 && v1.valueOf(); // .valueOf() should/must be non-nully
    },

    /**
     * Gets the _string representation_ of the value of a property.
     *
     * This method reads the value of the property by calling [Complex#get]{@link pentaho.type.Complex#get}.
     *
     * When the latter returns a {@link Nully} value, `""` is returned.
     * Otherwise, the result of the value's `toString()` method is returned.
     *
     * For a [Simple]{@link pentaho.type.Simple} type, this corresponds to returning
     * its [formatted]{@link pentaho.type.Simple#formatted} attribute, when it is not null.
     * For [Complex]{@link pentaho.type.Complex} and [List]{@link pentaho.type.List} types,
     * varies with the implementation.
     *
     * @param {string|pentaho.type.PropertyType} name - The property name or type object.
     * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
     *
     * @return {string} The string representation of the value, or `""`.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
     * name `name` is not defined.
     *
     * @see pentaho.type.Complex#get
     * @see pentaho.type.Complex#getv
     */
    getf: function(name, sloppy) {
      var v1 = this.get(name, sloppy);
      return v1 ? v1.toString() : "";
    },

    /**
     * Sets the value of a property.
     *
     * The value of [List]{@link pentaho.type.PropertyType#isList} properties is automatically created,
     * when complex instance is constructed, and is never replaced by another list value.
     * However, its contents can be modified.
     * On the other hand, for element properties, their value can be replaced.
     *
     * Execution proceeds as follows:
     *
     * 1. If the property is a list property:
     *   1. If `value` is {@link Nully},
     *      the list is cleared by calling the [List#clear]{@link pentaho.type.List#clear} method;
     *      however, if the property is [read-only]{@link pentaho.type.PropertyType#isReadOnly} and
     *      the list has any elements, an error is thrown instead;
     *   2. Otherwise, if `value` is distinct from the current list value,
     *      an elements list is extracted from the given value
     *      (see [ListType#_normalizeInstanceSpec]{@link pentaho.type.ListType#_normalizeInstanceSpec})
     *      and execution is delegated to the [List#set]{@link pentaho.type.List#set} method;
     *      likewise, if changes to the list would result and
     *      the property is [read-only]{@link pentaho.type.PropertyType#isReadOnly},
     *      an error is thrown;
     *
     * 2. If the property is an element property:
     *   1. If `value` is {@link Nully},
     *      the property's [default value]{@link pentaho.type.PropertyType#defaultValue}, if any,
     *      is evaluated and `value` is set to it;
     *      the property's new [defaulted status]{@link pentaho.type.Complex#isDefaultedOf} will be `true`.
     *
     *   2. Otherwise, if the specified `value` is not {@link Nully},
     *      the property's new defaulted status will be `false`.
     *
     *   3. If `value` is not [equal]{@link pentaho.type.Value#equals} to the current value and/or
     *      the property's defaulted status changes:
     *      1. If the property is [read-only]{@link pentaho.type.PropertyType#isReadOnly}, an error is thrown.
     *      2. Otherwise, the current value and the defaulted status are replaced by the new ones.
     *      3. A change action is executed, resulting in the change events for the `init`, `will`,
     *         `do` and `finally` being emitted.
     *
     *   4. Otherwise, if `value` and the defaulted status do not change, nothing is done.
     *
     * In both cases, of element and list properties,
     * when the given value(s) is a specification,
     * it is first constructed,
     * before any comparison with the current value(s) is performed.
     *
     * Contrast this behavior with that of the [configure]{@link pentaho.type.Value#configure} method,
     * in which specifications aren't considered to have an identity, a priori.
     * Only if these explicitly identify an entity or value which is incompatible with the current value
     * are they assumed to represent a new value that needs to be constructed.
     *
     * For element properties, specifications are constructed
     * having as default type the [valueType]{@link pentaho.type.PropertyType#valueType} of the property.
     *
     * For list properties, each element's specification is constructed
     * having as default type the
     * [elementType]{@link pentaho.type.Type#elementType}
     * of the property's [valueType]{@link pentaho.type.PropertyType#valueType}.
     *
     * @param {nonEmptyString|pentaho.type.PropertyType} name - The property name or type object.
     * @param {*} [valueSpec=null] A value specification.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     * @throws {TypeError} When the property is read-only and its value would change.
     *
     * @see pentaho.type.Value#configure
     * @see pentaho.type.Value#isReadOnly
     * @see pentaho.action.Execution
     */
    set: function(name, valueSpec) {

      var propType = this.$type.get(name);
      if(propType.isList) {
        var valueAmb = this.__getAmbientByType(propType);
        if(valueAmb === valueSpec) {
          return;
        }

        if(valueSpec != null) {
          valueSpec = valueAmb.$type.__getElementSpecsFromInstanceSpec(valueSpec);
          if(valueSpec != null) {
            valueAmb.set(valueSpec);
            return;
          }
        }

        // TODO: List property default value?
        valueAmb.clear();
      } else {
        ComplexChangeset.__setElement(this, propType, valueSpec);
      }
    },

    /** @inheritDoc */
    _configure: function(config) {
      if(config instanceof Value) {
        __configureFromValue.call(this, config);
      } else {
        __configureFromSpec.call(this, config);
      }
    },

    /**
     * Configures a property with a given value specification.
     *
     * Execution proceeds as follows:
     *
     * 1. If the property is a list property:
     *   1. If the config value is `null`,
     *      the list is cleared by calling the [List#clear]{@link pentaho.type.List#clear} method;
     *   2. Otherwise, if the config value is distinct from the current list value,
     *      execution is delegated to the [List.configure]{@link pentaho.type.List#configure} method;
     *
     * 2. If the property is an element property:
     *   1. If either the current value or the config value are `null`,
     *      then the config value replaces the current value;
     *   2. Otherwise, execution is delegated to the
     *      [Element#configureOrCreate]{@link pentaho.type.Element#configureOrCreate} method;
     *      if it returns an element distinct from the current value,
     *      then that value replaces the current value.
     *
     * If in any of the described steps,
     * an error is thrown if a change would result to the property's value and
     * the property is [read-only]{@link pentaho.type.PropertyType#isReadOnly}.
     * Also, an error is thrown if the value itself would have to be mutated and
     * its type is [read-only]{@link pentaho.type.ValueType#isReadOnly}.
     *
     * @param {pentaho.type.PropertyType} propType - The property to configure.
     * @param {*} valueConfig - A value specification. Not `undefined`.
     *
     * @throws {TypeError} When the property value would be replaced or, in case of list properties,
     * its elements would be added, moved or removed and the
     * property is [read-only]{@link pentaho.type.PropertyType#isReadOnly}.
     *
     * @throws {TypeError} When the property's current value would be mutated and
     * its type is [read-only]{@link pentaho.type.ValueType#isReadOnly}.
     *
     * @protected
     */
    _configureProperty: function(propType, valueConfig) {

      // assert valueConfig !== undefined

      var valueAmb = this.__getAmbientByType(propType);
      if(valueAmb !== valueConfig) {
        if(propType.isList) {

          // assert valueAmb !== null
          // Configure. Replace is not possible.

          if(valueConfig === null) {
            // Throws if property is read-only.
            valueAmb.clear();
          } else {
            // Let List#_configure handle any needed conversions and compatibility issues.
            valueAmb._configure(valueConfig);
          }
        } else {
          __configurePropertyElement.call(this, propType, valueAmb, valueConfig);
        }
      }
    },
    // endregion

    // region As List
    /**
     * Gets the _number of values_ of a given property.
     *
     * When the specified property is a _list_ property, its [count]{@link pentaho.type.List#count} is returned.
     *
     * When the specified property is not a _list_ property, `0` is returned if it is `null`; `1`, otherwise.
     *
     * @param {string|pentaho.type.PropertyType} name - The property name or type object.
     * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
     *
     * @return {number} The number of values.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
     * name `name` is not defined.
     */
    countOf: function(name, sloppy) {
      var pType = this.$type.get(name, sloppy);
      if(!pType) return 0;

      var value = this.__getAmbientByType(pType);
      return pType.isList ? value.count : (value ? 1 : 0);
    },
    // endregion

    // region property attributes
    // region applicable attribute
    /**
     * Gets a value that indicates if a given property is currently applicable.
     *
     * @param {string|pentaho.type.PropertyType} name - The property name or type object.
     *
     * @return {boolean} `true` if the property is applicable; `false`, otherwise.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    isApplicableOf: function(name) {
      return this.$type.get(name).isApplicableOn(this);
    },
    // endregion

    // region isEnabled attribute
    /**
     * Gets a value that indicates if a given property is currently enabled.
     *
     * @param {string|pentaho.type.PropertyType} name - The property name or property type object.
     *
     * @return {boolean} Returns `true` if the property is enabled; `false`, otherwise.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    isEnabledOf: function(name) {
      return this.$type.get(name).isEnabledOn(this);
    },
    // endregion

    // region countRange attribute
    /**
     * Gets the current valid count range of values of a given property.
     *
     * @param {string|pentaho.type.PropertyType} name - The property name or type object.
     *
     * @return {pentaho.IRange} The range of the property.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    countRangeOf: function(name) {
      return this.$type.get(name).countRangeOn(this);
    },
    // endregion

    // region isRequired attribute
    /**
     * Gets a value that indicates if a given property is currently required.
     *
     * A property is currently required if
     * its current {@link pentaho.type.Complex#countRangeOf} minimum is at least 1.
     *
     * @param {string|pentaho.type.PropertyType} [name] The property name or type object.
     *
     * @return {boolean} `true` if the property is required; `false`, otherwise.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    isRequiredOf: function(name) {
      return this.$type.get(name).countRangeOn(this).min > 0;
    },
    // endregion

    // region domainOf attribute
    /**
     * Gets the current list of valid values of a given property.
     *
     * @param {string|pentaho.type.PropertyType} [name] The property name or type object.
     *
     * @return {Array.<pentaho.type.Element>} An array of elements if the property is constrained; `null` otherwise.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
     */
    domainOf: function(name) {
      return this.$type.get(name).domainOn(this);
    },
    // endregion
    // endregion

    // region serialization
    /** @inheritDoc */
    toSpecInContext: function(keyArgs) {

      keyArgs = keyArgs ? Object.create(keyArgs) : {};

      var spec;

      var noAlias = !!keyArgs.noAlias;
      var declaredType;
      var includeType = !!keyArgs.forceType ||
            (!!(declaredType = keyArgs.declaredType) && this.$type !== declaredType);

      var useArray = !includeType && keyArgs.preferPropertyArray;
      var omitProps;
      if(useArray) {
        spec = [];
      } else {
        spec = {};
        if(includeType) spec._ = this.$type.toSpecInContext(keyArgs);

        omitProps = keyArgs.omitProps;
        // Do not propagate to child values
        keyArgs.omitProps = null;
      }

      var includeDefaults = !!keyArgs.includeDefaults;
      var type = this.$type;

      // Reset.
      keyArgs.forceType = false;

      type.each(propToSpec, this);

      return spec;

      function propToSpec(propType) {

        /* jshint validthis:true*/

        // When serializing, prefer `nameAlias` to `name` by default
        var name = noAlias ? propType.name : propType.nameAlias;
        if(!name) name = propType.name;

        if(omitProps && omitProps[name] === true) return;

        var value = this.__getAmbientByType(propType);

        var includeValue = includeDefaults || this.__getAmbientStateByType(propType) === PROP_VALUE_SPECIFIED;
        if(includeValue) {
          var valueSpec;
          if(value) {
            keyArgs.declaredType = propType.valueType;

            valueSpec = value.toSpecInContext(keyArgs);

            // If a value ends up not being serializable (see ./Function)
            // it may return `null` as a sign of failure.
            // In this case, we must check again if the value should be included,
            // like if it were originally `null`.
            if(valueSpec == null) {
              // Serialization failure.
              // Values can be omitted as long as complex form is used.
              if(!useArray) return;

              valueSpec = null;
            }
          } else {
            valueSpec = null;
          }

          if(useArray) {
            spec.push(valueSpec);
          } else {
            spec[name] = valueSpec;
          }
        } else if(useArray) {
          spec.push(null);
        }
      }
    },
    // endregion

    // region validation
    // @override
    /**
     * Determines if the given complex value is valid.
     *
     * The default implementation
     * validates each property's value against
     * the property's [valueType]{@link pentaho.type.PropertyType#valueType}
     * and collects and returns any reported errors.
     * Override to complement with a type's specific validation logic.
     *
     * You can use the error utilities in {@link pentaho.type.Util} to
     * help in the implementation.
     *
     * @return {Array.<pentaho.type.ValidationError>} A non-empty array of errors or `null`.
     *
     * @override
     */
    validate: function() {

      var errors = null;

      this.$type.each(function(pType) {
        errors = typeUtil.combineErrors(errors, pType.validateOn(this));
      }, this);

      return errors;
    },
    // endregion

    $type: /** @lends pentaho.type.ComplexType# */{

      /** @inheritDoc */
      _init: function(spec, keyArgs) {

        spec = this.base(spec, keyArgs) || spec;

        if(!this.__isReadOnly && spec.isReadOnly) {
          // Cannot have any properties.
          if(this.ancestor.count > 0) {
            throw error.argInvalid("isReadOnly");
          }

          this.__isReadOnly = true;
        }

        return spec;
      },

      id: module.id,

      isAbstract: true,

      get isComplex() { return true; },

      get isContainer() { return true; },

      // region isEntity attribute
      __isEntity: false,

      /**
       * Gets or sets a value that indicates if this type is an _entity_ type.
       *
       * [Complex]{@link pentaho.type.Complex} types can set this property to true,
       * and override the `$key` property, to become entity types.
       *
       * ### This attribute is *Monotonic*
       *
       * The value of a _monotonic_ attribute can change, but only in some, predetermined _monotonic_ direction.
       *
       * In this case, a _complex type_ which is not an entity type can later be marked as an entity type.
       * However, a _complex type_ which is an entity type can no longer go back to not being a non-entity type.
       *
       * ### This attribute is *Inherited*
       *
       * When there is no _local value_, the _effective value_ of the attribute is the _inherited effective value_.
       *
       * ### Other characteristics
       *
       * When a {@link Nully} value is specified, the set operation is ignored.
       *
       * When set and the type already has [subtypes]{@link pentaho.type.Type#hasDescendants},
       * an error is thrown.
       *
       * The default (root) `isEntity` attribute value is `false`.
       *
       * @type {boolean}
       * @override
       * @final
       *
       * @throws {pentaho.lang.OperationInvalidError} When setting and the type
       * already has [subtypes]{@link pentaho.type.Type#hasDescendants}.
       *
       * @see pentaho.type.Value#$key
       */
      get isEntity() {
        return this.__isEntity;
      },

      set isEntity(value) {

        this._assertNoSubtypesAttribute("isEntity");

        if(value == null) return;

        if(!this.__isEntity && value) {
          this.__isEntity = true;
        }
      },
      // endregion

      // region isReadOnly attribute
      __isReadOnly: false,

      /**
       * Gets a value that indicates
       * whether this type, and all of the value types of any property values, cannot be changed,
       * from the outside.
       *
       * The value of `Complex#isReadOnly` is `false`.
       *
       * A [Complex]{@link pentaho.type.Complex} type is necessarily read-only if its base complex type is read-only.
       * Otherwise, a `Complex` type can be _marked_ read-only,
       * but only upon definition and if the base complex type does not have any properties.
       *
       * All of the properties of a read-only complex type are
       * implicitly marked [read-only]{@link pentaho.type.PropertyType#isReadOnly}.
       * When the [valueType]{@link pentaho.type.PropertyType#valueType} of a property
       * is an element type, it must be a read-only type.
       * When the `valueType` of a property is a list type, then its
       * [element type]{@link pentaho.type.ListType#of} must be read-only.
       *
       * @type {boolean}
       * @readOnly
       */
      get isReadOnly() {
        return this.__isReadOnly;
      },
      // endregion

      // region properties

      // region properties property

      // TODO: Don't allow adding properties if the type has descendants.

      __props: null,

      // Used for configuration only.
      set props(propSpecs) {
        this._configureProperties(propSpecs);
      }, // jshint -W078

      // @internal
      __getProps: function() {
        // Always get/create from/on the class' prototype.
        // Lazy creation.
        var proto = this.constructor.prototype;
        return O.getOwn(proto, "__props") ||
          (proto.__props = PropertyTypeCollection.to([], /* declaringType: */this));
      },

      /**
       * Adds, overrides or configures properties of this complex type.
       *
       * @param {Array.<pentaho.type.spec.IPropertyType> |
       *         Object.<string, pentaho.type.spec.IPropertyType>} propTypesSpec - The
       * properties' specification.
       *
       * @protected
       */
      _configureProperties: function(propTypesSpec) {
        this.__getProps().configure(propTypesSpec);
      },

      /**
       * Normalizes a properties specification.
       *
       * @param {Array.<pentaho.type.spec.IPropertyType> |
       *         Object.<string, pentaho.type.spec.IPropertyType>} propTypesSpec - The properties specification.
       *
       * @return {Array.<pentaho.type.spec.IPropertyType>} The normalized specification.
       * @protected
       */
      _normalizePropertiesSpec: function(propTypesSpec) {

        if(Array.isArray(propTypesSpec)) {
          return propTypesSpec.map(function(propSpec) {
            return typeof propSpec === "string" ? {name: propSpec} : propSpec;
          });
        }

        var result = [];
        O.eachOwn(propTypesSpec, function(propTypeSpec, name) {
          propTypeSpec = Object.create(propTypeSpec);
          propTypeSpec.name = name;
          result.push(propTypeSpec);
        });

        return result;
      },
      // endregion

      /**
       * Gets the type object of the property with the given name,
       * or `null` if it is not defined.
       *
       * If a property type object is specified,
       * it is returned back only if it is _the_ property type object of
       * same name in this complex type.
       *
       * @param {string|pentaho.type.PropertyType} name - The property name or type object.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {pentaho.type.PropertyType} The property type object.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.
       */
      get: function(name, sloppy) {
        if(!name) throw error.argRequired("name");
        var p = this.__get(name);
        if(!p && !sloppy)
          throw error.argInvalid("name", "A property with the name '" + (name.name || name) + "' is not defined.");
        return p;
      },

      __get: function(name) {
        var ps;
        // !__props could only occur if accessing #get directly on Complex.type and it had no derived classes yet...
        return (!name || !(ps = this.__props)) ? null :
          (typeof name === "string") ? ps.get(name) :
          (ps.get(name.name) === name) ? name :
          null;
      },

      __getByAlias: function(nameAlias) {
        return this.__props !== null ? this.__props.getByAlias(nameAlias) : null;
      },

      /**
       * Gets a value that indicates if a given property is defined.
       *
       * If a property type object is specified,
       * this method tests whether it is the same property type object that exists under that name, if any.
       *
       * @param {string|pentaho.type.PropertyType} name - The property name or type object.
       *
       * @return {boolean} `true` if the property is defined; `false`, otherwise.
       */
      has: function(name) {
        // !__props could only occur if accessing #has directly on Complex.type and it had no derived classes yet...
        var ps;
        if(!name || !(ps = this.__props)) return false;
        if(typeof name === "string") return ps.has(name);
        // Name is a type object
        return ps.get(name.name) === name;
      },

      /**
       * Gets the property type object of the property with a given index,
       * if in range, or `null` if not.
       *
       * @param {number} index - The property index.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified `index` is out of range.
       *
       * @return {?pentaho.type.PropertyType} The property type object, or `null`.
       *
       * @throws {pentaho.lang.ArgumentRangeError} When `sloppy` is `false` and the specified `index` is out of range.
       */
      at: function(index, sloppy) {
        if(index == null) throw error.argRequired("index");
        var pType = this.__at(index);
        if(!pType && !sloppy)
          throw error.argRange("index");
        return pType;
      },

      __at: function(index) {
        // !__props could only occur if accessing #at directly on Complex.type and it had no derived classes yet...
        var ps = this.__props;
        return (ps && ps[index]) || null;
      },

      /**
       * Gets the number of properties of the complex type.
       *
       * @return {number} The number of properties.
       */
      get count() {
        // !__props could only occur if accessing #at directly on Complex.type and it had no derived classes yet...
        var ps = this.__props;
        return ps ? ps.length : 0;
      },

      /**
       * Calls a function for each defined property type.
       *
       * @param {function(pentaho.type.PropertyType, number, pentaho.type.Complex) : boolean?} f
       * The mapping function. Return `false` to break iteration.
       *
       * @param {?object} [x] The JS context object on which `f` is called.
       *
       * @return {pentaho.type.ComplexType} This object.
       */
      each: function(f, x) {
        var ps = this.__props;
        var L;
        if(ps && (L = ps.length)) {
          var i = -1;
          while(++i < L) {
            if(f.call(x, ps[i], i, this) === false)
              break;
          }
        }

        return this;
      },

      /**
       * Calls a function for each defined property type that this type shares with another given type
       * and whose value can, in principle, be copied from it.
       *
       * This method finds the lowest common ancestor of both types.
       * If it is a complex type, each of the corresponding local properties is yielded.
       *
       * @param {pentaho.type.Type} otherType - The other type.
       * @param {function(pentaho.type.PropertyType, number, pentaho.type.Complex) : boolean?} fun -
       * The mapping function. Return `false` to break iteration.
       *
       * @param {?object} [ctx] - The JS context object on which `fun` is called.
       *
       * @return {pentaho.type.ComplexType} This object.
       */
      eachCommonWith: function(otherType, fun, ctx) {
        var lca;
        if(otherType.isComplex && (lca = O.lca(this, otherType)) && lca.isComplex) {

          // eslint-disable-next-line consistent-return
          lca.each(function(basePropType, i) {
            var name = basePropType.name;
            var localPropType = this.get(name);

            /* A property is yielded if the value-type of the other type's property is a subtype of
             * the value-type of the local property.
             *
             *  var otherPropType = otherType.get(name);
             *
             * // assert basePropType === O.lca(localPropType, otherPropType)
             *
             * if(otherPropType.valueType.isSubtypeOf(localPropType.valueType))
             */
            if(fun.call(ctx, localPropType, i, this) === false)
              return false;

          }, this);
        }

        return this;
      },

      /**
       * Adds, overrides or configures properties of this complex type.
       *
       * @param {pentaho.type.spec.IPropertyType|
       *         Array.<pentaho.type.spec.IPropertyType>} propTypeSpec - A property type specification or
       *         an array of them.
       *
       * @return {pentaho.type.ComplexType} This object.
       */
      add: function(propTypeSpec) {

        if(!Array.isArray(propTypeSpec)) {
          propTypeSpec = [propTypeSpec];
        }

        this._configureProperties(propTypeSpec);

        return this;
      },
      // endregion

      // region serialization
      /** @inheritDoc */
      _fillSpecInContext: function(spec, keyArgs) {

        var any = this.base(spec, keyArgs);

        if(O.hasOwn(this, "__isReadOnly")) {
          any = true;
          spec.isReadOnly = this.isReadOnly;
        }

        if(O.hasOwn(this, "__isEntity")) {
          any = true;
          spec.isEntity = this.isEntity;
        }

        if(this.count) {
          var props;

          this.each(function(propType) {
            // Root or overridden property type. Exclude simply inherited.
            if(propType.declaringType === this) {
              if(!props) {
                any = true;
                props = spec.props = [];
              }
              props.push(propType.toSpecInContext(keyArgs));
            }
          }, this);
        }

        return any;
      }
      // endregion
    }
  })
  .implement(ContainerMixin)
  .implement(/** @lends pentaho.type.Complex# */{

    /** @inheritDoc */
    _initClone: function(clone) {

      this.base(clone);

      // All properties are copied except lists, which are shallow cloned.
      // List properties are not affected by changesets.
      var propTypes = this.$type.__getProps();
      var source = (this.__cset || this);
      var i = propTypes.length;
      var cloneValues = {};
      var cloneValuesState = {};
      var propType;
      var name;
      var value;

      while(i--) {
        propType = propTypes[i];
        name  = propType.name;

        cloneValues[name] = value = propType.isList ? this.__getByName(name).clone() : source.__getByName(name);
        cloneValuesState[name] = this.__valuesState[name];

        if(value != null && value.__addReference) {
          clone.__initPropertyValueRelation(propType, value);
        }
      }

      clone.__values = cloneValues;
      clone.__valuesState = cloneValuesState;
    },

    /** @inheritDoc */
    _createChangeset: function(txn) {
      return new ComplexChangeset(txn, this);
    }
  })
  .localize({$type: bundle.structured.Complex})
  .configure({$type: module.config});

  return Complex;

  // region configure
  /**
   * Configures this value with a distinct, non-{@link Nully} value.
   *
   * @memberOf pentaho.type.Complex#
   * @param {pentaho.type.Value} other - The other value.
   * @private
   */
  function __configureFromValue(other) {

    // assert other != null && other !== this

    // Copy common properties.

    this.$type.eachCommonWith(other.$type, function(localPropType) {

      var otherValue = other.get(localPropType.name);

      this._configureProperty(localPropType, otherValue);
    }, this);
  }

  /**
   * Configures this value with a distinct, non-{@link Nully} specification.
   *
   * @memberOf pentaho.type.Complex#
   * @param {!*} valueSpec - A value specification.
   * @private
   */
  function __configureFromSpec(valueSpec) {

    var type = this.$type;

    // assert valueSpec !== null && valueSpec !== this

    valueSpec = type._normalizeInstanceSpec(valueSpec);
    // assert valueSpec.constructor === Object

    var propValueSpec;

    for(var propNameOrAlias in valueSpec) {
      // "_" is the inline type property and should not even be considered / logged as not existing.
      if(O.hasOwn(valueSpec, propNameOrAlias) &&
         (propNameOrAlias !== "_") &&
         (propValueSpec = valueSpec[propNameOrAlias]) !== undefined) {

        var propType = type.get(propNameOrAlias, /* sloppy: */true);
        if(propType === null) {
          propType = type.__getByAlias(propNameOrAlias);

          // Ignore the alias if the name is also present.
          if(propType !== null && O.hasOwn(valueSpec, propType.name)) {
            propType = null;
          }
        }

        if(propType !== null) {
          this._configureProperty(propType, propValueSpec);
        } else {
          // Log. Undefined property name or alias.
        }
      }
    }
  }

  /**
   * Configures an element property with a given non-undefined, distinct, value specification.
   *
   * @memberOf pentaho.type.Complex#
   * @param {pentaho.type.PropertyType} propType - The property to configure.
   * @param {pentaho.type.Value} valueAmb - The current, ambient value, possibly `null`.
   * @param {*} valueConfig - A specification. Not `undefined`. Distinct from `valueAmb`.
   * @private
   */
  function __configurePropertyElement(propType, valueAmb, valueConfig) {

    // assert valueConfig !== undefined
    // assert valueAmb !== undefined
    // assert valueAmb !== valueConfig

    if(valueAmb === null || valueConfig === null) {
      // Throws if changed property is read-only.
      // If valueAmb is null, set to valueConfig.
      // If valueAmb is not null, set to null.
      ComplexChangeset.__setElement(this, propType, valueConfig);
      return;
    }

    // Both ambient and new are defined.

    // Configure valueAmb with valueConfig, if possible...
    valueConfig = valueAmb._configureOrCreate(valueConfig);

    if(valueConfig !== valueAmb) {
      // Throws if changed property is read-only.
      // Force replace: valueAmb and valueConfig may be equals yet still differ on content.
      ComplexChangeset.__setElement(this, propType, valueConfig, /* forceReplace: */true);
    }
  }
  // endregion

  // Constructor's helper functions
  function __readSpecByIndex(spec, propType) {
    return spec[propType.index];
  }

  function __readSpecByNameOrAlias(spec, propType) {
    var name;
    return O_hasOwn.call(spec, (name = propType.name)) ? spec[name] :
      ((name = propType.nameAlias) !== null && O_hasOwn.call(spec, name)) ? spec[name] :
      undefined;
  }
});
