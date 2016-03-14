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
  "./rejected",
  "../mixins/mixinDataFilter",
  "pentaho/util/error"
], function(rejected, mixinDataFilter, error) {
  "use strict";

  /**
   * @name RejectedExecute
   * @memberOf pentaho.visual.base.events
   * @description This event is triggered when any failure occurs while inside
   * the {@link pentaho.visual.base.Model#executeAction|Execute Action} flow.
   *
   * Those failures can be one of the following:
   *  - The event {@link pentaho.visual.events.WillExecute|"will:execute"} was canceled.
   *  - The `doExecute` action was {@link Nully}.
   *  - The `doExecute` action failed while executing.
   *
   * @extends pentaho.visual.base.events.Rejected
   * @event "rejected:execute"
   */
  return rejected("execute").extend("pentaho.visual.base.events.RejectedExecute",
    /** @lends pentaho.visual.base.events.RejectedExecute# */{
      constructor: function(source, error, dataFilter) {
        if(!error) throw error.argRequired("error");
        if(!dataFilter) throw error.argRequired("dataFilter");

        this.base(source, error);
        this._initFilter(dataFilter, false);
      }
    })
    .implement(mixinDataFilter);

});