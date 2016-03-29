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
  "../../lang/Event",
  "../mixins/_mixinChangeset"
], function(Event, mixinChangeset) {
  "use strict";

  /**
   * @name WillChange
   * @memberOf pentaho.type.events
   * @class
   * @extends pentaho.lang.Event
   * @mixes pentaho.lang.mixins._mixinChangeset
   *
   * @classDesc This event is emitted when a property value is changed.
   * The listeners of `will:change` are allowed to:
   * - cancel the event
   * - modify the changeset
   *
   * @constructor
   * @description Creates a `WillExecute` event.
   *
   * @param {!pentaho.type.Complex} source - The object which is emitting the event.
   * @param {!pentaho.type.ComplexChangeset} changeset -  The changes to be made to the values of the properties.
   */
  return Event.extend("pentaho.type.events.WillChange",
    /** @lends pentaho.type.events.WillChange# */{

      constructor: function(source, changeset) {
        this.base("will:change", source, true);
        this._initChangeset(changeset);
      }

    })
    .implement(mixinChangeset);

});