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
  "./List",
  "./Base",
  "../util/object"
], function(List, Base, O) {
  "use strict";

  var baseProto = Base.Array.prototype;

  // TODO: This class has several undocumented methods.

  return List.extend("pentaho.lang.SortedList", /** @lends  pentaho.lang.SortedList# */{
    /**
     * @classdesc The `SortedList` class is an abstract base class for ordered arrays.
     *
     * ### Remarks
     *
     * If an attempt is made to add an element to a specific index of the list,
     * an error is thrown.
     *
     * @class
     * @name SortedList
     * @memberOf pentaho.lang
     * @abstract
     * @extends pentaho.lang.List
     * @amd pentaho/lang/SortedList
     *
     * @description Initializes a sorted list instance.
     *
     * Note that because a `SortedList` is a sub-class of `Array`,
     * the `new` operator cannot be used to create instances (at least up to ECMAScript version 5).
     * Instead, instances of `SortedList` are actually initial instances of `Array`
     * whose prototype is then changed to be that of `SortedList`.
     *
     * In other words, `SortedList` is an "initialization" constructor
     * (see {@link pentaho.lang.ISpecifiable} for more information
     *  on these concepts).
     *
     * Concrete `SortedList` sub-classes should provide a static `to` method
     * to help in their construction.
     *
     * @param {Object}   [keyArgs]         The keyword arguments.
     * @param {?Function} [keyArgs.comparer] Specifies a function that defines the sort order.
     *
     * `keyArgs` is also passed-through to the methods that handle
     * the initialization of each list element.
     */
    constructor: function(keyArgs) {
      if(keyArgs != null && typeof keyArgs.comparer === "function") {
        this.comparer = keyArgs.comparer;
      }

      this.base(keyArgs);
    },

    __comparer: function(e1, e2) {
      if(e1 == null || e2 == null) {
        if(e1 != null) {
          return 1;
        }

        if(e2 != null) {
          return -1;
        }

        return 0;
      }

      var v1 = e1.valueOf();
      var v2 = e2.valueOf();

      return v1 === v2 ? 0 : (v1 > v2 ? 1 : -1);
    },

    get comparer() {
      return this.__comparer;
    },

    set comparer(comparer) {
      var hasOwn = O.hasOwn(this, "__comparer");
      if(hasOwn && this.__comparer !== comparer || !hasOwn && comparer != null) {
        if(comparer == null) {
          delete this.__comparer;
        } else {
          this.__comparer = comparer;
        }

        this.sort();
      }
    },

    sort: function(comparer) {
      if(comparer != null && comparer !== this.comparer) {
        throw new Error("Can't specify a different sorting function in a sorted list.");
      }

      this.base(this.comparer);
    },

    /**
     * Performs a binary search on the sorted list.
     *
     * @param {*} elem The item to search for.
     *
     * @return {number} The index of the element;
     *                  when not found returns the negative
     *                  index of the closest element.
     */
    search: function(elem) {
      var left = 0;
      var right = this.length - 1;

      while(left <= right) {
        // x | 0 is equivalent to Math.floor(x)
        var i = (left + right) / 2 | 0;

        var comparison = this.comparer(this[i], elem);

        if(comparison < 0) {
          left = i + 1;
        } else if(comparison > 0) {
          right = i - 1;
        } else {
          return i;
        }
      }

      // two's complement operation being used to
      // return (x+1)*-1 in a hackish way
      return ~right;
    },

    copyWithin: function() {
      throw new Error("Can't copy within a sorted list.");
    },

    fill: function() {
      throw new Error("Can't fill a sorted list.");
    },

    reverse: function() {
      throw new Error("Can't reverse a sorted list.");
    },

    unshift: function() {
      throw new Error("Can't do a indexed insert in a sorted list.");
    },

    insert: function() {
      throw new Error("Can't do a indexed insert in a sorted list.");
    },

    replace: function() {
      throw new Error("Can't do a indexed replace in a sorted list.");
    },

    splice: function() {
      if(arguments.length > 2) {
        throw new Error("Can't do a indexed insert in a sorted list.");
      }

      this.base(arguments);
    },

    __insertInOrder: function(elem, keyArgs) {
      var elem2 = this._adding(elem, null, keyArgs);

      if(elem2 !== undefined) {
        var index = Math.abs(this.search(elem2));
        // Direct call base proto splice to avoid sorted list restrictions
        baseProto.splice.call(this, index, 0, elem2);

        if(this._added) {
          this._added(elem2, index, keyArgs);
        }
      }

      return elem2;
    },

    _addMany: function(elems, keyArgs) {
      var isReplay = elems === this;
      var LE = elems.length;
      if(!LE) {
        return this.length;
      }

      var i = 0;

      if(isReplay) {
        while(i < LE) {
          var elem = elems[i];

          var elem2 = this._adding(elem, i, keyArgs);

          if(elem2 === undefined) {
            // Not added afterall
            // Remove from the array
            this.splice(i, 1);

            LE--;
            continue;
          } else {
            if(elem !== elem2) {
              this[i] = elem2;
            }

            if(this._added) this._added(elem2, i, keyArgs);
          }

          i++;
        }

        // sort initial array
        this.sort();
      } else {
        while(i < LE) {
          this.__insertInOrder(elems[i], keyArgs);

          i++;
        }
      }

      return LE;
    }
  });
});
