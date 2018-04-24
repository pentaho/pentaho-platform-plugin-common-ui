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
  "pentaho/module!",
  "./Simple",
  "pentaho/util/date",
  "pentaho/i18n!types"
], function(module, Simple, dateUtil, bundle) {

  "use strict";

  /**
   * @name pentaho.type.Date
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/Date
   *
   * @classDesc The class of date values.
   *
   * @description Creates a date instance.
   * @constructor
   * @param {pentaho.type.spec.IDate|Date|string} [spec] A date specification.
   */
  return Simple.extend(/** @lends pentaho.type.Date# */{
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

    $type: /** @lends pentaho.type.DateType# */{
      id: module.id,

      cast: function(v) {
        return dateUtil.parseDateEcma262v7(v);
      },

      /**
       * Gets a value that indicates if this is a continuous type.
       *
       * The {@link pentaho.type.Date} type is continuous.
       *
       * @type {boolean}
       * @readOnly
       * @override
       */
      get isContinuous() {
        return true;
      }
    }
  })
  .localize({$type: bundle.structured.Date})
  .configure({$type: module.config});
});
