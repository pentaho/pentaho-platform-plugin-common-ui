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
  "pentaho/type/mixins/mixinError"
], function(Event, mixinError) {
  "use strict";

  /**
   * @name RejectedUpdate
   * @memberOf pentaho.visual.base.events
   * @class
   * @extends pentaho.lang.Event
   * @mixes pentaho.lang.mixins.mixinError
   *
   * @classDesc This event is emitted when any rejection occurs while updating
   * the view with {@link pentaho.visual.base.Model#update|Model#update}.
   *
   * A rejection can be one of the following:
   *  - the event {@link pentaho.type.events.WillUpdate|"will:update"} was canceled
   *  - an error occurred while validating the model
   *  - an error occurred while updating the model
   *
   * @constructor
   * @description Creates a `RejectedUpdate` event.
   *
   * @param {!pentaho.visual.base.View} source - The view object that is emitting the event.
   * @param {!Error|pentaho.lang.UserError} error - The error of a rejected
   * {@link pentaho.lang.ActionResult|ActionResult}.
   */
  return Event.extend("pentaho.visual.base.events.RejectedUpdate",
    /** @lends pentaho.visual.base.events.RejectedUpdate# */{

      constructor: function(source, error) {
        this.base("rejected:update", source, false);
        this._initError(error);
      }
    }, /** @lends pentaho.visual.base.events.RejectedUpdate */{

      /**
       * Gets the event type.
       *
       * @type {string}
       * @readonly
       */
      get type() {
        return "rejected:update";
      }
    }).implement(mixinError);
});
