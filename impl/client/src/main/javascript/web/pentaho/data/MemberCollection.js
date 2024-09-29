/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "./Member",
  "../lang/Collection",
  "../util/arg"
], function(Member, Collection, arg) {

  return Collection.extend("pentaho.data.MemberCollection", /** @lends pentaho.data.MemberCollection# */{
    /**
     * @alias MemberCollection
     * @memberOf pentaho.data
     * @class
     * @extends pentaho.lang.Collection
     * @ignore
     * @classdesc A collection of members.
     *
     * ### AMD
     *
     * To obtain the constructor of this class,
     * require the module `"pentaho/data/MemberCollection"`.
     *
     * @description Initializes a members collection.
     *
     * A members collection is not constructed directly.
     * One is obtained through an attribute's
     * {@link pentaho.data.Attribute#members} property.
     *
     * @param {object} keyArgs The keyword arguments.
     * @param {pentaho.data.Attribute} keyArgs.attribute The attribute to which the
     *    members collection belongs.
     *
     * @see pentaho.data.Member
     */
    constructor: function(keyArgs) {

      this._attr = arg.required(keyArgs, "attribute", "keyArgs");

      this.base();
    },

    // region List implementation
    /**
     * Gets the class of elements of the list:
     * {@link pentaho.data.Member}.
     *
     * @type function
     * @readonly
     */
    elemClass: Member,
    // endregion

    // region IOfAttribute implementation
    /**
     * Gets the attribute to which the members collection belongs.
     *
     * @type pentaho.data.Attribute
     * @readonly
     */
    get attribute() {
      return this._attr;
    },
    // endregion

    _cachedKeyArgs: null,

    _cast: function(spec, index) {
      var ka = this._cachedKeyArgs || (this._cachedKeyArgs = {ordinal: 0});
      ka.ordinal = index;
      return this._attr.toMemberOf(spec, ka);
    },

    /**
     * Gets or creates and adds a member having a given value.
     *
     * @param {pentaho.data.Atomic} value The member's value.
     */
    getOrAdd: function(value) {
      return this.get(value) || this.add(value);
    }

    /**
     * Creates a specification of the members collection.
     *
     * @name pentaho.data.MemberCollection#toSpec
     * @method
     * @return {Array.<pentaho.data.spec.IMember>} A specification of the members collection.
     */
  });
});
