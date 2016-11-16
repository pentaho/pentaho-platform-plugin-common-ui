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
  "./contextVars"
], function(defaultContextVars) {

  "use strict";

  /**
   * @alias CustomContextVars
   * @memberOf pentaho
   *
   * @class
   * @implements pentaho.spec.IContextVars
   *
   * @classDesc The `CustomContextVars` class implements a
   * [spec.IContextVars]{@link pentaho.spec.IContextVars} whose variables default to the
   * values of the Pentaho Platform's default context variables, as given by `pentaho/contextVars`.
   *
   * @constructor
   * @description Creates a context variables object, optionally fixing some variables to the values
   * specified in `customContextVars`. Any absent or {@link Nully}-valued properties assume the values
   * of the Pentaho Platform's corresponding default context variables.
   *
   * @param {pentaho.spec.IContextVars} [customContextVars] The custom context variables' specification.
   */
  function CustomContextVars(customContextVars) {

    if(!customContextVars) customContextVars = {};

    this.application = customContextVars.application || defaultContextVars.application;
    this.user        = customContextVars.user        || defaultContextVars.user;
    this.theme       = customContextVars.theme       || defaultContextVars.theme;
    this.locale      = customContextVars.locale      || defaultContextVars.locale;
  }

  return CustomContextVars;
});
