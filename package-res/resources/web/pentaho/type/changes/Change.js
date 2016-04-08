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
  "./Operation",
  "../../util/error"
], function(Operation, error) {
  "use strict";

  /**
   * @name Change
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Operation
   * @amd pentaho/type/changes/Change
   * @abstract
   *
   * @classDesc Base class for describing changes on the values of properties.
   *
   * @constructor
   * @description Creates an instance.
   *
   * @param {!pentaho.type.Complex} owner - The [complex]{@linkplain pentaho.type.Complex} associated with this change.
   */
  return Operation.extend("pentaho.type.changes.Change", /** @lends pentaho.type.changes.Change# */{

    constructor: function(owner) {
      this._owner = owner;
    },

    /**
     * The [complex]{@linkplain pentaho.type.Complex} associated with this change.
     *
     * @type {!pentaho.type.Complex}
     * @readonly
     */
    get owner() {
      return this._owner;
    },

    /**
     * Assigns a value to this change.
     *
     * @method
     * @abstract
     */
    set: null,

    /**
     * Updates the owning [complex]{@linkplain pentaho.type.Complex} with this change.
     *
     * @method
     * @protected
     * @abstract
     */
    _commit: null

  });

});

