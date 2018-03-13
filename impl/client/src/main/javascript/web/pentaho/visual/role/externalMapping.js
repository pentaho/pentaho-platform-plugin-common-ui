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
  "pentaho/i18n!../i18n/messages",
  "pentaho/type/util",

  // so that r.js sees otherwise invisible dependencies.
  "./baseMapping"
], function(bundle, typeUtil) {

  "use strict";

  return [
    "./baseMapping",
    function(BaseMapping) {

      var context = this;

      /**
       * @name pentaho.visual.role.ExternalMapping.Type
       * @class
       * @extends pentaho.visual.role.BaseMapping.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.ExternalMapping}.
       */

      /**
       * @name pentaho.visual.role.ExternalMapping
       * @class
       * @extends pentaho.visual.role.BaseMapping
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.ExternalMapping>} pentaho/visual/role/externalMapping
       *
       * @classDesc The `ExternalMapping` class holds the association between
       * a specific visual role and the data fields of a visualization's current data set,
       * as seen by parties external to a visualization, such as a container.
       *
       * It extends the base [Mapping]{@link pentaho.visual.role.BaseMapping} class to add
       * the optional [isCategoricalFixed]{@link pentaho.visual.role.ExternalMapping#isCategoricalFixed} property.
       *
       * @description Creates a visual role external mapping instance.
       * @constructor
       * @param {pentaho.visual.role.spec.IExternalMapping} [spec] An external mapping specification.
       */
      var ExternalMapping = BaseMapping.extend(/** @lends pentaho.visual.role.ExternalMapping# */{

        constructor: function(spec) {

          this.base(spec);

          /**
           * The cached role adapter.
           *
           * @type {undefined|null|pentaho.visual.role.IAdapter}
           * @private
           */
          this.__adapter = undefined;
        },

        /**
         * Resets any existing data or mapping related cached information.
         *
         * Called by the containing abstract model whenever its data or visual role properties change.
         *
         * @protected
         * @override
         */
        _onDataOrMappingChanged: function() {
          this.__adapter = undefined;
        },

        /**
         * Gets the current adapter, if any, or `null`.
         *
         * An adapter exists if:
         * 1. the mapping is associated with a visualization,
         * 2. the mapping refers to an existing visual role property of the visualization's model,
         * 3. the mapped fields exist in the visualization's data set
         * 4. the mapped fields can be adapted into one of the modes of the visual role property.
         *
         * @type {pentaho.visual.role.IAdapter}
         * @readOnly
         * @see pentaho.visual.role.ExternalProperty.Type#getAdapterOn
         */
        get adapter() {
          var adapter;

          // Within a transaction?
          if(context.transaction !== null) {
            // Do not cache or use cache.
            // Doing this covers the will phase of change actions, in which multiple iterations can occur.
            // There would be no way to reset adapters cached during the process.
            adapter = this.__getAdapter();

          } else if((adapter = this.__adapter) === undefined) {

            adapter = this.__adapter = this.__getAdapter();
          }

          return adapter || null;
        },

        /**
         * Obtains the current adapter from the referring visualization and visual role property.
         *
         * @return {pentaho.visual.role.IAdapter} An adapter, or `null`.
         * @private
         */
        __getAdapter: function() {
          var iref = this._modelReference;
          if(iref !== null) {
            return iref.property.getAdapterOn(iref.container) || null;
          }

          return null;
        },

        $type: /** @lends pentaho.visual.role.ExternalMapping.Type# */{

          props: [
            /**
             * Gets or sets a value that indicates that only categorical modes of operation should be considered.
             *
             * This option only takes effect if the visual role
             * has any continuous [modes]{@link pentaho.visual.role.BaseProperty.Type#modes}.
             *
             * When the value is `true`,
             * only the categorical modes of [modes]{@link pentaho.visual.role.BaseProperty.Type#modes} are considered.
             *
             * @name pentaho.visual.role.ExternalMapping#isCategoricalFixed
             * @type {boolean}
             * @default false
             * @see pentaho.visual.role.spec.IExternalMapping#isCategoricalFixed
             */
            {name: "isCategoricalFixed", valueType: "boolean", isRequired: true, defautValue: false}
          ]
        }
      })
      .implement({$type: bundle.structured.externalMapping});

      return ExternalMapping;
    }
  ];
});
