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
define(["../_utils"], function(utils) {

  var baseProto = [];

  /**
   * @classdesc The `List` class is an abstract base class for typed arrays.
   *
   * Elements of a list must implement the {@link pentaho.visual.data.IListElement} interface.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/visual/data/List"`.
   *
   * @description Initializes a list instance.
   *
   * Note that because a `List` is a sub-class of `Array`,
   * it cannot be a "newable" constructor function (at least up to ECMAScript version 5).
   * Instead, instances of `List` are actually initial instances of `Array`
   * whose prototype is then changed to be that of `List`.
   * In other words, `List` is an "initialization" constructor
   * (see {@link pentaho.visual.data.ISpecifiable} for more information
   *  on these concepts.
   *
   * Concrete `List` sub-classes should provide a static `to` method
   * to help in their construction.
   *
   * @class
   * @abstract
   * @memberOf pentaho.visual.data
   * @extends Array
   * @param {Object} [keyArgs] The keyword arguments.
   *
   * These are not used directly by the `List` class
   * but are passed-through to the methods that handle
   * the initialization of each list element.
   */
  function List(keyArgs) {
    this._addMany(this, true, keyArgs);
  }

  utils.inherit(List, baseProto, /** @lends  pentaho.visual.data.List# */{
    // Optional hook methods
    // _adding(elem, index, keyArgs) -> replacement elem or undefined
    _adding: null,

    // _added(elem, index, keyArgs)
    _added: null,

    // abstract
    /**
     * Gets the constructor function of the elements held by this list.
     *
     * This class must implement the {@link pentaho.visual.data.IListElement} interface.
     *
     * @type function
     * @abstract
     * @readonly
     */
    elemClass: null,

    /**
     * The length of the list.
     *
     * @name pentaho.visual.data.List#length
     * @readonly
     * @type number
     */

    /**
     * Appends elements to the list and returns its new length.
     *
     * The values specified in `elems` are converted to the list elements' class
     * before actually being added to it.
     *
     * This method adds elements to the list using default options.
     * Use one of
     * {@link pentaho.visual.data.List#add} or
     * {@link pentaho.visual.data.List#addMany}
     * to be able to specify non-default options (keyword arguments).
     *
     * @param {...*} elems The elements to add to the list.
     * @return {number} The new length of the list.
     */
    push: function() {
      return this._addMany(arguments, false);
    },

    /**
     * Appends elements to the list and returns its new length.
     *
     * The values specified in `elems` are converted to the list elements' class
     * before actually being added to it.
     *
     * This method allows adding elements to the list using custom options (keyword arguments).
     * Contrast with method {@link pentaho.visual.data.List#push} which
     * adds elements using default options.
     *
     * @param {Array} elems An array of elements to add to the list.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * These are not used directly by the `List` class
     * but are passed-through to the methods that handle
     * the initialization of each list element.
     *
     * @return {number} The new length of the list.
     */
    addMany: function(elems, keyArgs) {
      return this._addMany(elems, false, keyArgs);
    },

    /**
     * Appends an element to the list and returns it.
     *
     * The value specified in argument `elem` is converted to the list elements' class
     * before actually being added to it.
     *
     * @param {*} elem An element or a value convertible to one.
     * @param {Object} [keyArgs] The keyword arguments.
     *
     * These are not used directly by the `List` class
     * but are passed-through to the methods that handle
     * the initialization of list elements.
     *
     * @return {pentaho.visual.data.IListElement} The added list element.
     */
    add: function(elem, keyArgs) {
      return this.insert(elem, this.length, keyArgs);
    },

    insert: function(elem, at, keyArgs) {
      var elem2 = this._cast(elem, at, keyArgs);

      if(this._adding) this._adding(elem2, at, keyArgs);

      baseProto.splice.call(this, at, 0, elem2);

      if(this._added) this._added(elem2, at, keyArgs);

      return elem2;
    },

    _cast: function(elem, index, keyArgs) {
      return this.elemClass ? this.elemClass.to(elem, keyArgs) : elem;
    },

    _addMany: function(elems, isReplay, keyArgs) {
      var LE = elems.length;
      if(!LE) return this.length;

      var adding = this._adding,
          added = this._added,
          i = 0,
          at = isReplay ? 0 : this.length;
      while(i < LE) {
        var elem = elems[i++],
            elem2 = this._cast(elem, at, keyArgs);
        if(adding) adding.call(this, elem2, at, keyArgs);
        if(isReplay) {
          if(elem !== elem2) this[at] = elem2;
        } else {
          baseProto.push.call(this, elem2);
        }
        if(added) added.call(this, elem2, at, keyArgs);
        at++;
      }

      return at;
    },

    //region ISpecifiable implementation
    /**
     * Creates a specification of this list.
     *
     * A list specification is an array containing the specifications of each of its elements.
     *
     * If the element's class does not implement {@link pentaho.visual.data.ISpecifiable},
     * each element is assumed to be its own specification.
     *
     * @return {Array} The list specification.
     */
    toSpec: function() {
      return this.map(function(elem) { return elem.toSpec ? elem.toSpec() : elem; });
    }
    //endregion
  });

  return List;
});