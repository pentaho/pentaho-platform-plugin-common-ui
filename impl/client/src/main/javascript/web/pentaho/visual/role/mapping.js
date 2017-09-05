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
  "pentaho/i18n!messages",
  "pentaho/type/util"
], function(module, bundle, typeUtil) {

  "use strict";

  return [
    "complex",
    "pentaho/visual/role/mappingAttribute",
    "pentaho/visual/role/level",
    function(Complex, MappingAttribute, MeasurementLevel) {

      /**
       * @name pentaho.visual.role.Mapping.Type
       * @class
       * @extends pentaho.type.Complex.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.Mapping}.
       */

      /**
       * @name pentaho.visual.role.Mapping
       * @class
       * @extends pentaho.type.Complex
       *
       * @amd {pentaho.type.Factory<pentaho.visual.role.Mapping>} pentaho/visual/role/mapping
       *
       * @classDesc The `Mapping` class holds the association between
       * a specific visual role and the data properties, here named _data attributes_,
       * of a visualization's current dataset.
       *
       * The mapping holds two pieces of information:
       *
       * 1. an optional, fixed [level of measurement]{@link pentaho.visual.role.Mapping#level}
       *    in which the visual role should operate
       * 2. a list of associations to data properties,
       *    [attributes]{@link pentaho.visual.role.Mapping#attributes},
       *    each of the type {@link pentaho.visual.role.MappingAttribute}.
       *
       * @description Creates a visual role mapping instance.
       * @constructor
       * @param {pentaho.visual.role.spec.IMapping} [spec] A visual role mapping specification.
       */
      var VisualRoleMapping = Complex.extend(/** @lends pentaho.visual.role.Mapping# */{

        /**
         * Gets the visual model that owns this visual role mapping, if any, or `null`.
         *
         * @type {pentaho.visual.base.Model}
         * @readOnly
         */
        get model() {
          // TODO: Test it is a visual Model (cyclic dependency)
          return typeUtil.__getFirstRefContainer(this);
        },

        /**
         * Gets a value that indicates if the mapping has any attributes.
         *
         * @type {boolean}
         * @readonly
         */
        get isMapped() {
          return this.attributes.count > 0;
        },

        $type: /** @lends pentaho.visual.role.Mapping.Type# */{
          id: module.id,

          props: [
            /**
             * Gets or sets the fixed measurement level on which the associated visual role is to operate.
             *
             * When `null` or unspecified,
             * the associated visual role operates in an automatically determined measurement level,
             * as returned by [levelAutoOn]{@link pentaho.visual.role.Property.Type#levelAutoOn}.
             *
             * When specified,
             * it must be one of the measurement levels supported by the associated visual role,
             * as defined in [levels]{@link pentaho.visual.role.Property.Type#levels};
             * otherwise, the mapping is considered _invalid_.
             *
             * @name pentaho.visual.role.Mapping#level
             * @type {pentaho.visual.role.Level}
             *
             * @see pentaho.visual.role.spec.IMapping#level
             */
            {name: "level", valueType: MeasurementLevel},

            /**
             * Gets or sets the attributes of the visual role mapping.
             *
             * @name pentaho.visual.role.Mapping#attributes
             * @type {pentaho.type.List<pentaho.visual.role.MappingAttribute>}
             */
            {name: "attributes", valueType: [MappingAttribute]}
          ]
        }
      })
      .implement({$type: bundle.structured.mapping});

      return VisualRoleMapping;
    }
  ];
});
