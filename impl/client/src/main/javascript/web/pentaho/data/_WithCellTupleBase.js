/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "./CellTuple",
  "../lang/Base",
  "../util/error",
  "../util/object"
], function(CellTuple, Base, error, O) {

  return Base.extend("pentaho.data._WithCellTupleBase", {
    // keyArgs: structure
    constructor: function(keyArgs) {
      this.cellTupleBase = CellTuple.Adhoc.to([], keyArgs);
      this.cellTupleBase.constructor = CellTuple.Adhoc;
    },

    // keyArgs: {}
    toCellTuple: function(cellSpecs, keyArgs) {
      if(cellSpecs instanceof CellTuple)
        return cellSpecs;

      if(!(cellSpecs instanceof Array))
        throw error.argInvalidType("cellSpecs", "Array");

      var cellTuple = O.setPrototypeOf(cellSpecs, this.cellTupleBase);
      CellTuple.call(cellTuple, keyArgs);
      return cellTuple;
    }
  });
});
