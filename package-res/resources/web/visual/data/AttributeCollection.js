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
  "./Attribute",
  "./Collection",
  "../_utils"
], function(Attribute, Collection, utils) {

  /**
   * @classdesc A collection of attributes.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/visual/data/AttributeCollection"`.
   *
   * @description Initializes an attribute collection.
   *
   * An attribute collection is not constructed directly.
   * One is obtained through a model's
   * {@link pentaho.visual.data.Model#attributes} property.
   *
   * @class
   * @memberOf pentaho.visual.data
   * @extends pentaho.visual.data.Collection
   * @see pentaho.visual.data.Attribute
   */
  function AttributeCollection() {
    Collection.call(this);
  }

  utils.inherit(AttributeCollection, Collection, /** @lends pentaho.visual.data.AttributeCollection# */{
    //region List implementation
    /**
     * Gets the class of elements of the list:
     * {@link pentaho.visual.data.Attribute}.
     *
     * @type function
     * @readonly
     */
    elemClass: Attribute,
    //endregion

    _cachedKeyArgs: null,

    _cast: function(spec, index) {
      var ka = this._cachedKeyArgs || (this._cachedKeyArgs = {ordinal: 0});
      ka.ordinal = index;
      return Attribute.to(spec, ka);
    }

    /**
     * Creates a specification of the attributes collection.
     *
     * @name pentaho.visual.data.AttributeCollection#toSpec
     * @method
     * @return {Array.<pentaho.visual.data.IAttributeSpec>} A specification of the attributes collection.
     */
  });

  /**
   * Converts an array of attribute specifications or instances
   * to an attributes collection.
   *
   * @ignore
   * @alias to
   * @memberOf pentaho.visual.data.AttributeCollection
   * @param {Array.<pentaho.visual.data.IAttributeSpec|pentaho.visual.data.Attribute>} [attrs]
   *    The attribute specifications or instances.
   * @return {pentaho.visual.data.AttributeCollection} An attribute collection.
   */
  AttributeCollection.to = function(attrs) {
    if(attrs != null && !(attrs instanceof Array)) throw utils.error.argInvalid("attrs", "Not an array.");

    return utils.setClass(attrs || [], AttributeCollection);
  };

  return AttributeCollection;
});