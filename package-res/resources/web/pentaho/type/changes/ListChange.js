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
  "./ValueChange",
  "./Add",
  "./RemoveOne",
  "./RemoveAt",
  "./Update",
  "./Sort",
  "../../util/arg",
  "../../util/object"
], function(ValueChange,
            Add, RemoveOne, RemoveAt, Update, Sort,
            arg, O) {
  "use strict";

  /**
   * @name ListChange
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.ValueChange
   * @amd pentaho/type/changes/ListChange
   *
   * @classDesc Class that represents changes in a multi-valued property
   * in a [complex]{@linkplain pentaho.type.Complex} object.
   *
   * @constructor
   * @description Creates a new instance.
   *
   * @param {!pentaho.type.Complex} owner - The [complex]{@linkplain pentaho.type.Complex} that contains the property associated with this change.
   * @param {!pentaho.type.List} list - The [multi-valued property]{@linkplain pentaho.type.List} associated with this change.
   * @param {!pentaho.type.List} list - The [multi-valued property]{@linkplain pentaho.type.List} associated with this change.
   */
  return ValueChange.extend("pentaho.type.changes.ListChange", /** @lends pentaho.type.changes.ListChange# */{

    constructor: function(owner, list, valueSpec) {
      this.base(owner);

      this._oldValue = list;
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
      return "listChange";
    },

    /**
     * Gets the list of operations to be applied.
     * @returns {pentaho.type.change.Operation[]}
     */
    get changes() {
      return this._changes;
    },

    /**
     * Computes the new value.
     * The value of the original property is not modified.
     *
     * @override
     */
    get newValue() {
      var newValue = this._newValue;
      if(newValue) return newValue;

      this._newValue = newValue = this.apply(this.oldValue.clone());
      return newValue;
    },

    /**
     * Adds, removes and/or updates elements to the element list.
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
    apply: function(propertyValue) {
      var changes = this.changes.slice();

      // Ignore changes until the last clear
      var idxLastClear = changes.reduce(function(memo, change, idx) {
        return change.type === "clear" ? idx : memo;
      }, undefined);
      changes = changes.slice(idxLastClear);

      // mutate list
      changes.forEach(function(change) {
        change.apply(propertyValue);
      });

      return propertyValue;
    },
    //endregion

    //region protected methods
    /**
     * @inheritdoc
     */
    _commit: function() {
      this.apply(this._oldValue);
    },

    /**
     * Decomposes the modifications into a set of operations and
     * populates [#changes]{@link pentaho.type.changes.ListChange#_changes} with the relevant
     * [Operation]{@link pentaho.type.changes.Operation} objects.
     *
     * @param {any|Array} fragment - The element or elements to set.
     * @param {boolean} add
     * @param {boolean} update
     * @param {boolean} remove
     * @param {boolean} index
     * @private
     */
    _set: function(fragment, add, update, remove, index) {
      var list = this.oldValue,
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
      var list = this.oldValue,
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

      var list = this.oldValue;

      if(count == null) count = 1;

      var L = list._elems.length;

      if(start >= L) return; // noop

      if(start < 0) start = Math.max(0, L + start);

      var removed = list._elems.slice(start, start + count);

      removed.forEach(function(elem) {
        this._removeKeys[elem.key] = elem;
      }, this);

      this.changes.push(new RemoveAt(removed, start));
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
      this.changes.push(new Sort(comparer));
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
      this.changes.push(new Add(elem, index, key));
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
      this.changes.push(new RemoveOne(elem, key));
    },

    /**
     * Creates an operation that updates an element in the list,
     * and appends that operation to the list of changes.
     * 
     * In an `update` operation, the reference to the element does not change, but its contents does.
     *
     * @param {!pentaho.type.Element} elem - The object (already in the list) that will be updated.
     * @param {!pentaho.type.Element} other - The object with the content will be used for updating the list.
     *
     * @see pentaho.type.changes.Update
     * @private
     */
    _updateOne: function(elem, other) {
      this.changes.push(new Update(elem, other));
    }
    //endregion

  });
});
