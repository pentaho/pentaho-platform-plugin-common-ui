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
  "../lang/OperationInvalidError"
], function(OperationInvalidError) {

  "use strict";

  /**
   * The `util` namespace contains utility function for working with modules.
   *
   * @namespace
   * @memberOf pentaho.module
   * @amd pentaho/module/util
   */
  var util = {
    getBaseIdOf: function(id) {
      return id && id.replace(/.[^/]+$/, "");
    },

    getId: function(localRequire) {
      // A global `require` function has no "module", nor id...
      if(localRequire.undef) {
        return null;
      }

      return localRequire("module").id;
    },

    absolutizeIdRelativeToSibling: function(id, siblingId) {
      return this.absolutizeId(id, this.getBaseIdOf(siblingId));
    },

    absolutizeId: function(id, baseId) {
      if(id && /^\./.test(id) && !/\.js$/.test(id)) {
        var baseIds = baseId ? baseId.split("/") : [];
        var ids = id.split("/");
        var needsBase = false;

        while(ids.length) {
          var segment = ids[0];
          if(segment === ".") {
            ids.shift();
            needsBase = true;
          } else if(segment === "..") {
            if(!baseIds.pop()) {
              throw new OperationInvalidError("Invalid path: '" + id + "'.");
            }
            ids.shift();
            needsBase = true;
          } else {
            break;
          }
        }

        if(needsBase) {
          baseId = baseIds.join("/");
          id = ids.join("/");

          return (baseId && id) ? (baseId + "/" + id) : (baseId || id);
        }
      }

      return id;
    }
  };

  return util;
});
