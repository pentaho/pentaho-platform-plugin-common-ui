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

      this.clearChanges();

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

    clearChanges: function() {
      this._changes = [];

      this._newValue = null;
      this._cachedCount = 0;

      this._addKeys = {};
      this._removeKeys = {};
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
        this._apply(cachedValue, cachedCount);
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

    /**
     * Applies the contained changes to the owner list value or, alternatively, to a given list value.
     *
     * @param {pentaho.type.List} [target] - The value to which changes are applied.
     *
     * When unspecified, defaults to {@link pentaho.type.changes.ListChangeset#owner}.
     */
    apply: function(target) {
      if(!target) target = this.owner;
      if(target === this.owner && this._newValue){
        var newValue = this.newValue;
        this.owner._elems = newValue._elems;
        this.owner._keys = newValue._keys;
        this._newValue = null;
      } else {
        this._apply(target, 0);
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
    _apply: function(list, startingFromIdx) {
      var changes = this._changes;

      // Ignore changes until the last clear
      var k, N = changes.length;
      for(k = N - 1; k > startingFromIdx; k--) {
        if(changes[k].type === "clear") break;
      }

      for(k = k > 0 ? k : 0; k < N; k++) {
        changes[k].apply(list);
      }
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
     * @private
     */
    _set: function(fragment, add, update, remove, move, index) {
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
              } else {
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

            this._removeOne(elem, i - removeCount);

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
            this._insertOne(action.value, newIndex);

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
            if(move) {
              var currentIndex = computed.indexOf(elem.key, i);
              if (currentIndex !== i) {
                this._moveOne(elem, currentIndex, i);

                computed.splice(i, 0, computed.splice(currentIndex, 1)[0]);
              }
            }

            if(update && setKeys[elem.key] === 2) {
              existing = O.getOwn(keys, elem.key) || O.getOwn(addKeys, elem.key);

              // This may trigger change events, that, in turn, may
              // perform further list changes and reenter `List#_set`.
              this._updateOne(existing, elem, i);
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
     * @see pentaho.type.changes.Remove
     * @private
     */
    _remove: function(fragment) {

      var list = this.newValue,
          remElems = Array.isArray(fragment) ? fragment : [fragment],
          removeKeys = this._removeKeys,
          L = remElems.length,
          i = -1,
          index, key, elem;

      // elem0 -> index0
      // elem1 -> index1 > index0
      while(++i < L) {
        if((elem = remElems[i]) &&
           list.has((key = elem.key)) && // includes removed elements...
           !O.getOwn(removeKeys, key) &&
           (index = list._elems.indexOf(elem)) > -1) {
          this._removeOne(elem, index);  // TODO: index is wrong!! Would need to call newValue on every iteration...
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
        this[elem.key] = elem;
      }, this._removeKeys);

      this._addChange(new Remove(removed, start));
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
     * @param {number} index - The position in the list at which the element should be inserted.
     *
     * @see pentaho.type.changes.Add
     * @private
     */
    _insertOne: function(elem, index) {
      this._addKeys[elem.key] = elem;
      this._addChange(new Add(elem, index));
    },

    /**
     * Creates an operation that removes an element from the list,
     * and appends that operation to the list of changes.
     *
     * @param {!pentaho.type.Element} elem - The object to be added to the list.
     * @param {number} index - The index of the element in the list.
     *
     * @see pentaho.type.changes.Remove
     * @private
     */
    _removeOne: function(elem, index) {
      this._removeKeys[elem.key] = elem;
      this._addChange(new Remove([elem], index));
    },

    /**
     * Creates an operation that moves an element inside the list,
     * and appends that operation to the list of changes.
     *
     * @param {!pentaho.type.Element} elem - The object to be moved in the list.
     * @param {number} fromIndex - The index of the element in the list.
     * @param {number} toIndex - The new index of the element in the list.
     *
     * @see pentaho.type.changes.Move
     * @private
     */
    _moveOne: function(elem, fromIndex, toIndex) {
      this._removeKeys[elem.key] = elem;
      this._addChange(new Move([elem], fromIndex, toIndex));
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
     * @param {!pentaho.type.changes.PrimitiveChange} change - Change object to be appended to the list of changes.
     * @private
     */
    _addChange: function(change) {
      this._changes.push(change);
    }
    //endregion
  });
});
