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
  "pentaho/module!_",
  "./AbstractMapping",
  "pentaho/i18n!messages"
], function(module, AbstractMapping, bundle) {

  "use strict";

  // NOTE: these will be kept private until it is decided between the model adapter and the viz concept.

  /**
   * @name pentaho.visual.role.ExternalMappingType
   * @class
   * @extends pentaho.visual.role.AbstractMappingType
   *
   * @private
   *
   * @classDesc The type class of {@link pentaho.visual.role.ExternalMapping}.
   */

  /**
   * @name pentaho.visual.role.ExternalMapping
   * @class
   * @extends pentaho.visual.role.AbstractMapping
   *
   * @private
   *
   * @amd pentaho/visual/role/ExternalMapping
   *
   * @classDesc The `ExternalMapping` class holds the association between
   * a specific visual role and the data fields of a visualization's current data set,
   * as seen by parties external to a visualization, such as a container.
   *
   * It extends the base [Mapping]{@link pentaho.visual.role.AbstractMapping} class to add
   * the optional [isCategoricalFixed]{@link pentaho.visual.role.ExternalMapping#isCategoricalFixed} property.
   *
   * @description Creates a visual role external mapping instance.
   * @constructor
   * @param {pentaho.visual.role.spec.IExternalMapping} [spec] An external mapping specification.
   */
  var ExternalMapping = AbstractMapping.extend(/** @lends pentaho.visual.role.ExternalMapping# */{

    // region strategy
    /**
     * Gets the current strategy, if any, or `null`.
     *
     * @type {pentaho.visual.role.adaptation.Strategy}
     * @readOnly
     */
    get strategy() {
      var iref = this._modelReference;
      return iref !== null ? iref.container.__getAmbientRoleStrategy(iref.property.name) : null;
    },
    // endregion

    // region mode
    /**
     * Gets the operation mode in which the associated visual role is to operate.
     *
     * @type {pentaho.visual.role.Mode}
     * @readonly
     * @override
     */
    get mode() {
      var iref = this._modelReference;
      return iref !== null ? iref.container.__getAmbientRoleMode(iref.property.name) : null;
    },
    // endregion

    $type: /** @lends pentaho.visual.role.ExternalMappingType# */{

      id: module.id,

      props: [
        /**
         * Gets or sets a value that indicates that only categorical modes of operation should be considered.
         *
         * This option only takes effect if the visual role
         * has any continuous [modes]{@link pentaho.visual.role.AbstractPropertyType#modes}.
         *
         * When the value is `true`,
         * only the categorical modes of [modes]{@link pentaho.visual.role.AbstractPropertyType#modes}
         * are considered.
         *
         * @name pentaho.visual.role.ExternalMapping#isCategoricalFixed
         * @type {boolean}
         * @default false
         * @see pentaho.visual.role.spec.IExternalMapping#isCategoricalFixed
         */
        {name: "isCategoricalFixed", valueType: "boolean", isRequired: true, defaultValue: false}
      ]
    }
  })
  .localize({$type: bundle.structured.ExternalMapping})
  .configure({$type: module.config});

  return ExternalMapping;
});
