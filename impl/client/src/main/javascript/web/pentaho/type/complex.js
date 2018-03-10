/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "./PropertyTypeCollection",
  "./util",
  "./mixins/Container",
  "../lang/ActionResult",
  "../lang/UserError",
  "./changes/ComplexChangeset",
  "../i18n!types",
  "../util/object",
  "../util/error",
  "../util/fun"
], function(PropertyTypeCollection, typeUtil,
            ContainerMixin, ActionResult, UserError,
            ComplexChangeset, bundle, O, error, F) {

  "use strict";

  var O_hasOwn = Object.prototype.hasOwnProperty;
  var PROP_VALUE_DEFAULT = 0;
  var PROP_VALUE_SPECIFIED = 1;

  // TODO: self-recursive complexes won't work if we don't handle them specially:
  // Component.parent : Component
  // Will cause requiring Component during it's own build procedure...
  // Need to recognize requests for the currently being built _top-level_ complex in a special way -
  // the one that cannot be built and have a module id.

  return ["value", "element", "property", function(Value, Element) {

    var valueType = Value.type;

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
     * @extends pentaho.type.mixins.Container
     *
     * @amd {pentaho.type.spec.UTypeModule<pentaho.type.Complex>} pentaho/type/complex
     *
     * @classDesc The base class of structured values.
     *
     * Example complex type:
     * ```js
     * define(function() {
     *
     *   return ["pentaho/type/complex", function(Complex) {
     *
     *     return Complex.extend({
     *       $type: {
     *         props: [
     *           {name: "name", valueType: "string", label: "Name"},
     *           {name: "categories", valueType: ["string"], label: "Categories"},
     *           {name: "price", valueType: "number", label: "Price"}
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
     * the {@link pentaho.type.Complex#_initClone} method should also be overridden to copy those properties.
     *
     * @constructor
     * @param {pentaho.type.spec.UComplex} [spec] A complex specification.
     *
     * @see pentaho.type.Simple
     * @see pentaho.type.spec.IComplex
     * @see pentaho.type.spec.IComplexProto
     * @see pentaho.type.spec.IComplexTypeProto
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
       * @param {pentaho.type.spec.UComplex} [spec] A complex specification.
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
       * We could, however, not addRef is the prop (and, thus, the list) is also isReadOnly?
       *
       * @param {!pentaho.type.Property.Type} propType - The property type.
       * @param {!pentaho.type.mixins.Container} value - The container value.
       *
       * @private
       */
      __initPropertyValueRelation: function(propType, value) {

        if(propType.isList || !propType.isBoundary) {
          value.__addReference(this, propType);
        }
      },

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
       * @param {!pentaho.type.Complex} other - An equal complex value to test for content-equality.
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
       * @param {string|!pentaho.type.Property.Type} [name] The property name or type object.
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
       * @param {string|!pentaho.type.Property.Type} [name] The property name or type object.
       * @return {boolean} Returns `true` if the property has been defaulted; `false`, otherwise.
       */
      isDefaultedOf: function(name) {
        var pType = this.$type.get(name);
        return this.__getAmbientStateByType(pType) === PROP_VALUE_DEFAULT;
      },

      // @internal friend Property.Type
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

      /**
       * Sets the value of a property.
       *
       * @param {nonEmptyString|!pentaho.type.Property.Type} name - The property name or type object.
       * @param {any?} [valueSpec=null] A value specification.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When a property with name `name` is not defined.
       * @throws {TypeError} When property is read-only.
       *
       * @fires "will:change"
       * @fires "did:change"
       * @fires "rejected:change"
       */
      set: function(name, valueSpec) {
        var propType = this.$type.get(name);

        if(propType.isReadOnly) throw new TypeError("'" + name + "' is read-only");

        if(propType.isList)
          // Delegate to List#set.
          this.__values[propType.name].set(valueSpec);
        else
          ComplexChangeset.__setElement(this, propType, valueSpec);
      },

      /** @inheritDoc */
      _configure: function(config) {
        this.__usingChangeset(function() {

          if(config instanceof Complex) {

            // TODO: should copy only the properties of the LCA type?

            // Copy common properties, if it is a subtype of this one.
            if(config.$type.isSubtypeOf(this.$type))
              this.$type.each(function(propType) {
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
      // endregion

      // region As List
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
       * @param {string|!pentaho.type.Property.Type} name - The property name or type object.
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
       * @param {string|pentaho.type.Property.Type} name - The property name or property type object.
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
       * @param {string|pentaho.type.Property.Type} name - The property name or type object.
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
       * @param {string|pentaho.type.Property.Type} [name] The property name or type object.
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
       * @param {string|pentaho.type.Property.Type} [name] The property name or type object.
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
          if(includeType) spec._ = this.$type.toRefInContext(keyArgs);

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

              // If a value ends up not being serializable (see ./function)
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

      $type: /** @lends pentaho.type.Complex.Type# */{

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

        alias: "complex",

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
         * implicitly marked [read-only]{@link pentaho.type.Property.Type#isReadOnly}.
         * When the [valueType]{@link pentaho.type.Property.Type#valueType} of a property
         * is an element type, it must be a read-only type.
         * When the `valueType` of a property is a list type, then its
         * [element type]{@link pentaho.type.List.Type#of} must be read-only.
         *
         * @type {boolean}
         * @readOnly
         */
        get isReadOnly() {
          return this.__isReadOnly;
        },
        // endregion
        // region properties property
        __props: null,

        // Used for configuration only.
        set props(propSpecs) {
          this.__getProps().configure(propSpecs);
        }, // jshint -W078

        // @internal
        __getProps: function() {
          // Always get/create from/on the class' prototype.
          // Lazy creation.
          var proto = this.constructor.prototype;
          return O.getOwn(proto, "__props") ||
            (proto.__props = PropertyTypeCollection.to([], /* declaringType: */this));
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
         * @return {?pentaho.type.Property.Type} The property type object, or `null`.
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
         * @param {function(pentaho.type.Property.Type, number, pentaho.type.Complex) : boolean?} f
         * The mapping function. Return `false` to break iteration.
         *
         * @param {Object} [x] The JS context object on which `f` is called.
         *
         * @return {!pentaho.type.Complex} This object.
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
         * Adds, overrides or configures properties to/of the complex type.
         *
         * @param {pentaho.type.spec.IPropertyTypeProto|pentaho.type.spec.IPropertyTypeProto[]} propTypeSpec
         * - A property type specification or an array of them.
         *
         * @return {pentaho.type.Complex} This object.
         */
        add: function(propTypeSpec) {
          if(!Array.isArray(propTypeSpec)) propTypeSpec = [propTypeSpec];
          this.__getProps().configure(propTypeSpec);
          return this;
        },

        // region validation
        // @override
        /**
         * Determines if the given complex value is a **valid instance** of this type.
         *
         * The default implementation
         * validates each property's value against
         * the property's [valueType]{@link pentaho.type.Property.Type#valueType}
         * and collects and returns any reported errors.
         * Override to complement with a type's specific validation logic.
         *
         * You can use the error utilities in {@link pentaho.type.Util} to
         * help in the implementation.
         *
         * @param {!pentaho.type.Value} value - The value to validate.
         *
         * @return {Array.<pentaho.type.ValidationError>} A non-empty array of errors or `null`.
         *
         * @protected
         * @override
         */
        _validate: function(value) {
          var errors = null;

          this.each(function(pType) {
            errors = typeUtil.combineErrors(errors, pType.validateOn(value));
          });

          return errors;
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
        },
        // endregion

        /**
         * Calls a function for each defined property type that this type shares with another given type
         * and whose value can, in principle, be copied from it.
         *
         * This method finds the lowest common ancestor of both types.
         * If it is a complex type, each of the corresponding local properties is yielded.
         *
         * @param {!pentaho.type.Type} otherType - The other type.
         * @param {function(pentaho.type.Property.Type, number, pentaho.type.Complex) : boolean?} fun -
         * The mapping function. Return `false` to break iteration.
         *
         * @param {Object} [ctx] - The JS context object on which `fun` is called.
         *
         * @return {!pentaho.type.Complex} This object.
         */
        eachCommonWith: function(otherType, fun, ctx) {
          var lca;
          if(otherType.isComplex && (lca = O.lca(this, otherType)) && lca.isComplex) {

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
        }
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
      },

      $type: bundle.structured.complex
    });

    /**
     * Creates a subtype of this one.
     *
     * For more information on class extension, in general,
     * see {@link pentaho.lang.Base.extend}.
     *
     * @name extend
     * @memberOf pentaho.type.Complex
     * @method
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
  }];

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
