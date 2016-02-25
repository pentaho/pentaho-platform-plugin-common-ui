/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "./AbstractFilter",
  "../../util/object",
  "../../lang/ArgumentRequiredError",
  "./_toSpec"
], function(AbstractFilter, O, ArgumentRequiredError, toSpec) {
  "use strict";

  /**
   * @name AbstractTreeFilter
   * @memberOf pentaho.data.filter
   * @class
   * @abstract
   * @amd pentaho/data/filter/AbstractTreeFilter
   *
   * @classdesc The `AbstractTreeFilter` class is the abstract base class of
   * classes that represent a filter.
   *
   * ### Remarks
   *
   * The following derived classes are not abstract and can be used directly:
   *
   * * {@link pentaho.data.filter.And}
   * * {@link pentaho.data.filter.Or}
   * * {@link pentaho.data.filter.Not}
   */
  var AbstractTreeFilter = AbstractFilter.extend("pentaho.data.filter.AbstractTreeFilter", /** @lends pentaho.data.filter.AbstractTreeFilter# */{
    constructor: function(operands) {
      var _operands = (operands instanceof Array) ? operands.slice() : operands ? [operands] : [];
      O.setConst(this, "_operands", _operands);
    },

    get operands(){
      return this._operands.slice();
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      var operands = [];
      if(this.operands.length) {
        this.operands.forEach(function(operand) {
          var spec = operand.toSpec();
          if(spec)
            operands.push(spec);
        });
      }
      return toSpec(this.type, operands.length ? operands : null);
    }
  });

  return AbstractTreeFilter;

});