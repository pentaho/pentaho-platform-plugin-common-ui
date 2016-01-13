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
  "./value",
  "./PropertyMetaCollection",
  "../i18n!types",
  "../util/object",
  "../util/error"
], function(module, valueFactory, PropertyMetaCollection, bundle, O, error) {

  "use strict";

  // TODO: self-recursive complexes won't work if we don't handle them specially:
  // Component.parent : Component
  // Will cause requiring Component during it's own build procedure...
  // Need to recognize requests for the currently being built _top-level_ complex in a special way -
  // the one that cannot be built and have a module id.

  return function(context) {

    var Value = context.get(valueFactory);

    /**
     * @name pentaho.type.Complex.Meta
     * @class
     * @extends pentaho.type.Value.Meta
     *
     * @classDesc The metadata class of {@link pentaho.type.Complex}.
     */

    /**
     * @name pentaho.type.Complex
     * @class
     * @extends pentaho.type.Value
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
     */
    var Complex = Value.extend("pentaho.type.Complex", /** @lends pentaho.type.Complex# */{

      // Note: neither `Value` or `Item` do anything in their constructor,
      // so, in the name of performance, we're purposely not calling base.
      constructor: function(spec) {
        // Create `Property` instances.
        var pMetas = this.meta._getProps(),
            i = pMetas.length,
            nameProp = !spec ? undefined : ((spec instanceof Array) ? "index" : "name"),
            pMeta,
            values = {};

        while(i--) {
          pMeta = pMetas[i];
          values[pMeta.name] = pMeta.toValue( nameProp && spec[pMeta[nameProp]] );
        }

        this._values = values;
      },

      /**
       * Gets the value of a property.
       *
       * If the specified property is not defined, `null` is returned.
       *
       * A list property always has an array value, possibly empty, but never `null`.
       *
       * @param {string|pentaho.type.Property.Meta} [name] The property name or metadata.
       * @param {boolean} [assertDefined=false] Indicates if an error should be thrown when a property
       *    with the specified name is not defined.
       *
       * @return {pentaho.type.Value|pentaho.type.Value[]} The value(s) of the property, or _null_.
       * @see pentaho.type.Property.Meta#list
       */
      get: function(name, assertDefined) {
        var pMeta = this.meta.get(name, assertDefined);
        return pMeta ? this._values[pMeta.name] : null;
      },

      /**
       * Sets the value of a property.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
       * @param {any?} [valueSpec=null] A value fragment specification.
       *
       * return {pentaho.type.Complex} This object.
       */
      set: function(name, valueSpec) {
        var pMeta  = this.meta.get(name, true),
            value1 = pMeta.toValue(valueSpec),
            value0 = this._values[pMeta.name];

        if(!pMeta.areEqualValues(value0, value1)) {
          // TODO: change event
          this._values[pMeta.name] = value1;
        }
      },

      /**
       * Obtains one `Value` of a given property.
       *
       * When the specified property is not a _list_ property,
       * only when `index` is not specified or is `0` is an existing value returned.
       *
       * An error is thrown if the specified property is not defined.
       *
       * When a requested index does not exist, `null` is returned.
       *
       * @param {string|pentaho.type.Property.Meta} [name] The property name or metadata.
       * @param {?number} [index=0] The index of the value.
       *
       * @return {?pentaho.type.Value} A single property value or `null`.
       * @see pentaho.type.Property.Meta#list
       */
      get1: function(name, index) {
        var pMeta = this.meta.get(name, true);
        if(!pMeta) return null;

        var value = this._values[pMeta.name];
        return pMeta.list ? (value[index || 0] || null) :
               !index     ? value :
               null;
      },

      /**
       * Obtains the number of values of a given property.
       *
       * When the specified property is a _list_ property,
       * the length of its value fragment is returned.
       *
       * When the specified property is not a _list_ property,
       * `0` is returned if it is `null` and `1`, otherwise.
       *
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
       *
       * @return {number} The number of values.
       */
      count: function(name) {
        var pMeta = this.meta.get(name, true);
        if(!pMeta) return 0;

        var value = this._values[pMeta.name];
        return pMeta.list ? value.length :
               value      ? 1 : 0;
      },

      /**
       * Obtains the underlying value of one `Value` of a given property.
       *
       * This method returns the result of the `valueOf()` method
       * on the `Value` returned by {@link pentaho.type.Complex#get1}.
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
       * @param {?number} [index] The index of the value.
       *
       * @return {?any} The underlying value of the requested `Value` or `undefined`.
       */
      getv: function(name, index) {
        var v1 = this.get1(name, index);
        return v1 ? v1.valueOf() : undefined;
      },

      /**
       * Obtains the string representation of one `Value` of a given property.
       *
       * This method returns the result of the `toString()` method
       * on the `Value` returned by {@link pentaho.type.Complex#get1}.
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
       * @return {string} The string representation of the requested `Value` or `""`.
       */
      getf: function(name, index) {
        var v1 = this.get1(name, index);
        return v1 ? v1.toString() : "";
      },

      //region property attributes
      //region applicable attribute
      /**
       * Obtains a value that indicates if a given property is currently applicable.
       *
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
       * @return {boolean} `true` if the property is applicable, `false`, otherwise.
       */
      applicable: function(name) {
        return this.meta.get(name, true).applicableEval(this);
      },
      //endregion

      //region readOnly attribute
      /**
       * Obtains a value that indicates if a given property is currently readonly.
       *
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
       * @return {boolean} `true` if the property is read-only, `false`, otherwise.
       *
       * @type boolean
       */
      readOnly: function(name) {
        return this.meta.get(name, true).readOnlyEval(this);
      },
      //endregion

      //region countRange attribute
      /**
       * Obtains the current valid count range of values of a given property.
       *
       * An error is thrown if the specified property is not defined.
       *
       * @param {string|pentaho.type.Property.Meta} name The property name or metadata.
       * @return {pentaho.IRange} The range of the property.
       */
      countRange: function(name) {
        return this.meta.get(name, true).countRangeEval(this);
      },
      //endregion

      //region required attribute
      /**
       * Obtains a value that indicates if a given property is currently required.
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
        return this.meta.get(name, true).countRangeEval(this).min > 0;
      },
      //endregion
      //endregion

      meta: /** @lends pentaho.type.Complex.Meta# */{
        id: module.id,

        "abstract": true,

        styleClass: "pentaho-type-complex",

        //region properties property
        _props: null,

        // TODO: remove the props getter...
        get props() {
          return this._getProps();
        },

        // Used for configuration only.
        /**
         * Configures the properties' metadata of the complex type.
         *
         * @type {pentaho.type.spec.IPropertyMeta[]|Object.<string, pentaho.type.spec.IPropertyMeta>}
         * @ignore
         */
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
         * @param {boolean} [assertDefined=false] Indicates if an error should be thrown when a property
         *    with the specified name is not defined.
         *
         * @return {pentaho.type.Property.Meta} The property metadata, or `null`.
         */
        get: function(name, assertDefined) {
          var p = this._get(name);
          if(!p && assertDefined)
            throw error.operInvalid("A property with the name '" + (name.name || name) + "' is not defined.");
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
          if(!(metaSpec instanceof Array)) metaSpec = [metaSpec];
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
