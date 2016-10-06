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
  "module",
  "./lang/Base",
  "./util/object",
  "./util/arg"
], function(module, Base, O, arg) {

  "use strict";

  /* global SESSION_NAME:false, SESSION_LOCALE:false, active_theme:false */

  return Base.extend(module.id, {

    /**
     * @alias GlobalContextVars
     * @memberOf pentaho
     *
     * @class
     * @extends pentaho.lang.Base
     * @implements pentaho.spec.IContextVars
     *
     * @classDesc The `GlobalContextVars` class implements a read-only
     * [IContextVars]{@link pentaho.spec.IContextVars} whose variables default to the
     * values of the Pentaho System's corresponding global variables.
     *
     * @constructor
     * @description Creates a context variables object, optionally fixing some variables to the values
     * specified in `contextVar`. Any absent or {@link Nully}-valued properties assume the values
     * of the Pentaho System's corresponding global variables.
     *
     * @param {pentaho.spec.IContextVars} [contextVars] The input context variables' specification.
     */
    constructor: function(contextVars) {

      // It's important that these are own value properties, and not getters,
      // to mimic the semantics of plain objects, where only own properties are considered.

      this.application = arg.optional(contextVars, "application") || getSysApp();
      this.user        = arg.optional(contextVars, "user")        || getSysUser();
      this.theme       = arg.optional(contextVars, "theme")       || getSysTheme();
      this.locale      = arg.optional(contextVars, "locale")      || getSysLocale();

      Object.freeze(this);
    }
  });

  function getSysApp() {
    // TODO: should try to find webcontext.js in scripts collection?
    return null;
  }

  function getSysUser() {
    return typeof SESSION_NAME !== "undefined" ? SESSION_NAME : null;
  }

  function getSysTheme() {
    return typeof active_theme !== "undefined" ? active_theme : null;
  }

  function getSysLocale() {
    return typeof SESSION_LOCALE !== "undefined" ? SESSION_LOCALE : null;
  }
});
