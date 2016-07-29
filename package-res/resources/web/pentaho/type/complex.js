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
  "./PropertyTypeCollection",
  "./util",
  "./ContainerMixin",
  "../lang/ActionResult",
  "../lang/UserError",
  "./changes/ComplexChangeset",
  "../i18n!types",
  "../util/object",
  "../util/error"
], function(module, elemFactory, PropertyTypeCollection, typeUtil,
            ContainerMixin, ActionResult, UserError,
            ComplexChangeset, bundle, O, error) {

  "use strict";

  // TODO: self-recursive complexes won't work if we don't handle them specially:
  // Component.parent : Component
  // Will cause requiring Component during it's own build procedure...
  // Need to recognize requests for the currently being built _top-level_ complex in a special way -
  // the one that cannot be built and have a module id.

  return function(context) {

    var Element = context.get(elemFactory);

    /**
     * @name pentaho.type.Complex.Type
     * @class
     * @extends pentaho.type.Element.Type
     *
     * @classDesc The base type class of complex types.
     *
     * For more information see {@link pentaho.type.Complex}.
     */

    /**
     * @name pentaho.type.Complex
     * @class
     * @extends pentaho.type.Element
     * @mixes pentaho.type.ContainerMixin
     *
     * @amd {pentaho.type.Factory<pentaho.type.Complex>} pentaho/type/complex
     *
     * @classDesc The base class of complex types.
     *
     * Example complex type:
     * ```js
     * define(["pentaho/type/complex"], function(complexFactory) {
     *
     *   return function(context) {
     *
     *     var Complex = context.get(complexFactory);
     *
     *     return Complex.extend({
     *       type: {
     *         props: [
     *           {name: "name", type: "string", label: "Name"},
     *           {name: "category", type: ["string"], label: "Category"},
     *           {name: "price", type: "number", label: "Price"}
     *         ]
     *       }
     *     });
     *   };
     *
     * });
     * ```
     *
     * @description Creates a complex instance.
     *
     * When a derived class overrides the constructor and creates additional instance properties,
     * the {@link pentaho.type.Complex#_clone} method should also be overridden to copy those properties.
     *
     * @constructor
     * @param {pentaho.type.spec.UComplex} [spec] A complex specification.
     *
     * @see pentaho.type.spec.IComplex
     * @see pentaho.type.spec.IComplexProto
     * @see pentaho.type.spec.IComplexTypeProto
     */
    var Complex = Element.extend("pentaho.type.Complex", /** @lends pentaho.type.Complex# */{

      // NOTE 1: neither `Value` or `Instance` do anything in their constructor,
      // so, in the name of performance, we're purposely not calling base.

      // NOTE 2: keep the constructor code synced with #clone !
      constructor: function(spec) {

        this._initContainer();

        // Create `Property` instances.
        var propTypes = this.type._getProps(),
            i = propTypes.length,
            nameProp = !spec ? undefined : (Array.isArray(spec) ? "index" : "name"),
            values = {},
            propType, value;

        while(i--) {
          propType = propTypes[i];
          values[propType.name] = value = propType.toValue(nameProp && spec[propType[nameProp]]);

          // If this instance is being newed up while there is an ambient transaction,
          // it should not cease to exist if the txn is rejected,
          // nor should its construction time property values be restored to... what? default values?
          // So, references added should also not be subject to the ambient transaction.
          if(value && value._addReference) value._addReference(this, propType);
        }

        this._values = values;
      },

      /**
       * Creates a shallow clone of this complex value.
       *
       * All property values are shared with the clone.
       *
       * @return {!pentaho.type.Complex} The complex value clone.
       */
      clone: function() {
        var clone = Object.create(Object.getPrototypeOf(this));
        this._clone(clone);
        return clone;
      },

      /**
       * Initializes a clone of this complex value.
       *
       * @param {!pentaho.type.Complex} clone - The complex value clone.
       * @protected
       */
      _clone: function(clone) {

        this._cloneContainer(clone);

        // All properties are copied except lists, which are shallow cloned.
        // List properties are not affected by changesets.
        var propTypes = this.type._getProps(),
            source = (this._cset || this),
            i = propTypes.length,
            cloneValues = {},
            propType, name, value;

        while(i--) {
          propType = propTypes[i];
          name  = propType.name;
          cloneValues[name] = value = propType.isList ? this._getByName(name).clone() : source._getByName(name);

          // See note on constructor. The same reasoning applies to a new clone instance.
          if(value && value._addReference) value._addReference(clone, propType);
        }

        clone._values = cloneValues;
      },

      /**
       * Gets the key of the complex value.
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
       * The default complex implementation, returns the value of the
       * complex instance's {@link pentaho.type.Complex#$uid}.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this._uid;
      },

      //region As Raw
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
       * @see pentaho.type.Complex#at
       * @see pentaho.type.Complex#first
       *
       * @param {string|!pentaho.type.Property.Type} [name] The property name or type object.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {pentaho.type.Value|Nully} The value of the property, or a {@link Nully} value.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.
       */
      get: function(name, sloppy) {
        var pType = this.type.get(name, sloppy);
        if(pType) return this._getByType(pType);
      },

      // friend Property.Type
      _getByType: function(pType) {
        // List values are never changed directly, only within,
        // so there's no need to waste time asking the changeset for changes.
        return (pType.isList ? this : (this._cset || this))._getByName(pType.name);
      },

      _getByName: function(name) {
        return this._values[name];
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
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {any|pentaho.type.Complex|pentaho.type.List|Nully} The primitive value of a `Simple`,
       *  the `Complex` or `List` value itself, or a {@link Nully} value.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.

       * @see pentaho.type.Complex#get
       * @see pentaho.type.Complex#getf
       */
      getv: function(name, sloppy) {
        var v1 = this.get(name, sloppy); // undefined or nully
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
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
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

      // TODO: when called with more steps than the structure has, is throwing hard
      /**
       * Gets the value of a property/index/key path based on the current complex.
       *
       * When called with no arguments, or with an empty `steps` array argument,
       * this complex value is returned.
       *
       * When a step, on a complex value, is not a defined property and `sloppy` is `true`,
       * `undefined` is returned.
       *
       * Value `null` is returned when a step, in `steps`:
       * 1. On a list value, is an element index that is out of range
       * 2. On a list value, is an element key that is not present
       * 3. On a complex value, a property has value `null`.
       *
       * This method supports two signatures.
       * When the first argument is an array, it is the `steps` array,
       * and the second argument is the optional `sloppy` argument:
       * ```js
       * var value;
       *
       * // Strict
       * value = complex.path(["a", "b", 1]);
       *
       * // Sloppy
       * value = complex.path(["a", "b", 1], true);
       * ```
       *
       * Otherwise, the method behaves as if `sloppy` were `false`,
       * and each argument is a step of the desired path:
       * ```js
       * var value;
       *
       * value = complex.path(); // -> null
       *
       * value = complex.path("a", "b", 1);
       * ```
       *
       * @param {Array.<(string|number|!pentaho.type.Property.Type)>} steps - The property/index/key path steps.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {pentaho.type.Value|Nully} The requested value, or a {@link Nully} value.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a step, on a complex value,
       * is not a defined property.
       */
      path: function(args, sloppy) {
        return Array.isArray(args) ? this._path(args, sloppy) : this._path(arguments, false);
      },

      _path: function(args, sloppy) {
        var L = args.length,
            i = -1,
            v = this,
            step;

        while(++i < L) {
          if(!(v = (typeof (step = args[i]) === "number") ? v.at(step, sloppy) : v.get(step, sloppy)))
            break;
        }

        return v;
      },

      /**
       * Sets the value of a property.
       *
       * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {any?} [valueSpec=null] A value specification.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       *
       * @fires "will:change"
       * @fires "did:change"
       * @fires "rejected:change"
       */
      set: function(name, valueSpec) {
        var propType = this.type.get(name);
        if(propType.isList)
        // Delegate to List#set.
          this._values[propType.name].set(valueSpec);
        else
          ComplexChangeset._setElement(this, propType, valueSpec);
      },

      _configure: function(config) {
        this._usingChangeset(function() {

          if(config instanceof Complex) {

            // TODO: should copy only the properties of the LCA type?

            // Copy common properties, if it is a subtype of this one.
            if(config.type.isSubtypeOf(this.type))
              this.type.each(function(propType) {
                this.set(propType, config.get(propType.name));
              }, this);

          } else {

            // TODO: should it be sloppy in this case?

            for(var name in config)
              if(O.hasOwn(config, name))
                this.set(name, config[name]);

          }
        });
      },

      // implement abstract pentaho.type.ContainerMixin#_createChangeset
      _createChangeset: function(txn) {
        return new ComplexChangeset(txn, this);
      },
      //endregion

      //region As Element
      /**
       * Gets the first element of the value of a property.
       *
       * This method returns the result of calling [Complex#at]{@link pentaho.type.Complex#at} with a `0` index.
       *
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {pentaho.type.Element|Nully} An element or a {@link Nully} value.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.

       * @see pentaho.type.Complex#firstv
       * @see pentaho.type.Complex#firstf
       */
      first: function(name, sloppy) {
        return this.at(name, 0, sloppy);
      },

      /**
       * Gets the _primitive value_ of the first element of the value of a property.
       *
       * This method returns the result of calling [Complex#atv]{@link pentaho.type.Complex#atv} with a `0` index.
       *
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {any|pentaho.type.Complex|Nully} The primitive value of the first element, or a {@link Nully} value.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.

       * @see pentaho.type.Complex#first
       * @see pentaho.type.Complex#firstf
       */
      firstv: function(name, sloppy) {
        return this.atv(name, 0, sloppy);
      },

      /**
       * Gets the _string representation_ of the first element of the value of a property.
       *
       * This method returns the result of calling [Complex#atf]{@link pentaho.type.Complex#atf} with a `0` index.
       *
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {string} The string representation of the first element, or `""`.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.

       * @see pentaho.type.Complex#first
       * @see pentaho.type.Complex#firstv
       */
      firstf: function(name, sloppy) {
        return this.atf(name, 0, sloppy);
      },
      //endregion

      //region As List
      /**
       * Gets the _number of values_ of a given property.
       *
       * When the specified property is a _list_ property, its [count]{@link pentaho.type.List#count} is returned.
       *
       * When the specified property is not a _list_ property, `0` is returned if it is `null`; `1`, otherwise.
       *
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {number} The number of values.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.
       */
      count: function(name, sloppy) {
        var pType = this.type.get(name, sloppy);
        if(!pType) return 0;

        var value = this._getByType(pType);
        return pType.isList ? value.count : (value ? 1 : 0);
      },

      /**
       * Gets one `Element` of a property's value, given the property and the index of the element.
       *
       * If the specified property is not defined and `sloppy` is `true`, `undefined` is returned.
       * If the specified index is out of range, `null` is returned.
       *
       * This method allows use of the same syntax for getting a single element from the value of a property,
       * whether it is a list or an element property. If the property is an element property whose value
       * is `null`, it is seen like a list property with no elements.
       * If its value is not `null`, it is seen like a list property with one element.
       * This behavior is consistent with that of the [count]{@link pentaho.type.Complex#count} property.
       *
       * @see pentaho.type.Property.Type#isList
       * @see pentaho.type.Complex#path
       * @see pentaho.type.Complex#atv
       * @see pentaho.type.Complex#atf
       * @see pentaho.type.Complex#count
       * @see pentaho.type.Complex#first
       *
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {number} index - The index of the desired element.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {pentaho.type.Element|Nully} A single `Element` value, or a {@link Nully} value.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.
       */
      at: function(name, index, sloppy) {
        var pType = this.type.get(name, sloppy);

        if(index == null) throw error.argRequired("index");

        if(!pType) return undefined;

        var value = this._getByType(pType);

        if(pType.isList) /* assert value */ return value.at(index || 0);

        return value && !index ? value : null;
      },

      /**
       * Gets the _primitive value_ of one element of the value of a property,
       * given the property and the index of the element.
       *
       * This method reads the value of the property/index by calling [Complex#at]{@link pentaho.type.Complex#at}.
       *
       * When the latter does not return a {@link Nully} value,
       * the result of the element's `valueOf()` method is returned.
       *
       * For a [Simple]{@link pentaho.type.Simple} type, this corresponds to returning
       * its [value]{@link pentaho.type.Simple#value} attribute.
       * For a [Complex]{@link pentaho.type.Complex} type, this corresponds to the value itself.
       *
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {number} index - The index of the element.
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       *
       * @return {any|pentaho.type.Complex|Nully} The primitive value of the requested element,
       * or a {@link Nully} value.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.

       * @see pentaho.type.Complex#at
       * @see pentaho.type.Complex#atf
       */
      atv: function(name, index, sloppy) {
        var v1 = this.at(name, index, sloppy); // undefined or nully
        return v1 && v1.valueOf(); // .valueOf() should/must be non-nully
      },

      /**
       * Gets the _string representation_ of one element of the value of a property,
       * given the property and the index of the element.
       *
       * This method reads the value of the property/index by calling [Complex#at]{@link pentaho.type.Complex#at}.
       *
       * When the latter returns a {@link Nully} value, `""` is returned.
       * Otherwise, the result of the element's `toString()` method is returned.
       *
       * For a [Simple]{@link pentaho.type.Simple} type, this corresponds to returning
       * its [formatted]{@link pentaho.type.Simple#formatted} attribute, when it is not null.
       * For a [Complex]{@link pentaho.type.Complex} type, this varies with the implementation.
       *
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {number} index - The index of the value.
       *
       * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
       * @return {string} The string representation of the requested element, or `""`.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
       * name `name` is not defined.
       *
       * @see pentaho.type.Complex#at
       * @see pentaho.type.Complex#atv
       */
      atf: function(name, index, sloppy) {
        var v1 = this.at(name, index, sloppy);
        return v1 ? v1.toString() : "";
      },
      //endregion

      //region property attributes
      //region applicable attribute
      /**
       * Gets a value that indicates if a given property is currently applicable.
       *
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
       *
       * @return {boolean} `true` if the property is applicable; `false`, otherwise.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       */
      isApplicable: function(name) {
        return this.type.get(name).isApplicableEval(this);
      },
      //endregion

      //region isReadOnly attribute
      /**
       * Gets a value that indicates if a given property is currently read-only.
       *
       * @param {string|pentaho.type.Property.Type} name - The property name or property type object.
       *
       * @return {boolean} Returns `true` if the property is read-only; `false` if the value is other.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       */
      isReadOnly: function(name) {
        return this.type.get(name).isReadOnlyEval(this);
      },
      //endregion

      //region countRange attribute
      /**
       * Gets the current valid count range of values of a given property.
       *
       * @param {string|pentaho.type.Property.Type} name - The property name or type object.
       *
       * @return {pentaho.IRange} The range of the property.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       */
      countRange: function(name) {
        return this.type.get(name).countRangeEval(this);
      },
      //endregion

      //region isRequired attribute
      /**
       * Gets a value that indicates if a given property is currently required.
       *
       * A property is currently required if
       * its current {@link pentaho.type.Complex#countRange} minimum is at least 1.
       *
       * @param {string|pentaho.type.Property.Type} [name] The property name or type object.
       *
       * @return {boolean} `true` if the property is required; `false`, otherwise.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       */
      isRequired: function(name) {
        return this.type.get(name).countRangeEval(this).min > 0;
      },
      //endregion
      //endregion

      //region validation
      // @override
      /**
       * Determines if this complex value is a **valid instance** of its type.
       *
       * The default implementation
       * validates each property's value against
       * the property's [type]{@link pentaho.type.Property.Type#type}
       * and collects and returns any reported errors.
       * Override to complement with a type's specific validation logic.
       *
       * You can use the error utilities in {@link pentaho.type.Util} to
       * help in the implementation.
       *
       * @return {?Array.<!pentaho.type.ValidationError>} A non-empty array of errors or `null`.
       *
       * @see pentaho.type.Value#isValid
       */
      validate: function() {
        var errors = null;

        this.type.each(function(pType) {
          errors = typeUtil.combineErrors(errors, pType.validate(this));
        }, this);

        return errors;
      },
      //endregion

      //region serialization
      toSpecInContext: function(keyArgs) {

        keyArgs = keyArgs ? Object.create(keyArgs) : {};

        var spec;
        var includeType = !!keyArgs.includeType;
        var useArray = !includeType && keyArgs.preferPropertyArray;
        var omitProps;
        if(useArray) {
          spec = [];
        } else {
          spec = {};
          if(includeType) spec._ = this.type.toRefInContext(keyArgs);
          omitProps = keyArgs.omitProps;

          // Do not propagate to child values
          keyArgs.omitProps = null;
        }

        var includeDefaults = !!keyArgs.includeDefaults;
        var areEqual = this.type.areEqual;

        this.type.each(propToSpec, this);

        return spec;

        function propToSpec(propType) {

          /*jshint validthis:true*/

          var name = propType.name;

          if(omitProps && O.hasOwn(omitProps, name)) return;

          var value = this._getByType(propType);

          var includeValue = includeDefaults;
          if(!includeValue) {
            var defaultValue = propType.value;
            // Isn't equal to the default value?
            if(propType.isList) {
              // TODO: This is not perfect... In a way lists are always created by us.
              // If a default list has been specified, this fails to not serialize a default list with count > 0.
              // However, this prevents serializing an empty list when the default is also empty.
              includeValue = (defaultValue && defaultValue.count > 0) || (value.count > 0);
            } else {
              includeValue = !areEqual(defaultValue, value);
            }
          }

          if(includeValue) {
            var valueSpec;
            if(value) {
              // Determine if value spec must contain the type inline
              var valueType = propType.type;
              keyArgs.includeType = value.type !== (valueType.isRefinement ? valueType.of : valueType);

              valueSpec = value.toSpecInContext(keyArgs);

              // If a value ends up not being serializable (see ./function)
              // it may return `null` as a sign of failure.
              // In this case, we must check again if the value should be included,
              // like if it were originally `null`.
              if(valueSpec == null) {
                if(includeDefaults) {
                  // The default value is better than a `null` that is the result of
                  // a serialization failure...
                  valueSpec = propType.value;
                } else {
                  // Defaults can be omitted as long as complex form is used.
                  // Same value as default?
                  if(!useArray && valueSpec == propType.value) return;

                  valueSpec = null;
                }
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
      //endregion

      type: /** @lends pentaho.type.Complex.Type# */{
        id: module.id,

        isAbstract: true,

        get isComplex() { return true; },
        get isContainer() { return true; },

        //region properties property
        _props: null,

        // Used for configuration only.
        set props(propSpecs) {
          this._getProps().configure(propSpecs);
        }, // jshint -W078

        _getProps: function() {
          // Always get/create from/on the class' prototype.
          // Lazy creation.
          var proto = this.constructor.prototype;
          return O.getOwn(proto, "_props") ||
            (proto._props = PropertyTypeCollection.to([], /*declaringType:*/this));
        },
        //endregion

        /**
         * Gets the type object of the property with the given name,
         * or `null` if it is not defined.
         *
         * If a property type object is specified,
         * it is returned back only if it is _the_ property type object of
         * same name in this complex type.
         *
         * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
         * @param {boolean} [sloppy=false] Indicates if an error is thrown if the specified property is not defined.
         *
         * @return {?pentaho.type.Property.Type} The property type object.
         *
         * @throws {pentaho.lang.ArgumentInvalidError} When `sloppy` is `false` and a property with
         * name `name` is not defined.
         */
        get: function(name, sloppy) {
          if(!name) throw error.argRequired("name");
          var p = this._get(name);
          if(!p && !sloppy)
            throw error.argInvalid("name", "A property with the name '" + (name.name || name) + "' is not defined.");
          return p;
        },

        _get: function(name) {
          var ps;
          // !_props could only occur if accessing #get directly on Complex.type and it had no derived classes yet...
          return (!name || !(ps = this._props)) ? null :
                 (typeof name === "string")     ? ps.get(name) :
                 (ps.get(name.name) === name)   ? name :
                 null;
        },

        /**
         * Gets a value that indicates if a given property is defined.
         *
         * If a property type object is specified,
         * this method tests whether it is the same property type object that exists under that name, if any.
         *
         * @param {string|pentaho.type.Property.Type} name - The property name or type object.
         *
         * @return {boolean} `true` if the property is defined; `false`, otherwise.
         */
        has: function(name) {
          // !_props could only occur if accessing #has directly on Complex.type and it had no derived classes yet...
          var ps;
          if(!name || !(ps = this._props)) return false;
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
         * @return {?pentaho.type.Property.Type} The property type object, or `null`.
         *
         * @throws {pentaho.lang.ArgumentRangeError} When `sloppy` is `false` and the specified `index` is out of range.
         */
        at: function(index, sloppy) {
          if(index == null) throw error.argRequired("index");
          var pType = this._at(index);
          if(!pType && !sloppy)
            throw error.argRange("index");
          return pType;
        },

        _at: function(index) {
          // !_props could only occur if accessing #at directly on Complex.type and it had no derived classes yet...
          var ps = this._props;
          return (ps && ps[index]) || null;
        },

        /**
         * Gets the number of properties of the complex type.
         *
         * @return {number} The number of properties.
         */
        get count() {
          // !_props could only occur if accessing #at directly on Complex.type and it had no derived classes yet...
          var ps = this._props;
          return ps ? ps.length : 0;
        },

        /**
         * Calls a function for each defined property type.
         *
         * @param {function(pentaho.type.Property.Type, number, pentaho.type.Complex) : boolean?} f
         * The mapping function. Return `false` to break iteration.
         *
         * @param {Object} [x] The JS context object on which `f` is called.
         *
         * @return {pentaho.type.Complex} This object.
         */
        each: function(f, x) {
          var ps = this._props, L;
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
         * Adds, overrides or configures properties to/of the complex type.
         *
         * @param {pentaho.type.spec.IPropertyTypeProto|pentaho.type.spec.IPropertyTypeProto[]} propTypeSpec
         * - A property type specification or an array of them.
         *
         * @return {pentaho.type.Complex} This object.
         */
        add: function(propTypeSpec) {
          if(!Array.isArray(propTypeSpec)) propTypeSpec = [propTypeSpec];
          this._getProps().configure(propTypeSpec);
          return this;
        },

        //region serialization
        _fillSpecInContext: function(spec, keyArgs) {

          var any = this.base(spec, keyArgs);

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
        //endregion
      }
    })
    .implement(ContainerMixin)
    .implement({
      type: bundle.structured.complex
    });

    /**
     * Creates a subtype of this one.
     *
     * For more information on class extension, in general,
     * see {@link pentaho.lang.Base.extend}.
     *
     * @name extend
     * @memberOf pentaho.type.Complex
     *
     * @param {string} [name] The name of the created class, used for debugging purposes.
     * @param {pentaho.type.spec.IComplexProto} [instSpec] The instance specification.
     * @param {Object} [classSpec] The static specification.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * @return {!Class.<pentaho.type.Complex>} The new complex instance subclass.
     *
     * @see pentaho.type.Value.extend
     */

    return Complex;
  };
});
