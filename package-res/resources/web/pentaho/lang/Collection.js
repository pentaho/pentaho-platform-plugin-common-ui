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
  "./List",
  "../util/object"
], function(List, O) {

  return List.extend("pentaho.lang.Collection", /** @lends pentaho.lang.Collection# */{
    /**
     * @classdesc The `Collection` class is an abstract base class for typed ordered maps.
     *
     * ### AMD
     *
     * To obtain the constructor of this class,
     * require the module `"pentaho/lang/Collection"`.
     *
     * ### Remarks
     *
     * A collection is a list whose elements can only be contained in one position.
     * If an attempt is made to add a duplicate element to the collection,
     * an error is thrown.
     *
     * Additionally, collection elements can be accessed by their key, and not only by position.
     *
     * Elements of a collection must implement the {@link pentaho.lang.ICollectionElement} interface.
     *
     * @class
     * @name Collection
     * @memberOf pentaho.lang
     * @abstract
     * @extends pentaho.lang.List
     *
     * @description Initializes a collection instance.
     *
     * Note that because a `Collection`  is a sub-class of `Array`,
     * it cannot be a "newable" constructor function (at least up to ECMAScript version 5).
     * Instead, instances of `Collection` are actually initial instances of `Array`
     * whose prototype is then changed to be that of `Collection`.
     * In other words, `Collection` is an "initialization" constructor
     * (see {@link pentaho.lang.ISpecifiable} for more information
     *  on these concepts.
     *
     * Concrete `Collection` sub-classes should provide a static `to` method
     * to help in their construction.
     *
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * These are not used directly by the `Collection` class
     * but are passed-through to the methods that handle
     * the initialization of each list element.
     */
    constructor: function Collection(keyArgs) {
      this._keys = {};

      this.base(keyArgs);
    },

    copyTo: function(col) {
      this.base(col);
      O.assignOwn(col._keys, this._keys);
    },

    /**
     * Gets the value returned by
     * {@link pentaho.lang.Collection#get}
     * when an element with a given key
     * is not contained in the collection.
     *
     * @type *
     * @default null
     * @readonly
     */
    missingValue: null,

    /**
     * Gets the constructor function of the elements held by this collection.
     *
     * This class must implement the {@link pentaho.lang.ICollectionElement} interface.
     *
     * @name pentaho.lang.Collection#elemClass
     * @type function
     * @abstract
     * @readonly
     */

    _getKeyName: function() {
      return this.elemClass.prototype.keyName;
    },

    _getElemKey: function(elem) {
      return elem.key;
    },

    _sayElemWithKey: function(key) {
      return "A " + this._getElemName()  + " with " + this._getKeyName() + " '" + key + "'";
    },

    _sayElemCannotHaveNullyKey: function() {
      return "A " + this._getElemName()  + " cannot have a nully " + this._getKeyName() + " value.";
    },

    _adding: function(elem, index, ka) {
      var elem2 = this._cast(elem, index, ka);
      if(elem2 !== undefined) {
        var key = this._getElemKey(elem2);
        if(key == null) throw new Error(this._sayElemCannotHaveNullyKey());
        if(this.has(key)) throw new Error(this._sayElemWithKey(key) + " is already included.");
      }
      return elem2;
    },

    _replacing: function(elem, index, elem0, ka) {
      var elem2 = this._cast(elem, index, ka);
      if(elem2 !== undefined) {
        var key = this._getElemKey(elem2);
        if(key == null) throw new Error(this._sayElemCannotHaveNullyKey());
      }
      return elem2;
    },

    _added: function(elem) {
      this._keys[this._getElemKey(elem)] = elem;
    },

    _replaced: function(elem) {
      this._keys[this._getElemKey(elem)] = elem;
    },

    /**
     * Checks if a given element belongs to the collection.
     *
     * @param {?pentaho.lang.IWithKey} [elem] The element to check.
     * @return {boolean} `true` if the element is belongs to the collection, `false` otherwise.
     */
    includes: function(elem) {
      if(elem) {
        var key = this._getElemKey(elem);
        if(key != null) return this.get(key) === elem;
      }
      return false;
    },

    /**
     * Tests if an element with a given key belongs to the collection.
     *
     * @param {string} [key] The element's key.
     * @return {boolean} `true` if an element with the given key belongs to the collection, `false` otherwise.
     */
    has: function(key) {
      var key2;
      return key != null &&
         (key2 = this._castKey(key)) != null &&
          O.hasOwn(this._keys, key2);
    },

    /**
     * Gets an element given its key.
     *
     * @param {string} [key] The element's key.
     * @param {boolean} [assertExists=false] Indicates if an error should be thrown when
     *     the collection does not contain an element with the given key.
     *
     * @return {pentaho.lang.ICollectionElement|*} The element with the given key,
     *     if one is contained by the collection,
     *     or {@link pentaho.lang.Collection#missingValue},
     *     otherwise.
     * @see pentaho.lang.Collection#getExisting
     */
    get: function(key, assertExists) {
      var key2;
      if(key != null &&
         (key2 = this._castKey(key)) != null &&
         O.hasOwn(this._keys, key2)) {
        return this._keys[key2];
      }

      if(assertExists) throw new Error(this._sayElemWithKey(key2) + " is not defined.");

      return this.missingValue;
    },

    /**
     * Gets an existing element given its key.
     *
     * An error is thrown when
     * the collection does not contain an element with the given key.
     *
     * @param {string} [key] The element's key.
     * @return {pentaho.lang.ICollectionElement} The element with the given key.
     * @see pentaho.lang.Collection#get
     */
    getExisting: function(key) {
      return this.get(key, true);
    },

    _castKey: function(key) {
      return key;
    }
  });
});