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

  // so that r.js sees otherwise invisible dependencies.
  "./baseMapping",
  "./mappingField",
  "./mode"
], function(bundle) {

  "use strict";

  return [
    "./baseMapping",
    "./mappingField",
    "./mode",
    function(BaseMapping, MappingField, Mode) {

      /**
       * @name pentaho.visual.role.Mapping.Type
       * @class
       * @extends pentaho.visual.role.BaseMapping.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.Mapping}.
       */

      /**
       * @name pentaho.visual.role.Mapping
       * @class
       * @extends pentaho.visual.role.BaseMapping
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.Mapping>} pentaho/visual/role/mapping
       *
       * @classDesc The `Mapping` class holds the association between
       * a specific visual role and the data fields of a model's current data set,
       * as seen internally to the visualization, by the view.
       *
       * It extends the base [Mapping]{@link pentaho.visual.role.BaseMapping} class to add
       * the [mode]{@link pentaho.visual.role.Mapping#mode} of operation of the visual role;
       *
       * @description Creates a visual role internal mapping instance.
       * @constructor
       * @param {pentaho.visual.role.spec.IMapping} [spec] A visual role internal mapping specification.
       */
      var Mapping = BaseMapping.extend(/** @lends pentaho.visual.role.Mapping# */{

        /**
         * Resets any existing data or mapping related cached information.
         *
         * Called by the containing abstract model whenever its data or visual role properties change.
         *
         * @protected
         * @friend pentaho.visual.base.AbstractModel
         */
        _onDataOrMappingChanged: function() {
          // Clear any cached mode.
          this.__mode = undefined;
        },

        // region mode
        __mode: undefined,

        /**
         * Gets the _effective_ operation mode in which the associated visual role is to operate.
         *
         * Calling this property is equivalent to calling
         * [getModeEffectiveOn]{@link pentaho.visual.role.Property.Type#getModeEffectiveOn}
         * on the the containing visual role property.
         * However, the results are cached for performance reasons.
         *
         * @name pentaho.visual.role.Mapping#mode
         * @type {pentaho.visual.role.Mode}
         * @readonly
         *
         * @see pentaho.visual.role.Property.Type#getModeEffectiveOn
         */
        get mode() {
          var mode = this.__mode;
          if(mode === undefined) {
            var iref = this._modelReference;
            if(iref !== null) {
              // Cache the mode.
              this.__mode = mode = iref.property.getModeEffectiveOn(iref.container);
            } else {
              mode = null;
            }
          }

          return mode;
        },
        // endregion

        $type: /** @lends pentaho.visual.role.Mapping.Type# */{
          props: [
            /**
             * Gets or sets the _fixed_ operation mode in which the associated visual role is to operate.
             *
             * When specified,
             * it must be equal to one of the operation [modes]{@link pentaho.visual.role.Property.Type#modes}
             * of the associated visual role property;
             * otherwise, the mapping is considered _invalid_.
             *
             * The effective mode in which the visual role operates is given by
             * the [mode]{@link pentaho.visual.role.Mapping#mode}.
             *
             * @name pentaho.visual.role.Mapping#modeFixed
             * @type {pentaho.visual.role.Mode}
             *
             * @see pentaho.visual.role.spec.IMapping#modeFixed
             * @see pentaho.visual.role.Mapping#mode
             */
            {name: "modeFixed", valueType: Mode}
          ]
        }
      })
      .implement({$type: bundle.structured.mapping});

      return Mapping;
    }
  ];
});
