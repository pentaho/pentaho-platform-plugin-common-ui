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
  "pentaho/lang/Event"
], function(Event) {
  "use strict";

  /**
   * @name WillUpdate
   * @memberOf pentaho.visual.base.events
   * @class
   * @extends pentaho.lang.Event
   *
   * @classDesc This event is emitted when the view is about to be updated.
   * The listeners of `will:update` are allowed to cancel the event.
   *
   * @constructor
   * @description Creates a `WillUpdate` event.
   *
   * @param {!pentaho.visual.base.Model} source - The view object that is emitting the event.
   */
  return Event.extend("pentaho.visual.base.events.WillUpdate",
    /** @lends pentaho.visual.base.events.WillUpdate# */{

      constructor: function(source) {
        this.base("will:update", source, true);
      }
    }, /** @lends pentaho.visual.base.events.WillUpdate */{

      /**
       * Gets the event type.
       *
       * @type string
       * @readonly
       */
      get type() {
        return "will:update";
      }
    });
});
