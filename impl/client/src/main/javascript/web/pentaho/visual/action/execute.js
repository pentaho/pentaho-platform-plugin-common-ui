/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!",
  "./Base",
  "./mixins/Data",
  "./mixins/Positioned"
], function(module, BaseAction, DataActionMixin, PositionedActionMixin) {

  "use strict";

  /**
   * @name pentaho.visual.action.Execute.Type
   * @class
   * @extends pentaho.visual.action.Base.Type
   * @extends pentaho.visual.action.mixins.Data.Type
   * @extends pentaho.visual.action.mixins.Positioned.Type
   *
   * @classDesc The type class of {@link pentaho.visual.action.Execute}.
   */

  /**
   * @name Execute
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.visual.action.Base
   * @extends pentaho.visual.action.mixins.Data
   * @extends pentaho.visual.action.mixins.Positioned
   *
   * @amd pentaho/visual/action/Execute
   *
   * @classDesc The `Execute` action is a synchronous, data and positioned action that
   * is performed when the user interacts with a visual element,
   * typically by double clicking it.
   */
  return BaseAction.extend(/** @lends  pentaho.visual.action.Execute# */{
    $type: {
      id: module.id,
      mixins: [DataActionMixin, PositionedActionMixin]
    }
  })
  .configure({$type: module.config});
});
