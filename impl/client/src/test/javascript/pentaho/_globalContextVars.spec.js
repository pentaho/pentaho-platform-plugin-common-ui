/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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

// Must be executed out of strict scope
var __global__ = this;

define([
  "tests/test-utils"
], function(testUtils) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;

  describe("pentaho._globalContextVars", function() {

    /**
     * Tests that a context variable is properly implemented by pentaho._globalContextVars.
     *
     * @param {string} varName - The name of the context variable's property.
     * @param {string} globalVarName - The name of the context variable's global variable name.
     */
    function testContextVariable(varName, globalVarName) {

      describe(varName, function() {

        var _valueBackup;

        beforeEach(function() {
          _valueBackup = __global__[globalVarName];
          __global__[globalVarName] = undefined;
        });

        afterEach(function() {
          __global__[globalVarName] = _valueBackup;
        });

        it("should have a null value when " + globalVarName + " is undefined", function() {

          return require.using(["pentaho/_globalContextVars"], function(contextVars) {
            expect(contextVars[varName]).toBe(null);
          });
        });

        it("should have a null value when " + globalVarName + " is empty", function() {

          __global__[globalVarName] = "";

          return require.using(["pentaho/_globalContextVars"], function(contextVars) {
            expect(contextVars[varName]).toBe(null);
          });
        });

        it("should respect a non-empty " + globalVarName + " value", function() {

          __global__[globalVarName] = "ABC";

          return require.using(["pentaho/_globalContextVars"], function(contextVars) {
            expect(contextVars[varName]).toBe("ABC");
          });
        });
      });
    }

    it("is an Object", function() {
      return require.using(["pentaho/_globalContextVars"], function(contextVars) {
        expect(contextVars.constructor).toBe(Object);
      });
    });

    testContextVariable("application", "PENTAHO_CONTEXT_NAME");
    testContextVariable("user", "SESSION_NAME");
    testContextVariable("theme", "active_theme");
    testContextVariable("locale", "SESSION_LOCALE");

  }); // pentaho._globalContextVars
});
