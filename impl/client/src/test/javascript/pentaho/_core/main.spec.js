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

  describe("pentaho._core.main", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should return a core instance", function() {

      return localRequire.promise([
        "pentaho/_core/main!",
        "pentaho/_core/Core"
      ])
      .then(function(deps) {
        var core = deps[0];
        var Core = deps[1];
        expect(core instanceof Core).toBe(true);
      });
    });

    it("should have environment be the global environment", function() {
      var environment = {};

      localRequire.define("pentaho/environment", function() {
        return environment;
      });

      return localRequire.promise(["pentaho/_core/main!"])
        .then(function(deps) {
          var core = deps[0];
          expect(core.environment).toBe(environment);
        });
    });

    it("should have modules as declared in pentaho/modules", function() {

      var modulesMap = {
        "test/my/type": {
          ancestor: null
        }
      };

      localRequire.define("pentaho/modules", function() {
        return modulesMap;
      });

      return localRequire.promise(["pentaho/_core/main!"])
        .then(function(deps) {
          var core = deps[0];
          var module = core.moduleMetaService.get("test/my/type");
          expect(module).not.toBe(null);
        });
    });
  });
});
