/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "./Changeset",
  "./Add",
  "./RemoveOne",
  "./RemoveAt",
  "./Update",
  "./Sort",
  "./Clear",
  "../../util/arg",
  "../../util/object"
], function(Changeset,
            Add, RemoveOne, RemoveAt, Update, Sort, Clear,
            arg, O) {
  "use strict";

  /**
   * @name ListChangeset
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Changeset
   * @amd pentaho/type/changes/ListChangeset
   *
   * @classDesc Class that represents changes in a multi-valued property
   * in a [complex]{@linkplain pentaho.type.Complex} object.
   *
   * @constructor
   * @description Creates a new instance.
   *
   * @param {!pentaho.type.List} owner - The [multi-valued property]{@linkplain pentaho.type.List} associated with this change.
   * @param {!pentaho.type.Element[]|!pentaho.type.spec.IElement[]} [valueSpec] - The [multi-valued property]{@linkplain pentaho.type.List} associated with this change.
   */
  return Changeset.extend("pentaho.type.changes.ListChangeset", /** @lends pentaho.type.changes.ListChangeset# */{

    constructor: function(owner, valueSpec) {
      this.base(owner);

      this._oldValue = owner;
      this._addKeys = {};
      this._removeKeys = {};

      this._changes = [];
      if(valueSpec !== undefined) this.set(valueSpec);
    },

    //region public interface
    /**
     * @inheritdoc
     */
    get type() {
      return "listChangeset";
    },

    /**
     * Gets the list of operations to be applied.
     * @return {pentaho.type.change.OwnedChange[]}
     */
    changes: function() {
      return this._changes;
    },

    /**
     * Asserts if this changeset contains any defined changes.
     *
     * @return {boolean} `true` if at least one change is defined,
     * `false` if no changes are defined.
     */
    get hasChanges() {
      var N = this._changes.length;
      return N === 0 ? true : (this._changes[N - 1].type !== "clear");
    },

    /**
     * Removes all changes in this changeset.
     */
    clearChanges: function() {
      this._changes.length = 0;
    },

    /**
     * Gets or sets the new value of the list that owns this changeset.
     * Do not modify this value.
     *
     * @type {!pentaho.type.Value}
     */
    get newValue() {
      var changes = this._changes;
      var N = changes.length;
      if(N === 0 || changes[N - 1].type === "clear") return this.oldValue;

      var newValue = this._newValue;
      var cachedValue, cachedIdx;
      if(newValue) {
        cachedValue = newValue;
        cachedIdx = this._cachedUpToIdx;
      } else {
        cachedValue = this.oldValue.clone();
        cachedIdx = 0;
      }

      if(cachedIdx < N) {
        this._newValue = cachedValue = this._apply(cachedValue, cachedIdx);
        this._cachedUpToIdx = N;
      } else if(cachedIdx > N) {
        // should never happen while using the regular API
        this._newValue = cachedValue = this._apply(this.oldValue.clone(), 0);
        this._cachedUpToIdx = N;
      }
      return cachedValue; // user may destroy the returned value
    },

    set newValue(valueSpec) {
      this.set(valueSpec);
    },

    /**
     * The value of the object before the changes are made.
     *
     * @type {!pentaho.type.Value}
     * @readonly
     */
    get oldValue() {
      return this._oldValue;
    },

    /**
     * Adds, removes, and/or updates elements to the element list.
     *
     * The element or elements specified in argument `fragment`
     * are converted to the list's element class.
     *
     * @param {pentaho.type.Element|pentaho.type.Element[]} fragment - The element or elements to set.
     *
     * @param {Object} [keyArgs] - The keyword arguments.
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
        arg.optional(keyArgs, "index")
      );
    },

    /**
     * @inheritdoc
     */
    apply: function(list) {
      if(!list) list = this.owner;

      this._apply(list, 0);
      // discard the changes

      if(list === this.owner) this.clearChanges();
      return list;
    },

    /**
     * Applies a subset of the changes to a list.
     *
     * This method is used for computing the future value of the list incrementally.
     *
     * @param {!pentaho.type.List} [list=this.owner] - The list that will be modified.
     * @param {number} [startingFromIdx=0] - The index of the first change to be considered.
     * @return {!pentaho.type.List} list - The modified list.
     * @private
     *
     * @see pentaho.type.changes.ListChangeset#newValue
     */
    _apply: function(list, startingFromIdx) {
      var changes = this._changes;

      // Ignore changes until the last clear
      var k, N = changes.length;
      for(k = N - 1; k > startingFromIdx; k--) {
        if(changes[k].type === "clear") break;
      }

      for(; k < N; k++) {
        changes[k].apply(list);
      }

      return list;
    },
    //endregion

    //region protected methods

    /**
     * Decomposes the modifications into a set of operations and
     * populates [#changes]{@link pentaho.type.changes.ListChangeset#_changes} with the relevant
     * [OwnedChange]{@link pentaho.type.changes.OwnedChange} objects.
     *
     * @param {any|Array} fragment - The element or elements to set.
     * @param {boolean} add
     * @param {boolean} update
     * @param {boolean} remove
     * @param {boolean} index
     * @private
     */
    _set: function(fragment, add, update, remove, index) {
      var list = this.newValue, // calculate relative the last change
        elems = list._elems,
        keys = list._keys,
        addKeys = this._addKeys,
        existing, elem, key;

      // Next insert index.
      if(index == null) {
        index = elems.length;
      } else {
        /*jshint laxbreak:true*/
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
      while(++i < L) {
        if((elem = list._cast(setElems[i])) != null) {
          key = elem.key;

          // Store input keys for removal loop, below.
          if(remove) setKeys[key] = 1;

          if((existing = O.getOwn(keys, key) || O.getOwn(addKeys, key))) {
            if(update && existing !== elem) {
              // This may trigger change events, that, in turn, may
              // perform further list changes and reenter `List#_set`.
              this._updateOne(existing, elem);
            }
          } else if(add) {
            this._insertOne(elem, index++, key);
          }
        }
      }

      // II - Remove Cycle
      if(remove) {
        elems = list._elems;
        i = elems.length;
        while(i) {
          --i;
          elem = elems[i];
          key = elem.key;
          if(!O.hasOwn(setKeys, key)) this._removeOne(elem, i, key);
        }
      }
    },

    /**
     * Creates a set of variable number of operations that remove elements from a list,
     * and appends that set to the list of changes.
     *
     * @param {pentaho.type.Element|pentaho.type.Element[]} fragment - The element or elements to remove.
     *
     * @see pentaho.type.changes.RemoveOne
     * @see pentaho.type.changes.RemoveAt
     * @private
     */
    _remove: function(fragment) {
      var list = this.newValue,
        remElems = Array.isArray(fragment) ? fragment : [fragment],
        removeKeys = this._removeKeys,
        L = remElems.length,
        i = -1,
        key, elem;

      // traversing in forward order, instead of backward, to make it more probable that changes are
      // registered in a single change statement.
      while(++i < L) {
        if((elem = remElems[i]) && list.has((key = elem.key)) && !O.getOwn(removeKeys, key) && list._elems.indexOf(elem) > -1) {
          this._removeOne(elem, key);
        }
      }
    },

    _removeAt: function(start, count) {
      if(count < 0) return; // noop

      var list = this.newValue;

      if(count == null) count = 1;

      var L = list._elems.length;

      if(start >= L) return; // noop

      if(start < 0) start = Math.max(0, L + start);

      var removed = list._elems.slice(start, start + count);

      removed.forEach(function(elem) {
        this._removeKeys[elem.key] = elem;
      }, this);

      this._addChange(new RemoveAt(removed, start));
    },

    /**
     * Adds a [sorting]{@link pentaho.type.changes.Sort} operation to the list of changes.
     *
     * @param {function(pentaho.type.Element, pentaho.type.Element) : number} comparer - The
     * function used for comparing elements in the list.
     *
     * @see pentaho.type.changes.Sort
     * @private
     */
    _sort: function(comparer) {
      this._addChange(new Sort(comparer));
    },

    /**
     * Creates an operation that inserts an element into the list at a specific position,
     * and appends that operation to the list of changes.
     *
     * @param {!pentaho.type.Element} elem - The object to be added to the list.
     * @param {number} index - The position in the list at which the element should to be inserted.
     * @param {string} key - The key that should be used for identifying the object to be added.
     *
     * @see pentaho.type.changes.Add
     * @private
     */
    _insertOne: function(elem, index, key) {
      if(!elem) return;
      this._addKeys[key] = elem;
      this._addChange(new Add(elem, index, key));
    },

    /**
     * Creates an operation that removes an element from the list,
     * and appends that operation to the list of changes.
     *
     * @param {!pentaho.type.Element} elem - The object to be added to the list.
     * @param {string} key - The key used for identifying the object to be removed.
     *
     * @see pentaho.type.changes.RemoveOne
     * @private
     */
    _removeOne: function(elem, key) {
      this._removeKeys[key] = elem;
      this._addChange(new RemoveOne(elem, key));
    },

    /**
     * Creates an operation that updates an element in the list,
     * and appends that operation to the list of changes.
     *
     * In an `update` operation, the reference to the element does not change, but its content does.
     *
     * @param {!pentaho.type.Element} elem - The object (already in the list) that will be updated.
     * @param {!pentaho.type.Element} other - The object with the content that will be used for updating the list.
     * @param {number} index - The position of `elem` in the list.
     *
     * @see pentaho.type.changes.Update
     * @private
     */
    _updateOne: function(elem, other, index) {
      this._addChange(new Update(elem, index, other));
    },

    /**
     * Creates an operation that removes all elements in the list,
     * and appends that operation to the list of changes.
     *
     * @see pentaho.type.changes.Clear
     * @private
     */
    _clear: function() {
      this._addChange(new Clear());
    },

    /**
     * Appends a change to this changeset.
     *
     * @param {!pentaho.type.changes.OwnedChange} change - Change object to be appended to the list of changes.
     * @private
     */
    _addChange: function(change) {
      this._changes.push(change);
    }
    //endregion

  });
});
