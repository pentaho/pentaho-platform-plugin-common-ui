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
  "module",
  "pentaho/lang/Event"
], function(module, Event) {

  "use strict";

  /**
   * @name DidUpdate
   * @memberOf pentaho.visual.base.events
   * @class
   * @extends pentaho.lang.Event
   *
   * @classDesc This event is emitted when updating the view with
   * {@link pentaho.visual.base.Model#update|Model#update} and it occurs without any failures.
   *
   * @constructor
   * @description Creates a `DidUpdate` event.
   *
   * @param {!pentaho.visual.base.View} source - The view object that is emitting the event.
   */
  return Event.extend(module.id, /** @lends pentaho.visual.base.events.DidUpdate# */{

      constructor: function(source) {
        this.base("did:update", source, false);
      }
    }, /** @lends pentaho.visual.base.events.DidUpdate */{

      /**
       * Gets the event type.
       *
       * @type {string}
       * @readonly
       */
      get type() {
        return "did:update";
      }
    });
});
