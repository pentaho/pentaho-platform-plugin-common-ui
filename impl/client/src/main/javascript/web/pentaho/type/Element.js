/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "./action/Transaction",
  "./_baseLoader",
  "pentaho/i18n!types",
  "pentaho/util/object",
  "pentaho/util/error",
  "pentaho/util/fun"
], function(module, Value, Transaction, baseLoader, bundle, O, error, fun) {

  "use strict";

  var __elemType = null;

  /**
   * @name pentaho.type.ElementType
   * @class
   * @extends pentaho.type.ValueType
   *
   * @classDesc The base type class of *singular* value types.
   *
   * For more information see {@link pentaho.type.Element}.
   */

  /**
   * @name pentaho.type.Element
   * @class
   * @extends pentaho.type.Value
   * @amd pentaho/type/Element
   *
   * @classDesc The base class of singular values.
   *
   * @description Creates an element instance.
   *
   * @see pentaho.type.List
   */
  var Element = Value.extend(/** @lends pentaho.type.Element# */{

    /**
     * Compares this element to another according to its relative order.
     *
     * Execution proceeds as follows:
     * 1. If `other` is {@link Nully}, it is considered to occur _before_ this one;
     * 2. If `other` is identical to this one, as per JavaScript's `===` operator, it has the same order;
     * 3. If `other` does not have the same constructor as this one, it has the same order;
     * 4. If `other` is [_equals]{@link pentaho.type.Value#_equals} to this one, it has the same order;
     * 5. Otherwise, the operation is delegated to the first value's
     *   [_compare]{@link pentaho.type.Element#_compare} method.
     *
     * @param {pentaho.type.Element|undefined} other - The other element value.
     *
     * @return {number} `-1` if this value is _before_ `other`; `1` if this value is _after_ `other`;
     * `0`, otherwise.
     *
     * @final
     *
     * @see pentaho.type.Element#_compare
     * @see pentaho.type.Value#equals
     */
    compare: function(other) {

      if(other == null) {
        return 1;
      }

      if(other === this || this.constructor !== other.constructor || this._equals(other)) {
        return 0;
      }

      return this._compare(other);
    },

    /**
     * Compares this element to a distinct, non-equal element of the same type according to its relative order.
     *
     * The default implementation does a lexicographical comparison of the elements'
     * [keys]{@link pentaho.type.Value#$key}.
     *
     * @param {pentaho.type.Element} other - The other element value.
     *
     * @return {number} `-1` if this value is _before_ `other`; `1` if this value is _after_ `other`;
     * `0`, otherwise.
     *
     * @protected
     *
     * @see pentaho.type.Element#compare
     * @see pentaho.type.Value#equals
     */
    _compare: function(other) {
      return fun.compare(this.$key, other.$key);
    },

    // region element configuration
    /**
     * Configures this value with a given configuration, if it is possible.
     * Otherwise creates and returns a new value based on this one, but with the configuration applied.
     *
     * If the given configuration is {@link Nully} or identical to `this`, then `this` is immediately returned.
     * Otherwise,
     * this method ensures that a transaction exists and
     * delegates to the [_configureOrCreate]{@link pentaho.type.Element#_configureOrCreate} method.
     *
     * This method considers configuration to not be possible in the following situations:
     *
     * 1. this instance is of a [read-only]{@link pentaho.type.ValueType#isReadOnly} type;
     * 2. `config` is of an [isEntity]{@link pentaho.type.Value#isEntity} type and is
     *     not [equals]{@link pentaho.type.Value#equals} to this value;
     * 3. `config` is not an instance of an [isEntity]{@link pentaho.type.Value#isEntity} type
     *     but is an instance of [Value]{@link pentaho.type.Value} and its constructor is not the same as this;
     * 4. `config` is not an instance of  `Value` - it is a specification and:
     *    4.1. it contains an inline type property, `_`, identifying a different type than that of this instance;
     *    4.2. this instance is of an `isEntity` type and `config` contains key properties that
     *         reference another entity.
     *
     * If configuration is considered possible,
     * the actual configuration is delegated to the [configure]{@link pentaho.type.Value#configure} method.
     *
     * @param {*} config - The value configuration.
     *
     * @return {pentaho.type.Element} `this` value, if the configuration could be applied to it;
     * a new, configured value, if not.
     *
     * @final
     */
    configureOrCreate: function(config) {

      if(config == null || config === this) {
        return this;
      }

      var value;

      Transaction.enter().using(function(scope) {

        value = this._configureOrCreate(config);

        scope.accept();
      }, this);

      return value;
    },

    /**
     * Configures this value with a given distinct and non-{@link Nully} configuration, if it is possible.
     * Otherwise creates and returns a new value based on this one, but with the configuration applied.
     *
     * This method can only be called when there is an ambient transaction.
     *
     * @param {!*} config - The non-{@link Nully} configuration. Assumed distinct from `this`.
     *
     * @return {pentaho.type.Element} `this`, already configured, or a new value.
     *
     * @protected
     * @override
     *
     * @see pentaho.type.Element#configureOrCreate
     * @see pentaho.type.Value#configure
     */
    _configureOrCreate: function(config) {

      var type = this.$type;

      if(config instanceof Value) {
        // Configuration uses a weak form of equality.
        var isEqual = type.isEntity ? this.equals(config) : this.constructor === config.constructor;
        if(!isEqual) {
          return config;
        }

        // Same "entity".
        // assert this.$type.isEntity

        if(type.isReadOnly) {
          return this.equalsContent(config) ? this : config;
        }

        // Same "entity", but possibly != content.

      } else {
        // Config is a specification.

        config = type._normalizeInstanceSpec(config);
        // assert config.constructor === Object
        // config is now a plain object.

        // They cannot be equal if they have different types.

        // In a property that has an abstract valueType,
        // complex.toSpec() will include the inline type of the current value.
        // To achieve no changes when this.configure(this.toSpec()),
        // having an inline type must not unconditionally build a new object.
        if(config._ && baseLoader.resolveType(config._).type !== type) {
          return __create(config);
        }

        // An untyped object specification or one having a type = this.$type.

        var value2;

        if(type.isEntity && type.hasNormalizedInstanceSpecKeyData(config)) {

          // Must create to know if they represent the same entity.
          value2 = __createWithDefaultType(config, type);

          if(!this.equals(value2)) {
            // Config better be a complete specification.
            return value2;
          }

          // Same entity, but possibly != content.
        }

        // !type.isEntity || this.equals(config)

        if(type.isReadOnly) {
          // Cannot configure this.
          value2 = type.createLike(this, config);

          // For entities, this must create an equals entity.
          // assert !type.isEntity || this.equals(value2)

          // Prefer `value` if they have the same content.
          return this.equalsContent(value2) ? this : value2;
        }
      }

      // Can configure value with config.

      this._configure(config);

      return this;
    },
    // endregion

    $type: /** @lends pentaho.type.ElementType# */{
      id: module.id,
      isAbstract: true,

      get isElement() { return true; },

      // region format

      // TODO: recursively inherit? clone? merge on set?

      // -> Optional({}), Inherited, Configurable
      __format: undefined,

      get format() {
        /* istanbul ignore next : not implemented method */
        return this.__format;
      },

      set format(value) {
        /* istanbul ignore next : not implemented method */

        if(value == null) {
          if(this !== __elemType) {
            delete this.__format;
          }
        } else {
          this.__format = value || {};
        }
      },
      // endregion

      // region compareElements method
      /**
       * Compares two element values according to their order.
       *
       * Execution proceeds as follows:
       * 1. If both values are {@link Nully}, they have the same order.
       * 2. Otherwise, if the first value is {@link Nully} (and the second is not), it is _before_ the second one.
       * 3. Othewise, the operation is delegated to the first value's {@link pentaho.type.Element#compare} method.
       *
       * @param {pentaho.type.Element} valueA - The first element value.
       * @param {pentaho.type.Element} valueB - The second element value.
       *
       * @return {number} `-1` if `valueA` is _before_ `valueB`; `1` is `valueA` is _after_ `valueB`; `0`, otherwise.
       */
      compareElements: function(valueA, valueB) {

        // Quick bailout test
        if(valueA == null) return valueB == null ? 0 : -1;

        return valueA.compare(valueB);
      },
      // endregion

      /**
       * Intersects two element arrays whose declared element type is this type.
       *
       * If this type is a simple type,
       * the intersection preserves the instance which has a `formatted` value.
       * When both have one, the elements of `elemsB` are preserved.
       *
       * Removes duplicates of `elemsB`, keeping the first occurrence.
       *
       * @param {Array.<pentaho.type.Element>} elemsA - The previous array of elements.
       * @param {Array.<pentaho.type.Element>} elemsB - The next array of elements.
       *
       * @return {Array.<pentaho.type.Element>} The intersection array, possibly empty.
       *
       * @private
       * @internal
       */
      __intersect: function(elemsA, elemsB) {
        var elemsAByKey = {};
        O.eachOwn(elemsA, function(elemA0) { elemsAByKey[elemA0.$key] = elemA0; });

        // Output order is that of `elemsB`.
        var isSimple = this.isSimple;
        var elemsC = [];
        var elemsCByKey = {};
        var i = -1;
        var countB = elemsB.length;
        while(++i < countB) {
          var elemB = elemsB[i];
          var key = elemB.$key;
          var elemA = O.getOwn(elemsAByKey, key);
          if(elemA && !O.hasOwn(elemsCByKey, key)) {
            // The formatted value of elemB overrides that of elemA. Keep elemB if it has a formatted value.
            var elemC = (!isSimple || elemB.formatted) ? elemB : elemA;
            elemsCByKey[key] = elemC;
            elemsC.push(elemC);
          }
        }

        return elemsC;
      },

      /**
       * Creates a value of this type based on a given value except with a given configuration applied.
       *
       * If this is an entity type,
       * it can only be called if either
       * the given configuration does not contain entity key information or
       * if it contains the same entity key information as the given value.
       *
       * The default implementation obtains the specification of the given value,
       * merges it with the given configuration, and creates a new value from the resulting specification.
       *
       * @param {pentaho.type.Element} value - The value to configure.
       * @param {!*} config - The configuration
       *
       * @return {pentaho.type.Element} The new value.
       *
       * @see pentaho.type.ValueType#isEntity
       * @see pentaho.type.Value#$key
       * @see pentaho.type.Type#hasNormalizedInstanceSpecKeyData
       */
      createLike: function(value, config) {

        // TODO: Caveat: #toSpec can not include all properties by default.
        // TODO: Caveat: aliases of complex properties don't work well this way.

        var valueSpec = value.toSpec();

        // TODO: Use an actual merge...
        O.eachOwn(config, function(value, propName) {
          if(value !== undefined) {
            valueSpec[propName] = value;
          }
        });

        return value.$type.create(valueSpec);
      }
    }
  })
  .localize({$type: bundle.structured.Element})
  .configure({$type: module.config});

  __elemType = Element.type;

  return Element;

  function __createWithDefaultType(instSpec, defaultType) {
    return instSpec._ ? baseLoader.resolveInstance(instSpec) : defaultType.create(instSpec);
  }

  function __create(instSpec) {
    return baseLoader.resolveInstance(instSpec);
  }
});
