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
  "./Attribute",
  "../lang/Collection"
], function(Attribute, Collection) {

  /**
   * @name AttributeCollection
   * @memberOf pentaho.data
   * @class
   * @extends pentaho.lang.Collection
   *
   * @ignore
   * @classdesc A collection of attributes.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/data/AttributeCollection"`.
   *
   * @description Initializes an attribute collection.
   *
   * An attribute collection is not constructed directly.
   * One is obtained through a model's
   * {@link pentaho.data.Model#attributes} property.
   *
   * @see pentaho.data.Attribute
   */
  return Collection.extend("pentaho.data.AttributeCollection", /** @lends pentaho.data.AttributeCollection# */{

    // region List implementation
    /**
     * Gets the class of elements of the list:
     * {@link pentaho.data.Attribute}.
     *
     * @type function
     * @readonly
     */
    elemClass: Attribute,
    // endregion

    _cachedKeyArgs: null,

    _cast: function(spec, index) {
      var ka = this._cachedKeyArgs || (this._cachedKeyArgs = {ordinal: 0});
      ka.ordinal = index;
      return Attribute.to(spec, ka);
    }

    /**
     * Creates a specification of the attributes collection.
     *
     * @name pentaho.data.AttributeCollection#toSpec
     * @method
     * @return {Array.<pentaho.data.spec.IAttribute>} A specification of the attributes collection.
     */
  });
});
