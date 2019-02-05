/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "pentaho/type/Complex",
  "pentaho/i18n!model"
], function(module, Complex, bundle) {

  "use strict";

  /**
   * @name pentaho.visual.ApplicationType
   * @class
   * @extends pentaho.type.ComplexType
   *
   * @classDesc The base type class of visual application types.
   *
   * For more information see {@link pentaho.visual.Application}.
   */

  /**
   * @name pentaho.visual.Application
   * @class
   * @extends pentaho.type.Complex
   *
   * @amd pentaho/visual/Application
   *
   * @classDesc The base class of visual applications.
   *
   * @description Creates a visual application instance.
   *
   * @constructor
   * @param {pentaho.visual.spec.IApplication} [spec] A visual application specification.
   */
  return Complex.extend({
    $type: {
      id: module.id
    }
  })
  .localize({$type: bundle.structured.Application})
  .configure({$type: module.config});
});
