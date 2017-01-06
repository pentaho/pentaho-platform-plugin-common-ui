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
  "./Sort",
  "./Clear",
  "../../util/arg",
  "../../util/object"
], function(Changeset, Add, Remove, Move, Sort, Clear, arg, O) {

  "use strict";

  /**
   * @name ListChangeset
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Changeset
   *
   * @amd pentaho/type/changes/ListChangeset
   *
   * @classDesc The class `ListChangeset` describes a log of changes in a
   * [list]{@linkplain pentaho.type.List} value.
   *
   * @constructor
   * @description Creates a new instance.
   *
   * @param {!pentaho.type.changes.Transaction} transaction - The owning transaction.
   * @param {!pentaho.type.List} owner - The list value where the changes take place.
   */
  return Changeset.extend("pentaho.type.changes.ListChangeset", /** @lends pentaho.type.changes.ListChangeset# */{

    constructor: function(transaction, owner) {

      this.base(transaction, owner);

      this._clearChanges();
    },

    // region public interface
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
      if(this._changes.length > 0)
        return true;

      // NOTE: if an element is to be removed, it is already included above.
      var changesByKey = this._changesByElemKey;
      for(var key in changesByKey)
        if(O.hasOwn(changesByKey, key) && changesByKey[key].hasChanges)
          return true;

      return false;
    },

    /**
     * Gets the nested changeset for an element with the given key, if any.
     *
     * @param {string} key - The key of the element.
     *
     * @return {pentaho.type.changes.ComplexChangeset} The nested changeset or `null`.
     */
    getChange: function(key) {
      // TODO: should not consider changes in elements to be removed?
      return O.getOwn(this._changesByElemKey, key) || null;
    },

    _clearChanges: function() {
      // NOTE: called from constructor

      // Cancel all primitive changes
      if(this._changes) this._changes.forEach(function(change) {
        change._cancelRefs(this.transaction, this.owner);
      }, this);

      // Clear all nested changes
      var changesByKey = this._changesByElemKey;
      for(var key in changesByKey) // nully tolerant
        if(O.hasOwn(changesByKey, key))
          changesByKey[key].clearChanges();

      this._changes = [];
      this._changesByElemKey = {};

      this._projMock = null;
      this._lastClearIndex = -1;
    },

    _setNestedChangeset: function(csetNested) {
      this._changesByElemKey[csetNested.owner.key] = csetNested;
    },

    /**
     * Gets a mock projection of the updated list value.
     *
     * When there are no changes, the owner list returned.
     * Otherwise, a projected mock containing only
     * the elements' data structures is created and returned.
     *
     * @type {!Object|!pentaho.type.List}
     * @readOnly
     * @private
     */
    get _projectedMock() {
      var changeCount = this._changes.length;
      if(!changeCount) return this.owner;

      var projMock = this._projMock ||
          (this._projMock = this.owner._cloneElementData({changeCount: 0}, /* useCommitted: */true));

      if(projMock.changeCount < changeCount) {
        this._applyFrom(projMock, projMock.changeCount);
        projMock.changeCount = changeCount;
      }

      return projMock;
    },

    _apply: function(target) {
      if(target === this.owner && this._projMock) {

        // Reuse `_projMock`'s fields and discard it afterwards.

        // Ensure up to date with every change.
        var projMock = this._projectedMock;

        this._projMock = null;

        target._elems = projMock._elems;
        target._keys = projMock._keys;
      } else {
        this._applyFrom(target, 0);
      }
    },

    /**
     * Applies a subset of the changes to a list.
     *
     * This method is used for computing the future value of the list incrementally.
     *
     * @param {!Object|!pentaho.type.List} list - The list or list mock to which to apply changes.
     * @param {number} startingFromIdx - The index of the first change to be considered.
     * @private
     */
    _applyFrom: function(list, startingFromIdx) {
      // assert startingFromIdx >= 0

      var changes = this._changes;
      var N = changes.length;

      // Ignore changes before the last clear.
      var k = Math.max(this._lastClearIndex, startingFromIdx);

      while(k < N) changes[k++]._apply(list);
    },
    // endregion

    // region protected interface

    /**
     * Decomposes the modifications into a set of operations and
     * populates [#changes]{@link pentaho.type.changes.ListChangeset#_changes} with
     * the relevant [PrimitiveChange]{@link pentaho.type.changes.PrimitiveChange} objects.
     *
     * @param {any|Array} fragment - The element or elements to set.
     * @param {?boolean} [add=false] Adds new elements to the list.
     * @param {?boolean} [update=false] Updates elements already present in the list.
     * @param {?boolean} [remove=false] Removes elements not present in `fragment` from the list.
     * @param {?boolean} [move=false] Moves elements inside the list.
     * @param {?number}  [index] The index at which to add new elements.
     * When unspecified, new elements are appended to the list.
     * This argument is ignored when `add` is `false`.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @private
     * @friend pentaho.type.List
     */
    _set: function(fragment, add, update, remove, move, index) {

      // TODO: don't convert elements twice (elemType.to)

      this._assertWritable();

      var list = this._projectedMock; // calculate relative the last change
      var elems = list._elems;
      var keys = list._keys;
      var elemType = this.owner.type.of;
      var existing;
      var elem;
      var key;

      // Next insert index.
      // It will be corrected with the removes
      // that occur before it
      if(index == null) {
        index = elems.length;
      } else {
        /* jshint laxbreak:true*/
        index = index < 0
          ? Math.max(0, elems.length + index)
          : Math.min(index, elems.length);
      }

      var setElems = Array.isArray(fragment)
            ? fragment.map(elemType.to, elemType)
            : [elemType.to(fragment)];

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

      // I - Pre-process setElems array
      var newElements = [];

      var i = -1;
      var L = setElems.length;
      while(++i < L) {
        if((elem = setElems[i]) != null) {
          key = elem.key;

          var repeated = O.hasOwn(setKeys, key);

          if((existing = O.getOwn(keys, key))) {
            if(update && existing !== elem && !existing.equalsContent(elem)) {
              setKeys[key] = 2;
            } else {
              setKeys[key] = 1;
            }
          } else if(!repeated && add) {
            setKeys[key] = 3;
            newElements.push({value: elem, to: newElements.length});
          } else {
            // Remove duplicates from setElems
            setElems.splice(i, 1);
            --L;
            --i;
          }
        }
      }

      // II - Process removes and build computed array

      // baseIndex represents the lowest index
      // of an already existing element on the
      // current array
      var baseIndex;

      var removeCount = 0;

      i = -1;
      L = elems.length;
      while(++i < L) {
        elem = elems[i];
        key = elem.key;

        if(!O.hasOwn(setKeys, key)) {
          if(remove) {
            if(i < index) {
              --index;
            }

            this._addChange(new Remove([elem], i - removeCount));

            ++removeCount;
          } else {
            computed.push(key);
          }
        } else {
          // baseIndex value is the lowest index
          // of an already existing element
          if(baseIndex == null) {
            baseIndex = i - removeCount;
          }

          computed.push(key);
        }
      }

      // if not set above and adding elements, baseIndex
      // value is the current corrected insertion index
      if(baseIndex == null && newElements.length > 0) {
        baseIndex = index;
      }

      // III - Process adds
      if(add) {
        i = -1;
        L = newElements.length;
        while(++i < L) {
          var action = newElements[i];

          var newIndex = index + action.to;

          this._addChange(new Add(action.value, newIndex));

          computed.splice(newIndex, 0, action.value.key);
        }
      }

      // IV - Process moves and updates
      var lastDestinationIndex = 0;
      if(move || update) {
        i = -1;
        L = setElems.length;
        while(++i < L) {
          if((elem = setElems[i]) != null) {
            var currentIndex = computed.indexOf(elem.key);
            if(move) {
              if(currentIndex < baseIndex) {
                --baseIndex;
              }

              if(currentIndex < baseIndex + i || currentIndex < lastDestinationIndex) {
                var destinationIndex = Math.max(baseIndex + i, lastDestinationIndex);

                this._addChange(new Move([elem], currentIndex, destinationIndex));

                computed.splice(destinationIndex, 0, computed.splice(currentIndex, 1)[0]);

                currentIndex = destinationIndex;
              }

              lastDestinationIndex = currentIndex;
            }

            if(update && setKeys[elem.key] === 2) {
              existing = O.getOwn(keys, elem.key);

              // This may create a new changeset, that gets hooked up into this.
              existing.configure(elem);
            }
          }
        }
      }
    },

    /**
     * Creates a set of variable number of operations that remove elements from a list,
     * and appends that set to the list of changes.
     *
     * @param {any|Array} fragment - The element or elements to remove.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @see pentaho.type.changes.Remove
     * @private
     * @friend pentaho.type.List
     */
    _remove: function(fragment) {

      this._assertWritable();

      var list = this._projectedMock; // calculate relative to the last change
      var elemType = this.owner.type.of;
      var elems = list._elems;
      var keys = list._keys;
      var removeElems = Array.isArray(fragment)
        ? fragment.map(elemType.to, elemType)
        : [elemType.to(fragment)];

      var elem;
      var key;

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
        if((elem = removeElems[i])) {
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
        var batchElems;
        var batchIndex;

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

    /**
     * Creates an operation that removes a section of elements from a list,
     * and appends that change to the list of changes.
     *
     * @param {number} start - The index at which to start removing.
     * @param {number} [count=1] The number of elements to remove.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @see pentaho.type.changes.Remove
     * @private
     * @friend pentaho.type.List
     */
    _removeAt: function(start, count) {

      this._assertWritable();

      if(count < 0) return; // noop

      var list = this._projectedMock;

      if(count == null) count = 1;

      var L = list._elems.length;

      if(start >= L) return; // noop

      if(start < 0) start = Math.max(0, L + start);

      var removed = list._elems.slice(start, start + count);

      this._addChange(new Remove(removed, start));
    },

    /**
     * Creates an operation that moves an element to a new position,
     * and appends that change to the list of changes.
     *
     * @param {any} elemSpec - An element specification.
     * @param {number} indexNew - The new index of the element.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @see pentaho.type.changes.Move
     * @private
     * @friend pentaho.type.List
     */
    _move: function(elemSpec, indexNew) {

      this._assertWritable();

      var owner = this.owner;
      var elem = owner._cast(elemSpec);
      var existing = owner.get(elem.key);
      if(existing) {
        var indexOld = owner.indexOf(existing);

        // assert indexOld >= 0

        var L = this._projectedMock._elems.length;

        indexNew = indexNew < 0 ? Math.max(0, L + indexNew) : Math.min(indexNew, L);

        if(indexOld !== indexNew)
          this._addChange(new Move(elem, indexOld, indexNew));
      }
    },

    /**
     * Adds a [sorting]{@link pentaho.type.changes.Sort} operation to the list of changes.
     *
     * @param {function(pentaho.type.Element, pentaho.type.Element) : number} comparer - The
     * function used for comparing elements in the list.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @see pentaho.type.changes.Sort
     * @private
     * @friend pentaho.type.List
     */
    _sort: function(comparer) {

      this._assertWritable();

      this._addChange(new Sort(comparer));
    },

    /**
     * Creates an operation that removes all elements in the list,
     * and appends that operation to the list of changes.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @see pentaho.type.changes.Clear
     * @private
     * @friend pentaho.type.List
     */
    _clear: function() {

      this._assertWritable();

      // See #_applyFrom
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

      change._prepareRefs(this.transaction, this.owner);
    }
    // endregion
  });
});
