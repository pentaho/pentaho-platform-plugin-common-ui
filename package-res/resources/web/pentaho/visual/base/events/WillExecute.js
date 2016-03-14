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
  "./will",
  "./mixinDataFilter",
  "pentaho/util/error"
], function(will, mixinDataFilter, error) {
  "use strict";

  return will("execute").extend("pentaho.visual.base.events.WillExecute",
    /** @lends pentaho.visual.base.events.WillExecute# */{
      constructor: function(source, dataFilter, onExecute) {
        if(!onExecute) throw error.argRequired("onExecute");
        this.base(source);
        this._initFilter(dataFilter || null, true);
        this._onExecute = onExecute || null;
      },

      set executeAction(f) {
        if(typeof f === "function")
          this._onExecute = f;
      },

      get executeAction() {
        return this._onExecute;
      }
    })
    .implement(mixinDataFilter);

});