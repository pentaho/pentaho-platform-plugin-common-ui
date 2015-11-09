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
  "./Member",
  "./Collection",
  "../_utils"
], function(Member, Collection, utils) {

  /**
   * @classdesc A collection of members.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/visual/data/MemberCollection"`.
   *
   * @description Initializes a members collection.
   *
   * A members collection is not constructed directly.
   * One is obtained through an attribute's
   * {@link pentaho.visual.data.Attribute#members} property.
   *
   * @class
   * @memberOf pentaho.visual.data
   * @extends pentaho.visual.data.Collection
   * @param {!Object} keyArgs The keyword arguments.
   * @param {pentaho.visual.data.Attribute} keyArgs.attribute The attribute to which the
   *    members collection belongs.
   *
   * @see pentaho.visual.data.Member
   */
  function MemberCollection(keyArgs) {
    this._attr = utils.required(keyArgs, "attribute", "keyArgs");

    Collection.call(this);
  }

  utils.inherit(MemberCollection, Collection, /** @lends pentaho.visual.data.MemberCollection# */{

    //region List implementation
    /**
     * Gets the class of elements of the list:
     * {@link pentaho.visual.data.Member}.
     *
     * @type function
     * @readonly
     */
    elemClass: Member,
    //endregion

    //region IOfAttribute implementation
    /**
     * Gets the attribute to which the members collection belongs.
     *
     * @type !pentaho.visual.data.Attribute
     * @readonly
     */
    get attribute() {
      return this._attr;
    },
    //endregion

    _cachedKeyArgs: null,

    _cast: function(spec, index) {
      var ka = this._cachedKeyArgs || (this._cachedKeyArgs = {ordinal: 0});
      ka.ordinal = index;
      return this._attr.toMemberOf(spec, ka);
    },

    /**
     * Gets or creates and adds a member having a given value.
     *
     * @param {pentaho.visual.data.Atomic} value The member's value.
     */
    getOrAdd: function(value) {
      return this.get(value) || this.add(value);
    }

    /**
     * Creates a specification of the members collection.
     *
     * @name pentaho.visual.data.MemberCollection#toSpec
     * @method
     * @return {Array.<pentaho.visual.data.IMemberSpec>} A specification of the members collection.
     */
  });

  /**
   * Converts an array of member specifications to a members collection.
   *
   * @ignore
   * @alias to
   * @memberOf pentaho.visual.data.MemberCollection
   * @param {Array.<pentaho.visual.data.IMemberSpec>} [members]
   *    The member specifications.
   * @param {!Object} keyArgs The keyword arguments.
   * @param {pentaho.visual.data.Attribute} keyArgs.attribute The attribute to which the
   *    members collection will belong.
   *
   * @return {pentaho.visual.data.MemberCollection} A members collection.
   */
  MemberCollection.to = function(members, keyArgs) {
    if(members != null && !(members instanceof Array)) throw utils.error.argInvalid("members", "Not an array.");

    return utils.setClass(members || [], MemberCollection, keyArgs);
  };

  return MemberCollection;
});