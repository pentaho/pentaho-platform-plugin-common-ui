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
  "pentaho/shim/es6-promise"
], function() {

  "use strict";

  describe("pentaho.modules", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should return the module's configuration", function() {

      localRequire.config({
        config: {
          "pentaho/modules": null
        }
      });

      var modulesMap = {
        "test/my/type": {
          ancestor: null
        }
      };

      localRequire.config({
        config: {
          "pentaho/modules": modulesMap
        }
      });

      return localRequire.promise(["pentaho/modules"])
        .then(function(deps) {
          var moduleValue = deps[0];
          expect(moduleValue).toEqual(modulesMap);
        });
    });

    it("should return the module's merged configurations", function() {

      localRequire.config({
        config: {
          "pentaho/modules": null
        }
      });

      localRequire.config({
        config: {
          "pentaho/modules": {
            "test/my/typeA": {
              ancestor: null
            }
          }
        }
      });

      localRequire.config({
        config: {
          "pentaho/modules": {
            "test/my/typeB": {
              ancestor: null
            }
          }
        }
      });

      return localRequire.promise(["pentaho/modules"])
        .then(function(deps) {
          var moduleValue = deps[0];
          expect(moduleValue).toEqual({
            "test/my/typeA": {
              ancestor: null
            },
            "test/my/typeB": {
              ancestor: null
            }
          });
        });
    });
  });
});
