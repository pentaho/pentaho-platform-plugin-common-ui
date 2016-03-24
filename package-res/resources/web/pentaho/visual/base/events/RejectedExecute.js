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
  "pentaho/lang/mixins/mixinError",
  "pentaho/util/error"
], function(Event, mixinDataFilter, mixinError, utilError) {
  "use strict";

  /**
   * @name RejectedExecute
   * @memberOf pentaho.visual.base.events
   * @description This event is triggered when any failure occurs while inside
   * the {@link pentaho.visual.base.Model#executeAction|Execute Action} flow.
   *
   * Those failures can be one of the following:
   *  - The event {@link pentaho.visual.events.WillExecute|"will:execute"} was canceled.
   *  - The `doExecute` action was {@link Nully}.
   *  - The `doExecute` action failed while executing.
   *
   * @extends pentaho.lang.Event
   * @event "rejected:execute"
   */
  return Event.extend("pentaho.visual.base.events.RejectedExecute",
    /** @lends pentaho.visual.base.events.RejectedExecute# */{

      /**
       * Creates a `RejectedExecute` event.
       *
       * @constructor
       *
       * @param {!Object} source - The object where the event will be initially emitted.
       * @param {!Error|pentaho.lang.UserError} error - The error of a rejected {@link pentaho.lang.ActionResult|ActionResult}.
       * @param {?pentaho.visual.base.events.WillSelect} will - The "will:execute" event object.
       */
      constructor: function(source, error, will) {
        if(!will) throw utilError.argRequired("will");

        this.base("rejected:execute", source, false);
        this._initFilter(will.dataFilter, false);
        this._initError(error);
      }
    },{

      /**
       * Gets the event type.
       *
       * @type !string
       * @readonly
       *
       * @static
       */
      get type() {
        return "rejected:execute";
      }
    }).implement(mixinDataFilter)
      .implement(mixinError);

});
