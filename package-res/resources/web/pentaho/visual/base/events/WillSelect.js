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
  "./will",
  "../mixins/mixinDataFilter",
  "pentaho/util/error",
  "./DidSelect",
  "./RejectedSelect"
], function(will, mixinDataFilter, error, Did, Rejected) {
  "use strict";

  /**
   * @name WillSelect
   * @memberOf pentaho.visual.base.events
   * @description This event is triggered when
   * the {@link pentaho.visual.base.Model#selectAction|Select Action} flow starts.
   * The listeners of `will:select` are allowed to:
   * - cancel the event,
   * - replace the input data filter
   * - replace the selection mode.
   *
   * @extends pentaho.visual.base.events.Will
   * @event "will:select"
   */
  return will("select").extend("pentaho.visual.base.events.WillSelect",
    /** @lends pentaho.visual.base.events.WillSelect# */{

      /**
       * Creates a `WillSelect` event.
       *
       * @constructor
       *
       * @param {!Object} source - The object where the event will be initially emitted.
       * @param {!pentaho.data.filter.AbstractFilter} dataFilter - A filter representing the data set of the visual element(s) which the user interacted with.
       * @param {?function} selectionMode - A function that represents how the selection made by the user
       * will be merged with the current selection.
       * A function representing the way a new {@link pentaho.data.filter.AbstractFilter|Data Filters} with previous selections.
       */
      constructor: function(source, dataFilter, selectionMode) {
        if(!selectionMode) throw error.argRequired("selectionMode");;

        this.base(source);
        this._initFilter(dataFilter, true);
        this.selectionMode = selectionMode;
      },

      set selectionMode(f) {
        if(f != null && typeof f !== "function") {
          throw error.argInvalidType("selectionMode", "function", typeof f);
        }
        this._selectionMode = f;
      },

      get selectionMode() {
        return this._selectionMode;
      },

      Did: Did,
      Rejected: Rejected
    })
    .implement(mixinDataFilter);

});
