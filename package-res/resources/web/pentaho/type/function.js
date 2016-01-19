/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "./simple",
  "../i18n!types"
], function(module, simpleFactory, bundle) {

  // Cannot use strict here because of the evil eval, below...

  return function(context) {

    "use strict";

    var Simple = context.get(simpleFactory);

    /**
     * @name pentaho.type.Function
     * @class
     * @extends pentaho.type.Simple
     * @amd pentaho/type/function
     *
     * @classDesc A primitive JavaScript function type.
     *
     * ### AMD
     *
     * Module Id: `pentaho/type/function`
     *
     * The AMD module returns the type's factory, a
     * {@link pentaho.type.Factory<pentaho.type.Function>}.
     *
     * @description Creates a function instance.
     */
    return Simple.extend("pentaho.type.Function", {
      meta: {
        id: module.id,
        styleClass: "pentaho-type-function",
        cast: castFun
      }
    }).implement({
      meta: bundle.structured["object"]
    });
  };

  function castFun(f) {
    switch(typeof f) {
      case "function": return f;
      case "string"  : eval("(" + f + ")");
    }
  }
});
