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

  function Row(keyArgs) {
    this.c = utils.required(keyArgs, "rows").toCellTuple(this.c || [], keyArgs);
  }

  utils.implement(Row, {
    get cells() {
      return this.c;
    },

    //region ISpecifiable implementation
    toSpec: function() {
      return {
        c: this.c.toSpec()
      };
    },
    //endregion

    _onStructurePositionAdded: function() {
      this.c._onStructurePositionAdded();
    }
  });

  // keyArgs: rows
  Row.to = function(spec, keyArgs) {
    if(spec instanceof Array) {
      // directly a cell tuple
      spec = {c: spec};
    }

    return utils.setClass(spec, Row, keyArgs);
  };

  return Row;
});