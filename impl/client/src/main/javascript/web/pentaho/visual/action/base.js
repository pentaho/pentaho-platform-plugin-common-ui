/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
define(function() {

  "use strict";

  return ["pentaho/type/action/base", function(ActionBase) {
    /**
     * @name pentaho.visual.action.Base.Type
     * @class
     * @extends pentaho.type.action.Base.Type
     *
     * @classDesc The type class of {@link pentaho.visual.action.Base}.
     */

    /**
     * @name Base
     * @memberOf pentaho.visual.action
     * @class
     * @extends pentaho.type.action.Base
     * @abstract
     *
     * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.action.Base>} pentaho/visual/action/base
     *
     * @classDesc The `visual.action.Base` class is the base class of the actions
     * defined by the Visualization API.
     *
     * @description Creates a base action instance given its specification.
     * @param {pentaho.visual.action.spec.IBase} [spec] A base action specification.
     * @constructor
     */

    return ActionBase.extend(/** @lends pentaho.visual.action.Base# */{
      $type: /** @lends pentaho.visual.action.Base.Type# */{
        isAbstract: true
      }
    });
  }];
});
