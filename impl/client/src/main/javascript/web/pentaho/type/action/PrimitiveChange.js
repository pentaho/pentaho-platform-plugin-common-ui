/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
  "module",
  "./Change"
], function(module, Change) {
  "use strict";

  return Change.extend(module.id, /** @lends pentaho.type.action.PrimitiveChange# */{

    /**
     * @name PrimitiveChange
     * @memberOf pentaho.type.action
     * @class
     * @abstract
     * @extends pentaho.type.action.Change
     * @amd pentaho/type/action/PrimitiveChange
     *
     * @classDesc The `PrimitiveChange` class is the abstract base class of changes
     * that are the direct consequence of performing **primitive operations** on a
     * [structured value]{@link pentaho.type.mixins.Container}.
     *
     * Primitive changes always exist in the context of a [Changeset]{@link pentaho.type.action.Changeset}.
     *
     * Example primitive changes are
     * the [Replace]{@link pentaho.type.action.Replace} operation on a [Complex]{@link pentaho.type.Complex} value, and
     * the [Add]{@link pentaho.type.action.Add} and [Clear]{@link pentaho.type.action.Clear} operations on a
     * [List]{@link pentaho.type.List} value.
     *
     * @constructor
     * @description Creates a `PrimitiveChange` instance.
     */

    /** @inheritDoc */
    get transactionVersion() {
      return this.__txnVersion;
    },

    /**
     * Sets the new transaction version of this change.
     *
     * @param {number} txnVersion - The transaction version.
     * @protected
     * @internal
     */
    _setTransactionVersion: function(txnVersion) {
      this.__txnVersion = txnVersion;
    },

    /**
     * Registers reference changes caused by this change.
     *
     * @param {pentaho.type.action.Changeset} changeset - The changeset.
     *
     * @protected
     * @internal
     */
    _prepare: function(changeset) {
    },

    /**
     * Unregisters reference changes caused by this change.
     *
     * @param {pentaho.type.action.Changeset} changeset - The changeset.
     *
     * @protected
     * @internal
     */
    _cancel: function(changeset) {
    }
  });
});
