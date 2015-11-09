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
  "./_Annotatable",
  "../_utils"
], function(AttributeCollection, Annotatable, utils) {

  var annotProto = Annotatable.prototype;

  /**
   * @classdesc The `Model` class contains metadata about a certain type of entities.
   *
   * In a nutshell, a model contains the definition of attributes that can be attributed to its entities.
   *
   * A model, just like all of its main components,
   * implements the {@link pentaho.visual.data.IAnnotatable}.
   * As such, any desired data can be associated with it.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/visual/data/Model"`.
   *
   * ### Remarks
   *
   * @class
   * @memberOf pentaho.visual.data
   * @implements pentaho.visual.data.IAnnotatable
   * @implements pentaho.visual.data.ISpecifiable
   *
   * @param {pentaho.visual.data.IModelSpec |
   *     Array.<pentaho.visual.data.IAttributeSpec |
   *     pentaho.visual.data.Attribute>} [spec] The model specification.
   *
   * An array of attribute specifications or instances can also be specified.
   */
  function Model(spec) {

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
     * @type !(pentaho.visual.data.AttributeCollection)
     * @readonly
     */
    this.attributes = AttributeCollection.to(attrsSpec);

    /**
     * Gets the common format provider specification of the model.
     *
     * This format provider provides defaults to the format providers
     * of every attribute of the model.
     *
     * @type ?pentaho.visual.data.IFormatProviderSpec
     * @see pentaho.visual.data.Attribute#format
     */
    this.format = (spec && spec.format) || null;

    if(spec && spec.p) this.p = spec.p;
    Annotatable.call(this);
  }

  /**
   * Converts a model specification to a model instance.
   *
   * If the value specified in the `modelSpec` argument is already a model instance, it is returned.
   * Otherwise, a new model is created and returned.
   *
   * @param {pentaho.visual.data.Model|pentaho.visual.data.ModelSpec} [modelSpec]
   *    A model instance or specification.
   *
   * @return {pentaho.visual.data.Model} A model instance.
   */
  Model.to = function(modelSpec) {
      return (modelSpec instanceof Model) ? modelSpec : new Model(modelSpec);
  };

  return utils.implement(Model, /** @lends pentaho.visual.data.Model# */{
    //region ISpecifiable implementation
    /**
     * Creates a specification of the model.
     *
     * @return {pentaho.visual.data.IModelSpec}
     *    A specification of the model.
     */
    toSpec: function() {
      var spec = {
        attrs: this.attributes.toSpec(),

        // TODO: deep-clone returned format spec...
        format: this.format
      };

      return annotProto.toSpec(spec);
    }
    //endregion
  });
});
