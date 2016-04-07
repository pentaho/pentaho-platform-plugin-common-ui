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
  "./PropertyChange",
  "./AddChange",
  "./RemoveOneChange",
  "./RemoveAtChange",
  "./UpdateChange",
  "./SortChange",
  "../../util/arg",
  "../../util/object"
], function(PropertyChange, AddChange, RemoveOneChange,
            RemoveAtChange, UpdateChange, SortChange,
            arg, O) {
  "use strict";

  return PropertyChange.extend("pentaho.type.changes.ListChange", /** @lends pentaho.type.changes.ListChange# */{

    constructor: function(owner, oldValue, valueSpec) {
      this.base(owner);

      this._oldValue = oldValue;
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

    get changes() {
      return this._changes;
    },

    /**
     * Computes the new value.
     * The value of the original property is not modified.
     *
     * @returns {*}
     */
    get newValue() {
      var newValue = this._newValue;
      if(newValue) return newValue;

      this._newValue = newValue = this.simulate(this.oldValue.clone());
      return newValue;
    },

    set: function(fragment, keyArgs) {
      this._set(
        fragment,
        !arg.optional(keyArgs, "noAdd"),
        !arg.optional(keyArgs, "noUpdate"),
        !arg.optional(keyArgs, "noRemove"),
        arg.optional(keyArgs, "index")
      );
    },

    simulate: function(propertyValue) {
      var changes = this.changes.slice();

      // Ignore changes until the last clear
      var idxLastClear = changes.reduce(function(memo, change, idx) {
        return change.type === "clear" ? idx : memo;
      }, undefined);
      changes = changes.slice(idxLastClear);

      // mutate list
      changes.forEach(function(change) {
        change.simulate(propertyValue);
      });

      return propertyValue;
    },
    //endregion

    //region protected methods
    _commit: function() {
      this.simulate(this._oldValue);
    },

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

      this.changes.push(new RemoveAtChange(removed, start));
    },

    _sort: function(comparer) {
      this.changes.push(new SortChange(comparer));
    },

    _insertOne: function(elem, index, key) {
      this._addKeys[key] = elem;
      this.changes.push(new AddChange(elem, index, key));
    },

    _removeOne: function(elem, key) {
      this._removeKeys[key] = elem;
      this.changes.push(new RemoveOneChange(elem, key));
    },

    _updateOne: function(elem, other) {
      this.changes.push(new UpdateChange(elem, other));
    }
    //endregion

  });
});
