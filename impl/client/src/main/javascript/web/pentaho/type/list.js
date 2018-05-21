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
  "pentaho/module!",
  "./Value",
  "./Element",
  "./mixins/Container",
  "./changes/ListChangeset",
  "./util",
  "./SpecificationContext",
  "./_baseLoader",
  "pentaho/i18n!types",
  "pentaho/util/arg",
  "pentaho/util/error",
  "pentaho/util/object"
], function(module, Value, Element, ContainerMixin, ListChangeset,
            typeUtil, SpecificationContext, baseLoader,
            bundle, arg, error, O) {

  "use strict";

  var __listType;

  /**
   * @name pentaho.type.ListType
   * @class
   * @extends pentaho.type.ValueType
   *
   * @classDesc The base type class of plural value types.
   *
   * For more information see {@link pentaho.type.List}.
   */

  /**
   * @alias List
   * @memberOf pentaho.type
   * @class
   * @extends pentaho.type.Value
   * @extends pentaho.type.mixins.Container
   *
   * @amd pentaho/type/List
   *
   * @classDesc The base class of plural values.
   *
   * A list is an ordered set of [elements]{@link pentaho.type.Element} of
   * a [common, base type]{@link pentaho.type.ListType#of}.
   *
   * @description Creates a list instance.
   *
   * When a derived class overrides the constructor
   * and creates additional instance properties,
   * the {@link pentaho.type.List#_initClone} method should
   * also be overridden to copy those properties.
   *
   * @constructor
   * @param {pentaho.type.spec.List|pentaho.type.List|Array.<pentaho.type.Element>} [instSpec] The
   * list specification or a compatible list instance or element's array.
   * @param {Object} [keyArgs] - The keyword arguments.
   * @param {boolean} [keyArgs.isBoundary=false] - Indicates if the list should be a _boundary list_.
   * @param {boolean} [keyArgs.isReadOnly=false] - Indicates if the list should be a _read-only list_.
   *
   * @throws {pentaho.lang.ArgumentInvalidTypeError} When the type of `instSpec` is not
   * {@link Object}, {@link Array} or {@link pentaho.type.List}.
   *
   * @see pentaho.type.Element
   * @see pentaho.type.spec.IList
   * @see pentaho.type.spec.IListType
   */
  var List = Value.extend(/** @lends pentaho.type.List# */{

    constructor: function(instSpec, keyArgs) {

      this._initContainer();

      // @internal
      this.__elems = [];
      // @internal
      this.__keys  = {};

      if(keyArgs) {
        if(keyArgs.isBoundary) this.__isBoundary = true;
        if(keyArgs.isReadOnly) this.__isReadOnly = true;
        if(keyArgs.needReadOnlyElementValidation) this.__needReadOnlyElementValidation = true;
      }

      if(instSpec != null) {
        var elemSpecs = __listType.__getElementSpecsFromInstanceSpec(instSpec);
        if(elemSpecs != null) {
          this.__load(elemSpecs);
        }
      }
    },

    __load: function(elemSpecs) {
      var isBoundary = this.__isBoundary;
      var i = -1;
      var L = elemSpecs.length;
      var elemType = this.$type.elementType;
      var elems = this.__elems;
      var keys  = this.__keys;
      var elem;
      var key;
      var needReadOnlyElementValidation = this.__needReadOnlyElementValidation;

      while(++i < L) {
        if((elem = elemType.to(elemSpecs[i])) != null && !O.hasOwn(keys, (key = elem.$key))) {
          if(needReadOnlyElementValidation && !elem.$type.isReadOnly) {
            throw new TypeError("List requires elements of a read-only type.");
          }

          elems.push(elem);
          keys[key] = elem;

          if(!isBoundary && elem.__addReference) elem.__addReference(this);
        }
      }
    },

    /**
     * Gets a value that indicates if this list requires validation that the type of each element is read-only.
     *
     * @type {boolean}
     * @private
     */
    __needReadOnlyElementValidation: false,

    // region $isReadOnly
    __isReadOnly: false,

    /**
     * Gets a value that indicates if this list is read-only.
     *
     * @type {boolean}
     * @readOnly
     */
    get $isReadOnly() {
      return this.__isReadOnly;
    },

    /**
     * Asserts that the list can be changed, throwing an error if not.
     *
     * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     *
     * @private
     */
    __assertEditable: function() {
      if(this.__isReadOnly) {
        throw new TypeError("The list is read-only.");
      }
    },
    // endregion

    // region $isBoundary
    __isBoundary: false,

    /**
     * Gets a value that indicates if this list is a _boundary list_.
     *
     * A boundary list isolates the list holder from the list's elements.
     *
     * The validity of a _boundary list_ is not affected by the validity of its elements.
     * Changes within the elements of _boundary list_ do not bubble to it.
     *
     * @type {boolean}
     * @readOnly
     */
    get $isBoundary() {
      return this.__isBoundary;
    },
    // endregion

    /**
     * Clones the data structures that store elements.
     *
     * @param {!Object} clone - The list clone.
     * @param {boolean} [useCommitted=false] Indicates that the committed version is desired.
     * @return {!Object} The specified clone object.
     *
     * @private
     * @internal
     * @friend {pentaho.type.changes.ListChangeset}
     * @see pentaho.type.changes.ListChangeset#__projectedMock
     */
    _cloneElementData: function(clone, useCommitted) {
      var mock = useCommitted ? this : this.__projectedMock;
      clone.__elems = mock.__elems.slice();
      clone.__keys  = O.assignOwnDefined({}, mock.__keys);
      return clone;
    },

    /**
     * Gets a mock projection of the updated list value.
     *
     * When there are no changes, the owner list is returned.
     * Otherwise, a projected mock containing only
     * the elements' data structures is created and returned.
     *
     * @type {!Object|!pentaho.type.List}
     * @readOnly
     * @private
     * @internal
     * @see pentaho.type.changes.ListChangeset#__projectedMock
     */
    get __projectedMock() {
      var cset;
      return (cset = this.__cset) ? cset.__projectedMock : this;
    },

    /**
     * Gets the key of the list value.
     *
     * The default list implementation, returns the value of the
     * list instance's {@link pentaho.type.List#$uid}.
     *
     * @type {string}
     * @readonly
     */
    get $key() {
      return this.$uid;
    },

    /**
     * Gets the number of elements in the list.
     *
     * @type {number}
     * @readonly
     */
    get count() {
      return this.__projectedMock.__elems.length;
    },

    /**
     * Gets the element at a specified index, or `null`.
     *
     * @param {number} index - The desired index.
     * @return {pentaho.type.Element} The element value or `null`.
     */
    at: function(index) {
      if(index == null) throw error.argRequired("index");
      return this.__projectedMock.__elems[index] || null;
    },

    /**
     * Gets a value that indicates if an element with a given key is present in the list.
     *
     * @param {string|any} key - The element's key.
     *
     * @return {boolean} `true` if an element with the given key is present in the list; `false`, otherwise.
     */
    has: function(key) {
      return key != null &&
          (key = this.__castKey(key)) != null &&
          O.hasOwn(this.__projectedMock.__keys, key);
    },

    /**
     * Gets a value that indicates if a given element is present in the list.
     *
     * @param {pentaho.type.Element} elem - The element to test.
     *
     * @return {boolean} `true` if the element is present in the list; `false`, otherwise.
     */
    includes: function(elem) {
      return elem != null && this.get(elem.$key) === elem;
    },

    /**
     * Gets the index of a given element in the list.
     *
     * @param {pentaho.type.Element} elem - The element whose index to determine.
     *
     * @return {number} `true` if the element is present in the list; `false`, otherwise.
     */
    indexOf: function(elem) {
      return elem != null && this.has(elem.$key) ? this.__projectedMock.__elems.indexOf(elem) : -1;
    },

    /**
     * Gets the element having a specified key value, if any, or `null`.
     *
     * @param {string|any} key - The element's key.
     *
     * @return {pentaho.type.Element} The corresponding element or `null`.
     */
    get: function(key) {
      // jshint laxbreak:true
      return (key != null && (key = this.__castKey(key)) != null)
        ? O.getOwn(this.__projectedMock.__keys, key, null)
        : null;
    },

    /**
     * Adds, removes, moves and/or updates elements to the element list.
     *
     * The element or elements specified in argument `fragment`
     * are converted to the list's element class.
     *
     * @param {any|Array} fragment - The element or elements to set.
     *
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * @param {boolean} [keyArgs.noAdd=false] Prevents adding new elements to the list.
     * @param {boolean} [keyArgs.noRemove=false] Prevents removing elements not present in `fragment` from the list.
     * @param {boolean} [keyArgs.noMove=false] Prevents moving elements inside the list.
     * @param {boolean} [keyArgs.noUpdate=true] Prevents updating elements already present in the list.
     *
     * @param {number} [keyArgs.index] The index at which to add new elements.
     * When unspecified, new elements are appended to the list.
     * This argument is ignored when `noAdd` is `true`.
     *
     * @throws {TypeError} When a change would occur and the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     */
    set: function(fragment, keyArgs) {

      this.__set(
        fragment,
        !arg.optional(keyArgs, "noAdd"),
        !arg.optional(keyArgs, "noUpdate", true),
        !arg.optional(keyArgs, "noRemove"),
        !arg.optional(keyArgs, "noMove"),
        arg.optional(keyArgs, "index"));
    },

    /**
     * Adds one or more elements to the _end_ of the list.
     *
     * The element or elements specified in argument `fragment`
     * are converted to the list's element class.
     *
     * @param {any|Array} fragment - Value or values to add.
     *
     * @throws {TypeError} When a change would occur and the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     */
    add: function(fragment) {
      this.__set(fragment, /* add: */true, /* update: */false, /* remove: */false, /* move: */false);
    },

    /**
     * Inserts one or more elements, starting at the given index.
     *
     * If `index` is negative,
     * it means the position at that many elements from the end (`index' = count - index`).
     *
     * When the index is greater than or equal to the length of the list,
     * the element or elements are appended to the list.
     *
     * @param {any|Array} fragment - Element or elements to add.
     * @param {number} index - The index at which to start inserting new elements.
     *
     * @throws {TypeError} When a change would occur and the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     */
    insert: function(fragment, index) {
      this.__set(
        fragment, /* add: */true, /* update: */false, /* remove: */false, /* move: */false, /* index: */index);
    },

    /**
     * Removes one or more elements from the list.
     *
     * Specified elements that are not present in the list are ignored.
     *
     * @param {any|Array} fragment - Element or elements to remove.
     *
     * @throws {TypeError} When a change would occur and the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     */
    remove: function(fragment) {

      this.__usingChangeset(function(cset) {
        cset.__remove(fragment);
      });
    },

    /**
     * Moves an element to a new position.
     *
     * @param {any} elemSpec - An element specification.
     * @param {number} indexNew - The new index of the element.
     *
     * @throws {TypeError} When a change would occur and the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     */
    move: function(elemSpec, indexNew) {

      this.__usingChangeset(function(cset) {
        cset.__move(elemSpec, indexNew);
      });
    },

    /**
     * Removes one or more elements from the list,
     * given the start index and the number of elements to remove.
     *
     * If `count` is {@link Nully} or omitted, it defaults to `1`.
     * If `count` is less than `1`, nothing is removed.
     * If `start` is not less than the number of elements in the list, nothing is removed.
     * If `start` is negative,
     * it means to start removing that many elements from the end (`start' = length - start`).
     *
     * @param {number} start - The index at which to start removing.
     * @param {number} [count=1] The number of elements to remove.
     *
     * @throws {TypeError} When a change would occur and the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     */
    removeAt: function(start, count) {

      this.__usingChangeset(function(cset) {
        cset.__removeAt(start, count);
      });
    },

    /**
     * Sorts the elements of the list using the given comparer function.
     *
     * @param {function(pentaho.type.Element, pentaho.type.Element) : number} comparer - The comparer function.
     *
     * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     */
    sort: function(comparer) {

      this.__usingChangeset(function(cset) {
        cset.__sort(comparer);
      });
    },

    /**
     * Removes all elements from the list.
     *
     * @throws {TypeError} When a change would occur and the list is [read-only]{@link pentaho.type.List#$isReadOnly}.
     */
    clear: function() {

      this.__usingChangeset(function(cset) {
        cset.__clear();
      });
    },

    /**
     * Creates an array with the elements of the list or values derived from each element.
     *
     * @param {function(pentaho.type.Element):any} [map] A function that converts each element into something else.
     * @param {Object} [ctx] The JS context object on which to call `map`.
     *
     * @return {Array.<any>} An array of elements.
     */
    toArray: function(map, ctx) {
      var elems = this.__projectedMock.__elems;
      return map ? elems.map(map, ctx) : elems.slice();
    },

    /**
     * Calls a function for each element of the list.
     *
     * @param {function(pentaho.type.Element, number, pentaho.type.List) : boolean?} fun - The mapping function.
     * Return `false` to break iteration.
     *
     * @param {Object} [ctx] The JS context object on which `fun` is called.
     */
    each: function(fun, ctx) {
      var elems = this.__projectedMock.__elems;
      var L = elems.length;
      var i = -1;

      while(++i < L)
        if(fun.call(ctx, elems[i], i, this) === false)
          break;
    },

    /**
     * Casts a value for use as a lookup key and returns it.
     *
     * @param {any} value - The value from which the key is built.
     *
     * @return {nonEmptyString} The key.
     *
     * @private
     */
    __castKey: function(value) {
      return value.toString();
    },

    /**
     * Casts a value specification to the element type of the list.
     *
     * @param {any} valueSpec - The value.
     *
     * @return {pentaho.type.Element} An element.
     *
     * @private
     * @internal
     */
    __cast: function(valueSpec) {
      return this.$type.__elemType.to(valueSpec);
    },

    // region Core change methods
    // implement abstract pentaho.type.mixins.Container#_createChangeset
    /** @inheritDoc */
    _createChangeset: function(txn) {
      return new ListChangeset(txn, this);
    },

    __set: function(fragment, add, update, remove, move, index) {

      this.__usingChangeset(function(cset) {
        cset.__set(fragment, add, update, remove, move, index);
      });
    },

    /**
     * Configures this list with a given distinct and non-{@link Nully} configuration.
     *
     * This method can only be called when there is an ambient transaction.
     *
     * The argument `config` accepts the same types of values given which
     * a `List` instance can be constructed from.
     *
     * An additional configuration input format is supported,
     * the key map configuration format,
     * in which `config.d` is a map from
     * element keys to element configurations, instead of,
     * an array of element specifications.
     * In this case, each targeted element is individually configured
     * with the corresponding element configuration
     * by using its [configureOrCreate]{@link pentaho.type.Element#configureOrCreate} method.
     * If the latter returns a distinct element,
     * then the original element is replaced in the list.
     *
     * With all of the other configuration formats,
     * a list of element specifications is obtained and
     * passed to the [set]{@link pentaho.type.List#set} method.
     *
     * @param {!pentaho.type.spec.List|!pentaho.type.List|!Array.<!pentaho.type.Element>} config - The list
     * specification or a compatible list instance or element's array.
     *
     * @throws {pentaho.lang.ArgumentInvalidTypeError} When the type of `config` is not
     * {@link Object}, {@link Array} or {@link pentaho.type.List}.
     *
     * @throws {TypeError} When the list would be changed and it is [read-only]{@link pentaho.type.List#$isReadOnly}.
     *
     * @throws {pentaho.lang.ArgumentInvalidError} When `config.d` is an object that contains a key
     * which is not the key of an element in the list.
     *
     * @protected
     * @override
     *
     * @see pentaho.type.Value#configure
     * @see pentaho.type.List#set
     * @see pentaho.type.Complex#_configure
     * @see pentaho.type.Element#configureOrCreate
     */
    _configure: function(config) {

      // assert config !== null && config !== this

      config = this.$type._normalizeInstanceSpec(config);
      // assert config.constructor === Object

      var data = config.d;
      if(data != null) {

        if(data.constructor === Object) {

          O.eachOwn(data, function(elementConfig, key) {

            if(elementConfig != null) {

              var elem = this.get(key);
              if(elem === null) {
                throw error.argInvalid("config", "There is no element with key '" + key + "'.");
              }

              var elem2 = elem._configureOrCreate(elementConfig);
              if(elem2 !== elem) {
                // Replace
                var index = this.indexOf(elem);
                this.removeAt(index, 1);
                this.insert(elem2, index);
              }
            }
          }, this);

        } else if(Array.isArray(data)) {
          this.set(data, {noUpdate: false});
        } else {
          throw error.argInvalidType("config", ["Array", "Object", "pentaho.type.List"], typeof config);
        }
      }
    },

    // endregion

    // region serialization
    /** @inheritDoc */
    toSpecInContext: function(keyArgs) {

      keyArgs = keyArgs ? Object.create(keyArgs) : {};

      // Capture now, before using it below for the elements.
      var listType = this.$type;
      var declaredType;
      var includeType = !!keyArgs.forceType || (!!(declaredType = keyArgs.declaredType) && listType !== declaredType);

      var elemSpecs;

      if(this.count) {
        // Reset.
        keyArgs.forceType = false;

        var elemType = listType.elementType;

        elemSpecs = this.toArray(function(elem) {
          keyArgs.declaredType = elemType; // JIC it is changed by elem.toSpecInContext
          return elem.toSpecInContext(keyArgs);
        });
      } else {
        elemSpecs = [];
      }

      if(includeType)
        return {
          _: listType.toRefInContext(keyArgs),
          d: elemSpecs
        };

      return elemSpecs;
    },
    // endregion

    // region validation
    /**
     * Determines if the given list value is valid.
     *
     * The default implementation validates each element against the
     * list's [element type]{@link pentaho.type.ListType#of}
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
      return this.__projectedMock.__elems.reduce(function(errors, elem) {
        return typeUtil.combineErrors(errors, elem.validate());
      }, null);
    },
    // endregion

    $type: /** @lends pentaho.type.ListType# */{

      /** @inheritDoc */
      _postInit: function() {

        this.base.apply(this, arguments);

        // Force base value inheritance. Cannot change after being set locally...
        if(!O.hasOwn(this, "__elemType")) {

          // noinspection JSUnresolvedVariable
          this.__elemType = this.__elemType;
        }
      },

      id: module.id,

      get isList() { return true; },

      get isContainer() { return true; },

      /**
       * Gets a value that indicates if this type is an _entity_ type.
       *
       * [List]{@link pentaho.type.List} types are inherently non-entity types.
       *
       * @name pentaho.type.ListType#isEntity
       * @type {boolean}
       * @readOnly
       * @see pentaho.type.Value#$key
       * @override
       * @final
       */

      /**
       * Gets a value that indicates
       * whether this type, and all of the types of any contained values, cannot be changed, from the outside.
       *
       * [List]{@link pentaho.type.List} types are never, a priori, and directly read-only.
       * This property is _final_ and always returns `false`.
       *
       * However, if a complex property is read-only and has a list value type,
       * then the value of the property itself, the list instance,
       * is marked [read-only]{@link pentaho.type.List#$isReadOnly}.
       * Also, the [element type]{@link pentaho.type.ListType#of} of a list type can be read-only.
       *
       * @name pentaho.type.ListType#isReadOnly
       * @type {boolean}
       * @readOnly
       * @override
       * @final
       */

      // region of / element type attribute
      __elemType: Element.type,

      /** @inheritDoc */
      get elementType() {
        return this.__elemType;
      },

      /**
       * Gets or sets the type of the elements that this type of list can contain.
       *
       * Must and can only be specified upon definition.
       *
       * Must be a subtype of the ancestor type's `of` type.
       *
       * When set to `undefined`, the operation is ignored.
       *
       * When set to `null`, an error is thrown.
       *
       * @type {pentaho.type.ElementType}
       *
       * @throws {pentaho.lang.OperationInvalidError} When set to a type that is different from
       *   the current local type.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When set to a type that is not a subtype of the
       *   ancestor list type's `of` type.
       *
       * @see pentaho.type.spec.IListType#of
       */
      get of() {
        return this.__elemType;
      },

      // Supports configuration.
      set of(value) {
        if(value === undefined) {
          return;
        }

        if(!value) {
          throw error.argRequired("of");
        }

        // NOTE: one of the problems is determining if two types are equal,
        //  because these can be anonymous types. Equality would have to mean
        //  structurally equal. Because there isn't an equals test,
        //  it cannot be validated that a set is ok as long as the set value does not change.

        var elemType = baseLoader.resolveType(value).type;
        var baseElemType = this.__elemType;

        // Can't use O.setConst cause the configurable: false is inherited
        // and we need to be able to set each local value at least once.
        if(O.hasOwn(this, "__elemType")) {
          if(elemType !== baseElemType) {
            throw error.operInvalid("Property 'of' cannot change.");
          }

          return;
        }

        // Hierarchy consistency
        // Validate that it is a sub-type of the base property's type.
        // This ensures that `of` is an element type...
        if(elemType !== baseElemType && !elemType.isSubtypeOf(baseElemType)) {
          throw error.argInvalid("of", bundle.structured.errors.list.elemTypeNotSubtypeOfBaseElemType);
        }

        // Mark set locally even if it is the same...

        // noinspection JSUnresolvedVariable
        this.__elemType = elemType;

      },
      // endregion

      // region serialization
      /**
       * Normalizes a given non-{@link Nully} value specification.
       *
       * @param {!any} instSpec - The value specification.
       *
       * @return {!any} The normalized value specification.
       *
       * @throws {pentaho.lang.ArgumentInvalidTypeError} When the type of `instSpec` is not
       * {@link Object}, {@link Array} or {@link pentaho.type.List}.
       *
       * @protected
       * @override
       *
       * @see pentaho.type.ValueType#normalizeInstanceSpec
       */
      _normalizeInstanceSpec: function(instSpec) {

        if(instSpec.constructor === Object) {
          return instSpec;
        }

        if(Array.isArray(instSpec)) {
          return {d: instSpec};
        }

        if(instSpec instanceof List) {
          return {d: instSpec.__elems};
        }

        throw error.argInvalidType("instSpec", ["Array", "Object", "pentaho.type.List"], typeof instSpec);
      },

      /**
       * Obtains the array of elements' specifications given the list instance specification.
       *
       * @param {pentaho.type.spec.List|pentaho.type.List|Array.<pentaho.type.Element>} [instSpec] The
       * list specification or a compatible list instance or element's array.
       *
       * @return {Array.<pentaho.type.Element|pentaho.type.spec.Element>} The array of elements, possibly `null`.
       *
       * @throws {pentaho.lang.ArgumentInvalidTypeError} When the type of `instSpec` is not
       * {@link Object}, {@link Array} or {@link pentaho.type.List}.
       *
       * @private
       * @internal
       */
      __getElementSpecsFromInstanceSpec: function(instSpec) {

        if(Array.isArray(instSpec)) {
          return instSpec;
        }

        if(instSpec.constructor === Object) {
          return Array.isArray(instSpec.d) ? instSpec.d : null;
        }

        if(instSpec instanceof List) {
          return instSpec.__elems;
        }

        throw error.argInvalidType("instSpec", ["Array", "Object", "pentaho.type.List"], typeof instSpec);
      },

      // * "list" has an id and toRefInContext immediately returns that
      // * ["string"] -> anonymous list type, equivalent to {base: "list", of: "string"}
      //   toRefInContext calls the toSpecInContext, cause it has no id and because a temporary id is also
      //   never generated to it, in scope
      //   toSpecInContext only can return this form if there are no other local list class attributes
      /** @inheritDoc */
      toSpecInContext: function(keyArgs) {
        if(!keyArgs) keyArgs = {};

        // The type's id or the temporary id in this scope.
        var baseType = this.ancestor;
        var spec = {
          id: this.shortId,
          base: baseType.toRefInContext(keyArgs)
        };

        // Add "of" if we're `List` or the base `of` is different.
        var baseElemType = baseType.isSubtypeOf(List.type) ? baseType.__elemType : null;
        if(!baseElemType || this.__elemType !== baseElemType) {
          spec.of = this.__elemType.toRefInContext(keyArgs);
        }

        // No other attributes, no id and base is "list"?
        if(!this._fillSpecInContext(spec, keyArgs) && !spec.id && spec.base === "list") {

          if(!spec.of) spec.of = this.__elemType.toRefInContext(keyArgs);

          return [spec.of];
        }

        // Need id
        if(!spec.id) spec.id = SpecificationContext.current.add(this);

        return spec;
      }
      // endregion
    }
  })
  .implement(ContainerMixin)
  .implement(/** @lends pentaho.type.List# */{
    /** @inheritDoc */
    _initClone: function(clone) {
      this.base(clone);
      this._cloneElementData(clone);
    }
  })
  .localize({$type: bundle.structured.List})
  .configure({$type: module.config});

  __listType = List.type;

  return List;
});
