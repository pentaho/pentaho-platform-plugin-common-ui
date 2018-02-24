/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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

  // so that r.js sees otherwise invisible dependencies.
  "pentaho/visual/role/mappingField"
], function(bundle) {

  "use strict";

  return [
    "complex",
    "./mappingField",
    function(Complex, MappingField) {

      /**
       * @name pentaho.visual.role.BaseMapping.Type
       * @class
       * @extends pentaho.type.Complex.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.BaseMapping}.
       */

      /**
       * @name pentaho.visual.role.BaseMapping
       * @class
       * @extends pentaho.type.Complex
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.BaseMapping>} pentaho/visual/role/baseMapping
       *
       * @classDesc The `BaseMapping` class is the base class for associations between
       * a visual role and data fields of a visualization's current data set.
       *
       * A mapping contains a list of [fields]{@link pentaho.visual.role.BaseMapping#fields},
       * each of the type [MappingField]{@link pentaho.visual.role.MappingField}.
       *
       * @description Creates a visual role mapping instance.
       * @constructor
       * @param {pentaho.visual.role.spec.IBaseMapping} [spec] A visual role mapping specification.
       */
      var Mapping = Complex.extend(/** @lends pentaho.visual.role.BaseMapping# */{

        /**
         * Gets a value that indicates if the mapping has any fields.
         *
         * @type {boolean}
         * @readonly
         * @deprecated
         */
        get isMapped() {
          return this.fields.count > 0;
        },

        /**
         * Gets a value that indicates if the mapping has any fields.
         *
         * @type {boolean}
         * @readonly
         */
        get hasFields() {
          return this.fields.count > 0;
        },

        /**
         * Resets any existing adaptation related cached information.
         *
         * Called by the containing abstract model whenever its data or visual role properties change.
         *
         * @protected
         * @friend pentaho.visual.base.AbstractModel
         */
        _onDataOrMappingChanged: function() {
        },

        /**
         * Gets the reference corresponding to the containing abstract model and visual role property, if any.
         *
         * @type {?({container: pentaho.visual.base.AbstractModel, property: pentaho.visual.role.BaseProperty})}
         * @readOnly
         * @protected
         */
        get _modelReference() {
          var refs = this.$references;
          if(refs && refs.length) {
            return refs[0];
          }
          return null;
        },

        $type: /** @lends pentaho.visual.role.BaseMapping.Type# */{
          props: [
            /**
             * Gets or sets the fields of the visual role mapping.
             *
             * @name pentaho.visual.role.BaseMapping#fields
             * @type {pentaho.type.List<pentaho.visual.role.MappingField>}
             */
            {name: "fields", valueType: [MappingField]}
          ]
        }
      })
      .implement({$type: bundle.structured.baseMapping});

      return Mapping;
    }
  ];
});
