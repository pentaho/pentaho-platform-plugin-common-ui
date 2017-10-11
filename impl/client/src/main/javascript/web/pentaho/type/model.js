/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "../i18n!types"
], function(bundle) {

  "use strict";

  return ["complex", "application", function(Complex, Application) {

    /**
     * @name pentaho.type.Model.Type
     * @class
     * @extends pentaho.type.Complex.Type
     *
     * @classDesc The base type class of model types.
     *
     * For more information see {@link pentaho.type.Model}.
     */

    /**
     * @name pentaho.type.Model
     * @class
     * @extends pentaho.type.Complex
     *
     * @amd {pentaho.type.spec.UTypeModule<pentaho.type.Model>} pentaho/type/model
     *
     * @classDesc The base class of model values.
     *
     * Models are complex values that have an [application]{@link pentaho.type.Model#application} property.
     *
     * @description Creates a model instance.
     *
     * @constructor
     * @param {pentaho.type.spec.IModel} [spec] A model specification.
     */
    var Model = Complex.extend(/** @lends pentaho.type.Model# */{

      // region serialization
      /** @inheritDoc */
      toSpecInContext: function(keyArgs) {
        if(keyArgs && keyArgs.isJson) {
          keyArgs = keyArgs ? Object.create(keyArgs) : {};

          var omitProps = keyArgs.omitProps;
          keyArgs.omitProps = omitProps = omitProps ? Object.create(omitProps) : {};

          if(omitProps.application == null) omitProps.application = true;
        }

        return this.base(keyArgs);
      },
      // endregion

      $type: /** @lends pentaho.type.Model.Type# */{
        alias: "model",

        props: [
          /**
           * Gets or sets the application object.
           *
           * The application object represents the relevant state and
           * interface of the application in which a model is being used.
           *
           * This property is not serialized by default.
           * To serialize it, specify the argument `keyArgs.omitProps.application` of
           * [toSpec]{@link pentaho.type.Model#toSpec} to `false`.
           *
           * @name application
           * @memberOf pentaho.type.Model#
           * @type {pentaho.type.Application}
           */
          {
            name: "application",
            valueType: Application
          }
        ]
      }
    })
    .implement({
      $type: bundle.structured.model
    });

    return Model;
  }];
});
