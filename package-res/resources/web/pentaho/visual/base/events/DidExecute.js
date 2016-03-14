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
  "./did",
  "../mixins/mixinDataFilter"
], function(did, mixinDataFilter) {
  "use strict";

  /**
   * @name DidExecute
   * @memberOf pentaho.visual.base.events
   * @description This event is triggered when
   * the {@link pentaho.visual.base.Model#executeAction|Execute Action} flow ends without any failures.
   *
   * @extends pentaho.visual.base.events.Did
   * @event "did:execute"
   */
  return did("execute").extend("pentaho.visual.base.events.DidExecute",
    /** @lends pentaho.visual.base.events.DidExecute# */{
      constructor: function(source, value, dataFilter) {
        this.base(source, value);
        this._initFilter(dataFilter, false);
      }
    })
    .implement(mixinDataFilter);

});