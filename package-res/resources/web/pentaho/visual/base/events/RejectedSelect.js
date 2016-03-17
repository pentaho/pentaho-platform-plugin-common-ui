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
  "pentaho/lang/Event",
  "../mixins/mixinDataFilter",
  "pentaho/util/error"
], function(Event, mixinDataFilter, utilError) {
  "use strict";

  /**
   * @name RejectedSelect
   * @memberOf pentaho.visual.base.events
   * @description This event is triggered when any failure occurs while inside
   * the {@link pentaho.visual.base.Model#selectAction|Select Action} flow.
   *
   * Those failures can be one of the following:
   *  - The event {@link pentaho.visual.events.WillSelect|"will:select"} was canceled.
   *  - The selection mode was invalid.
   *
   * @extends pentaho.lang.Event
   * @event "rejected:select"
   */
  return Event.extend("pentaho.visual.base.events.RejectedSelect",
    /** @lends pentaho.visual.base.events.RejectedSelect# */{

      /**
       * Creates a base `RejectedSelection` event.
       *
       * @constructor
       *
       * @param {!Object} source - The object where the event will be initially emitted.
       * @param {!Error|pentaho.lang.UserError} error - The error of a rejected {@link pentaho.lang.ActionResult|ActionResult}.
       * @param {?pentaho.visual.base.events.WillSelect} will - The "will:select" event object.
       */
      constructor: function(source, error, will) {
        if(!error) throw utilError.argRequired("error");
        if(!will) throw utilError.argRequired("will");

        this.base("rejected:select", source, false);
        this.error = error;

        this._initFilter(will.dataFilter, false);
      }
    },{
      get type() {
        return "rejected:select";
      }
    })
    .implement(mixinDataFilter);

});
