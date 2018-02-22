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
  "pentaho/i18n!messages",
  "pentaho/type/util"
], function(bundle, typeUtil) {

  "use strict";

  return [
    "complex",
    function(Complex) {

      /**
       * @name pentaho.visual.role.MappingField
       * @class
       * @extends pentaho.type.Complex
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.MappingField>} pentaho/visual/role/mappingField
       *
       * @classDesc The `MappingField` class represents a data property in a
       * [visual role mapping]{@link pentaho.visual.role.Mapping}.
       *
       * @see pentaho.visual.role.Mapping
       *
       * @description Creates a visual role mapping field instance.
       * @constructor
       * @param {pentaho.visual.role.spec.UMappingField} [spec] A visual role mapping field specification.
       */
      return Complex.extend("pentaho.visual.role.MappingField", /** @lends pentaho.visual.role.MappingField# */{

        constructor: function(spec, keyArgs) {
          // The name property?
          if(typeof spec === "string") spec = {name: spec};

          this.base(spec, keyArgs);
        },

        /**
         * Gets the visual role mapping that owns this mapping field, if any, or `null`.
         *
         * @type {pentaho.visual.base.role.Mapping}
         * @readonly
         */
        get mapping() {
          // TODO: Test it is a fields list of a mapping...
          var fieldsList = typeUtil.__getFirstRefContainer(this);
          return fieldsList && typeUtil.__getFirstRefContainer(fieldsList);
        },

        /**
         * Gets the visual model that owns this visual role mapping field, if any, or `null`.
         *
         * @type {pentaho.visual.base.Model}
         * @readonly
         */
        get model() {
          var mapping = this.mapping;
          return mapping && mapping.model;
        },

        /**
         * Gets the _data attribute_ referenced by this visual role mapping field.
         *
         * @type {pentaho.data.Attribute}
         * @private
         * @readonly
         * @deprecated
         *
         * @see pentaho.visual.role.MappingField#name
         * @see pentaho.visual.role.MappingField#mapping
         * @see pentaho.visual.role.MappingField#model
         */
        get __dataAttribute() {
          var name = this.name;
          if(name) {
            var data;
            var model = this.model;
            if(model && (data = model.data)) {
              return data.model.attributes.get(name);
            }
          }

          return null;
        },

        /** @inheritDoc */
        toSpecInContext: function(keyArgs) {

          var spec = this.base(keyArgs);

          if(spec.constructor === Object) {
            // If only the name is output, then return it directly.
            var count = 0;
            var name = null;

            /* eslint guard-for-in: 0 */
            for(var p in spec) {
              count++;
              if(count > 1 || p !== "name") break;
              // count === 0 && p === name
              name = spec.name;
            }

            if(name && count === 1) spec = name;
          }

          return spec;
        },

        $type: {
          props: [
            /**
             * Gets or sets the name of the data property.
             *
             * This property is required.
             *
             * @name pentaho.visual.role.MappingField#name
             * @type {string}
             * @see pentaho.visual.role.spec.IMappingField#name
             */
            {name: "name", valueType: "string", isRequired: true}
          ]
        }
      })
      .implement({$type: bundle.structured.MappingField});
    }
  ];
});
