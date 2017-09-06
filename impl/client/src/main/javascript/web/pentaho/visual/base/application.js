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
  "module",
  "pentaho/i18n!model"
], function(module, bundle) {

  "use strict";

  return ["pentaho/type/application", function(Application) {

    /**
     * @name pentaho.visual.base.Application.Type
     * @class
     * @extends pentaho.type.Application.Type
     *
     * @classDesc The base type class of visual application types.
     *
     * For more information see {@link pentaho.visual.base.Application}.
     */

    /**
     * @name pentaho.visual.base.Application
     * @class
     * @extends pentaho.type.Application
     *
     * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.Application>} pentaho/visual/base/application
     *
     * @classDesc The base class of visual applications.
     *
     * @description Creates a visual application instance.
     *
     * @constructor
     * @param {pentaho.visual.base.spec.IApplication} [spec] A visual application specification.
     */
    var VisualApplication = Application.extend(/** @lends pentaho.visual.base.Application# */{
      $type: /** @lends pentaho.visual.base.Application.Type# */{
        id: module.id
      }
    })
    .implement({
      $type: bundle.structured.application.type
    });

    return VisualApplication;
  }];
});
