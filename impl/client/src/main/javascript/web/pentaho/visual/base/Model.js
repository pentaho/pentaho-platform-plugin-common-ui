/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "./AbstractModel",
  "./KeyTypes",
  "pentaho/util/text",
  "pentaho/util/error",
  "../role/Property" // Pre-loaded with Model
], function(module, AbstractModel, KeyTypes, textUtil, errorUtil) {

  "use strict";

  /**
   * @name pentaho.visual.base.ModelType
   * @class
   * @extends pentaho.visual.base.AbstractModelType
   *
   * @classDesc The base class of visual model types.
   *
   * For more information see {@link pentaho.visual.base.Model}.
   */

  /**
   * @name Model
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.visual.base.AbstractModel
   * @abstract
   *
   * @amd pentaho/visual/base/Model
   *
   * @classDesc The `Model` class is the base class of internal models of visualizations.
   *
   * @constructor
   * @description Creates a `Model` instance.
   * @param {pentaho.visual.base.spec.IModel} [modelSpec] A plain object containing the
   * internal model specification.
   */
  return AbstractModel.extend(/** @lends pentaho.visual.base.Model# */{
    $type: /** @lends pentaho.visual.base.ModelType# */{
      id: module.id,
      defaultView: "./View",
      isAbstract: true,

      /** @inheritDoc */
      _init: function(spec, keyArgs) {

        spec = this.base(spec, keyArgs) || spec;

        this.__setVisualKeyType(spec.visualKeyType);

        return spec;
      },

      // region visualKeyType
      __visualKeyType: undefined,

      /** @inheritDoc */
      get visualKeyType() {
        return this.__visualKeyType;
      },

      /**
       * Sets the value of visual key type.
       *
       * If the value is {@link Nully} or an empty string, it is ignored,
       * unless this type is not [isAbstract]{@link pentaho.type.Type#isAbstract},
       * in which case the default value of [dataKey]{@link }pentaho.visual.base.KeyTypes.dataKey} is assumed.
       *
       * @param {?pentaho.visual.base.KeyTypes|undefined} value - The new visual key type, if any.
       *
       * @throw {pentaho.lang.ArgumentRangeError} When the visual key type value is not one of the possible values.
       * @throw {pentaho.lang.OperationInvalidError} When the visual key type value is already set and the specified
       * value is different.
       *
       * @private
       */
      __setVisualKeyType: function(value) {

        value = textUtil.nonEmptyString(value);

        var visualKeyType = this.__visualKeyType;
        if(visualKeyType === undefined) {

          if(value === null) {

            if(this.isAbstract) {
              return;
            }

            value = KeyTypes.dataKey;

          } else if(!KeyTypes.hasOwnProperty(value)) {

            throw errorUtil.argRange("visualKeyType");
          }

          this.__visualKeyType = value;
          return;
        }

        if(value !== null && visualKeyType !== value) {

          // Would change value...
          throw errorUtil.operInvalid("Once defined, 'visualKeyType' cannot be changed.");
        }
      }
      // endregion
    }
  })
  .configure({$type: module.config});
});
