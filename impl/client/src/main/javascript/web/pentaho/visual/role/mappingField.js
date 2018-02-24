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
  "pentaho/i18n!messages"
], function(bundle) {

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
       * @classDesc The `MappingField` class represents a field in a
       * [visual role mapping]{@link pentaho.visual.role.BaseMapping}.
       *
       * @see pentaho.visual.role.BaseMapping
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
             * Gets or sets the name of the field.
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
