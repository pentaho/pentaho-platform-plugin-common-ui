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
  "../Event",
  "../mixins/mixinChangeset",
  "../mixins/mixinError",
  "../../util/error"
], function(Event, mixinChangeset, mixinError, utilError) {
  "use strict";

  /**
   * @name RejectedChange
   * @memberOf pentaho.lang.events
   * @description This event is triggered when any failure occurs while changing
   * properties values with {@link pentaho.type.complex#set|complex.set}.
   *
   * Those failures can be one of the following:
   *  - The event {@link pentaho.lang.events.WillChange|"will:change"} was canceled.
   *  - A property value changes while processing the listeners of {@link pentaho.lang.events.WillChange|"will:change"}.
   *
   * @extends pentaho.lang.Event
   * @event "rejected:change"
   */
  return Event.extend("pentaho.lang.events.RejectedChange",
    /** @lends pentaho.lang.events.RejectedChange# */{

      /**
       * Creates a `RejectedChange` event.
       *
       * @constructor
       *
       * @param {!Object} source - The object where the event will be initially emitted.
       * @param {?pentaho.visual.base.events.WillSelect} will - The "will:change" event object.
       * @param {!Error|pentaho.lang.UserError} error - The error of a rejected {@link pentaho.lang.ActionResult|ActionResult}.
       */
      constructor: function(source, changeset, error) {
        if(!changeset) throw utilError.argRequired("changeset");

        this.base("rejected:change", source, false);
        this._initChangeset(changeset);
        this._initError(error);
      }
    }, {

      /**
       * Gets the event type.
       *
       * @type !string
       * @readonly
       *
       * @static
       */
      get type() {
        return "rejected:change";
      }

    }).implement(mixinChangeset)
      .implement(mixinError);

});
