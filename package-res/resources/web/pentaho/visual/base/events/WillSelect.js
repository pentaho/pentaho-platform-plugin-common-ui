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
  "../mixins/mixinDataFilter"
], function(will, mixinDataFilter) {
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
      constructor: function(source, dataFilter, selectionMode) {
        this.base(source);
        this._initFilter(dataFilter || null, true);
        this._selectionMode = selectionMode || null;
      },

      set selectionMode(f) {
        if(typeof f === "function")
          this._selectionMode = f;
      },

      get selectionMode() {
        return this._selectionMode;
      }
    })
    .implement(mixinDataFilter);

});