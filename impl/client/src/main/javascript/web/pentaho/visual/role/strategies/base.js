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
  "module",
  "pentaho/lang/NotImplementedError",
  "pentaho/i18n!../i18n/messages"
], function(module, NotImplementedError, bundle) {

  "use strict";

  return [
    "complex",
    function(Complex) {

      /**
       * @name pentaho.visual.role.strategies.Base.Type
       * @class
       * @extends pentaho.type.Complex.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.strategies.Base}.
       */

      /**
       * @name pentaho.visual.role.strategies.Base
       * @class
       * @extends pentaho.type.Complex
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.strategies.Base>} pentaho/visual/role/strategies/base
       *
       * @classDesc The `MappingStrategy` class describes a strategy for mapping data from the data space
       * to the visual space, and back.
       *
       * @description Creates a visual role mapping strategy instance.
       * @constructor
       * @param {pentaho.visual.role.strategies.spec.IBase} [spec] A mapping strategy specification.
       */
      var MappingStrategy = Complex.extend(/** @lends pentaho.visual.role.strategies.Base# */{
        $type: /** @lends pentaho.visual.role.strategies.Base.Type# */{
          id: module.id
        },

        /**
         * Gets a suitable mapper for the given visual role property, data set view and visual role mode.
         *
         * If the strategy is not suitable for mapping the given arguments, `null` should be returned.
         *
         * When the returned mapper is not `null`, it must be such that:
         *
         * 1. Its [inputData]{@link pentaho.visual.role.strategies.IMapper#inputData} property is
         *    the given `inputData` argument;
         * 2. Its [mode]{@link pentaho.visual.role.strategies.IMapper#mode} is the given `mode` argument.
         * 3. Its [dataType]{@link pentaho.visual.role.strategies.IMapper#dataType} is a subtype of the
         *    [dataType]{@link pentaho.visual.role.Mode#dataType} of the `mode` argument.
         *
         * @name getMapper
         * @memberOf pentaho.visual.role.strategies.Base#
         * @method
         * @param {!pentaho.type.visual.role.Property.Type} propType - The visual role property type.
         * @param {!pentaho.data.ITable} inputData - The data set view to be mapped.
         * @param {!pentaho.visual.role.Mode} mode - The visual role mode of `propType` which will be used.
         *
         * @return {pentaho.visual.role.strategies.IMapper} A suitable mapper, or,
         * if the strategy cannot map this situation, `null`.
         *
         * @abstract
         */

        // ---

        getMapper: function() {
          throw new NotImplementedError();
        }
      })
      .implement({$type: bundle.structured.strategies.base});

      return MappingStrategy;
    }
  ];
});
