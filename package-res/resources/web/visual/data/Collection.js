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
  "../_utils"
], function(List, utils) {

  /**
   * @classdesc The `Collection` class is an abstract base class for typed ordered maps.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/visual/data/Collection"`.
   *
   * ### Remarks
   *
   * A collection is a list whose elements can only be contained in one position.
   * If an attempt is made to add a duplicate element to the collection,
   * an error is thrown.
   *
   * Additionally, collection elements can be accessed by their key, and not only by position.
   *
   * Elements of a collection must implement the {@link pentaho.visual.data.ICollectionElement} interface.
   *
   * @description Initializes a collection instance.
   *
   * Note that because a `Collection`  is a sub-class of `Array`,
   * it cannot be a "newable" constructor function (at least up to ECMAScript version 5).
   * Instead, instances of `Collection` are actually initial instances of `Array`
   * whose prototype is then changed to be that of `Collection`.
   * In other words, `Collection` is an "initialization" constructor
   * (see {@link pentaho.visual.data.ISpecifiable} for more information
   *  on these concepts.
   *
   * Concrete `Collection` sub-classes should provide a static `to` method
   * to help in their construction.
   *
   * @class
   * @abstract
   * @memberOf pentaho.visual.data
   * @extends pentaho.visual.data.List
   */
  function Collection(keyArgs) {
    this._keys = {};

    List.call(this, keyArgs);
  }

  utils.inherit(Collection, List, /** @lends pentaho.visual.data.Collection# */{

    /**
     * Gets the value returned by
     * {@link pentaho.visual.data.Collection#get}
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
     * This class must implement the {@link pentaho.visual.data.ICollectionElement} interface.
     *
     * @name pentaho.visual.data.Collection#elemClass
     * @type function
     * @abstract
     * @readonly
     */

    _sayElemWithKey: function(key) {
      var elemProto = this.elemClass.prototype;
      return "A " + elemProto.elemName  + " with " + elemProto.keyName + " '" + key + "'";
    },

    _sayElemCannotHaveNullyKey: function() {
      var elemProto = this.elemClass.prototype;
      return "A " + elemProto.elemName  + " cannot have a nully " + elemProto.keyName + " value.";
    },

    _adding: function(elem) {
      var key = elem.key;
      if(key == null) throw new Error(this._sayElemCannotHaveNullyKey());
      if(this.has(key)) throw new Error(this._sayElemWithKey(key) + " is already included.");
    },

    _added: function(elem) {
      this._keys[elem.key] = elem;
    },

    /**
     * Checks if a given element belongs to the collection.
     *
     * @param {?pentaho.visual.data.IWithKey} [elem] The element to check.
     * @return {boolean} `true` if the element is belongs to the collection, `false` otherwise.
     */
    includes: function(elem) {
      if(elem) {
        var key = elem.key;
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
         utils.O_hasOwn.call(this._keys, key2);
    },

    /**
     * Gets an element given its key.
     *
     * @param {string} [key] The element's key.
     * @param {boolean} [assertExists=false] Indicates if an error should be thrown when
     *     the collection does not contain an element with the given key.
     *
     * @return {pentaho.visual.data.ICollectionElement|*} The element with the given key,
     *     if one is contained by the collection,
     *     or {@link pentaho.visual.data.Collection#missingValue},
     *     otherwise.
     * @see pentaho.visual.data.Collection#getExisting
     */
    get: function(key, assertExists) {
      var key2;
      if(key != null &&
         (key2 = this._castKey(key)) != null &&
         utils.O_hasOwn.call(this._keys, key2)) {
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
     * @return {pentaho.visual.data.ICollectionElement} The element with the given key.
     * @see pentaho.visual.data.Collection#get
     */
    getExisting: function(key) {
      return this.get(key, true);
    },

    _castKey: function(key) {
      return key;
    }
  });

  /*
  Collection.to = function(colSpec, keyArgs) {
    if(col != null && !(colSpec instanceof Array)) throw utils.error.argInvalid("colSpec", "Not an array.");

    return utils.setClass(colSpec || [], Collection, keyArgs);
  };
  */

  return Collection;
});