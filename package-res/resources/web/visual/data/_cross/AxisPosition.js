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
  "../../_utils"
], function(utils) {

  // spec: cells
  // keyArgs: ordinal
  function AxisPosition(spec, keyArgs) {
    this._cells = utils.required(spec, "cells", "spec");
    this._ord   = utils.required(keyArgs, "ordinal", "keyArgs");
  }

  utils.implement(AxisPosition, {
    //region IListElement
    elemName: "axis position",
    //endregion

    //region IWithKey implementation
    keyName: "key",

    get key() {
      return this._cells.key;
    },
    //endregion

    //region IWithOrdinal implementation
    get ordinal() {
      return this._ord;
    },
    //endregion

    get cells() {
      return this._cells;
    },
    //endregion

    //region ISpecifiable implementation
    toSpec: function() {
      return this._cells.toSpec();
    }
    //endregion
  });

  // Helps to make lists of.
  // spec: cells
  // keyArgs: ordinal
  AxisPosition.to = function(spec, keyArgs) {
    return new AxisPosition(spec, keyArgs);
  };

  return AxisPosition;
});