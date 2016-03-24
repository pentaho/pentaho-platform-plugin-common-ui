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
  "../mixins/mixinChangeset"
], function(Event, mixinChangeset) {
  "use strict";

  /**
   * @name WillChange
   * @memberOf pentaho.lang.events
   * @description This event is triggered when a property value is changed in the model.
   * The listeners of `will:change` are allowed to:
   * - cancel the event
   * - make changes to the changeset
   *
   * @extends pentaho.lang.Event
   * @event "will:change"
   */
  return Event.extend("pentaho.lang.events.WillChange",
    /** @lends pentaho.lang.events.WillChange# */{

      /**
       * Creates a `WillExecute` event.
       *
       * @constructor
       *
       * @param {!Object} source - The object where the event will be initially emitted.
       * @param {!pentaho.lang.ComplexChangeset|*} changeset - A changeset representing the changes made to the properties values.
       */
      constructor: function(source, changeset) {
        this.base("will:change", source, true);
        this._initChangeset(changeset);
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
        return "will:change";
      }
    }).implement(mixinChangeset);

});