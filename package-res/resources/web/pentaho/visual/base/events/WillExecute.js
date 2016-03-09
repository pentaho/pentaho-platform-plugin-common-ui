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
  "./FilterEvent",
  "pentaho/util/error"
], function(FilterEvent, error) {
  "use strict";

  var type = "will:execute";
  return FilterEvent.extend("pentaho.lang.FilterEvent", /** @lends pentaho.visual.base.events.WillExecute# */{

    constructor: function(source, dataFilter, action) {
      if (!action) throw error.argRequired("action");

      this.base(type, source, true, dataFilter);
      this._action = action;
    },

    set action(_) {
      this._action = _;
    },

    get action() {
      return this._action;
    }
  }, {
    type: type
  });
});