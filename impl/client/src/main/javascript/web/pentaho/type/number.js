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
  "../i18n!types"
], function(bundle) {

  "use strict";

  return ["simple", function(Simple) {

    /**
     * @name pentaho.type.Number
     * @class
     * @extends pentaho.type.Simple
     * @amd {pentaho.type.spec.UTypeModule<pentaho.type.Number>} pentaho/type/number
     *
     * @classDesc The class of number values.
     *
     * @description Creates a number instance.
     */
    var PenNumber = Simple.extend(/** @lends pentaho.type.Number# */{
      /**
       * Gets the underlying number primitive of the value.
       * @name pentaho.type.Number#value
       * @type number
       * @readonly
       */

      $type: /** @lends pentaho.type.Number.Type# */{
        alias: "number",
        cast: __toNumber,

        /**
         * Gets a value that indicates if this is a continuous type.
         *
         * The {@link pentaho.type.Number} type is continuous.
         *
         * @type {boolean}
         * @readOnly
         * @override
         */
        get isContinuous() {
          return true;
        }
      }
    }).implement(/** @lends pentaho.type.Number# */{
      $type: bundle.structured["number"] // eslint-disable-line dot-notation
    });

    return PenNumber;

    function __toNumber(v) {
      v = +v;
      return isNaN(v) ? null : v;
    }
  }];
});
