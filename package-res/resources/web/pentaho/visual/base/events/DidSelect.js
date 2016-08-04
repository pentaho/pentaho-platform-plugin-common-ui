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
], function(Event, mixinDataFilter, error) {
  "use strict";

  /**
   * @name DidSelect
   * @memberOf pentaho.visual.base.events
   * @class
   * @extends pentaho.lang.Event
   * @mixes pentaho.visual.base.mixins.mixinDataFilter
   *
   * @classDesc This event is triggered when
   * the {@link pentaho.visual.base.Model#selectAction|Select Action} flow ends without any failures.
   *
   * @constructor
   * @description Creates a `DidSelect` event.
   *
   * @param {!pentaho.visual.base.Model} source - The model object which is emitting the event.
   * @param {?Object} value - The value of a fulfilled {@link pentaho.lang.ActionResult|ActionResult}.
   * @param {pentaho.visual.base.events.WillSelect} will - The "will:select" event object.
   */
  return Event.extend("pentaho.visual.base.events.DidSelect",
    /** @lends pentaho.visual.base.events.DidSelect# */{

      constructor: function(source, value, will) {
        if(!will) throw error.argRequired("will");

        this.base("did:select", source, false);
        this.value = value;
        this._initFilter(will.dataFilter, false);
      }
    }, /** @lends pentaho.visual.base.events.DidSelect */{

      /**
       * Gets the event type.
       *
       * @type {string}
       * @readonly
       */
      get type() {
        return "did:select";
      }
    })
    .implement(mixinDataFilter);

});
