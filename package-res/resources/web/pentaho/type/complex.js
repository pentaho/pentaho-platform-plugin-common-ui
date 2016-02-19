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
  "module",
  "./element",
  "./PropertyMetaCollection",
  "./valueHelper",
  "../i18n!types",
  "../util/object",
  "../util/error"
], function(module, elemFactory, PropertyMetaCollection, valueHelper, bundle, O, error) {

  "use strict";

  // TODO: self-recursive complexes won't work if we don't handle them specially:
  // Component.parent : Component
  // Will cause requiring Component during it's own build procedure...
  // Need to recognize requests for the currently being built _top-level_ complex in a special way -
  // the one that cannot be built and have a module id.

  var _complexNextUid = 1;

  return function(context) {

    var Element = context.get(elemFactory);

    /**
     * @name pentaho.type.Complex.Meta
     * @class
     * @extends pentaho.type.Element.Meta
     *
     * @classDesc The base type class of complex types.
     *
     * For more information see {@link pentaho.type.Complex}.
     */

    /**
     * @name pentaho.type.Complex
     * @class
     * @extends pentaho.type.Element
     * @amd pentaho/type/complex
     *
     * @classDesc The base class of complex types.
     *
     * ### AMD
     *
     * Module Id: `pentaho/type/complex`
     *
     * The AMD module returns the type's factory, a
     * {@link pentaho.type.Factory<pentaho.type.Complex>}.
     *
     * Example complex type:
     * ```javascript
     * define(["pentaho/type/complex"], function(complexFactory) {
     *
     *   return function(context) {
     *
     *     var Complex = context.get(complexFactory);
     *
     *     return Complex.extend({
     *       meta: {
     *         // Properties
     *         props: [
     *           {name: "name", type: "string", label: "Name"},
     *           {name: "category", type: "string", label: "Category", list: true},
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
     * When a derived class overrides the constructor
     * and creates additional instance properties,
     * the {@link pentaho.type.Complex#_clone} method should
     * also be overridden to copy those properties.
     *
     * @constructor
     * @param {object} spec The complex instance specification.
     */
    var Complex = Element.extend("pentaho.type.Complex", /** @lends pentaho.type.Complex# */{

      // NOTE 1: neither `Value` or `Item` do anything in their constructor,
      // so, in the name of performance, we're purposely not calling base.

      // NOTE 2: keep the constructor code synced with #clone !
      constructor: function(spec) {
        // Create `Property` instances.
        var pMetas = this.meta._getProps(),
            i = pMetas.length,
            nameProp = !spec ? undefined : (Array.isArray(spec) ? "index" : "name"),
            pMeta,
            values = {};

        while(i--) {
          pMeta = pMetas[i];
          values[pMeta.name] = pMeta.toValue( nameProp && spec[pMeta[nameProp]] );
        }

        this._values = values;
        this._uid = String(_complexNextUid++);
      },

      /**
       * Creates a shallow clone of this complex value.
       *
       * All property values are shared with the clone,
       * except list values themselves, which are shallow-cloned.
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
       * @param {!pentaho.type.Complex} clone The complex value clone.
       * @protected
       */
      _clone: function(clone) {
        // All properties are copied except lists, which are shallow cloned.
        var pMetas = this.meta._getProps(),
            i = pMetas.length,
            values = this._values,
            cloneValues = {},
            pMeta, v;

        while(i--) {
          pMeta = pMetas[i];
          v = values[pMeta.name];
          cloneValues[pMeta.name] = v && pMeta.list ? v.clone() : v;
        }

        clone._values = cloneValues;
        clone._uid = String(_complexNextUid++);
      },

      /**
       * Gets the unique id of the complex instance.
       * @type {string}
       * @readonly
       */
      get uid() {
        return this._uid;
      },

      /**
       * Gets the key of the complex value.
       *
       * The key of a value identifies it among values of the same concrete type.
       *
       * If two values have the same concrete type and their
       * keys are equal, then it must also be the case that
       * {@link pentaho.type.Value.Meta#areEqual}
       * returns `true` when given the two values.
       * The opposite should be true as well.
       * If two values of the same concrete type have distinct keys,
       * then {@link pentaho.type.Value.Meta#areEqual} should return `false`.
       *
       * The default complex implementation, returns the value of the
       * complex instance's {@link pentaho.type.Complex#uid}.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this._uid;
      },

      /**
       * Gets the value of a property.
       *
       * A list property always has a non-null value, possibly an empty list, but never `null`.
       *
       * An element property _can_ have a `null` value.
       *
       * @param {string|!pentaho.type.Property.Meta} [name] The property name or metadata.
       * @param {boolean} [lenient=false] Indicates if `null` is returned
       *   if a property with the specified name is not defined, or if, instead, an error is thrown.
       *
       * @return {?pentaho.type.Value} The value of the property, or _null_.
       *
       * @throws {pentaho.lang.ArgumentRequiredError} When `lenient` is `false` and `name` is not specified.
       * @throws {pentaho.lang.ArgumentInvalidError} When `lenient` is `false` and
       * a property with name `name` is not defined.
       */
      get: function(name, lenient) {
        var pMeta = this.meta.get(name, lenient);
        return pMeta ? this._values[pMeta.name] : null;
      },

      /**
       * Sets the value of a property.
       *
       * @param {string|!pentaho.type.Property.Meta} name The property name or metadata.
       * @param {any?} [valueSpec=null] A value specification.
       *
       * return {pentaho.type.Complex} This object.
       */
      set: function(name, valueSpec) {
        var pMeta  = this.meta.get(name),
            value0 = this._values[pMeta.name];

        if(pMeta.list) {
          value0.set(valueSpec);
        } else {
          var value1 = pMeta.toValue(valueSpec);
          if(!pMeta.type.areEqual(value0, value1)) {
            // TODO: change event
            this._values[pMeta.name] = value1;
          }
        }
      },

      /**
       * Gets one `Element` of a property's value.
       *
       * This method allows to use the same syntax for getting a single element from the value of a property,
       * whether it is a list or an element property. If the property is an element property whose value
       * is `null`, it is seen like a list property with no elements.
       * If its value is not `null`, it is seen like a list property with one element.
       * This behavior is consistent with that of the [count]{@link pentaho.type.Complex#count} property.
       *
       * By default, the **first** element of the property's value, if any, is returned.
       *
       * Also, by default, the method does **not** behave _leniently_.
       * If
       * the a property with the specified name is not defined, or
       * the specified or implied index is out of range, or
       * the resulting element is `null`,
       * an error is thrown.
       * If, however, argument `lenient` is given the value `true`, `null` is returned, instead.
       *
       * @see pentaho.type.Property.Meta#list
       * @see pentaho.type.Complex#path
       * @see pentaho.type.Complex#getv
       * @see pentaho.type.Complex#getf
       * @see pentaho.type.Complex#count
       *
       * @param {string|!pentaho.type.Property.Meta} name The property name or metadata.
       * @param {?number} [index=0] The index of the desired element.
       * @param {boolean} [lenient=false] Indicates if `null` is returned
       * when the specified property or index do not exist, or if, instead, an error is thrown.
       *
       * @return {?pentaho.type.Element} A single `Element` value or `null`.
       *
       * @throws {pentaho.lang.ArgumentRequiredError} When `lenient` is `false` and `name` is not specified.
       * @throws {pentaho.lang.ArgumentInvalidError} When `lenient` is `false` and
       * a property with name `name` is not defined.
       *
       * @throws {pentaho.lang.ArgumentOutOfRangeError} When `lenient` is `false` and
       * the specified or implied `index` is out of range.
       */
      get1: function(name, index, lenient) {
        var pMeta = this.meta.get(name, lenient);
        if(pMeta) {
          var pValue = this._values[pMeta.name];

          if(pMeta.list) {
            // assert pValue;
            return pValue.at(index || 0, lenient);
          }

          // index is 0 or nully (unspecified)
          if(pValue && !index) {
            return pValue;
          }

          if(!lenient) {
            throw error.argOutOfRange("index");
          }
        }
        // => lenient
        return null;
      },

      // always lenient - no good place to pass the argument (unless first or last position...)
      /**
       * Gets the value of a property/index/key path based on the current complex.
       *
       * This method behaves _leniently_. Value `null` is returned when a step, in `steps`:
       * 1. on a list value, is an element index that is out of range
       * 2. on a list value, is an element key that is not present
       * 3. on a complex value, a property is not defined
       * 4. on a complex value, a property has value `null`.
       *
       * @param {...(string|number|!pentaho.type.Property.Meta)} steps The property/index/key path steps.
       *
       * @return {?pentaho.type.Value} The requested value or `null`.
       */
      path: function() {
        var L = arguments.length,
            i = -1,
            v = this,
            step;

        while(++i < L)
          if(!(v = (typeof (step = arguments[i]) === "number")
               ? v.at (step, /*lenient:*/true)
               : v.get(step, /*lenient:*/true)))
            return null;

        return v;
      },

      /**
       * Gets the _number of values_ of a given property.
       *
       * When the specified property is not defined and `lenient` is `true`, `0` is returned.
       *
       * When the specified property is a _list_ property, its {@link pentaho.type.List#count} is returned.
       *
       * When the specified property is not a _list_ property, `0` is returned if it is `null` and `1`, otherwise.
       *
       * @param {string|!pentaho.type.Property.Meta} name The property name or property metadata.
       * @param {boolean} [lenient=false] Indicates if `0` is returned
       *   when a property with the specified name is not defined, or if, instead, an error is thrown.
       *
       * @return {number} The number of values.
       *
       * @throws {pentaho.lang.ArgumentRequiredError} When `lenient` is `false` and `name` is not specified.
       * @throws {pentaho.lang.ArgumentInvalidError} When `lenient` is `false` and
       * a property with name `name` is not defined.
       */
      count: function(name, lenient) {
        var pMeta = this.meta.get(name, lenient);
        if(!pMeta) return 0;

        var value = this._values[pMeta.name];
        return pMeta.list ? value.count :
               value      ? 1 : 0;
      },

      /**
       * Gets the _value of_ one `Element` of a property's value.
       *
       * This method returns the result of the `valueOf()` method
       * on the `Element` returned by {@link pentaho.type.Complex#get1}.
       *
       * For a {@link pentaho.type.Simple} type, this corresponds to returning
       * its {@link pentaho.type.Simple#value} attribute.
       * For a {@link pentaho.type.Complex} type, this corresponds to itself.
       *
       * When `lenient` is `true` and the specified property or index do not exist, `undefined` is returned.
       *
       * @param {string|!pentaho.type.Property.Meta} name The property name or metadata.
       * @param {?number} [index=0] The index of the element.
       * @param {boolean} [lenient=false] Indicates if an `undefined` value is returned
       *   when the specified property or index do not exist, or if, instead, an error is thrown.
       *
       * @return {?any} The underlying value of the requested `Element` or `undefined`.
       *
       * @throws {pentaho.lang.ArgumentRequiredError} When `lenient` is `false` and `name` is not specified.
       * @throws {pentaho.lang.ArgumentInvalidError} When `lenient` is `false` and
       * a property with name `name` is not defined.
       *
       * @throws {pentaho.lang.ArgumentOutOfRangeError} When `lenient` is `false` and
       * the specified or implied `index` is out of range.
       */
      getv: function(name, index, lenient) {
        var v1 = this.get1(name, index, lenient);
        return v1 ? v1.valueOf() : undefined;
      },

      /**
       * Gets the _string representation of_ one `Element` of a property's value.
       *
       * This method returns the result of the `toString()` method
       * on the `Element` returned by {@link pentaho.type.Complex#get1}.
       *
       * For a {@link pentaho.type.Simple} type, this corresponds to returning
       * its {@link pentaho.type.Simple#formatted} attribute when it is not null.
       * For a {@link pentaho.type.Complex} type, depends totally on the implementation.
       *
       * When `lenient` is `true` and the specified property or index do not exist, `""` is returned.
       *
       * @param {string|!pentaho.type.Property.Meta} name The property name or metadata.
       * @param {?number} [index=0] The index of the value.
       * @param {boolean} [lenient=false] Indicates if an empty string is returned
       *   when the specified property or index do not exist, or if, instead, an error is thrown.
       *
       * @return {string} The string representation of the requested `Element` or `""`.
       *
       * @throws {pentaho.lang.ArgumentRequiredError} When `lenient` is `false` and `name` is not specified.
       * @throws {pentaho.lang.ArgumentInvalidError} When `lenient` is `false` and
       * a property with name `name` is not defined.
       *
       * @throws {pentaho.lang.ArgumentOutOfRangeError} When `lenient` is `false` and
       * the specified or implied `index` is out of range.
       */
      getf: function(name, index, lenient) {
        var v1 = this.get1(name, index, lenient);
        return v1 ? v1.toString() : "";
      },

      //region property attributes
      //region applicable attribute
      /**
       * Gets a value that indicates if a given property is currently applicable.
       *
       * @param {string|!pentaho.type.Property.Meta} name The property name or metadata.
       *
       * @return {boolean} `true` if the property is applicable, `false`, otherwise.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       */
      applicable: function(name) {
        return this.meta.get(name).applicableEval(this);
      },
      //endregion

      //region readOnly attribute
      /**
       * Gets a value that indicates if a given property is currently readonly.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or property metadata.
       *
       * @return {boolean} Returns `true` if the property is read-only, `false` if the value is other.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       */
      readOnly: function(name) {
        return this.meta.get(name).readOnlyEval(this);
      },
      //endregion

      //region countRange attribute
      /**
       * Gets the current valid count range of values of a given property.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
       *
       * @return {pentaho.IRange} The range of the property.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       */
      countRange: function(name) {
        return this.meta.get(name).countRangeEval(this);
      },
      //endregion

      //region required attribute
      /**
       * Gets a value that indicates if a given property is currently required.
       *
       * A property is currently required if
       * its current {@link pentaho.type.Complex#countRange} minimum is at least 1.
       *
       * @param {string|pentaho.type.Property.Meta} [name] The property name or metadata.
       *
       * @return {boolean} `true` if the property is required, `false`, otherwise.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       */
      required: function(name) {
        return this.meta.get(name).countRangeEval(this).min > 0;
      },
      //endregion
      //endregion

      meta: /** @lends pentaho.type.Complex.Meta# */{
        id: module.id,

        "abstract": true,

        styleClass: "pentaho-type-complex",

        //region properties property
        _props: null,

        // Used for configuration only.
        set props(propSpecs) {
          this._getProps().configure(propSpecs);
        },

        _getProps: function() {
          // Always get/create from/on the class' prototype.
          // Lazy creation.
          var proto = this.constructor.prototype;
          return O.getOwn(proto, "_props") ||
              (proto._props = PropertyMetaCollection.to([], /*declaringMeta:*/this));
        },
        //endregion

        /**
         * Gets the metadata of the property with the given name.
         *
         * If a metadata instance is specified,
         * it is returned back only if it is _the_ metadata instance of
         * same name in this complex type.
         *
         * @param {string|!pentaho.type.Property.Meta} name The property name or metadata.
         * @param {boolean} [lenient=false] Indicates if `null` is returned
         *   when a property with the specified name is not defined, or if, instead, an error is thrown.
         *
         * @return {?pentaho.type.Property.Meta} The property metadata.
         *
         * @throws {pentaho.lang.ArgumentRequiredError} When `lenient` is `false` and `name` is not specified.
         * @throws {pentaho.lang.ArgumentInvalidError} When `lenient` is `false` and
         *   a property with name `name` is not defined.
         */
        get: function(name, lenient) {
          if(!name && !lenient) {
            throw error.argRequired("name");
          }

          var p = this._get(name);
          if(!p && !lenient)
            throw error.argInvalid("name", "A property with the name '" + (name.name || name) + "' is not defined.");
          return p;
        },

        _get: function(name) {
          var ps;
          return (!name || !(ps = this._props)) ? null :
                 (typeof name === "string")     ? ps.get(name) :
                 (ps.get(name.name) === name)   ? name :
                 null;
        },

        /**
         * Gets a value that indicates if a given property is defined.
         *
         * If a _metadata_ instance is specified,
         *
         * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
         *
         * @return {boolean} `true` if the property is defined, `false`, otherwise.
         */
        has: function(name) {
          var ps;
          if(!name || !(ps = this._props)) return false;
          if(typeof name === "string") return ps.has(name);
          // Name is a metadata
          return ps.get(name.name) === name;
        },

        /**
         * Gets the metadata of the property with a given index.
         *
         * @param {?number} index The property index.
         * @param {boolean} [lenient=false] Indicates if `null` is returned
         *   when the specified index is out of range, or if, instead, an error is thrown.
         *
         * @return {?pentaho.type.Property.Meta} The property metadata, or `null`.
         *
         * @throws {pentaho.lang.ArgumentRequiredError} When `lenient` is `false` and `index` is not specified.
         * @throws {pentaho.lang.ArgumentOutOfRangeError} When `lenient` is `false` and
         *   the specified `index` is out of range.
         */
        at: function(index, lenient) {
          if(index == null) {
            if(lenient) return null;
            throw error.argRequired("index");
          }

          var pMeta = this._getProps()[index] || null;
          if(!pMeta && !lenient)
            throw error.argOutOfRange("index");

          return pMeta;
        },

        /**
         * Gets the number of properties of the complex type.
         *
         * @return {number} The number of properties.
         */
        get count() {
          return this._props ? this._props.length : 0;
        },

        /**
         * Calls a function for each defined property metadata.
         *
         * @param {function(pentaho.type.Property.Meta, number, pentaho.type.Complex) : boolean?} f The mapping function.
         * @param {Object} [x] The JS context object on which `f` is called.
         *
         * @return {pentaho.type.Complex} This object.
         */
        each: function(f, x) {
          var ps = this._props, L;
          if(ps && (L = ps.length)) {
            var i = -1;
            while(++i < L)
              if(f.call(x, ps[i], i, this) === false)
                break;
          }
          return this;
        },

        /**
         * Adds, overrides or configures properties to/of the complex type.
         *
         * @param {pentaho.type.spec.IPropertyMeta|pentaho.type.spec.IPropertyMeta[]} metaSpec A property meta
         *   specification or an array of.
         *
         * @return {pentaho.type.Complex} This object.
         */
        add: function(metaSpec) {
          if(!Array.isArray(metaSpec)) metaSpec = [metaSpec];
          this._getProps().configure(metaSpec);
          return this;
        },

        //region validation
        // @override
        /**
         * Determines if a complex value,
         * that _is an instance of this type_,
         * is also a **valid instance** of _this_ type.
         *
         * Thus, `this.is(value)` must be true.
         *
         * The default implementation
         * validates each property's value against
         * the property's [type]{@link pentaho.type.Property.Meta#type}
         * and collects and returns any reported errors.
         *
         * @see pentaho.type.Value.Meta#validate
         * @see pentaho.type.Value.Meta#validateInstance
         *
         * @param {!pentaho.type.Complex} value The complex value to validate.
         *
         * @return {Nully|Error|Array.<!Error>} An `Error`, a non-empty array of `Error` or a `Nully` value.
         *
         * @protected
         * @overridable
         */
        _validate: function(value) {
          var errors = null;

          this.each(function(pMeta) {
            errors = valueHelper.combineErrors(errors, pMeta.validate(value));
          }, this);

          return errors;
        }
        //endregion
      }
    }).implement({
      meta: bundle.structured.complex
    });

    return Complex;
  };
});
