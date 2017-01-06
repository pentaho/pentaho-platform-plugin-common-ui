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
  "../mixins/_mixinChangeset",
  "../mixins/mixinError"
], function(Event, mixinChangeset, mixinError) {
  "use strict";

  /**
   * @name RejectedChange
   * @memberOf pentaho.type.events
   * @class
   * @extends pentaho.lang.Event
   * @mixes pentaho.lang.mixins.mixinError
   * @mixes pentaho.lang.mixins._mixinChangeset
   *
   * @classDesc This event is emitted when any rejection occurs while changing
   * properties values with {@link pentaho.type.Complex#set|Complex#set}.
   *
   * A rejection can be one of the following:
   *  - the event {@link pentaho.type.events.WillChange|"will:change"} was canceled
   *  - the value of a property in changeset was not consistent with the current value of the property,
   *  which indicates that some change took place during the processing of the
   *  {@link pentaho.type.events.WillChange|"will:change"} event listeners.
   *
   * @constructor
   * @description Creates a `RejectedChange` event.
   *
   * @param {!pentaho.type.Complex} source - The object which is emitting the event.
   * @param {!pentaho.type.ComplexChangeset} changeset - The changes to be made to the values of the properties.
   * @param {!Error|pentaho.lang.UserError} error - The error of a rejected
   * {@link pentaho.lang.ActionResult|ActionResult}.
   */
  return Event.extend("pentaho.type.events.RejectedChange",
    /** @lends pentaho.type.events.RejectedChange# */{

      constructor: function(source, changeset, error) {
        this.base("rejected:change", source, false);
        this._initChangeset(changeset);
        this._initError(error);
      }

    })
    .implement(mixinChangeset)
    .implement(mixinError);

});
