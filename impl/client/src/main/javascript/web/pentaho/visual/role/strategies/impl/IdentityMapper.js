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
  "./Mapper"
], function(module, O, Mapper) {

  "use strict";

  var IdentityMapper = Mapper.extend(/** @lends pentaho.visual.role.strategies.impl.IdentityMapper# */{
    /**
     * @classDesc The `IdentityMapper` class is the mapper implementation class of the `Identity` strategy.
     * @alias IdentityMapper
     * @memberOf pentaho.visual.role.strategies.impl
     * @class
     * @extends pentaho.visual.role.strategies.impl.Mapper
     * @private
     * @see pentaho.visual.role.strategies.Identity
     * @description Creates an identity mapper instance.
     * @param {!pentaho.type.visual.role.strategies.Base} strategy - The strategy.
     * @param {!pentaho.type.visual.role.Property.Type} propType - The visual role property type.
     * @param {!pentaho.data.ITable} inputData - The data set view to be mapped.
     * @param {!pentaho.visual.role.Mode} mode - The visual role mode of `propType` which will be used.
     * @param {!pentaho.type.Type} fieldType - The type of the mapped field's value.
     */
    constructor: function(strategy, propType, inputData, mode, fieldType) {

      this.base(strategy, propType, inputData, mode);

      /**
       * A map from key to row index.
       *
       * @type {!Object.<string, number>}
       * @private
       * @readOnly
       */
      this.__index = Object.create(null);

      /**
       * The data type of the visual role value.
       *
       * @type {!pentaho.type.Type}
       * @readOnly
       * @private
       */
      this.__dataType = fieldType;

      /**
       * The visual role value key function.
       *
       * @type {function(any) : string}
       * @private
       * @readOnly
       */
      this.__keyFun = O.getSameTypeKeyFun(this.dataType.alias);
    },

    /** @inheritDoc */
    get dataType() {
      return this.__dataType;
    },

    /** @inheritDoc */
    getValue: function(rowIndex) {

      var value = this.inputData.getValue(rowIndex, 0);

      // Index the value.
      this.__index[this.__keyFun(value)] = rowIndex;

      return value;
    },

    /** @inheritDoc */
    getFormatted: function(rowIndex) {
      return this.inputData.getFormattedValue(rowIndex, 0);
    },

    /** @inheritDoc */
    invertValue: function(value) {
      return this.__index[this.__keyFun(value)];
    }
  });

  return IdentityMapper;
});
