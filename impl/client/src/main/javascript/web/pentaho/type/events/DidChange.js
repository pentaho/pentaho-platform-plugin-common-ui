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
   * @name DidChange
   * @memberOf pentaho.type.events
   * @class
   * @extends pentaho.lang.Event
   * @mixes pentaho.type.mixins._mixinChangeset
   *
   * @classDesc This event is emitted when changes have occurred in complex or list values.
   *
   * @constructor
   * @description Creates a `DidChange` event.
   *
   * @param {!pentaho.type.Complex} source - The object which is emitting the event.
   * @param {!pentaho.type.changes.Changeset} changeset - The changeset.
   */
  return Event.extend("pentaho.type.events.DidChange", /** @lends pentaho.type.events.DidChange# */{

    constructor: function(source, changeset) {
      this.base("did:change", source, false);
      this._initChangeset(changeset);
    }

  })
  .implement(mixinChangeset);

});
