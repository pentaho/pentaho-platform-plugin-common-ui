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
  "./value",
  "../../lang/_AnnotatableLinked",
  "../../util/arg",
  "../../util/error",
  "../../util/object",
  "../../util/text",
  "../../util/fun"
], function(Item, Value, AnnotatableLinked, arg, error, O, text, F) {

  "use strict";

  var O_isProtoOf = Object.prototype.isPrototypeOf,
      _propMeta = null;

  /**
   * @name pentaho.type.Property
   *
   * @class
   * @extends pentaho.type.Item
   *
   * @classdesc A property of a complex value.
   *
   * @see pentaho.type.Complex
   * @description Creates a property.
   *
   * This constructor is used internally by the `pentaho/type` package and
   * should not be used directly.
   */

  /**
   * @name pentaho.type.Property.Meta
   *
   * @class
   * @extends pentaho.type.Item.Meta
   *
   * @implements pentaho.lang.IWithKey
   * @implements pentaho.lang.IListElement
   * @implements pentaho.lang.ICollectionElement
   *
   * @classdesc The metadata of a property of a complex type.
   *
   * @description Creates a property metadata instance.
   *
   * This constructor is used internally by the `pentaho/type` package and
   * should not be used directly.
   *
   * @see pentaho.type.Complex
   */
  var Property = Item.extend("pentaho.type.Property", /** @lends pentaho.type.Property# */{

    constructor: function(owner, value) {
      this._owner = owner;

      // Does not fire change event
      this._value = this._toValue(value);
    },

    //region attributes

    //region owner attribute
    /**
     * Gets the complex value that owns this property.
     *
     * @type !pentaho.type.Complex
     * @readonly
     */
    get owner() {
      return this._owner;
    },
    //endregion

    //region value attribute
    /**
     * Gets or sets the value of the property.
     *
     * @type pentaho.type.Value | pentaho.type.Value[] | null
     */
    get value() {
      return this._value;
    },

    set value(value) {
      // TODO: change event
      value = this._toValue(value);
      if(!this._areEqual(value, this._value)) {
        this._value = value;
      }
    },

    _areEqual: function(va, vb) {
      if(va === vb) return true;

      var typeMeta = this.meta.type;
      if(this.meta.list) {
        var i = va.length;
        if(i !== vb.length) return false;
        while(i--) if(!typeMeta.areEqual(va[i], vb[i])) return false;
        return true;
      }

      return typeMeta.areEqual(va, vb);
    },

    _toValue: function(value) {
      if(this.meta.list) {
        return value == null
          // Reset. Copy the default value...
          // TODO: fix meta.value default value for list properties
          ? (this.meta.value || []).slice()
          : this._toValueArray((value instanceof Array) ? value : [value]);
      }

      return this.meta.type.to(value);
    },

    _toValueArray: function(values) {
      var i = values.length,
          typeMeta = this.meta.type,
          value;
      while(i--) {
        value = typeMeta.to(values[i]);
        if(value != null) {
          values[i] = value;
        } else {
          values.splice(i, 1);
        }
      }
      return values;
    },
    //endregion

    //region countMin attribute
    /**
     * Gets the current minimum number of values that the property must hold.
     *
     * @type number
     * @readonly
     */
    get countMin() {
      return this.meta.countMinEval(this._owner);
    },
    //endregion

    //region countMax attribute
    /**
     * Gets the current maximum number of values that the property can hold.
     *
     * @type number
     * @readonly
     */
    get countMax() {
      return this.meta.countMaxEval(this._owner);
    },
    //endregion

    //region required attribute
    /**
     * Gets a value that indicates if the property is currently required.
     *
     * @type boolean
     * @readonly
     */
    get required() {
      return this.meta.requiredEval(this._owner);
    },
    //endregion

    //region applicable attribute
    /**
     * Gets a value that indicates if the property is currently applicable.
     *
     * @type boolean
     * @readonly
     */
    get applicable() {
      return this.meta.applicableEval(this._owner);
    },
    //endregion

    //region readOnly attribute
    /**
     * Gets a value that indicates if the property is currently readonly.
     *
     * @type boolean
     * @readonly
     */
    get readOnly() {
      return this.meta.readOnlyEval(this._owner);
    },
    //endregion
    //endregion

    meta: /** @lends pentaho.type.Property.Meta# */{

      // TODO: cardinality related: countMin, countMax, required
      // TODO: applicable, readonly, visible
      // TODO: value, members?
      // TODO: p -> AnnotatableLinked.configure(this, config);
      // TODO: dynamic attributes, this complex environment, non-standard base impl. composition

      // Note: constructor/_init only called on sub-classes of Property.Meta,
      // and not on Property.Meta itself.

      /**
       * Creates a property metadata instance, given a property specification.
       *
       * @param {pentaho.type.spec.UPropertyMeta} spec A property name or specification object.
       * @param {object} keyArgs Keyword arguments.
       * @param {pentaho.type.Complex.Meta} keyArgs.declaringMeta The metadata class of the complex type
       *    that declares the property.
       * @param {number} keyArgs.index The index of the property within its complex type.
       * @ignore
       */
      constructor: function(spec, keyArgs) {
        // A singular string property with the specified name.
        if(typeof spec === "string") spec = {name: spec};

        this.base(spec, keyArgs);
      },

      _init: function(spec, keyArgs) {

        this.base.apply(this, arguments);

        // TODO: Validate same context as base?

        O.setConst(this, "_declaringMeta", arg.required(keyArgs, "declaringMeta", "keyArgs"));

        if(this.isRoot)
          O.setConst(this, "_index", keyArgs.index || 0);
      },

      _postInit: function() {

        this.base.apply(this, arguments);

        if(this.isRoot) {
          // Required validation
          if(!this._name) this.name = null; // throws...

          // Force assuming default values
          if(!this._typeMeta) this.type = null;
          if(!this._label)    this._resetLabel();
        }
      },

      //region IListElement
      /**
       * Gets the singular name of `Property.Meta` list-elements.
       * @type string
       * @readonly
       * @default "property"
       */
      elemName: "property",
      //endregion

      //region IWithKey implementation
      /**
       * Gets the singular name of `Property.Meta` keys.
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
       * @type pentaho.type.IContext
       * @readonly
       */
      get context() {
        return this._declaringMeta.context;
      },
      //endregion

      //region declaringType attribute
      /**
       * The metadata of the complex type that declares this property.
       *
       * @type pentaho.type.Complex.Meta
       * @readonly
       */
      get declaringType() {
        return this._declaringMeta;
      },
      //endregion

      //region index attribute
      /**
       * The index of the property in the containing complex type.
       *
       * @type number
       * @readonly
       */
      get index() {
        return this._index;
      },
      //endregion

      //region name attribute

      // -> nonEmptyString, Required, Immutable, Root-only.
      _name: undefined,

      get name() {
        return this._name;
      },

      set name(value) {
        value = nonEmptyString(value);

        if(this.isRoot) {
          if(!value) throw error.argRequired("name");
          if(this._name) {
            if(this._name !== value)
              throw error.argInvalid("name", "Property cannot change the 'name' attribute.");
          } else {
            // Can only be set once,or throws.
            O.setConst(this, "_name", value);
            O.setConst(this, "_namePriv", "_" + value);

            this._createValueAccessor();
          }
        } else {
          // Hierarchy consistency
          if(value && value !== this._name)
            throw error.argInvalid("name", "Property cannot change the 'name' attribute.");
        }
      },
      //endregion

      //region list attribute

      // -> Optional(false), Immutable, Root-only.
      _list: false,

      get list() {
        return this._list;
      },

      set list(value) {
        if(this.isRoot) {
          this._list = !!value;
        } else if(value != null) {
          // Hierarchy consistency
          value = !!value;
          if(value !== this._list)
            throw error.argInvalid("list", "Sub-properties cannot change the 'list' attribute.");
        }
      },
      //endregion

      //region (value) type attribute
      /**
       * The type of _singular_ values that the property can hold.
       *
       * @type !pentaho.type.Value.Meta
       * @readonly
       */
      get type() {
        return this._typeMeta;
      },

      set type(value) {
        // Resolves types synchronously.
        if(this.isRoot) {
          this._typeMeta = this.context.get(value).meta;
        } else if(value != null) {
          // Hierarchy consistency
          var typeMeta = this.context.get(value).meta;

          // Validate that it is a sub-type of the base property's type.
          if(typeMeta !== this._typeMeta) {
            if(!O_isProtoOf.call(this._typeMeta, typeMeta))
              throw error.argInvalid(
                  "type",
                  "Sub-properties must have a 'type' that derives from their base property's 'type'.");

            this._typeMeta = typeMeta;
          }
        }
      },
      //endregion

      //region value attribute
      _value: null,

      /**
       * The default value of the property.
       *
       * @type pentaho.type.Value | pentaho.type.Value[] | null
       */
      get value() {
        return this._value;
      },

      set value(value) {
        // TODO
        this._value = value;
      },
      //endregion

      //region label attribute
      // default is a Capitalization of name
      _resetLabel: function() {
        this._label = text.titleFromName(this.name);
      },
      //endregion

      //region countMin attribute
      _countMin: 0,
      _countMinEval: F.constant(0),

      /**
       * Gets or sets whether a property is required.
       *
       * A non-negative integer.
       *
       * A _required_ property must have at least one value.
       * {@link pentaho.type.Property#countMin} is greater than one.
       *
       * Gets a non-null value only when `countMin` is also a constant non-null value.
       *
       * @type null | number | (function(this:pentaho.type.Complex) : number)
       */
      get required() {
        var countMin = this.countMin;
        return countMin == null || F.is(countMin) ? null : (countMin > 0);
      },

      set required(value) {
        if(this === _propMeta) return;

        if(value == null) {
          // Reset local value
          delete this._countMin;
          delete this._countMinEval;
        } else {
          this._countMin = value;
          this._countMinEval = this._countMinCombine(
              Object.getPrototypeOf(this)._countMinEval, // "Escape" local value, if any.
              F.to(value));
        }
      },

      /**
       * Evaluates the value of `required` attribute of this property
       * on a given owner complex value.
       *
       * @param {pentaho.type.Complex} owner The complex value that owns the property.
       * @return {number} The evaluated value of the `required` attribute.
       */
      requiredEval: function(owner) {
        return this.countMinEval(owner) > 0;
      },

      //endregion

      //endregion

      //region value accessor
      _createValueAccessor: function() {
        var mesa = this._declaringMeta.mesa,
            name = this._name,
            namePriv = this._namePriv;
            //nameFormattedPriv = name + "Formatted";

        if((name in mesa) || (namePriv in mesa)/* || (nameFormattedPriv in mesa)*/)
          throw error.argInvalid("name", "Property cannot have name '" + name + "' cause it's reserved.");

        // Receives a `Property` instance (see `Complex#constructor`).
        //mesa[namePriv] = new Property( ... );

        Object.defineProperty(mesa, name, {
          configurable: true,

          get: function propertyValueGetter() {
            return this[namePriv].value;
            //var value = this[namePriv].value;
            //return value && value.valueOf();
          },

          set: function propertyValueSetter(value) {
            this[namePriv].value = value;
          }
        });
        /*
        Object.defineProperty(mesa, name + "Formatted", {
          configurable: true,

          get: function propertyFormattedGetter() {
            var value = this[namePriv].value;
            return value && value.toString();
          }
        });
        */
      },
      //endregion

      // Configuration support
      set attrs(attrSpecs) {
        Object.keys(attrSpecs).forEach(function(name) {
          this._dynamicAttribute(name, attrSpecs[name]);
        }, this);
        return this;
      },

      _dynamicAttribute: function(name, spec) {
        var cast = spec.cast,
            dv = spec.value,
            combine = spec.combine,
            namePriv = "_" + name,
            namePrivEval = namePriv + "Eval",
            root = this;

        this[namePriv] = dv; // assumed already cast
        this[namePrivEval] = F.constant(dv);

        Object.defineProperty(this, name, {
          get: function() {
            return O.getOwn(this, namePriv);
          },
          set: function(value) {
            // cannot change the root value
            if(this === root) return;

            if(value == null) {
              // Reset local values
              delete this[namePriv];
              delete this[namePrivEval];
            } else {
              var fValue;
              if(F.is(value)) {
                fValue = value;
                if(cast) fValue = wrapWithCast(fValue, cast.bind(this), dv);
              } else {
                value = cast ? cast.call(this, value, dv) : value;
                fValue = F.constant(value);
              }

              this[namePriv] = value;
              this[namePrivEval] = combine.call(
                  this,
                  Object.getPrototypeOf(this)[namePrivEval], // "Escape" local value, if any.
                  fValue);
            }
          }
        });

        this[name + "Eval"] = function(owner) {
          return this[namePrivEval].call(owner);
        };
      }
    } // end instance meta:
  }).implement({
    meta: {
      attrs: {
        /**
         * Evaluates the value of the `countMin` attribute of this property
         * on a given owner complex value.
         *
         * @name countMinEval
         * @memberOf pentaho.type.Property.Meta#
         * @param {pentaho.type.Complex} owner The complex value that owns the property.
         * @return {number} The evaluated value of the `countMin` attribute.
         */

        /**
         * Gets or sets the minimum number of values that a property of this type can have.
         *
         * A non-negative integer.
         * When the property is _not_ a {@link pentaho.type.Property#list} property,
         * the value clamped to not being greater than one.
         *
         * The effective value is the **maximum** between that specified and
         * the evaluated value of the ancestor property.
         *
         * The `countMin`value is a non-negative integer.
         *
         * @name countMin
         * @memberOf pentaho.type.Property.Meta#
         * @type number | (function(this:pentaho.type.Complex) : number)
         * @see pentaho.type.Property.Meta#countMinEval
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
         * Gets or sets the maximum number of values that a property of this type must have.
         *
         * The effective value is the **minimum** between that specified and
         * the evaluated value of the ancestor property.
         *
         * The `countMax` value is constrained to be greater than or equal to the
         * value of {@link pentaho.type.Property.Meta#countMin}.
         * However, that constraint is not enforced in the value of this property,
         * but only upon evaluation, by {@link pentaho.type.Property.Meta#countMaxEval}.
         *
         * @name countMax
         * @memberOf pentaho.type.Property.Meta#
         * @type number | (function(this:pentaho.type.Complex) : number)
         * @see pentaho.type.Property.Meta#countMaxEval
         */
        countMax: {
          value: Infinity,
          cast:  castCount,
          combine: function(baseEval, localEval) {
            return function() {
              return Math.min(baseEval.call(this), localEval.call(this));
            };
          }
        }
      }
    }
  }).implement({

    // Override the auto/ generated method (by the above attrs declaration)
    // to implement the >= countMin constraint.

    /**
     * Evaluates the value of the `countMax` attribute of this property
     * on a given owner complex value.
     *
     * The `countMax` value is constrained to be greater than or equal to the
     * value of {@link pentaho.type.Property.Meta#countMin}.
     * When the argument `countMin` is specified,
     * it is used to constraint the evaluated value of `countMax`.
     * Otherwise, the `countMin` attribute is evaluated, internally,
     * and used to apply the constraint.
     *
     * @name countMaxEval
     * @memberOf pentaho.type.Property.Meta#
     * @param {pentaho.type.Complex} owner The complex value that owns the property.
     * @param {number} [countMin] The evaluated value of the `countMin` attribute, on the same owner.
     * @return {number} The evaluated value of the `countMax` attribute.
     */
    countMaxEval: function(owner, countMin) {
      if(countMin == null) countMin = this.countMinEval(owner);
      return Math.max(countMin, this.base(owner));
    }
  });

  _propMeta = Property.meta;

  return Property;

  function nonEmptyString(value) {
    return value == null ? null : (String(value) || null);
  }

  function wrapWithCast(fun, cast) {
    return function() {
      var v = fun.call(this, arguments);
      return v == null ? null : cast(v);
    };
  }

  function castCount(v, dv) {
    v = +v;
    v = isNaN(v) || v < 0 ? dv : Math.floor(v);
    if(!this.list && v > 1) v = 1;
    return v;
  }
});
