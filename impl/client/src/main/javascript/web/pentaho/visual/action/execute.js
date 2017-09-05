/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module"
], function(module) {

  "use strict";

  return ["pentaho/visual/action/data", function(DataAction) {

    /**
     * @name pentaho.visual.action.Execute.Type
     * @class
     * @extends pentaho.visual.action.Data.Type
     *
     * @classDesc The type class of "execute" actions.
     *
     * For more information see {@link pentaho.visual.action.Execute}.
     */

    /**
     * @name Execute
     * @memberOf pentaho.visual.action
     * @class
     * @extends pentaho.visual.action.Data
     *
     * @amd {pentaho.type.Factory<pentaho.visual.action.Execute>} pentaho/visual/action/execute
     *
     * @classDesc The `Execute` action is a synchronous action that is performed when
     * the user interacts with a visual element, typically by double clicking it.
     *
     * This action has the *alias* `"execute"`,
     * which can also be specified as the event name
     * when calling [on]{@link pentaho.lang,IEventSource#on} of action targets.
     */
    return DataAction.extend(/** @lends  pentaho.visual.action.Execute# */{
      $type: {
        id: module.id,
        alias: "execute"
      }
    });
  }];
});
