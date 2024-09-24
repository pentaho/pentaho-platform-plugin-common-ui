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

  describe("pentaho.module.metaService", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should return a module metadata service", function() {

      return localRequire.promise(["pentaho/module/metaService"])
        .then(function(deps) {
          var moduleService = deps[0];

          // Duck Typing.
          expect(moduleService instanceof Object).toBe(true);
          expect(typeof moduleService.get).toBe("function");
          expect(typeof moduleService.getInstanceOf).toBe("function");
          expect(typeof moduleService.getInstancesOf).toBe("function");
          expect(typeof moduleService.getSubtypeOf).toBe("function");
          expect(typeof moduleService.getSubtypesOf).toBe("function");
        });
    });
  });
});
