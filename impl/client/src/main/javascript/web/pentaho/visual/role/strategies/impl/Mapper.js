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

  var Mapper = Base.extend(/** @lends pentaho.visual.role.strategies.impl.Mapper# */{
    /**
     * @classDesc The `Mapper` class is the abstract base class of the mappers of the basic strategies.
     * @alias Mapper
     * @memberOf pentaho.visual.role.strategies.impl
     * @class
     * @extends pentaho.lang.Base
     * @implements {pentaho.visual.role.strategies.IMapper}
     * @abstract
     * @private
     * @description Creates a mapper instance.
     * @param {!pentaho.type.visual.role.strategies.Base} strategy - The strategy.
     * @param {!pentaho.type.visual.role.Property.Type} propType - The visual role property type.
     * @param {!pentaho.data.ITable} inputData - The data set view to be mapped.
     * @param {!pentaho.visual.role.Mode} mode - The visual role mode of `propType` which will be used.
     */
    constructor: function(strategy, propType, inputData, mode) {

      O.setConst(this, "strategy", strategy);
      O.setConst(this, "inputData", inputData);
      O.setConst(this, "mode", mode);

      /**
       * The visual role property type.
       *
       * @name _propType
       * @type {!pentaho.type.visual.role.Property.Type}
       * @protected
       * @readOnly
       */
      O.setConst(this, "_propType", propType);
    },

    /** @inheritDoc */
    get kind() {
      return null;
    },

    /**
     * Gets the data type of the mapped visual role value.
     *
     * The default implementation returns the
     * [mode]{@link @lends pentaho.visual.role.strategies.impl.Mapper#mode}'s
     * [dataType]{pentaho.visual.role.Mode#dataType}.
     *
     * @type {!pentaho.type.Type}
     * @readOnly
     */
    get dataType() {
      return this.mode.dataType;
    },

    /** @inheritDoc */
    get isContinuous() {
      return this.mode.isContinuous;
    }
  });

  return Mapper;
});
