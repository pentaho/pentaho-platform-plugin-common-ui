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
  "./element",
  "../i18n!types",
  "../util/arg",
  "../util/error",
  "../util/fun",
  "../util/object"
], function(module, valueFactory, elemFactory, bundle, arg, error, fun, O) {

  "use strict";

  return function(context) {

    var O_isProtoOf = Object.prototype.isPrototypeOf;

    var Value = context.get(valueFactory),
        Element = context.get(elemFactory),
        _listMeta = null,
        _listNextUid = 1;

    /**
     * @alias List
     * @memberOf pentaho.type
     * @class
     * @extends pentaho.type.Value
     * @amd pentaho/type/list
     *
     * @classdesc A list of `Element` instances of some _common base_ type.
     *
     * @description Creates a list with the given elements.
     *
     * When a derived class overrides the constructor
     * and creates additional instance properties,
     * the {@link pentaho.type.List#_clone} method should
     * also be overridden to copy those properties.
     *
     * @constructor
     * @param {Object} [spec] The list specification or another compatible list instance.
     */
    var List = Value.extend("pentaho.type.List", /** @lends pentaho.type.List# */{

      constructor: function(spec) {
        this._elems = [];
        this._keys  = {};
        this._uid = String(_listNextUid++);
        this._changes = null;
        this._changeLevel = 0;

        if(spec != null) {
          // An array of element specs?
          // A plain Object with a `d` array property?
          var elemSpecs =
              Array.isArray(spec) ? spec :
              (spec.constructor === Object && Array.isArray(spec.d)) ? spec.d :
              (spec instanceof List) ? spec._elems :
              null;

          if(elemSpecs) {
            this._set(
                elemSpecs,
                /*add:*/true,
                /*update:*/false,
                /*remove:*/false,
                /*index:*/0,
                /*silent:*/true);
          }
        }
      },

      /**
       * Creates a shallow clone of this list value.
       *
       * @return {!pentaho.type.List} The list value clone.
       */
      clone: function() {
        var clone = Object.create(Object.getPrototypeOf(this));
        this._clone(clone);
        return clone;
      },

      /**
       * Initializes a clone of this list value.
       *
       * @param {!pentaho.type.List} clone The list value clone.
       */
      _clone: function(clone) {
        clone._elems = this._elems.slice();
        clone._keys  = O.assignOwnDefined({}, this._keys);
        clone._uid = String(_listNextUid++);
        clone._changes = null;
        clone._changeLevel = 0;
      },

      /**
       * Gets the unique id of the list instance.
       * @type {string}
       * @readonly
       */
      get uid() {
        return this._uid;
      },

      /**
       * Gets the key of the list value.
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
       * The default list implementation, returns the value of the
       * list instance's {@link pentaho.type.List#uid}.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this._uid;
      },

      /**
       * Gets the number of elements in the list.
       *
       * @type number
       * @readonly
       */
      get count() {
        return this._elems.length;
      },

      /**
       * Gets the element at a specified index.
       *
       * If the index is out of range, `null` is returned.
       *
       * @param {number} index The desired index.
       *
       * @return {?pentaho.type.Element} The element value or `null`.
       */
      at: function(index) {
        return this._elems[index] || null;
      },

      /**
       * Gets a value that indicates if an element with
       * a given key is present in the list.
       *
       * @param {string|any} key The element's key.
       *
       * @return {boolean} `true` if an element with the given key is present in the list, `false` otherwise.
       */
      has: function(key) {
        return key != null && (key = this._castKey(key)) != null && O.hasOwn(this._keys, key);
      },

      /**
       * Gets a value that indicates if a given element is present in the list.
       *
       * @param {pentaho.type.Element} elem The element to test.
       *
       * @return {boolean} `true` if the element is present in the list, `false` otherwise.
       */
      includes: function(elem) {
        return elem != null && this.get(elem.key) === elem;
      },

      /**
       * Gets the index of a given element in the list.
       *
       * @param {pentaho.type.Element} elem The element whose index to determine.
       *
       * @return {number} `true` if the element is present in the list, `false` otherwise.
       */
      indexOf: function(elem) {
        return elem && this.has(elem.key) ? this._elems.indexOf(elem) : -1;
      },

      /**
       * Gets the element having a specified key value, if any, or `null`.
       *
       * @param {string|any} key The element's key.
       *
       * @return {?pentaho.type.Element} The corresponding element or `null`.
       */
      get: function(key) {
        return (key != null && (key = this._castKey(key)) != null) ? O.getOwn(this._keys, key, null) : null;
      },

      /**
       * Adds, removes and/or updates elements to the element list.
       *
       * The element or elements specified in argument `fragment`
       * are converted to the list's element class.
       *
       * @param {any|Array} fragment The element or elements to set.
       *
       * @param {Object} [keyArgs] The keyword arguments.
       *
       * @param {boolean} [keyArgs.noAdd=false] Prevents adding new elements to the list.
       * @param {boolean} [keyArgs.noRemove=false] Prevents removing elements not present in `fragment` from the list.
       * @param {boolean} [keyArgs.noUpdate=false] Prevents updating elements already present in the list.
       *
       * @param {number} [keyArgs.index] The index at which to add new elements.
       * When unspecified, new elements are appended to the list.
       * This argument is ignored when `noAdd` is `true`.
       */
      set: function(fragment, keyArgs) {
        this._set(
            fragment,
            !arg.optional(keyArgs, "noAdd"),
            !arg.optional(keyArgs, "noUpdate"),
            !arg.optional(keyArgs, "noRemove"),
            arg.optional(keyArgs, "index"));
      },

      /**
       * Adds and/or updates one or more elements to the _end_ of the list.
       *
       * The element or elements specified in argument `fragment`
       * are converted to the list's element class.
       *
       * @param {any|Array} fragment Value or values to add.
       *
       * @return {pentaho.type.List} The added list element.
       */
      add: function(fragment) {
        this._set(fragment, /*add:*/true, /*update:*/true, /*remove:*/false);
      },

      /**
       * Inserts or updates one or more elements, starting at the given index.
       *
       * If `index` is negative,
       * it means the position at that many elements from the end (`index' = count - index`).
       *
       * When the index is greater than or equal to the length of the list,
       * the element or elements are appended to the list.
       *
       * @param {any|any[]} fragment Element or elements to add.
       * @param {number} index The index at which to start inserting new elements.
       */
      insert: function(fragment, index) {
        this._set(fragment, /*add:*/true, /*update:*/true, /*remove:*/false, /*index:*/index);
      },

      /**
       * Removes one or more elements from the list.
       *
       * Specified elements that are not present in the list are ignored.
       *
       * @param {pentaho.type.Element|Array.<pentaho.type.Element>} fragment Element or elements to remove.
       */
      remove: function(fragment) {
        this._remove(fragment);
      },

      /**
       * Removes one or more elements from the list,
       * given the start index and the number of elements to remove.
       *
       * If `count` is less than `1`, nothing is removed.
       * If `count` is {@link Nully} or omitted, it defaults to `1`.
       * If `start` is not less than the number of elements in the list, nothing is removed.
       * If `start` is negative,
       * it means to start removing that many elements from the end (`start' = length - start`).
       *
       * @param {number} start Index at which to start removing.
       * @param {number} [count=1] Number of elements to remove.
       */
      removeAt: function(start, count) {
        this._removeAt(start, count);
      },

      /**
       * Creates an array with the elements of the list.
       *
       * @return {Array.<pentaho.type.Element>} An array of elements.
       */
      toArray: function() {
        return this._elems.slice();
      },

      /**
       * Casts a value for use as a lookup key and returns it.
       *
       * @param {any} value The value from which the key is built.
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
       * @param {any} valueSpec The value.
       *
       * @return {pentaho.type.Element} An element.
       *
       * @protected
       */
      _cast: function(valueSpec) {
        var meta = this.meta;
        return meta.context.create(valueSpec, meta._elemMeta, meta._elemMeta);
      },

      //region Change tracking
      _changes: null,
      _changeLevel: 0,

      _enterChange: function() {
        if(!this._changes) this._changes = [];
        this._changeLevel++;
      },

      _exitChange: function(silent) {
        var changes = null;

        if(!(--this._changeLevel)) {
          changes = this._changes;
          this._changes = null;
          if(!silent && changes.length) {
            // TODO: fire list change event
            // Rollback if cancelled?
            // Apply changes only at the end?
          }
        }

        return changes;
      },

      _addChange: function(type, elem, index) {
        this._getChange(type, index).elems.push(elem);
      },

      _getChange: function(type, index) {
        var changes = this._changes,
            L = changes.length,
            change = L ? changes[L - 1] : null;

        if(change && change.type === type && change.at + change.elems.length === index)
          return change;

        changes.push((change = {type: type, at: index, elems: []}));
        return change;
      },
      //endregion

      //region Core change methods
      _set: function(fragment, add, update, remove, index, silent) {
        var elems = this._elems,
            keys  = this._keys,
            existing, elem, key;

        if(!silent) this._enterChange();

        // Next insert index.
        if(index == null) {
          index = elems.length;
        } else {
          index = index < 0
              ? Math.max(0, elems.length + index)
              : Math.min(index, elems.length);
        }

        var setElems = Array.isArray(fragment) ? fragment : [fragment];
        // Index of elements in setElems, by key.
        // In the end, this is used to efficiently lookup which elems _not_ to remove.
        var setKeys = remove ? {} : null;

        // I - Add/Update Cycle
        var i = -1, L = setElems.length;
        while(++i < L) if((elem = this._cast(setElems[i])) != null) {
          key = elem.key;

          // Store input keys for removal loop, below.
          if(remove) setKeys[key] = 1;

          if((existing = O.getOwn(keys, key))) {
            if(update && existing !== elem) {
              // This may trigger change events, that, in turn, may
              // perform further list changes and reenter `List#_set`.
              this._updateOne(existing, elem, silent);
            }
          } else if(add) {
            this._insertOne(elem, index++, key, silent);
          }
        }

        // II - Remove Cycle
        if(remove) {
          elems = this._elems;
          i = elems.length;
          while(--i) {
            elem = elems[i];
            key  = elem.key;
            if(!O.hasOwn(setKeys, key)) this._removeOne(elem, i, key, silent);
          }
        }

        if(!silent) this._exitChange();
      },

      _insertOne: function(elem, index, key, silent) {
        this._elems.splice(index, 0, elem);
        this._keys[key] = elem;

        if(!silent) this._addChange("add", elem, index);
      },

      _removeOne: function(elem, index, key, silent) {
        this._elems.splice(index, 1);
        delete this._keys[key];

        if(!silent) this._addChange("remove", elem, index);
      },

      _updateOne: function(elem, other, silent) {
        // TODO
      },

      _remove: function(fragment, silent) {
        if(!silent) this._enterChange();

        var remElems = Array.isArray(fragment) ? fragment : [fragment],
            L = remElems.length,
            i = -1,
            index, key, elem;

        // traversing in forward order, instead of backward, to make it more probable that changes are
        // registered in a single change statement.
        while(++i < L) {
          if((elem = remElems[i]) && this.has((key = elem.key)) && (index = this._elems.indexOf(elem)) > -1) {
            this._removeOne(elem, index, key, silent);
          }
        }

        if(!silent) this._exitChange();
      },

      _removeAt: function(start, count, silent) {
        if(count < 0) return; // noop

        if(count == null) count = 1;

        var L = this._elems.length;

        if(start >= L) return; // noop

        if(start < 0) start = Math.max(0, L + start);

        if(!silent) this._enterChange();

        var removed = this._elems.splice(start, count),
            i = removed.length;
        if(i) {
          // Remove from key index
          while(i--) {
            var elem = removed[i];
            delete this._keys[elem.key];
          }

          // Append to the elems
          if(!silent) {
            var changeElems = this._getChange("remove", start).elems;
            changeElems.push.apply(changeElems, removed);
          }
        }

        if(!silent) this._exitChange();
      },
      //endregion

      //region validation
      /**
       * Performs validation of this list, aggregating
       * the results of the validation of each of its members.
       *
       * When invalid returns a non-empty array of `Error` objects.
       * When valid `null` is returned.
       *
       * @return {Array.<!Error>|null} A non-empty array of `Error` or `null`.
       */
      validate: function() {
        var errors = [],
            elems = this._elems,
            C = elems.length;

        for(var i = 0; i < C; i++) {
          errors.push.apply(errors, this.meta.of.validate(elems[i]));
        }

        return errors.length > 0 ? errors : null;
      },
      //endregion

      meta: /** @lends pentaho.type.List.Meta# */{

        id: module.id,

        styleClass: "pentaho-type-list",

        //region list property
        get list() {
          return true;
        },
        //endregion

        //region of
        _elemMeta: Element.meta,

        /**
         * Gets the metadata of the type of elements that the list can contain.
         *
         * @type {pentaho.type.Element.Meta}
         * @readonly
         */
        get of() {
          return this._elemMeta;
        },

        // supports configuration
        set of(value) {
          if(!value) throw error.argRequired("name");

          // NOTE: one of the problems is determining if two types are equal,
          //  because these can be anonymous types. Equality would have to mean
          //  structurally equal. Because there isn't an equals test,
          //  it cannot be validated that a set is ok as long as the set value does not change.

          // Don't let change root default value.
          if(this === _listMeta) return;

          // Can't use O.setConst cause the configurable: false is inherited
          // and we need to be able to set each local value at least once.
          if(O.hasOwn(this, "_elemMeta"))  throw error.operInvalid("Property 'of' cannot change.");

          var ElemMeta = this.context.get(value),
              elemMeta = ElemMeta.meta,
              baseMeta = this._elemMeta;

          // Hierarchy consistency
          // Validate that it is a sub-type of the base property's type.
          // This ensures that `of` is an element type...
          if(elemMeta !== baseMeta && !O_isProtoOf.call(baseMeta, elemMeta))
            throw error.argInvalid("of", bundle.structured.errors.list.elemTypeNotExtendsBaseElemType);

          // Mark set locally even if it is the same...
          this._elemMeta = elemMeta;
        }
        //endregion
      }
    }).implement({
      meta: bundle.structured["list"]
    });

    _listMeta = List.meta;

    return List;
  };
});
