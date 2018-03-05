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

      var context = this;

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
          var mode;

          // Within a transaction?
          if(context.transaction !== null) {
            // Do not cache or use cache.
            // Doing this covers the will phase of change actions, in which multiple iterations can occur.
            // There would be no way to reset the mode cached during the process.
            mode = this.__getMode();
          } else if((mode = this.__mode) === undefined) {
            // When undefined, it's like not caching.
            this.__mode = mode = this.__getMode();
          }

          return mode || null;
        },

        /**
         * Gets the mode from the referring container abstract model and property.
         *
         * When there is no container, `undefined` is returned.
         *
         * @return {undefined|pentaho.visual.role.Mode} The mode, `null` or `undefined`.
         *
         * @private
         */
        __getMode: function() {
          var iref = this._modelReference;
          if(iref !== null) {
            return iref.property.getModeEffectiveOn(iref.container);
          }
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
