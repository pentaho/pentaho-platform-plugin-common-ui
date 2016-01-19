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
  "./AttributeCollection",
  "../lang/Base",
  "../lang/_Annotatable"
], function(AttributeCollection, Base, Annotatable) {

  return Base.extend("pentaho.data.Model", /** @lends pentaho.data.Model# */{
    /**
     * @alias Model
     * @memberOf pentaho.data
     * @class
     * @implements pentaho.lang.IAnnotatable
     * @implements pentaho.lang.ISpecifiable
     *
     * @classdesc The `Model` class contains metadata about a certain type of entities.
     *
     * In a nutshell, a model contains the definition of attributes that can be attributed to its entities.
     *
     * A model, just like all of its main components,
     * implements the {@link pentaho.lang.IAnnotatable}.
     * As such, any desired data can be associated with it.
     *
     * ### AMD
     *
     * To obtain the constructor of this class,
     * require the module `"pentaho/data/Model"`.
     *
     * ### Remarks
     *
     * @description Creates a model given a specification.
     *
     * @param {pentaho.data.spec.IModel |
     *     Array.<pentaho.data.spec.IAttribute |
     *     pentaho.data.Attribute>} [spec] The model specification.
     *
     * An array of attribute specifications or instances can also be specified.
     */
    constructor: function(spec) {

      var attrsSpec;
      if(spec instanceof Array) {
        attrsSpec = spec;
        spec = null;
      } else if(spec && spec.constructor === Object) {
        attrsSpec = spec.attrs;
      }

      /**
       * Gets the attributes collection.
       *
       * @type !(pentaho.data.AttributeCollection)
       * @readonly
       */
      this.attributes = AttributeCollection.to(attrsSpec);

      /**
       * Gets the common format provider specification of the model.
       *
       * This format provider provides defaults to the format providers
       * of every attribute of the model.
       *
       * @type ?pentaho.data.spec.IFormatProvider
       * @see pentaho.data.Attribute#format
       */
      this.format = (spec && spec.format) || null;

      Annotatable.call(this, spec);
    },

    //region ISpecifiable implementation
    /**
     * Creates a specification of the model.
     *
     * @return {pentaho.data.spec.IModel}
     *    A specification of the model.
     */
    toSpec: function() {
      var spec = {
        attrs: this.attributes.toSpec(),

        // TODO: deep-clone returned format spec...
        format: this.format
      };

      return Annotatable.toSpec(this, spec);
    }
    //endregion
  }).implement(Annotatable);
});
