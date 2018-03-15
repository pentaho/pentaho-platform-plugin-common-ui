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
  "pentaho/util/object",
  "pentaho/lang/Base"
], function(module, O, Base) {

  "use strict";

  var Adapter = Base.extend(/** @lends pentaho.visual.role.adaptation.impl.Adapter# */{
    /**
     * @classDesc The `Adapter` class is the abstract base class of the adapters of the basic strategies.
     * @alias Adapter
     * @memberOf pentaho.visual.role.adaptation.impl
     * @class
     * @extends pentaho.lang.Base
     * @implements {pentaho.visual.role.adaptation.IAdapter}
     * @abstract
     * @private
     * @description Creates an adapter instance.
     * @param {!pentaho.type.visual.role.adaptation.IStrategyMethod} method - The strategy method.
     * @param {!pentaho.data.ITable} dataTable - The data set to be adapted.
     * @param {!Array.<number>} inputFieldIndexes - The indexes of the input fields.
     * @param {!Array.<number>} outputFieldIndexes - The indexes of the ourput fields.
     */
    constructor: function(method, dataTable, inputFieldIndexes, outputFieldIndexes) {

      O.setConst(this, "method", method);
      O.setConst(this, "data", dataTable);
      O.setConst(this, "inputFieldIndexes", inputFieldIndexes);
      O.setConst(this, "outputFieldIndexes", outputFieldIndexes);
    }
  });

  return Adapter;
});
