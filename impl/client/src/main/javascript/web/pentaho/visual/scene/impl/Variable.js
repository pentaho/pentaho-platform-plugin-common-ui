/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/Base"
], function(module, Base) {

  return Base.extend(module.id, /** @lends pentaho.visual.scene.impl.Variable# */{

    /**
     * @alias Variable
     * @memberOf  pentaho.visual.scene.impl
     * @classDesc The `impl.Variable` class is a basic implementation of the `IVariable` interface.
     * @class
     * @implements {pentaho.visual.scene.IVariable}
     * @private
     *
     * @description Creates a variable instance having a given value and formatted value.
     * @constructor
     * @param {any} value - The value of the variable.
     * @param {?string} [formatted] - The formatted value of the variable.
     */
    constructor: function(value, formatted) {
      this.value = value;
      this.formatted = formatted !== undefined ? formatted : null;
    },

    valueOf: function() {
      return this.value;
    },

    toString: function() {
      return this.formatted;
    }
  });
});
