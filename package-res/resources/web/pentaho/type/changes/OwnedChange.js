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
  "./Change"
], function(Change) {
  "use strict";

  /**
   * @name OwnedChange
   * @memberOf pentaho.type.changes
   * @class
   * @abstract
   * @extends pentaho/type/changes/OwnedChange
   * @amd pentaho/type/changes/OwnedChange
   *
   * @classDesc Base class for describing modifications to an object.
   */
  return Change.extend("pentaho.type.changes.OwnedChange", /** @lends pentaho.type.changes.OwnedChange# */{
    /**
     * Modifies the provided element.
     *
     * @method
     * @param {!pentaho.type.Element} element - The object to be modified.
     * @abstract
     */
    apply: null
  });
});
