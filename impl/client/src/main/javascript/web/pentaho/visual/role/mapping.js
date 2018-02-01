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
    "pentaho/visual/role/mappingAttribute",
    "pentaho/visual/role/mode",
    function(Complex, MappingAttribute, Mode) {

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
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.Mapping>} pentaho/visual/role/mapping
       *
       * @classDesc The `Mapping` class holds the association between
       * a specific visual role and the data properties, here named _data attributes_,
       * of a visualization's current dataset.
       *
       * The mapping allows specifying three pieces of information:
       *
       * 1. an optional, fixed mode of operation, [modeFixed]{@link pentaho.visual.role.Mapping#modeFixed};
       * 2. an optional, fixed scale type, [isContinuousFixed]{@link pentaho.visual.role.Mapping#isContinuousFixed};
       * 3. a list of associations to data properties,
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
          props: [
            /**
             * Gets or sets the fixed mode of operation of the visual role.
             *
             * When specified,
             * it must be equal to one of the visual role's operation
             * [modes]{@link pentaho.visual.role.Property.Type#modes};
             * otherwise, the mapping is considered _invalid_.
             * Also, when specified,
             * the value of [isContinuousFixed]{@link pentaho.visual.role.Mapping#isContinuousFixed} is ignored.
             *
             * When `null` or unspecified,
             * one of the visual role's [modes]{@link pentaho.visual.role.Property.Type#modes} of operation is
             * chosen automatically.
             *
             * @name pentaho.visual.role.Mapping#modeFixed
             * @type {pentaho.visual.role.Mode}
             *
             * @see pentaho.visual.role.spec.IMapping#modeFixed
             * @see pentaho.visual.role.Mapping#isContinuousFixed
             */
            {name: "modeFixed", valueType: Mode},

            /**
             * Gets or sets a value that indicates the type of scale, continuous or categorical,
             * that the associated visual role should use to encode values.
             *
             * When specified,
             * the choice of mode of operation is constrained to [modes]{@link pentaho.visual.role.Property.Type#modes}
             * with the specified scale type, [Mode#isContinuous]{@link pentaho.visual.role.Mode#isContinuous}.
             *
             * When `null` or unspecified, the choice of mode of operation is not constrained.
             *
             * This property is ignored if [modeFixed]{@link pentaho.visual.role.Mapping#modeFixed} is specified.
             *
             * @name pentaho.visual.role.Mapping#isContinuousFixed
             * @type {?boolean}
             *
             * @see pentaho.visual.role.spec.IMapping#isContinuousFixed
             * @see pentaho.visual.role.Mapping#modeFixed
             */
            {name: "isContinuousFixed", valueType: "boolean"},

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
