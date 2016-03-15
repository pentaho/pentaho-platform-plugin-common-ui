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
  "pentaho/util/error"
], function(will, mixinDataFilter, error) {
  "use strict";

  /**
   * @name WillExecute
   * @memberOf pentaho.visual.base.events
   * @description This event is triggered when
   * the {@link pentaho.visual.base.Model#executeAction|Execute Action} flow starts.
   * The listeners of `will:execute` are allowed to:
   * - cancel the event,
   * - replace the input data filter
   * - replace the `doExecute` action.
   *
   * @extends pentaho.visual.base.events.Will
   * @event "will:execute"
   */
  return will("execute").extend("pentaho.visual.base.events.WillExecute",
    /** @lends pentaho.visual.base.events.WillExecute# */{

      /**
       * Creates a `WillExecute` event.
       *
       * @constructor
       *
       * @param {!Object} source - The object where the event will be initially emitted.
       * @param {!pentaho.data.filter.AbstractFilter} dataFilter - A filter representing the data set of the visual element which the user interacted with.
       * @param {!function} doExecute - The action that will be executed in the {@link pentaho.visual.base.model#executeAction|Execute Action} event flow.
       */
      constructor: function(source, dataFilter, doExecute) {
        if(!doExecute) throw error.argRequired("doExecute");

        this.base(source);
        this._initFilter(dataFilter, true);
        this.doExecute = doExecute;
      },

      set doExecute(f) {
        if(typeof f !== "function") {
          throw error.argInvalidType("doExecute", "function", typeof f);
        }

        this._doExecute = f;
      },

      get doExecute() {
        return this._doExecute;
      }
    })
    .implement(mixinDataFilter);

});
