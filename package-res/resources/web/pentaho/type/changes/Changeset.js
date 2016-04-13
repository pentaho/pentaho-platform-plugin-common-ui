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
  "./Change",
  "../../util/error"
], function(Change, error) {
  "use strict";

  return Change.extend("pentaho.type.changes.Changeset", /** @lends pentaho.type.changes.Changeset# */{

    /**
     * @alias Changeset
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.Change
     * @amd pentaho/type/changes/Changeset
     * @abstract
     *
     * @classDesc The `Changeset` class describes a set of changes occurring in a structured value,
     * the [owner]{@link pentaho.type.changes.Changeset#owner} value.
     *
     * A changeset is a container for a set of
     * [PrimitiveChange]{@link pentaho.type.changes.PrimitiveChange} instances.
     *
     * @constructor
     * @description Creates an empty `Changeset` for a given owner value.
     *
     * @param {!pentaho.type.UStructuredValue} owner - The structured value where the changes take place.
     */
    constructor: function(owner) {
      if(!owner) throw error.argRequired("owner");

      this._owner = owner;
    },

    /**
     * Gets the structured value where the changes take place.
     *
     * @type {!pentaho.type.UStructuredValue}
     * @readOnly
     */
    get owner() {
      return this._owner;
    },

    /**
     * Gets a value that indicates if there are any changes.
     *
     * @type {boolean}
     * @readOnly
     */
    get hasChanges() {
      return false;
    },

    /**
     * Removes all changes.
     */
    clearChanges: function() {
      throw error.notImplemented("clearChanges");
    },

    /**
     * Applies the contained changes to the owner value or, alternatively, to a given value.
     *
     * @param {pentaho.type.UStructuredValue} [target] - The value to which changes are applied.
     *
     * When unspecified, defaults to {@link pentaho.type.changes.Changeset#owner}.
     *
     * @abstract
     */

    apply: function(target) {
      throw error.notImplemented("apply");
    }
  });
});