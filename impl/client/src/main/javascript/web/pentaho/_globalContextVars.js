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
define(function() {

  "use strict";

  /* global SESSION_NAME:false, SESSION_LOCALE:false, active_theme:false,
            PENTAHO_CONTEXT_NAME:false,
            CONTEXT_PATH:false
   */

  /**
   * A read-only [IContextVars]{@link pentaho.spec.IContextVars} whose variables default to the
   * values of the Pentaho System's corresponding global variables.
   *
   * @name pentaho._globalContextVars
   * @type pentaho.spec.IContextVars
   * @amd {pentaho.spec.IContextVars} pentaho._globalContextVars
   * @private
   */
  return Object.freeze(/** @type pentaho.spec.IContextVars */{
    basePath:     typeof CONTEXT_PATH !== "undefined" ? (CONTEXT_PATH || null) : null,
    application:  typeof PENTAHO_CONTEXT_NAME !== "undefined" ? (PENTAHO_CONTEXT_NAME || null) : null,
    user:         typeof SESSION_NAME !== "undefined" ? (SESSION_NAME || null) : null,
    theme:        typeof active_theme !== "undefined" ? (active_theme || null) : null,
    locale:       typeof SESSION_LOCALE !== "undefined" ? (SESSION_LOCALE || null) : null
  });
});
