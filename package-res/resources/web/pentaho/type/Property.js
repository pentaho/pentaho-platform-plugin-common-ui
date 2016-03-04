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
  "./valueHelper",
  "../i18n!types",
  "../lang/_AnnotatableLinked",
  "../util/arg",
  "../util/error",
  "../util/object",
  "../util/text",
  "../util/fun"
], function(Item, valueHelper, bundle, AnnotatableLinked, arg, error, O, text, F) {

  "use strict";

  var _propertyMeta;
  /**
   * @name pentaho.type.Property
   *
   * @class
   * @extends pentaho.type.Item
   *
   * @classdesc A property of a complex value.
   *
   * The developer is not expected to create instances of this type.
   *
   * @see pentaho.type.Complex
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
   * A _Property_ only exists within a _complex_ item.
   *
   * @description Creates a property metadata instance.
   *
   * This constructor is used internally by the `pentaho/type` package and
   * should not be used directly.
   *
   * @see pentaho.type.Complex
   */
  var Property = Item.extend("pentaho.type.Property", /** @lends pentaho.type.Property# */{

    // TODO: value, members?
    // TODO: p -> AnnotatableLinked.configure(this, config);

    meta: /** @lends pentaho.type.Property.Meta# */{
      // Note: constructor/_init is only called on sub-classes of Property.Meta,
      // and not on Property.Meta itself.

      /**
       * Initializes a property metadata instance, given a property specification.
       *
       * @param {pentaho.type.spec.UPropertyMeta} spec A property name or specification object.
       * @param {!Object} keyArgs Keyword arguments.
       * @param {!pentaho.type.Complex.Meta} keyArgs.declaringMeta The metadata class of the complex type
       *    that declares the property.
       * @param {number} keyArgs.index The index of the property within its complex type.
       * @ignore
       */
      constructor: function(spec, keyArgs) {
        // A singular string property with the specified name.
        if(typeof spec === "string") spec = {name: spec};

        this.base(spec, keyArgs);
      },

      /**
       * Performs initialization tasks that take place before the instance is
       * extended with its spec.
       *
       * @param {pentaho.type.spec.UPropertyMeta} spec A property name or specification object.
       * @param {!Object} keyArgs Keyword arguments.
       * @param {!pentaho.type.Complex.Meta} keyArgs.declaringMeta The metadata class of the complex type
       *    that declares the property.
       * @param {number} keyArgs.index The index of the property within its complex type.
       * @protected
       * @ignore
       */
      _init: function(spec, keyArgs) {

        this.base.apply(this, arguments);

        // TODO: Validate same context as base?

        O.setConst(this, "_declaringMeta", arg.required(keyArgs, "declaringMeta", "keyArgs"));

        if(this.isRoot) O.setConst(this, "_index", keyArgs.index || 0);
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
       * @type pentaho.type.Context
       * @readonly
       */
      get context() {
        return this._declaringMeta.context;
      },
      //endregion

      //region declaringType attribute
      /**
       * Gets the metadata of the complex type that declares this property.
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

      // -> nonEmptyString, Required, Immutable, Root-only.
      _name: undefined,

      /**
       * Gets the name of the property.
       *
       * @type string
       * @readonly
       */
      get name() {
        return this._name;
      },

      /**
       * The `name` attribute can only be set once.
       * The setter is used internally when extending Property, e.g.:
       *
       * var derivedProp = Property.extendProto({name: "xpto"});
       *
       * @ignore
       */
      set name(value) {
        value = nonEmptyString(value);

        if(!value) throw error.argRequired("name");

        if(this.isRoot) {
          // Can only be set-once or cannot change, or throws.
          O.setConst(this, "_name", value);
        } else {
          // Hierarchy consistency
          if(value && value !== this._name)
            throw error.argInvalid("name", "Sub-properties cannot change the 'name' attribute.");
        }
      },
      //endregion

      //region list attribute
      /**
       * Gets a value that indicates if the property is a _list_.
       *
       * A property is a _list_ property if its value type,
       * {@link pentaho.type.Property.Meta#type}, is a list type,
       * i.e., if it is or extends {@link pentaho.type.List}.
       *
       * @type boolean
       * @readonly
       */
      get isList() {
        return this._typeMeta.isList;
      },
      //endregion

      //region (value) element type attribute
      /**
       * The base element type of the _singular_ values that the property can hold.
       *
       * When the property is a list property,
       * that list type's element type,
       * {@link pentaho.type.List.Meta#of},
       * is returned.
       *
       * Otherwise,
       * {@link pentaho.type.Property.type} is returned.
       *
       * @type !pentaho.type.Element.Meta
       * @readonly
       */
      get elemType() {
        var type = this._typeMeta;
        return type.isList ? type.of : type;
      },
      //endregion

      //region (value) type attribute
      /**
       * Gets the base type of the value that the property can hold.
       *
       * @type !pentaho.type.Value.Meta
       * @readonly
       */
      get type() {
        return this._typeMeta;
      },

      /**
       * Sets the type of the value that the property can hold.
       * Note that changing the type does not implicitly enforce a cast of the value to the new type.
       * TODO: review this setter.
       * @ignore
       */
      set type(value) {
        // Resolves types synchronously.
        if(this.isRoot) {
          this._typeMeta = this.context.get(value).meta;
        } else {
          // Can be changed

          // Delete any inherited value.
          delete this._typeMeta;

          if(value != null) {
            var typeMeta = this.context.get(value).meta,
                baseMeta = this._typeMeta;

            // Hierarchy/PreviousValue consistency
            // Validate that it is a sub-type of the base property's type
            // or a refinement type whose `of` is the base type.
            // (which can only happen if baseMeta itself is not a refinement type).
            if(typeMeta !== baseMeta) {
              if(!typeMeta.isSubtypeOf(baseMeta))
                throw error.argInvalid("type", bundle.structured.errors.property.typeNotSubtypeOfBaseType);

              this._typeMeta = typeMeta;
            }
          }
        }
      },
      //endregion

      //region value attribute and methods
      _value: null,

      /**
       * Gets or sets the _default value_ of the property.
       *
       * Setting to `undefined` clears the local value and
       * inherits any base default value.
       *
       * Setting to `null` breaks inheritance
       * and forces not having a _default value_.
       *
       * Any other set values must be _convertible_ to
       * the property's value type, {@link pentaho.type.Property.Meta#type}.
       *
       * The default _default value_ of a property is
       * that of its ancestor property,
       * as long as it is an instance of the local value type,
       * or `null` in any other case.
       *
       * @type ?pentaho.type.Value
       */
      get value() {
        return this._value;
      },

      // TODO: implement safe default value inheritance

      // NOTE: the argument cannot have the same name as the property setter
      // or PhantomJS 1.9.8 will throw a syntax error...
      set value(_) {
        if(_ === undefined) {
          if(this !== _propertyMeta) {
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
       * {@link pentaho.type.Property.Meta#value}.
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
       * Ensures that list properties always have a non-null default.
       *
       * @return {pentaho.type.Value} The fresh default value.
       * @ignore
       */
      _freshDefaultValue: function() {
        var value = this.value;
        return value     ? value.clone()      :
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
       * @return {nonEmptyString}
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
       * {@link pentaho.type.Property.Meta#countMin} and {@link pentaho.type.Property.Meta#countMax}.
       *
       * @param {pentaho.type.Complex} owner The complex value that owns the property.
       * @return {?Array.<!Error>} A non-empty array of `Error` or `null`.
       *
       * @see pentaho.type.Complex.Meta#_validate
       */
      validate: function(owner) {
        var errors = null;

        if(this.applicableEval(owner)) {
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

      //region dynamic attributes
      // Configuration support
      /**
       * Sets the attributes of the property.
       *
       * This setter is used when the developer is extending Property to support new attributes.
       *
       * @type pentaho.type.spec.IPropertyMeta
       * @ignore
       */
      set attrs(attrSpecs) {
        Object.keys(attrSpecs).forEach(function(name) {
          this._dynamicAttribute(name, attrSpecs[name]);
        }, this);
      },

      /**
       * Dynamically defines an attribute and corresponding setter and getter methods.
       *
       * This method is an implementation detail,
       * ans is invoked by {pentaho.type.Property.Meta#attrs}
       *
       * @param {String} name
       * @param {} spec
       * @private
       * @ignore
       */
      _dynamicAttribute: function(name, spec) {
        var cast = spec.cast,
            // default/neutral value
            dv = castAndNormalize(spec.value, cast, null),
            combine = spec.combine,
            namePriv = "_" + name,
            namePrivEval = namePriv + "Eval",
            root = this;

        this[namePriv] = dv;
        this[namePrivEval] = F.constant(dv);

        Object.defineProperty(this, name, {
          get: function() {
            return O.getOwn(this, namePriv);
          },
          set: function(value) {
            // Cannot change the root value
            if(this === root) return;

            if(value == null) {
              // Reset local values
              delete this[namePriv];
              delete this[namePrivEval];
              return;
            }

            var fValue;
            if(F.is(value)) {
              fValue = value;
              if(cast) fValue = wrapWithCast(fValue, cast, dv);
            } else {
              // If the cast failure is found at static time, we opt to inherit.
              // Only at runtime (above wrapWithCast) we turn cast failure into default/neutral value.
              value = castAndNormalize(value, cast, null);
              if(value == null) {
                // Reset local values
                delete this[namePriv];
                delete this[namePrivEval];
                return;
              }

              fValue = F.constant(value);
            }

            this[namePriv] = value;
            this[namePrivEval] = combine.call(
                this,
                Object.getPrototypeOf(this)[namePrivEval], // "Escape" local value, if any.
                fValue);
          }
        });

        this[name + "Eval"] = function(owner) {
          return this[namePrivEval].call(owner);
        };
      }
      //endregion
    } // end instance meta:
  }).implement({
    meta: /** @lends pentaho.type.Property.Meta# */{
      attrs: {
        /**
         * Evaluates the value of the `required` attribute of this property
         * on a given owner complex value.
         *
         * @name requiredEval
         * @memberOf pentaho.type.Property.Meta#
         * @param {pentaho.type.Complex} owner The complex value that owns the property.
         * @return {boolean} The evaluated value of the `required` attribute.
         * @ignore
         */

        /**
         * Gets or sets a value that indicates if a property is required.
         *
         * This attribute is *dynamic*:
         * 1. when a function is specified, it is dynamically evaluated for each complex instance
         * 2. affects only the _local_ value of the attribute metadata
         * 3. inheritance takes place only when the attribute is evaluated
         *    in the context of a given complex instance.
         *
         * A _required_ property must have at least one value.
         *
         * The _effective `required` attribute value_ is the
         * disjunction (_or_) between the locally specified value and
         * the evaluated value inherited from its ancestor.
         *
         * This and other attributes are combined to evaluate the resulting _effective value count range_.
         * See {@link pentaho.type.Property.Meta#countRangeEval}.
         *
         * Setting the attribute to `null` or `undefined` clears the local value.
         *
         * The default, root `required` attribute value is `false`.
         *
         * @name required
         * @memberOf pentaho.type.Property.Meta#
         * @type null | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>
         * @see pentaho.type.Complex#required
         */
        required: {
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
         * Evaluates the value of the `countMin` attribute of this property
         * on a given owner complex value.
         *
         * @name countMinEval
         * @memberOf pentaho.type.Property.Meta#
         * @param {pentaho.type.Complex} owner The complex value that owns the property.
         * @return {number} The evaluated value of the `countMin` attribute.
         * @ignore
         */

        /**
         * Gets or sets the minimum number of values that a property of this type can have.
         *
         * A non-negative integer.
         *
         * This attribute is *dynamic*:
         * 1. when a function is specified, it is dynamically evaluated for each complex instance
         * 2. affects only the _local_ value of the attribute metadata
         * 3. inheritance takes place only when the attribute is evaluated
         *    in the context of a given complex instance.
         *
         * The _effective `countMin` attribute value_ is the
         * maximum of the locally specified value and
         * the evaluated value inherited from its ancestor.
         *
         * This and other attributes are combined to evaluate the resulting _effective value count range_.
         * See {@link pentaho.type.Property.Meta#countRangeEval}.
         *
         * Setting the attribute to `null` or `undefined` clears the local value.
         *
         * The default, root `countMin` attribute value is `0`.
         *
         * @name countMin
         * @memberOf pentaho.type.Property.Meta#
         * @type number | pentaho.type.PropertyDynamicAttribute.<number>
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
         * Evaluates the value of the `countMax` attribute of this property
         * on a given owner complex value.
         *
         * @name countMaxEval
         * @memberOf pentaho.type.Property.Meta#
         * @param {pentaho.type.Complex} owner The complex value that owns the property.
         * @return {number} The evaluated value of the `countMax` attribute.
         * @ignore
         */

        /**
         * Gets or sets the maximum number of values that a property of this type must have.
         *
         * A non-negative integer.
         *
         * This attribute is *dynamic*:
         * 1. when a function is specified, it is dynamically evaluated for each complex instance
         * 2. affects only the _local_ value of the attribute metadata
         * 3. inheritance takes place only when the attribute is evaluated
         *    in the context of a given complex instance.
         *
         * The _effective `countMax` attribute value_ is the
         * minimum of the locally specified value and
         * the evaluated value inherited from its ancestor.
         *
         * This and other attributes are combined to evaluate the resulting _effective value count range_.
         * See {@link pentaho.type.Property.Meta#countRangeEval}.
         *
         * Setting the attribute to `null` or `undefined` clears the local value.
         *
         * The default, root `countMax` attribute value is `Infinity`.
         *
         * @name countMax
         * @memberOf pentaho.type.Property.Meta#
         * @type number | pentaho.type.PropertyDynamicAttribute.<number>
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
         * Evaluates the value of the `applicable` attribute of this property
         * on a given owner complex value.
         *
         * @name applicableEval
         * @memberOf pentaho.type.Property.Meta#
         * @param {pentaho.type.Complex} owner The complex value that owns the property.
         * @return {boolean} The evaluated value of the `applicable` attribute.
         * @ignore
         */

        /**
         * Gets or sets a value or function that indicates if a property is applicable.
         *
         * This attribute is *dynamic*:
         * 1. when a function is specified, it is dynamically evaluated for each complex instance
         * 2. affects only the _local_ value of the attribute metadata
         * 3. inheritance takes place only when the attribute is evaluated
         *    in the context of a given complex instance.
         *
         * The _effective `applicable` attribute value_ is the
         * conjunction (_and_) between the locally specified value and
         * the evaluated value inherited from its ancestor.
         *
         * Setting the attribute to `null` or `undefined` clears the local value.
         *
         * The default, root `applicable` attribute value is `true`.
         *
         * @name applicable
         * @memberOf pentaho.type.Property.Meta#
         *
         * @type null | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>
         * @see pentaho.type.Complex#applicable
         */
        applicable: {
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
         * Evaluates the value of the `readOnly` attribute of this property
         * on a given owner complex value.
         *
         * @name readOnlyEval
         * @memberOf pentaho.type.Property.Meta#
         * @param {pentaho.type.Complex} owner The complex value that owns the property.
         * @return {boolean} The evaluated value of the `readOnly` attribute.
         * @ignore
         */

        /**
         * Gets or sets a value or function that indicates if a property cannot be written to.
         *
         * This attribute is *dynamic*:
         * 1. when a function is specified, it is dynamically evaluated for each complex instance
         * 2. affects only the _local_ value of the attribute metadata
         * 3. inheritance takes place only when the attribute is evaluated
         *    in the context of a given complex instance.
         *
         * A property should be considered read-only whenever its value is implied/imposed somehow
         * and thus cannot not be changed, directly, by the user.
         *
         * The _effective `readOnly` attribute value_ is the
         * disjunction (_or_) between the locally specified value and
         * the evaluated value inherited from its ancestor.
         *
         * Setting the attribute to `null` or `undefined` clears the local value.
         *
         * The default, root `readOnly` attribute value is `false`.
         *
         * @name readOnly
         * @memberOf pentaho.type.Property.Meta#
         * @type null | boolean | pentaho.type.PropertyDynamicAttribute.<boolean>
         * @see pentaho.type.Complex#readOnly
         */
        readOnly: {
          value: false,
          cast:  Boolean,
          combine: function(baseEval, localEval) {
            return function() {
              // localEval is skipped if base is true.
              return baseEval.call(this) || localEval.call(this);
            };
          }
        }
      }, // end attrs:

      /**
       * Evaluates the _effective value count range_ of this property
       * on a given owner complex value.
       *
       * The _effective value count range_ is a conciliation
       * of the _effective value_ of the attributes:
       *
       * * {@link pentaho.type.Property.Meta#isList}
       * * {@link pentaho.type.Property.Meta#required}
       * * {@link pentaho.type.Property.Meta#countMin}
       * * {@link pentaho.type.Property.Meta#countMax}
       *
       * The logic can be best explained by the following
       * simple example function:
       *
       * ```js
       * function evaluateRange(list, isRequiredEf, countMinEf, countMaxEf) {
       *    var min = countMinEf;
       *    var max = countMaxEf;
       *
       *    if(list && min > 1) min = 1;
       *    if(list && max > 1) max = 1;
       *
       *    if(isRequiredEf && min < 1) min = 1;
       *
       *    if(max < min) max = min;
       *
       *    return {min: min, max};
       * }
       * ```
       *
       * When the property is _not_ a {@link pentaho.type.Property#isList} property,
       * the value can only either be zero or one.
       *
       * If the property is _not_ a _list_ property,
       * both the minimum and the maximum can only be either zero or one.
       *
       * If `required` is true, then the minimum must be greater than or equal to one.
       *
       * The `countMax` value is constrained to be greater than or equal to the minimum.
       *
       * @param {pentaho.type.Complex} owner The complex value that owns the property.
       *
       * @return {pentaho.IRange<number>} The evaluated value of the values count range.
       * @see pentaho.type.Complex#countRange
       */
      countRangeEval: function(owner) {
        var required = this.requiredEval(owner),
            countMin = this.countMinEval(owner),
            countMax = this.countMaxEval(owner);

        if(!this.isList) {
          if(countMin > 1) countMin = 1;
          if(countMax > 1) countMax = 1;
        }

        if(required && countMin < 1) countMin = 1;

        if(countMax < countMin) countMax = countMin;

        return {min: countMin, max: countMax};
      }
    } // end meta:
  });

  _propertyMeta = Property.prototype;

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
