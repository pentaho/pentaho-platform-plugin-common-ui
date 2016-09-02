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
  "./Attribute",
  "../lang/Collection"
], function(Attribute, Collection) {

  /**
   * @name AttributeCollection
   * @memberOf pentaho.data
   * @class
   * @extends pentaho.lang.Collection
   *
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
