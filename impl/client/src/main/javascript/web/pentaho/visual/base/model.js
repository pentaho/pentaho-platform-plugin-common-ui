/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "pentaho/i18n!model"
], function(module, bundle) {

  "use strict";

  return [
    "pentaho/type/model",
    "pentaho/visual/role/property",
    "pentaho/visual/base/application",
    function(Model, RoleProperty, VisualApplication) {

      var _rolePropertyType = RoleProperty.type;

      /**
       * @name pentaho.visual.base.Model.Type
       * @class
       * @extends pentaho.type.Model.Type
       *
       * @classDesc The base class of visual model types.
       *
       * For more information see {@link pentaho.visual.base.Model}.
       */

      /**
       * @name Model
       * @memberOf pentaho.visual.base
       * @class
       * @extends pentaho.type.Model
       * @abstract
       *
       * @amd {pentaho.type.Factory<pentaho.visual.base.Model>} pentaho/visual/base/model
       *
       * @classDesc The `Model` class is the abstract base class of visualization models.
       *
       * @constructor
       * @description Creates a visualization `Model` instance.
       * @param {pentaho.visual.base.spec.IModel} [modelSpec] A plain object containing the model specification.
       */
      var VisualModel = Model.extend(/** @lends pentaho.visual.base.Model# */{

        // region serialization
        /** @inheritDoc */
        toSpecInContext: function(keyArgs) {

          if(keyArgs && keyArgs.isJson) {
            keyArgs = keyArgs ? Object.create(keyArgs) : {};

            var omitProps = keyArgs.omitProps;
            keyArgs.omitProps = omitProps = omitProps ? Object.create(omitProps) : {};

            // Only isJson serialization does not work with the value of `data`
            // due to the circular dependencies it contains.
            if(omitProps.data == null) omitProps.data = true;
          }

          return this.base(keyArgs);
        },
        // endregion

        $type: /** @lends pentaho.visual.base.Model.Type# */{
          id: module.id,
          defaultView: "./view",
          isAbstract: true,

          props: [
            /**
             * Gets or sets the visual application object.
             *
             * The application object represents the relevant state and
             * interface of the application in which a model is being used.
             *
             * This property does not serialize to JSON by default.
             *
             * @name application
             * @memberOf pentaho.visual.base.Model#
             * @type {pentaho.visual.base.Application}
             */
            {
              name: "application",
              valueType: VisualApplication
            },

            /**
             * Gets or sets the data of the visualization.
             *
             * This property does not serialize to JSON by default.
             *
             * @name data
             * @memberOf pentaho.visual.base.Model#
             * @type {pentaho.data.ITable}
             */
            {
              name: "data",
              valueType: "object",
              isRequired: true
            }
          ],

          /**
           * Calls a function for each defined visual role property type.
           *
           * A visual role property type is a property type which is a subtype of {@link pentaho.visual.role.Property}.
           *
           * @param {function(pentaho.type.Property.Type, number, pentaho.type.Complex) : boolean?} f - The mapping
           * function. Return `false` to break iteration.
           *
           * @param {Object} [x] The JS context object on which `f` is called.
           *
           * @return {!pentaho.visual.base.Model} This object.
           */
          eachVisualRole: function(f, x) {
            var j = 0;
            this.each(function(propType) {
              if(this.isVisualRole(propType) && f.call(x, propType, j++, this) === false) {
                return false;
              }
            }, this);
            return this;
          },

          /**
           * Gets a value that indicates if a given property type is a subtype of
           * {@link pentaho.visual.role.Property.Type}.
           *
           * @param {!pentaho.type.Property.Type} propType - The property type to test.
           * @return {boolean} `true` if `type` is a visual role property type; or `false`, otherwise.
           */
          isVisualRole: function(propType) {
            return propType.isSubtypeOf(_rolePropertyType);
          }
        }
      })
      .implement({$type: bundle.structured.type});

      return VisualModel;
    }
  ];
});
