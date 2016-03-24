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
   * @name mixinChangeset
   * @memberOf pentaho.lang.mixins.mixinChangeset
   * @mixin
   */
  return  /** @lends pentaho.lang.mixins.mixinChangeset# */{

    /**
     * Initializes the mixin.
     *
     * @param {!pentaho.lang.ComplexChangeset|*} changeset - A changeset representing the changes made to the properties values.
     * @protected
     */
    _initChangeset: function(changeset) {
      if(!changeset) throw error.argRequired("changeset");
      this._changeset = changeset;
    },

    /**
     * Gets the changeset representing the changes made to the properties values.
     *
     * @type !pentaho.lang.ComplexChangeset
     * @readonly
     */
    get changeset() {
      return this._changeset;
    }
  };
});
