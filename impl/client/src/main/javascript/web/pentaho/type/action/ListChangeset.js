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
  "module",
  "./Changeset",
  "./Add",
  "./Remove",
  "./Move",
  "./Sort",
  "./Clear",
  "pentaho/util/arg",
  "pentaho/util/object"
], function(module, Changeset, Add, Remove, Move, Sort, Clear, arg, O) {

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
   * @param {pentaho.type.changes.Transaction} transaction - The owning transaction.
   * @param {pentaho.type.List} target - The list value where the changes take place.
   */
  return Changeset.extend(module.id, /** @lends pentaho.type.changes.ListChangeset# */{

    constructor: function(transaction, target) {

      this.base(transaction, target);

      /**
       * Map of the existing child changesets, with current primitive changes applied.
       *
       * @type {Object.<string, pentaho.type.changes.Changeset>}
       * @private
       */
      this.__changesetByKey = Object.create(null);

      /**
       * Array of primitive changes.
       *
       * @type {Array.<pentaho.type.changes.Change>}
       * @private
       */
      this.__primitiveChanges = [];

      this.__projMock = null;
      this.__lastClearIndex = -1;
    },

    // region public interface
    /**
     * Gets the list value where the changes take place.
     *
     * @name pentaho.type.changes.ListChangeset#target
     * @type {pentaho.type.List}
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
     * The returned array should not be modified.
     *
     * @type {pentaho.type.change.PrimitiveChange[]}
     * @readOnly
     */
    get changes() {
      return this.__primitiveChanges;
    },

    /** @inheritDoc */
    get hasChanges() {
      if(this.__primitiveChanges.length > 0) {
        return true;
      }

      var changesByKey = this.__changesetByKey;
      for(var key in changesByKey) {
        if(O.hasOwn(changesByKey, key) && changesByKey[key].hasChanges) {
          return true;
        }
      }

      return false;
    },

    /**
     * Gets the child changeset for an element with the given key, if any.
     *
     * @param {string} key - The key of the element.
     *
     * @return {pentaho.type.changes.ComplexChangeset} The child changeset or `null`.
     */
    getChange: function(key) {
      return O.getOwn(this.__changesetByKey, key) || null;
    },

    /** @inheritDoc */
    _clearChanges: function() {

      // TODO: Define clearChanges semantics.
      // Should it clear child changesets as seen before or after clearing local changes?

      // Clear all primitive changes.
      this.__primitiveChanges.forEach(function(change) {
        change._cancel(this);
      }, this);

      // Clear all currently accessible child changesets.
      var changesByKey = this.__changesetByKey;
      for(var key in changesByKey) {
        if(O.hasOwn(changesByKey, key)) {
          changesByKey[key]._clearChangesRecursive(this);
        }
      }

      this.__primitiveChanges = [];
      this.__projMock = null;
      this.__lastClearIndex = -1;
    },

    /**
     * Marks an element as added by a change or cancels a previous removal.
     * @param {pentaho.type.Complex} element - The added element.
     * @private
     * @internal
     */
    __addComplexElement: function(element) {

      // The transaction version is already affected by the __addChange or _clearChanges methods.

      this.transaction.__ensureChangeRef(element).addReference(this.target);

      var childChangeset = element.__cset;
      if(childChangeset !== null) {
        this.__changesetByKey[element.$key] = childChangeset;

        // Make sure that the new changeset descendants have at least our topological order.
        childChangeset.__updateNetOrder(this._netOrder + 1);
      }
    },

    /**
     * Marks an element as removed by a change or cancels a previous addition.
     * @param {pentaho.type.Complex} element - The removed element.
     * @private
     * @internal
     */
    __removeComplexElement: function(element) {
      // The transaction version is already affected by the __addChange or _clearChanges methods.

      this.transaction.__ensureChangeRef(element).removeReference(this.target);

      var childChangeset = element.__cset;
      if(childChangeset !== null) {

        delete this.__changesetByKey[element.$key];

        // Make sure that the changeset descendants update its new topological order.
        childChangeset._resetNetOrder();
      }
    },

    /** @inheritDoc */
    eachChildChangeset: function(fun, ctx) {
      var changesByKey = this.__changesetByKey;
      for(var key in changesByKey) {
        if(O.hasOwn(changesByKey, key) && fun.call(ctx, changesByKey[key]) === false) {
          return;
        }
      }
    },

    /** @inheritDoc */
    __onChildChangesetCreated: function(childChangeset, propType) {
      // This is called when the child changeset is a current child.
      // However, if a remove or clear change is added,
      // this child changeset is not being removed...
      this.__changesetByKey[childChangeset.target.$key] = childChangeset;

      // `childChangeset` was just created.
      // In its constructor, its transaction version is set to the latest of the transaction.
      // So, surely, its version is >= ours.
      this._setTransactionVersion(childChangeset.transactionVersion);

      childChangeset.__updateNetOrder(this._netOrder + 1);
    },

    /**
     * Gets a mock projection of the updated list value.
     *
     * When there are no changes, the target list returned.
     * Otherwise, a projected mock containing only
     * the elements' data structures is created and returned.
     *
     * @type {object|pentaho.type.List}
     * @readOnly
     * @private
     * @internal
     */
    get __projectedMock() {
      var changeCount = this.__primitiveChanges.length;
      if(changeCount === 0) {
        return this.target;
      }

      var projectedMock = this.__projMock ||
          (this.__projMock = this.target._cloneElementData({changeCount: 0}, /* useCommitted: */true));

      if(projectedMock.changeCount < changeCount) {
        this.__applyFrom(projectedMock, projectedMock.changeCount);
        projectedMock.changeCount = changeCount;
      }

      return projectedMock;
    },

    /** @inheritDoc */
    _apply: function(target) {
      if(target === this.target && this.__projMock) {

        // Reuse `__projMock`'s fields and discard it afterwards.

        // Ensure up to date with every change.
        var projectedMock = this.__projectedMock;

        this.__projMock = null;

        target.__elems = projectedMock.__elems;
        target.__keys = projectedMock.__keys;
      } else {
        this.__applyFrom(target, 0);
      }
    },

    /**
     * Applies a subset of the changes to a list.
     *
     * This method is used for computing the future value of the list incrementally.
     *
     * @param {object|pentaho.type.List} list - The list or list mock to which to apply changes.
     * @param {number} startingFromIdx - The index of the first change to be considered.
     * @private
     * @internal
     */
    __applyFrom: function(list, startingFromIdx) {
      // assert startingFromIdx >= 0

      var changes = this.__primitiveChanges;
      var N = changes.length;

      // Ignore changes before the last clear.
      var k = Math.max(this.__lastClearIndex, startingFromIdx);

      while(k < N) changes[k++]._apply(list);
    },
    // endregion

    // region protected interface

    /**
     * Decomposes the modifications into a set of operations and
     * populates [__primitiveChanges]{@link pentaho.type.changes.ListChangeset#__primitiveChanges} with
     * the relevant [PrimitiveChange]{@link pentaho.type.changes.PrimitiveChange} objects.
     *
     * @param {*|Array} fragment - The element or elements to set.
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
     * @throws {TypeError} When a change would occur and the target list
     * is [read-only]{@link pentaho.type.List#$isReadOnly}.
     *
     * @private
     * @internal
     * @friend pentaho.type.List
     */
    __set: function(fragment, add, update, remove, move, index) {

      this._assertWritable();

      var list = this.__projectedMock; // Calculate relative to the last change.
      var elems = list.__elems;
      var keys = list.__keys;
      var elemType = this.target.$type.elementType;
      var existing;
      var elem;
      var key;
      var isTargetReadOnly = this.target.$isReadOnly;
      var needReadOnlyElementValidation = this.target.__needReadOnlyElementValidation;

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

      // TODO: why should we accept null elements? Do these mess up the indexes?

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
          key = elem.$key;

          if((existing = O.getOwn(keys, key))) {
            // Same "entity".

            // Different instances and different content?
            if(update && existing !== elem) {
              // Preserve the existing one. Configure it with the new one.
              setKeys[key] = 2;

              // This may create a new changeset, that gets hooked up into this.
              var elem2 = existing.configureOrCreate(elem);
              if(elem2 !== existing && add && remove) {
                // Replace existing by elem.
                setKeys[key] = 4;
                newElements.push({value: elem2, to: newElements.length});
              }

            } else {
              // Same instances. Preserve. Don't remove.
              setKeys[key] = 1;
            }
          } else if(add && !O.hasOwn(setKeys, key)) { // If add && !repeated
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
        key = elem.$key;

        // Not present anymore, or is to be replaced by the new one.
        if(!O.hasOwn(setKeys, key) || setKeys[key] === 4) {
          if(remove) {
            if(i < index) {
              --index;
            }

            if(isTargetReadOnly) {
              this.target.__assertEditable();
            }

            this.__addChange(new Remove([elem], i - removeCount));

            ++removeCount;
          } else {
            computed.push(key);
          }
        } else {
          // The baseIndex value is the lowest index
          // of an already existing element
          if(baseIndex == null) {
            baseIndex = i - removeCount;
          }

          computed.push(key);
        }
      }

      // If not set above and adding elements, baseIndex
      // value is the current corrected insertion index.
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

          if(isTargetReadOnly) {
            this.target.__assertEditable();
          }

          if(needReadOnlyElementValidation && !action.value.$type.isReadOnly) {
            throw new TypeError("List requires elements of a read-only type.");
          }

          this.__addChange(new Add(action.value, newIndex));

          computed.splice(newIndex, 0, action.value.$key);
        }
      }

      // IV - Process moves
      var lastDestinationIndex = 0;
      if(move) {
        i = -1;
        L = setElems.length;
        while(++i < L) {
          if((elem = setElems[i]) != null) {
            var currentIndex = computed.indexOf(elem.$key);
            if(currentIndex < baseIndex) {
              --baseIndex;
            }

            if(currentIndex < baseIndex + i || currentIndex < lastDestinationIndex) {
              var destinationIndex = Math.max(baseIndex + i, lastDestinationIndex);

              if(isTargetReadOnly) {
                this.target.__assertEditable();
              }

              this.__addChange(new Move([elem], currentIndex, destinationIndex));

              computed.splice(destinationIndex, 0, computed.splice(currentIndex, 1)[0]);

              currentIndex = destinationIndex;
            }

            lastDestinationIndex = currentIndex;
          }
        }
      }
    },

    /**
     * Creates a set of variable number of operations that remove elements from a list,
     * and appends that set to the list of changes.
     *
     * @param {*|Array} fragment - The element or elements to remove.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @throws {TypeError} When a change would occur and the target list
     * is [read-only]{@link pentaho.type.List#$isReadOnly}.
     *
     * @see pentaho.type.changes.Remove
     * @private
     * @internal
     * @friend pentaho.type.List
     */
    __remove: function(fragment) {

      this._assertWritable();

      var list = this.__projectedMock; // Calculate relative to the last change.
      var elemType = this.target.$type.elementType;
      var elems = list.__elems;
      var keys = list.__keys;
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
          key = elem.$key;

          if(!O.hasOwn(removeKeys, key) && O.hasOwn(keys, key)) {
            removeKeys[key] = 1;
            removedInfos.push({value: elem, from: elems.indexOf(elem)});
          }
        }
      }

      if((L = removedInfos.length)) {

        this.target.__assertEditable();

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
            if(batchElems) this.__addChange(new Remove(batchElems, batchIndex));

            batchElems = [];
          }

          batchElems.unshift(info.value);
          batchIndex = info.from;
        } while(++i < L);

        if(batchElems) this.__addChange(new Remove(batchElems, batchIndex));
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
     * @throws {TypeError} When a change would occur and the target list
     * is [read-only]{@link pentaho.type.List#$isReadOnly}.
     *
     * @see pentaho.type.changes.Remove
     * @private
     * @internal
     * @friend pentaho.type.List
     */
    __removeAt: function(start, count) {

      this._assertWritable();

      if(count < 0) return; // Noop.

      var list = this.__projectedMock;

      if(count == null) count = 1;

      var L = list.__elems.length;

      if(start >= L) return; // Noop.

      if(start < 0) start = Math.max(0, L + start);

      this.target.__assertEditable();

      var removed = list.__elems.slice(start, start + count);

      this.__addChange(new Remove(removed, start));
    },

    /**
     * Creates an operation that moves an element to a new position,
     * and appends that change to the list of changes.
     *
     * @param {*} elemSpec - An element specification.
     * @param {number} indexNew - The new index of the element.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @throws {TypeError} When a change would occur and the target list
     * is [read-only]{@link pentaho.type.List#$isReadOnly}.
     *
     * @see pentaho.type.changes.Move
     * @private
     * @internal
     * @friend pentaho.type.List
     */
    __move: function(elemSpec, indexNew) {

      this._assertWritable();

      var target = this.target;
      var elem = target.__cast(elemSpec);
      var existing = target.get(elem.$key);
      if(existing) {
        var indexOld = target.indexOf(existing);

        // assert indexOld >= 0

        var L = this.__projectedMock.__elems.length;

        indexNew = indexNew < 0 ? Math.max(0, L + indexNew) : Math.min(indexNew, L);

        if(indexOld !== indexNew) {

          this.target.__assertEditable();

          this.__addChange(new Move(elem, indexOld, indexNew));
        }
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
     * @throws {TypeError} When a change would occur and the target list
     * is [read-only]{@link pentaho.type.List#$isReadOnly}.
     *
     * @see pentaho.type.changes.Sort
     * @private
     * @internal
     * @friend pentaho.type.List
     */
    __sort: function(comparer) {

      this._assertWritable();

      this.target.__assertEditable();

      this.__addChange(new Sort(comparer));
    },

    /**
     * Creates an operation that removes all elements in the list,
     * and appends that operation to the list of changes.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the changeset has already been applied or canceled.
     *
     * @throws {TypeError} When a change would occur and the target list
     * is [read-only]{@link pentaho.type.List#$isReadOnly}.
     *
     * @see pentaho.type.changes.Clear
     * @private
     * @internal
     * @friend pentaho.type.List
     */
    __clear: function() {

      this._assertWritable();

      if(this.target.count === 0) {
        return;
      }

      this.target.__assertEditable();

      // See #__applyFrom.
      this.__lastClearIndex = this.__primitiveChanges.length;

      this.__addChange(new Clear());
    },

    /**
     * Appends a change to this changeset.
     * Called by the constructor of individual primitive changes.
     *
     * @param {pentaho.type.changes.PrimitiveChange} change - Change object to be appended to the list of changes.
     * @private
     * @internal
     */
    __addChange: function(change) {

      this.__primitiveChanges.push(change);

      change._prepare(this);

      var txnVersion = this.transaction.__takeNextVersion();
      change._setTransactionVersion(txnVersion);
      this._setTransactionVersionLocal(txnVersion);
    }
    // endregion
  });
});
