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
  "../Event"
], function(Event) {
  "use strict";

  /**
   * @name WillChange
   * @memberOf pentaho.visual.base.events
   * @description This event is triggered by
   * the {@link pentaho.visual.base.Model#selectAction|Select Action} flow.
   * The listeners of `will:change:selectionFilter` are allowed to:
   * - cancel the event
   * - replace the input data filter
   *
   * @extends pentaho.lang.Event
   * @event "will:change"
   */

  return Event.extend("pentaho.visual.base.events.WillChange",
    /** @lends pentaho.visual.base.events.WillChange# */{

      constructor: function(source, changeset) {
        this.base("will:change", source, true);

        this._changeset = changeset;
      },

      get changeset() {
        return this._changeset;
      }
    },{
      get type() {
        return "will:change";
      }
    });

});