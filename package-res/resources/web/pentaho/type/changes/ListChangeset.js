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
  "./Remove",
  "./Move",
  "./Update",
  "./Sort",
  "./Clear",
  "../../util/arg",
  "../../util/object"
], function(Changeset,
            Add, Remove, Move, Update, Sort, Clear,
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

      this._clearChanges();

      if(valueSpec !== undefined) this.set(valueSpec);
    },

    //region public interface
    /**
     * Gets the list value where the changes take place.
     *
     * @name pentaho.type.changes.ListChangeset#owner
     * @type {!pentaho.type.List}
     * @readonly
     */

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "list"
     */
    get type() {
      return "list";
    },

    /**
     * Gets the list of contained primitive changes.
     *
     * Do **NOT** modify the returned array in any way.
     *
     * @type {pentaho.type.change.PrimitiveChange[]}
     * @readOnly
     */
    get changes() {
      return this._changes;
    },

    get hasChanges() {
      var N = this._changes.length;
      return N === 0 ? false : (this._changes[N - 1].type !== "clear");
    },

    _clearChanges: function() {
      this._changes = [];

      this._newValue = null;
      this._cachedCount = 0;
      this._lastClearIndex = -1;
    },

    // /**
    //  * The value of the object before the changes are made.
    //  *
    //  * @type {!pentaho.type.Value}
    //  * @readonly
    //  */
    // get oldValue() {
    //   return this.owner;
    // },

    /**
     * Gets or sets the new value.
     *
     * The value of the original property is not modified.
     *
     * Do **NOT** modify the returned object in any way.
     *
     * @type {!pentaho.type.Value}
     */
    get newValue() {
      var n = this._changes.length;
      if(!n) return this.owner;

      var cachedValue = this._newValue;
      var cachedCount;

      if(cachedValue) {
        cachedCount = this._cachedCount;
      } else {
        this._newValue = cachedValue = this.owner.clone();
        cachedCount = 0;
      }

      if(cachedCount < n) {
        this._applyFrom(cachedValue, cachedCount);
        this._cachedCount = n;
      }

      return cachedValue;
    },

    set newValue(valueSpec) {
      this.set(valueSpec);
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
     * @param {boolean} [keyArgs.noMove=false] Prevents moving elements inside the list.
     * @param {boolean} [keyArgs.noUpdate=false] Prevents updating elements already present in the list.
     *
     * @param {number} [keyArgs.index] The index at which to add new elements.
     * When unspecified, new elements are appended to the list.
     * This argument is ignored when `noAdd` is `true`.
     *
     * @throws {pentaho.lang.OperationInvalid} When the changeset has already been applied or rejected.
     */
    set: function(fragment, keyArgs) {
      this._set(
        fragment,
        !arg.optional(keyArgs, "noAdd"),
        !arg.optional(keyArgs, "noUpdate"),
        !arg.optional(keyArgs, "noRemove"),
        !arg.optional(keyArgs, "noMove"),
        arg.optional(keyArgs, "index")
      );
    },

    _apply: function(target) {
      if(target === this.owner && this._newValue) {

        // Reuse `_newValue` copy's internal fields and discard it afterwards.
        // Ensure up to date with every change.
        var newValue = this.newValue;
        target._elems = newValue._elems;
        target._keys  = newValue._keys;

        // Avoid problems with shared data structures.
        this._newValue = null;
      } else {
        this._applyFrom(target, 0);
      }
    },

    /**
     * Applies a subset of the changes to a list.
     *
     * This method is used for computing the future value of the list incrementally.
     *
     * @param {!pentaho.type.List} list - The list that will be modified.
     * @param {number} startingFromIdx - The index of the first change to be considered.
     * @private
     *
     * @see pentaho.type.changes.ListChangeset#newValue
     */
    _applyFrom: function(list, startingFromIdx) {
      // assert startingFromIdx >= 0

      var changes = this._changes;
      var N = changes.length;

      // Ignore changes before the last clear.
      //var k = N - 1;
      //while(k > startingFromIdx && changes[k].type !== "clear") k--;
      var k = Math.max(this._lastClearIndex, startingFromIdx);

      while(k < N) changes[k++]._apply(list);
    },
    //endregion

    //region protected interface

    /**
     * Decomposes the modifications into a set of operations and
     * populates [#changes]{@link pentaho.type.changes.ListChangeset#_changes} with the relevant
     * [PrimitiveChange]{@link pentaho.type.changes.PrimitiveChange} objects.
     *
     * @param {any|Array} fragment - The element or elements to set.
     * @param {boolean} add
     * @param {boolean} update
     * @param {boolean} remove
     * @param {boolean} move
     * @param {number} index
     *
     * @throws {pentaho.lang.OperationInvalid} When the changeset has already been applied or rejected.
     *
     * @private
     */
    _set: function(fragment, add, update, remove, move, index) {

      this._assertMutable();

      var list = this.newValue, // calculate relative the last change
          elems = list._elems,
          keys = list._keys,
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

      var setElems = Array.isArray(fragment) ? fragment.slice() : [fragment];

      // Index of elements in setElems, by key.
      // This is used to detect duplicate values and to efficiently
      // lookup which elems _not_ to remove or to update.
      //
      // Possible values are:
      // undefined: Existing element, removed
      // 1: Existing element, not updated
      // 2: Existing element, updated
      // 3: Non-existing element, added
      var setKeys = {};

      var computed = [];

      var newElements = [];
      var baseIndex = index;
      var relativeIndex = 0;

      // I - Pre-process setElems array
      var i = -1;
      var L = setElems.length;
      while(++i < L) {
        if((elem = list._cast(setElems[i])) != null) {
          key = elem.key;

          var repeated = O.hasOwn(setKeys, key);

          if((existing = O.getOwn(keys, key))) {
            if(update && existing !== elem) {
              setKeys[key] = 2;
            } else {
              setKeys[key] = 1;
            }

            if(!repeated) {
              if(!newElements.length) {
                ++baseIndex;
              } else if(move) {
                relativeIndex++;
              }
            }
          } else if(!repeated && add) {
            setKeys[key] = 3;
            newElements.push({type: "add", value: elem, to: relativeIndex++});
          } else {
            // Remove duplicates from setElems
            setElems.splice(i, 1);
            --L;
            --i;
          }
        }
      }

      // II - Process removes and build computed array
      var realBaseIndex = baseIndex;

      var removeCount = 0;

      i = -1;
      L = elems.length;
      while(++i < L) {
        elem = elems[i];
        key = elem.key;

        if(!O.hasOwn(setKeys, key)) {
          if(remove) {
            if(i < baseIndex) {
              --realBaseIndex;
            }

            this._addChange(new Remove([elem], i - removeCount));

            ++removeCount;
          } else {
            computed.push(key);
          }
        } else {
          computed.push(key);
        }
      }

      // III - Process adds
      if(add) {
        i = -1;
        L = newElements.length;
        while (++i < L) {
          var action = newElements[i];

          var newIndex = realBaseIndex + action.to;
          if (action.type === "add") {
            this._addChange(new Add(action.value, newIndex));

            computed.splice(newIndex, 0, action.value.key);
          }
        }
      }

      // Moves only make sense on a proper set()
      move = move && computed.length === setElems.length;

      // IV - Process moves and updates
      if(move || update) {
        i = -1;
        L = setElems.length;
        while(++i < L) {
          if((elem = list._cast(setElems[i])) != null) {
            var currentIndex = computed.indexOf(elem.key, i);
            if(move) {
              if (currentIndex !== i) {
                this._addChange(new Move([elem], currentIndex, i));

                computed.splice(i, 0, computed.splice(currentIndex, 1)[0]);

                currentIndex = i;
              }
            }

            if(update && setKeys[elem.key] === 2) {
              existing = O.getOwn(keys, elem.key);

              // This may trigger change events, that, in turn, may
              // perform further list changes and reenter `List#_set`.
              this._addChange(new Update(existing, currentIndex, elem));
            }
          }
        }
      }
    },

    /**
     * Creates a set of variable number of operations that remove elements from a list,
     * and appends that set to the list of changes.
     *
     * @param {pentaho.type.Element|pentaho.type.Element[]} fragment - The element or elements to remove.
     *
     * @throws {pentaho.lang.OperationInvalid} When the changeset has already been applied or rejected.
     *
     * @see pentaho.type.changes.Remove
     * @private
     */
    _remove: function(fragment) {

      this._assertMutable();

      var list  = this.newValue, // calculate relative to the last change
          elems = list._elems,
          keys  = list._keys,
          elem, key;

      var removeElems = Array.isArray(fragment) ? fragment : [fragment];

      // Index of elements in removeElems, by key.
      // For removing duplicates in removeElems.
      //
      // Possible values are:
      // 1: Existing element, removed
      var removeKeys = {};

      /** @type Array.<{value: pentaho.type.Element, from: number}> */
      var removedInfos = [];

      // I - Pre-process removeElems array
      var i = -1;
      var L = removeElems.length;
      while(++i < L) {
        if((elem = list._cast(removeElems[i]))) {
          key = elem.key;

          if(!O.hasOwn(removeKeys, key) && O.hasOwn(keys, key)) {
            removeKeys[key] = 1;
            removedInfos.push({value: elem, from: elems.indexOf(elem)});
          }
        }
      }

      if((L = removedInfos.length)) {

        // II - Order descending so indexes keep valid
        removedInfos.sort(function(info1, info2) {
          return info2.from - info1.from;
        });

        // III - Process the removes

        // Add 1 `Remove` change per contiguous group of removed elements.
        var batchElems, batchIndex;

        i = 0;
        do {
          var info = removedInfos[i];

          if(!batchElems || (info.from !== batchIndex - 1)) {
            // End existing batch and create a new one.
            if(batchElems) this._addChange(new Remove(batchElems, batchIndex));

            batchElems = [];
          }

          batchElems.unshift(info.value);
          batchIndex = info.from;
        } while(++i < L);

        if(batchElems) this._addChange(new Remove(batchElems, batchIndex));
      }
    },

    _removeAt: function(start, count) {

      this._assertMutable();

      if(count < 0) return; // noop

      var list = this.newValue;

      if(count == null) count = 1;

      var L = list._elems.length;

      if(start >= L) return; // noop

      if(start < 0) start = Math.max(0, L + start);

      var removed = list._elems.slice(start, start + count);

      this._addChange(new Remove(removed, start));
    },

    /**
     * Adds a [sorting]{@link pentaho.type.changes.Sort} operation to the list of changes.
     *
     * @param {function(pentaho.type.Element, pentaho.type.Element) : number} comparer - The
     * function used for comparing elements in the list.
     *
     * @throws {pentaho.lang.OperationInvalid} When the changeset has already been applied or rejected.
     *
     * @see pentaho.type.changes.Sort
     * @private
     */
    _sort: function(comparer) {

      this._assertMutable();

      this._addChange(new Sort(comparer));
    },

    /**
     * Creates an operation that removes all elements in the list,
     * and appends that operation to the list of changes.
     *
     * @throws {pentaho.lang.OperationInvalid} When the changeset has already been applied or rejected.
     *
     * @see pentaho.type.changes.Clear
     * @private
     */
    _clear: function() {

      this._assertMutable();

      this._lastClearIndex = this._changes.length;
      this._addChange(new Clear());
    },

    /**
     * Appends a change to this changeset.
     *
     * @param {!pentaho.type.changes.PrimitiveChange} change - Change object to be appended to the list of changes.
     * @private
     */
    _addChange: function(change) {
      this._changes.push(change);
    }
    //endregion
  });
});
