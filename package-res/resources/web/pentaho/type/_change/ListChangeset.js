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
  "./AddChange",
  "./RemoveChange",
  "./UpdateChange",
  "./SortChange",
  "../../util/arg",
  "../../util/object"
], function(Changeset, AddChange, RemoveChange, UpdateChange, SortChange,
            arg, O) {
  "use strict";

  return Changeset.extend("pentaho.type.ListChangeset", {
    
    constructor: function(owner, oldValue, valueSpec) {
      this.base(owner);

      this._oldValue = oldValue;

      this._changes = [];
      if(valueSpec !== undefined) this.set(valueSpec);
    },

    get changes() {
      return this._changes;
    },

    //region public interface
    set newValue(valueSpec) {
      this.set(valueSpec);
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

    get oldValue() {
      return this._oldValue;
    },
    //endregion


    set: function(fragment, keyArgs) {
      this._set(
        fragment,
        !arg.optional(keyArgs, "noAdd"),
        !arg.optional(keyArgs, "noUpdate"),
        !arg.optional(keyArgs, "noRemove"),
        arg.optional(keyArgs, "index")
      );
    },

    _set: function(fragment, add, update, remove, index) {
      var list = this.oldValue,
        elems = list._elems,
        keys  = list._keys,
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
      while(++i < L) if((elem = list._cast(setElems[i])) != null) {
        key = elem.key;

        // Store input keys for removal loop, below.
        if(remove) setKeys[key] = 1;

        if((existing = O.getOwn(keys, key))) {
          if(update && existing !== elem) {
            // This may trigger change events, that, in turn, may
            // perform further list changes and reenter `List#_set`.
            this._updateOne(existing, elem); // list._updateOne(existing, elem, true);
          }
        } else if(add) {
          this._insertOne(elem, index++); // list._insertOne(elem, index++, key, true);
        }
      }

      // II - Remove Cycle
      if(remove) {
        elems = list._elems;
        i = elems.length;
        while(i) {
          --i;
          elem = elems[i];
          key  = elem.key;
          if(!O.hasOwn(setKeys, key)) this._removeOne(elem, i); // list._removeOne(elem, i, key, true);
        }
      }

    },

    _remove: function(fragment) {
      var list = this.oldValue,
        remElems = Array.isArray(fragment) ? fragment : [fragment],
        L = remElems.length,
        i = -1,
        index, elem;

      // traversing in forward order, instead of backward, to make it more probable that changes are
      // registered in a single change statement.
      while(++i < L) {
        if((elem = remElems[i]) && list.has(elem.key) && (index = list._elems.indexOf(elem)) > -1) {
          this._removeOne(elem, index);
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
      
      this.changes.push(new RemoveChange(removed, start));
    },
    
    _sort: function(comparer) {
      this.changes.push(new SortChange(comparer));
    },

    _insertOne: function(elem, index) {
      this.changes.push(new AddChange(elem, index));
    },

    _removeOne: function(elem, index) {
      this.changes.push(new RemoveChange(elem, index));
    },

    _updateOne: function(elem, other) {
      this.changes.push(new UpdateChange(elem, other));
    },

    //--------------------------------------- commit -----------------------------------
    
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

    _commit: function() {
      this.simulate(this._oldValue);
    }
  });
});
