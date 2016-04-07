/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../../lang/Base"
], function(Base) {
  "use strict";

  /**
   * @name BaseChange
   * @memberOf pentaho.type.changes
   * @class
   *
   * @classDesc Base class for changes.
   *
   * @extends pentaho.lang.Base
   * @amd pentaho/type/_change/BaseChange
   */
  return Base.extend("pentaho.type.changes.BaseChange", /** @lends pentaho.type.changes.BaseChange# */{
    /**
     * Identifies the operation implemented by this change.
     * @type {string}
     * @readonly
     * @abstract
     */
    type: null,

    /**
     * Implements an operation on an object.
     *
     * @method
     * @param {!pentaho.type.Value} obj - The object to which he
     * @return {!pentaho.type.Value} Returns an object that
     * @abstract
     *
     */
    simulate: null
  });
});

