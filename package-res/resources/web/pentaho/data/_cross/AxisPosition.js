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
  "../../lang/Base",
  "../../util/arg"
], function(Base, arg) {

  return Base.extend("pentaho.data._cross.AxisPosition", {

    // spec: cells
    // keyArgs: ordinal
    constructor: function(spec, keyArgs) {
      this._cells = arg.required(spec, "cells", "spec");
      this._ord   = arg.required(keyArgs, "ordinal", "keyArgs");
    },

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
});