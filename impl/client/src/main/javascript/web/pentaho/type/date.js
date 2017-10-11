/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "../util/date",
  "../i18n!types"
], function(date, bundle) {

  "use strict";

  return ["simple", function(Simple) {

    /**
     * @name pentaho.type.Date
     * @class
     * @extends pentaho.type.Simple
     * @amd {pentaho.type.spec.UTypeModule<pentaho.type.Date>} pentaho/type/date
     *
     * @classDesc The class of date values.
     *
     * @description Creates a date instance.
     * @constructor
     * @param {pentaho.type.spec.IDate|Date|string} [spec] A date specification.
     */
    var PenDate = Simple.extend(/** @lends pentaho.type.Date# */{
      /**
       * Gets the underlying `Date` object of the date value.
       * @name pentaho.type.Date#value
       * @type Date
       * @readonly
       */

      // region serialization
      /** @inheritDoc */
      _toJSONValue: function(keyArgs) {
        // A string in a format based upon a simplification of the ISO-8601 Extended Format,
        // as defined by [ECMA-262]{@link http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15}.
        return this.value.toJSON();
      },
      // endregion

      $type: /** @lends pentaho.type.Date.Type# */{
        alias: "date",

        cast: function(v) {
          return date.parseDateEcma262v7(v);
        }
      }
    }).implement(/** @lends pentaho.type.Date# */{
      $type: bundle.structured["date"] // eslint-disable-line dot-notation
    });

    return PenDate;
  }];
});
