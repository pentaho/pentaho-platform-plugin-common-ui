/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "./ContainerMixin",
  "./changes/ListChangeset",
  "./value",
  "./element",
  "./util",
  "./SpecificationContext",
  "../i18n!types",
  "../util/arg",
  "../util/error",
  "../util/object"
], function(module, ContainerMixin, ListChangeset,
            valueFactory, elemFactory, typeUtil, SpecificationContext,
            bundle, arg, error, O) {

  "use strict";

  return function(context) {

    var Value = context.get(valueFactory);
    var Element = context.get(elemFactory);

    /**
     * @name pentaho.type.List.Type
     * @class
     * @extends pentaho.type.Value.Type
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
     * @extends pentaho.type.ContainerMixin
     *
     * @amd {pentaho.type.Factory<pentaho.type.List>} pentaho/type/list
     *
     * @classDesc The base class of plural values.
     *
     * A list is an ordered set of [elements]{@link pentaho.type.Element} of
     * a [common, base type]{@link pentaho.type.List.Type#of}.
     *
     * @description Creates a list instance.
     *
     * When a derived class overrides the constructor
     * and creates additional instance properties,
     * the {@link pentaho.type.List#_clone} method should
     * also be overridden to copy those properties.
     *
     * @constructor
     * @param {pentaho.type.spec.UList} [spec] The list specification or another compatible list instance.
     * @param {Object} [keyArgs] - The keyword arguments.
     * @param {boolean} [keyArgs.isBoundary] - Indicates if the list should be a _boundary list_.
     * @param {boolean} [keyArgs.isReadOnly] - Indicates if the list should be a _read-only list_.
     *
     * @see pentaho.type.Element
     * @see pentaho.type.spec.IList
     * @see pentaho.type.spec.IListProto
     * @see pentaho.type.spec.IListTypeProto
     */
    var List = Value.extend(/** @lends pentaho.type.List# */{

      constructor: function(spec, keyArgs) {

        this._initContainer();

        this._elems = [];
        this._keys  = {};

        if(keyArgs) {
          if(keyArgs.isBoundary) this._isBoundary = true;
          if(keyArgs.isReadOnly) this._isReadOnly = true;
        }

        if(spec != null) {
          // An array of element specs?
          // A plain Object with a `d` array property?
          var elemSpecs =
              Array.isArray(spec) ? spec :
              (spec.constructor === Object && Array.isArray(spec.d)) ? spec.d :
              (spec instanceof List) ? spec._elems :
              null;

          if(elemSpecs) this._load(elemSpecs);
        }
      },

      _load: function(elemSpecs) {
        var isBoundary = this._isBoundary;
        var i = -1;
        var L = elemSpecs.length;
        var elemType = this.type.of;
        var elems = this._elems;
        var keys  = this._keys;
        var elem;
        var key;
        while(++i < L) {
          if((elem = elemType.to(elemSpecs[i])) != null && !O.hasOwn(keys, (key = elem.key))) {
            elems.push(elem);
            keys[key] = elem;

            if(!isBoundary && elem._addReference) elem._addReference(this);
          }
        }
      },

      // region isReadOnly
      _isReadOnly: false,

      /**
       * Gets a value that indicates if this list is read-only.
       *
       * @type {boolean}
       * @readOnly
       */
      get isReadOnly() {
        return this._isReadOnly;
      },

      /**
       * Asserts that the list can be changed, throwing an error if not.
       *
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       *
       * @private
       */
      __assertEditable: function() {
        if(this._isReadOnly) throw new TypeError("The list is read-only.");
      },
      // endregion

      // region isBoundary
      _isBoundary: false,

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
      get isBoundary() {
        return this._isBoundary;
      },
      // endregion

      /**
       * Creates a shallow clone of this list value.
       *
       * All elements are shared with the clone.
       *
       * Ownership is not preserved.
       *
       * If the list is read-only, the clone will not.
       *
       * @return {!pentaho.type.List} The list value clone.
       */
      clone: function() {
        var clone = Object.create(Object.getPrototypeOf(this));
        this._clone(clone);
        return clone;
      },

      _clone: function(clone) {
        this._cloneContainer(clone);
        this._cloneElementData(clone);
      },

      /**
       * Clones the data structures that store elements.
       *
       * @param {!Object} clone - The list clone.
       * @param {boolean} [useCommitted=false] Indicates that the committed version is desired.
       * @return {!Object} The specified clone object.
       *
       * @private
       * @friend {pentaho.type.changes.ListChangeset}
       * @see pentaho.type.changes.ListChangeset#_projectedMock
       */
      _cloneElementData: function(clone, useCommitted) {
        var mock = useCommitted ? this : this._projectedMock;
        clone._elems = mock._elems.slice();
        clone._keys  = O.assignOwnDefined({}, mock._keys);
        return clone;
      },

      // region configuration

      /**
       * Configures a list instance with a given configuration.
       *
       * When `config` is another list, an error is thrown.
       *
       * When `config` is a plain object, its keys are the keys of list elements,
       * which must belong to the list, and the values are the configuration values,
       * which are then passed to the element's [configure]{@link pentaho.type.Element#configure} method.
       *
       * @name pentaho.type.List#configure
       *
       * @param {?any} config - The configuration.
       *
       * @return {!pentaho.type.Value} This instance.
       *
       * @throws {pentaho.lang.ArgumentInvalidError} When `config` is a plain object that contains a key that is
       * not the key of an element in the list.
       *
       * @throws {pentaho.lang.ArgumentInvalidType} When `config` is not a list or a plain object.
       */

      /** @inheritDoc */
      _configure: function(config) {
        this._usingChangeset(function() {

          if(config instanceof List) {
            // TODO: when differences between `configure` and `set` are revisited, try to decide what makes sense here.
            throw error.notImplemented("Behaviour not yet defined.");

          } else if(config.constructor === Object) {

            O.eachOwn(config, function(v, key) {
              var elem = this.get(key);
              if(!elem) throw error.argInvalid("domain", "An element with key '" + key + "' is not defined.");

              elem.configure(v);
            }, this);

          } else {
            throw error.argInvalidType("config", ["pentaho.type.List", "Object"], typeof config);
          }
        });
      },
      // endregion

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
       * @see pentaho.type.changes.ListChangeset#_projectedMock
       */
      get _projectedMock() {
        var cset;
        return (cset = this._cset) ? cset._projectedMock : this;
      },

      /**
       * Gets the key of the list value.
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
       * The default list implementation, returns the value of the
       * list instance's {@link pentaho.type.List#$uid}.
       *
       * @type {string}
       * @readonly
       */
      get key() {
        return this._uid;
      },

      /**
       * Gets the number of elements in the list.
       *
       * @type {number}
       * @readonly
       */
      get count() {
        return this._projectedMock._elems.length;
      },

      /**
       * Gets the element at a specified index, or `null`.
       *
       * @param {number} index - The desired index.
       * @return {?pentaho.type.Element} The element value or `null`.
       */
      at: function(index) {
        if(index == null) throw error.argRequired("index");
        return this._projectedMock._elems[index] || null;
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
            (key = this._castKey(key)) != null &&
            O.hasOwn(this._projectedMock._keys, key);
      },

      /**
       * Gets a value that indicates if a given element is present in the list.
       *
       * @param {pentaho.type.Element} elem - The element to test.
       *
       * @return {boolean} `true` if the element is present in the list; `false`, otherwise.
       */
      includes: function(elem) {
        return elem != null && this.get(elem.key) === elem;
      },

      /**
       * Gets the index of a given element in the list.
       *
       * @param {pentaho.type.Element} elem - The element whose index to determine.
       *
       * @return {number} `true` if the element is present in the list; `false`, otherwise.
       */
      indexOf: function(elem) {
        return elem && this.has(elem.key) ? this._projectedMock._elems.indexOf(elem) : -1;
      },

      /**
       * Gets the element having a specified key value, if any, or `null`.
       *
       * @param {string|any} key - The element's key.
       *
       * @return {?pentaho.type.Element} The corresponding element or `null`.
       */
      get: function(key) {
        // jshint laxbreak:true
        return (key != null && (key = this._castKey(key)) != null)
            ? O.getOwn(this._projectedMock._keys, key, null)
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
       * @param {boolean} [keyArgs.noUpdate=false] Prevents updating elements already present in the list.
       *
       * @param {number} [keyArgs.index] The index at which to add new elements.
       * When unspecified, new elements are appended to the list.
       * This argument is ignored when `noAdd` is `true`.
       *
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       */
      set: function(fragment, keyArgs) {

        this._set(
            fragment,
            !arg.optional(keyArgs, "noAdd"),
            !arg.optional(keyArgs, "noUpdate"),
            !arg.optional(keyArgs, "noRemove"),
            !arg.optional(keyArgs, "noMove"),
            arg.optional(keyArgs, "index"));
      },

      /**
       * Adds and/or updates one or more elements to the _end_ of the list.
       *
       * The element or elements specified in argument `fragment`
       * are converted to the list's element class.
       *
       * @param {any|Array} fragment - Value or values to add.
       *
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       */
      add: function(fragment) {
        this._set(fragment, /* add: */true, /* update: */true, /* remove: */false, /* move: */false);
      },

      /**
       * Inserts and/or updates one or more elements, starting at the given index.
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
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       */
      insert: function(fragment, index) {
        this._set(fragment, /* add: */true, /* update: */true, /* remove: */false, /* move: */false, /* index: */index);
      },

      /**
       * Removes one or more elements from the list.
       *
       * Specified elements that are not present in the list are ignored.
       *
       * @param {any|Array} fragment - Element or elements to remove.
       *
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       */
      remove: function(fragment) {

        this.__assertEditable();

        this._usingChangeset(function(cset) {
          cset._remove(fragment);
        });
      },

      /**
       * Moves an element to a new position.
       *
       * @param {any} elemSpec - An element specification.
       * @param {number} indexNew - The new index of the element.
       *
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       */
      move: function(elemSpec, indexNew) {

        this.__assertEditable();

        this._usingChangeset(function(cset) {
          cset._move(elemSpec, indexNew);
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
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       */
      removeAt: function(start, count) {

        this.__assertEditable();

        this._usingChangeset(function(cset) {
          cset._removeAt(start, count);
        });
      },

      /**
       * Sorts the elements of the list using the given comparer function.
       *
       * @param {function(pentaho.type.Element, pentaho.type.Element) : number} comparer - The comparer function.
       *
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       */
      sort: function(comparer) {

        this.__assertEditable();

        this._usingChangeset(function(cset) {
          cset._sort(comparer);
        });
      },

      /**
       * Removes all elements from the list.
       *
       * @throws {TypeError} When the list is [read-only]{@link pentaho.type.List#isReadOnly}.
       */
      clear: function() {

        this.__assertEditable();

        this._usingChangeset(function(cset) {
          cset._clear();
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
        var elems = this._projectedMock._elems;
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
        var elems = this._projectedMock._elems;
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
       * @protected
       */
      _castKey: function(value) {
        return value.toString();
      },

      /**
       * Casts a value specification to the element type of the list.
       *
       * @param {any} valueSpec - The value.
       *
       * @return {pentaho.type.Element} An element.
       *
       * @protected
       */
      _cast: function(valueSpec) {
        return this.type._elemType.to(valueSpec);
      },

      // region Core change methods
      // implement abstract pentaho.type.ContainerMixin#_createChangeset
      _createChangeset: function(txn) {
        return new ListChangeset(txn, this);
      },

      _set: function(fragment, add, update, remove, move, index) {

        this.__assertEditable();

        this._usingChangeset(function(cset) {
          cset._set(fragment, add, update, remove, move, index);
        });
      },
      // endregion

      // region validation
      /**
       * Determines if this list value is a **valid instance** of its type.
       *
       * The default implementation validates each element against the
       * list's [element type]{@link pentaho.type.List.Type#of}
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
        var elemType = this.type.of;

        return this._projectedMock._elems.reduce(function(errors, elem) {
          return typeUtil.combineErrors(errors, elemType.validateInstance(elem));
        }, null);
      },
      // endregion

      // region serialization
      /** @inheritDoc */
      toSpecInContext: function(keyArgs) {

        keyArgs = keyArgs ? Object.create(keyArgs) : {};

        // Capture now, before using it below for the elements.
        var listType = this.type;
        var declaredType;
        var includeType = !!keyArgs.forceType ||
              (!!(declaredType = keyArgs.declaredType) && listType !== declaredType.essence);

        var elemSpecs;

        if(this.count) {
          // reset
          keyArgs.forceType = false;

          var elemType = listType.of.essence;

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

      type: /** @lends pentaho.type.List.Type# */{

        /** @inheritDoc */
        _postInit: function() {

          this.base.apply(this, arguments);

          // Force base value inheritance. Cannot change after being set locally...
          if(!O.hasOwn(this, "_elemType")) this._elemType = this._elemType;
        },

        id: module.id,
        alias: "list",

        get isList() { return true; },
        get isContainer() { return true; },

        // region of / element type attribute
        _elemType: Element.type,

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
         * @type {pentaho.type.Element.Type}
         *
         * @throws {pentaho.lang.OperationInvalidError} When set to a type that is different from
         *   the current local type.
         *
         * @throws {pentaho.lang.ArgumentInvalidError} When set to a type that is not a subtype of the
         *   ancestor list type's `of` type.
         *
         * @see pentaho.type.spec.IListTypeProto#of
         */
        get of() {
          return this._elemType;
        },

        // supports configuration
        set of(value) {
          if(value === undefined) return;
          if(!value) throw error.argRequired("of");

          // NOTE: one of the problems is determining if two types are equal,
          //  because these can be anonymous types. Equality would have to mean
          //  structurally equal. Because there isn't an equals test,
          //  it cannot be validated that a set is ok as long as the set value does not change.

          var ElemInstance = this.context.get(value);
          var elemType = ElemInstance.type;
          var baseElemType = this._elemType;

          // Can't use O.setConst cause the configurable: false is inherited
          // and we need to be able to set each local value at least once.
          if(O.hasOwn(this, "_elemType")) {
            if(elemType !== baseElemType) throw error.operInvalid("Property 'of' cannot change.");
            return;
          }

          // Hierarchy consistency
          // Validate that it is a sub-type of the base property's type.
          // This ensures that `of` is an element type...
          if(elemType !== baseElemType && !elemType.isSubtypeOf(baseElemType))
            throw error.argInvalid("of", bundle.structured.errors.list.elemTypeNotSubtypeOfBaseElemType);

          // Mark set locally even if it is the same...
          this._elemType = elemType;

        },
        // endregion

        // region serialization
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
          var baseElemType = baseType.isSubtypeOf(List.type) ? baseType._elemType : null;
          if(!baseElemType || this._elemType !== baseElemType) {
            spec.of = this._elemType.toRefInContext(keyArgs);
          }

          // No other attributes, no id and base is "list"?
          if(!this._fillSpecInContext(spec, keyArgs) && !spec.id && spec.base === "list") {

            if(!spec.of) spec.of = this._elemType.toRefInContext(keyArgs);

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
    .implement({
      type: bundle.structured.list
    });

    // override the documentation to specialize the argument types.
    /**
     * Creates a subtype of this one.
     *
     * For more information on class extension, in general,
     * see {@link pentaho.lang.Base.extend}.
     *
     * @name extend
     * @memberOf pentaho.type.List
     * @method
     *
     * @param {string} [name] The name of the created class, used for debugging purposes.
     * @param {pentaho.type.spec.IListProto} [instSpec] The instance specification.
     * @param {Object} [classSpec] The static specification.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * @return {!Class.<pentaho.type.List>} The new list instance subclass.
     *
     * @see pentaho.type.Value.extend
     */

    return List;
  };
});
