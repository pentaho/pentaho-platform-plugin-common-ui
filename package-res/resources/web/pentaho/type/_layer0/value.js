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
  "./Item",
  "../../i18n!../i18n/types",
  "../../util/error",
  "../../util/fun",
  "../../util/object"
], function(Item, bundle, error, fun, O) {

  "use strict";

  var _baseMid = "pentaho/type/";

  /**
   * Creates the root `Value` class of the given context.
   *
   * ### AMD
   *
   * Module Id: `pentaho/type/value`
   *
   * @alias valueFactory
   * @memberOf pentaho.type
   * @type pentaho.type.Factory<pentaho.type.Value>
   * @amd pentaho/type/value
   */
  return function(context) {

    var _valueMeta = null;

    /**
     * @name pentaho.type.Value.Meta
     * @class
     * @extends pentaho.type.Item.Meta
     *
     * @classDesc The base _metadata_ class of value types.
     */

    /**
     * @name pentaho.type.Value
     * @class
     * @extends pentaho.type.Item
     *
     * @classDesc
     *
     * Example type:
     * ```javascript
     * define(["pentaho/type/value"], function(valueFactory) {
     *
     *   return function(context) {
     *
     *     var Value = context.get(valueFactory);
     *
     *     return Value.extend({
     *       type: {
     *         // Label of a single element of this type of value.
     *         label: "Name",
     *
     *         // Category of the type of value or concept
     *         category: "foo",
     *
     *         // Description of the type of value
     *         description: "Foo",
     *
     *         helpUrl: "foo/bar"
     *
     *         // min, max - for _ordered_ types (number, string, any having compare specified?)
     *         // minOpen, maxOpen? false
     *         // lengthMin, lengthMax, pattern - facets for strings only
     *
     *         // Arbitrary metadata
     *         p: {
     *         },
     *
     *         // Closed domain of _values_ of this type.
     *         // When inherited, specified values must be a subset of those in the base class.
     *         // By default, the list is an undetermined, possibly infinite,
     *         // set of all values allowed in the base domain...
     *         // This also specifies the default natural ordering of the values.
     *         domain: [],
     *
     *         // Default formatting specification for values of this type
     *         format: {},
     *
     *         styleClass: ""
     *       }
     *     });
     *   };
     * });
     * ```
     *
     * @description Creates a value.
     */
    var Value = Item.extend("pentaho.type.Value", {
      meta: /** @lends pentaho.type.Value.Meta# */{
        // Note: constructor/_init only called on sub-classes of Value.Meta,
        // and not on Value.Meta itself.
        _init: function() {
          this.base.apply(this, arguments);

          // Block inheritance, with default values
          this._abstract = false;
        },

        id: _baseMid + "value",

        styleClass: "pentaho-type-value",

        //region context property

        // NOTE: any class extended from this one will return the same context...
        /**
         * Gets the context that defined this type class.
         * @type pentaho.type.IContext
         * @override
         */
        get context() {
          return context;
        },
        //endregion

        //region abstract property
        // @type boolean
        // -> boolean, Optional(false)

        // Default value is for `Value.Meta` only.
        // @see Value.Meta#constructor.
        _abstract: true,

        get "abstract"() {
          return this._abstract;
        },

        set "abstract"(value) {
          // nully is reset, which is false, so !! works well.
          this._abstract = !!value;
        },
        //endregion

        //region format

        // TODO: recursively inherit? clone? merge on set?

        // -> Optional({}), Inherited, Configurable
        _format: undefined,

        get format() {
          return this._format;
        },

        set format(value) {
          if(value == null) {
            if(this !== _valueMeta) {
              delete this._format;
            }
          } else {
            this._format = value || {};
          }
        },
        //endregion

        //region domain

        // Closed domain of _values_ of this type.
        // Also defines the default natural ordering of the values.
        // When inherited, specified values must be a subset of those in the base class.
        // Although they can be in a different order.
        // By default, the list is an undetermined, possibly infinite,
        // set of all values allowed in the base domain...
        // Because it is not possible to escape a base domain,
        // both setting to undefined or null resets the property,
        // inheriting the base domain.
        _domain: null,

        get domain() {
          return this._domain;
        },

        set domain(value) {
          if(value == null) {
            // inherit unless we're the root
            if(this !== _valueMeta) {
              delete this._domain;
            }
          } else {
            var baseDomain = Object.getPrototypeOf(this)._domain;
            if(baseDomain && !isSubsetOf(value, baseDomain))
              throw error.argInvalid("domain", bundle.structured.errors.type.domainIsNotSubsetOfBase);

            this._domain = value;
          }
        },
        //endregion

        //region methods
        getKey: function(value) {
          // A unique key of the value among values of the same "kind".
          // TODO: Specifically, unique among values of its first sub-class???
          return value == null ? "" : String(value);
        },

        //region validate method

        // Unit validation of a value.
        // Returns array of non-empty Error objects or null.

        // Configurable in a special way.
        // Setting always sets the core.
        // Getting always gets the wrapper.
        get validate() {
          return validateTop;
        },

        set validate(validate) {
          this._validate = validate || validateCore;
        },

        _validate: validateCore,
        //endregion

        //region areEqual method

        // Configurable in a special way.
        // Setting always sets the core.
        // Getting always gets the wrapper.
        get areEqual() {
          return areEqualTop;
        },

        set areEqual(areEqual) {
          this._areEqual = areEqual || areEqualCore;
        },

        _areEqual: areEqualCore,
        //endregion

        //region compare method
        // Configurable in a special way.
        // Setting always sets the core.
        // Getting always gets the wrapper.
        get compare() {
          return compareTop;
        },

        set compare(compare) {
          this._compare = compare || compareCore;
        },

        _compare: compareCore,
        //endregion

        // TODO: Serialization of a Specification to/from JSON
        toJSON: function(value) {
        },

        fromJSON: function(json) {
        }
        //endregion
      }
    },
    /*classSpec:*/ null,
    /*keyArgs:*/ {
      isRoot: true
    }).implement({
      meta: bundle.structured.value
    });

    _valueMeta = Value.meta;

    return Value;
  };

  //region validate private methods
  function validateTop(value) {
    return value === null ? null : this._validate(value);
  }

  // Validation of a non-empty value.
  // Should call the base method first.
  // TODO: Only undefined and arrays are not possible values?
  function validateCore(value) {
    return value === undefined    ? [new Error(bundle.structured.errors.value.isUndefined)] :
           value instanceof Array ? [new Error(bundle.structured.errors.value.singleValueIsArray)] :
           !this.is(value)        ? [new Error(bundle.format(bundle.structured.errors.value.notOfType, [this.label]))] :
           null;
  }
  //endregion

  //region areEqual private methods
  // Should be consistent with result of compare.
  // areEqual => compare -> 0
  function areEqualTop(va, vb) {
    return va === vb || (va == null && vb == null) || this._areEqual(va, vb);
  }

  function areEqualCore(va, vb) {
    return va === vb;
  }
  //endregion

  //region compare private methods
  // consistent with isEmpty and areEqual
  function compareTop(va, vb) {
    // Quick bailout test
    if(va ===  vb) return 0;
    if(va == null) return vb == null ? 0 : 1;
    if(vb == null) return -1;
    return this._areEqual(va, vb) ? 0 : this._compare(va, vb);
  }

  // natural ascending comparer of non-equal, non-empty values
  function compareCore(va, vb) {
    return fun.compare(va, vb);
  }
  //endregion

  function isSubsetOf(sub, sup, key) {
    if(!key) key = fun.identity;

    var L1 = sup.length, L2 = sub.length, i, supIndex;
    if(L2 > L1) return false;

    supIndex = {};
    i = L1;
    while(i--) supIndex[key(sup[i])] = 1;

    i = L2;
    while(i--) if(!O.hasOwn(supIndex, key(sub[i]))) return false;

    return true;
  }
});
