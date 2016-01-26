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
  "../i18n!types",
  "../util/object",
  "../util/error",
  "../util/arg"
], function(module, elemFactory, PropertyMetaCollection, bundle, O, error, arg) {

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
     * @classDesc The metadata class of {@link pentaho.type.Complex}.
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
       * @param {string|pentaho.type.Property.Meta} [name] The property name or metadata.
       * @param {boolean} [lenient=false] Indicates if an error should not be thrown
       *   when a property with the specified name is not defined.
       *
       * @return {?pentaho.type.Value} The value of the property, or _null_.
       */
      get: function(name, lenient) {
        var pMeta = this.meta.get(name, lenient);
        return pMeta ? this._values[pMeta.name] : null;
      },

      /**
       * Sets the value of a property.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
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
       * Gets a singular `Element` value of a given property.
       *
       * When the specified property is not a _list_ property,
       * only when `index` is not specified or is `0`
       * is an existing value returned.
       *
       * An error is thrown if the specified property is not defined.
       *
       * When a requested index does not exist, `null` is returned.
       *
       * @param {string|pentaho.type.Property.Meta} [name] The property name or metadata.
       * @param {?number} [index=0] The index of the value.
       *
       * @return {?pentaho.type.Element} A singular `Element` value or `null`.
       * @see pentaho.type.Property.Meta#list
       * @see pentaho.type.Complex#path
       */
      get1: function(name, index) {
        var pMeta = this.meta.get(name),
            value = this._values[pMeta.name];
        return pMeta.list ? value.at(index) :
               !index     ? value :
               null;
      },

      /**
       * Gets the value of a property/index/key path based on the current complex.
       *
       * An error is thrown when
       * a specified property is not defined on a complex value along the path.
       *
       * `null` is returned when:
       * 1. a specified index is out-of-range on a list value along the path
       * 2. a specified key is not present on a list value along the path
       * 3. a specified element property contains a null value along the path.
       *
       * @param {...(string|number|pentaho.type.Property.Meta)} path The property/index/key path.
       *
       * @return {?pentaho.type.Value} The requested `Value` or `null`.
       */
      path: function() {
        var L = arguments.length,
            i = -1,
            v = this,
            step;

        while(++i < L)
          if(!(v = (typeof (step = arguments[i]) === "number") ? v.at(step) : v.get(step)))
            return null;

        return v;
      },

      /**
       * Gets the _number of values_ of a given property.
       *
       * When the specified property is a _list_ property,
       * its {@link pentaho.type.List#count} is returned.
       *
       * When the specified property is not a _list_ property,
       * `0` is returned if it is `null` and
       * `1`, otherwise.
       *
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or property metadata.
       *
       * @return {number} The number of values.
       */
      count: function(name) {
        var pMeta = this.meta.get(name);
        var value = this._values[pMeta.name];
        return pMeta.list ? value.count :
               value      ? 1 : 0;
      },

      /**
       * Gets the underlying value of a singular `Element` value of a given property.
       *
       * This method returns the result of the `valueOf()` method
       * on the `Element` returned by {@link pentaho.type.Complex#get1}.
       *
       * For a {@link pentaho.type.Simple} type, this corresponds to returning
       * its {@link pentaho.type.Simple#value} attribute.
       * For a {@link pentaho.type.Complex} type, this corresponds to itself.
       *
       * An error is thrown if the specified property is not defined.
       *
       * When a requested index does not exist, `undefined` is returned.
       *
       * @param {string|pentaho.type.Property.Meta} [name] The property name or metadata.
       * @param {?number} [index] The index of the element.
       *
       * @return {?any} The underlying value of the requested `Element` or `undefined`.
       */
      getv: function(name, index) {
        var v1 = this.get1(name, index);
        return v1 ? v1.valueOf() : undefined;
      },

      /**
       * Gets the string representation of a singular `Element` value of a given property.
       *
       * This method returns the result of the `toString()` method
       * on the `Element` returned by {@link pentaho.type.Complex#get1}.
       *
       * For a {@link pentaho.type.Simple} type, this corresponds to returning
       * its {@link pentaho.type.Simple#formatted} attribute when it is not null.
       * For a {@link pentaho.type.Complex} type, depends totally on the implementation.
       *
       * An error is thrown if the specified property is not defined.
       *
       * When a requested index does not exist, `""` is returned.
       *
       * @param {string|pentaho.type.Property.Meta} [name] The property name or metadata.
       * @param {?number} [index] The index of the value.
       *
       * @return {string} The string representation of the requested `Element` or `""`.
       */
      getf: function(name, index) {
        var v1 = this.get1(name, index);
        return v1 ? v1.toString() : "";
      },

      //region property attributes
      //region applicable attribute
      /**
       * Gets a value that indicates if a given property is currently applicable.
       *
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
       * @return {boolean} `true` if the property is applicable, `false`, otherwise.
       */
      applicable: function(name) {
        return this.meta.get(name).applicableEval(this);
      },
      //endregion

      //region readOnly attribute
      /**
       * Gets a value that indicates if a given property is currently readonly.
       *
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or property metadata.
       * @return {boolean} Returns `true` if the property is read-only, `false` if the value is other.
       *
       * @type boolean
       */
      readOnly: function(name) {
        return this.meta.get(name).readOnlyEval(this);
      },
      //endregion

      //region countRange attribute
      /**
       * Gets the current valid count range of values of a given property.
       *
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
       * @return {pentaho.IRange} The range of the property.
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
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} [name] The property name or metadata.
       * @return {boolean} `true` if the property is required, `false`, otherwise.
       */
      required: function(name) {
        return this.meta.get(name).countRangeEval(this).min > 0;
      },
      //endregion
      //endregion

      //region validation

      /**
       * Performs validation of this item.
       *
       * When invalid, returns either one `Error` or a non-empty array of `Error` objects.
       * When valid, `null` is returned.
       *
       * @return {Error|Array.<!Error>|null} An `Error`, a non-empty array of `Error` or `null`.
       */
      validate: function() {
        var errors = [];
        for (var i in this._values) {
          if (this._values[i]) {
            Array.prototype.push.apply(errors, this._values[i].validate());
          }
        }

        return errors.length > 0 ? errors : null;
      },

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
         * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
         * @param {boolean} [lenient=false] Indicates if an error should not be thrown
         *   when a property with the specified name is not defined.
         *
         * @return {?pentaho.type.Property.Meta} The property metadata.
         */
        get: function(name, lenient) {
          var p = this._get(name);
          if(!p && !lenient) throw error.operInvalid("A property with the name '" + (name.name || name) + "' is not defined.");
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
         * Gets the `Property.Meta` of the property with the given index.
         *
         * @param {number} index The property index.
         *
         * @return {pentaho.type.Property.Meta} The property metadata.
         */
        at: function(index) {
          if(index == null) throw error.argRequired("index");
          return this._getProps()[index] || null;
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
        }
      }
    }).implement({
      meta: bundle.structured.complex
    });

    return Complex;
  };
});
