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
  "./Change"
], function(Change) {
  "use strict";

  /**
   * @name PrimitiveChange
   * @memberOf pentaho.type.changes
   * @class
   * @abstract
   * @extends pentaho.type.changes.Change
   * @amd pentaho/type/changes/PrimitiveChange
   *
   * @classDesc The `PrimitiveChange` class is the abstract base class of changes
   * that are the direct consequence of performing **primitive operations** on a
   * [structured value]{@link pentaho.type.UContainer}.
   *
   * Primitive changes always exist in the context of a [Changeset]{@link pentaho.type.changes.Changeset}.
   *
   * Example primitive changes are
   * the [Replace]{@link pentaho.type.changes.Replace} operation on a [Complex]{@link pentaho.type.Complex} value, and
   * the [Add]{@link pentaho.type.changes.Add} and [Clear]{@link pentaho.type.changes.Clear} operations on a
   * [List]{@link pentaho.type.List} value.
   *
   * @description Creates a `PrimitiveChange` instance.
   */

  return Change.extend("pentaho.type.changes.PrimitiveChange", /** @lends pentaho.type.changes.PrimitiveChange# */{
    /**
     * Register reference changes caused by the change.
     *
     * @param {!pentaho.type.changes.Transaction} transaction - The ambient transaction, provided for performance.
     * @param {!pentaho.type.mixins.Container} container - The container instance.
     *
     * @protected
     *
     * @see pentaho.type.changes.ListChangeset.__addChange
     * @see pentaho.type.changes.ComplexChangeset.__setElement
     */
    _prepareRefs: function(transaction, container) {
    },

    /**
     * Unregisters reference changes caused by the change.
     *
     * @param {!pentaho.type.changes.Transaction} transaction - The ambient transaction, provided for performance.
     * @param {!pentaho.type.mixins.Container} container - The container instance.
     *
     * @protected
     *
     * @see pentaho.type.changes.ListChangeset#_clearChanges
     * @see pentaho.type.changes.ComplexChangeset#_clearChanges
     * @see pentaho.type.changes.ComplexChangeset.__setElement
     */
    _cancelRefs: function(transaction, container) {
    }
  });
});
