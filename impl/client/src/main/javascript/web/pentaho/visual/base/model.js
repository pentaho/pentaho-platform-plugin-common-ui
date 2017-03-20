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

  "pentaho/type/model",
  "./application",
  "pentaho/lang/Event",
  "pentaho/util/fun",
  "pentaho/util/object",
  "../action/SelectionModes",

  "pentaho/i18n!model",

  // pre-load all visual role mapping types
  "../role/mapping",
  "../role/nominal",
  "../role/ordinal",
  "../role/quantitative"
], function(module, modelFactory, visualApplicationFactory,
            Event, F, O, SelectionModes, bundle, mappingFactory) {

  "use strict";

  return function(context) {

    var Model = context.get(modelFactory);
    var Mapping = context.get(mappingFactory);

    /**
     * @name Model
     * @memberOf pentaho.visual.base
     * @class
     * @extends pentaho.type.Model
     * @abstract
     *
     * @amd {pentaho.type.Factory<pentaho.visual.base.Model>} pentaho/visual/base
     *
     * @classDesc The `Model` class is the abstract base class of visualization models.
     *
     * @constructor
     * @description Creates a visual model.
     * @param {pentaho.visual.base.spec.IModel} [modelSpec] A plain object containing the model specification.
     */
    var VisualModel = Model.extend(/** @lends pentaho.visual.base.Model# */{

      _initValue: function(value, propType) {
        // Empty visual role mapping?
        return !value && propType.type.isSubtypeOf(Mapping.type)
            ? propType.toValue({})
            : value;
      },

      // region serialization
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

      type: /** @lends pentaho.visual.base.Model.Type# */{
        sourceId: module.id,
        id: module.id.replace(/.\w+$/, ""),
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
            type: visualApplicationFactory
          },
          {
            name: "data",
            type: "object",
            isRequired: true
          }
        ],

        /**
         * Calls a function for each defined visual role property type.
         *
         * A visual role property type is a property type whose
         * [value type]{@link pentaho.type.Property.Type#type} is a subtype of
         * [Mapping]{@link pentaho.visual.role.Mapping}.
         *
         * @param {function(pentaho.type.Property.Type, number, pentaho.type.Complex) : boolean?} f - The mapping
         * function. Return `false` to break iteration.
         *
         * @param {Object} [x] The JS context object on which `f` is called.
         *
         * @return {pentaho.visual.base.Model} This object.
         */
        eachVisualRole: function(f, x) {
          var j = 0;
          this.each(function(propType) {
            if(this.isVisualRole(propType.type) && f.call(x, propType, j++, this) === false) {
              return false;
            }
          }, this);
          return this;
        },

        /**
         * Gets a value that indicates if a given property type is a subtype of
         * [Mapping]{@link pentaho.visual.role.Mapping.Type}.
         *
         * @param {!pentaho.type.Type} type - The type to test.
         * @return {boolean} `true` if `type` is a mapping type; or `false`, otherwise.
         */
        isVisualRole: function(type) {
          return type.isSubtypeOf(Mapping.type);
        }
      }
    })
    .implement({type: bundle.structured.type});

    return VisualModel;
  };
});
