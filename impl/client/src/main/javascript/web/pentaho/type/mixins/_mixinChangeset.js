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
  "pentaho/util/error"
], function(error) {
  "use strict";

  /**
   * @name _mixinChangeset
   * @memberOf pentaho.type.mixins
   * @mixin
   * @private
   */
  return  /** @lends pentaho.type.mixins._mixinChangeset */{

    /**
     * Initializes the mixin.
     *
     * @param {!pentaho.type.ComplexChangeset} changeset - An object that describes the changes
     * to be made to a set of properties.
     * @protected
     */
    _initChangeset: function(changeset) {
      if(!changeset) throw error.argRequired("changeset");
      this._cset = changeset;
    },

    /**
     * Gets the object with the changes to the set of properties.
     *
     * @type {!pentaho.type.ComplexChangeset}
     * @readonly
     */
    get changeset() {
      return this._cset;
    }
  };
});
