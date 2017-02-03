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
   * @name Change
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.lang.Base
   * @amd pentaho/type/changes/Change
   * @abstract
   *
   * @classDesc The `Change` class is the abstract base class of classes that
   * describe changes in [structured value instances]{@link pentaho.type.UStructuredValue}.
   */
  return Base.extend("pentaho.type.changes.Change", /** @lends pentaho.type.changes.Change# */{

    // Block default Base.js constructor
    constructor: function() {}

    /**
     * Gets the type of change.
     *
     * @name type
     * @memberOf pentaho.type.changes.Change#
     * @type {string}
     * @readonly
     * @abstract
     */

    /**
     * Applies any local primitive changes.
     *
     * @name _apply
     * @memberOf pentaho.type.changes.Change#
     * @method
     * @param {!pentaho.type.ContainerMixin} target - The container to which changes are applied.
     * @abstract
     */
  });
});

