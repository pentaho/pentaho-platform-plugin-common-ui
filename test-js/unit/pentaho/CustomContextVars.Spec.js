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
  "tests/test-utils"
], function(testUtils) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;

  describe("pentaho.CustomContextVars -", function() {

    /**
     * Mocks AMD with dummy default context variables.
     */
    function configDefaultContext(localRequire) {

      localRequire.define("pentaho/contextVars", {
        application: "APP",
        user:        "USER",
        theme:       "THEME",
        locale:      "LOCALE"
      });
    }

    it("is a function", function() {

      return require.using(["pentaho/CustomContextVars"], configDefaultContext, function(CustomContextVars) {
        expect(typeof CustomContextVars).toBe("function");
      });
    });

    describe("new CustomContextVars(spec) -", function() {

      it("should return a CustomContextVars instance", function() {

        return require.using(["pentaho/CustomContextVars"], configDefaultContext, function(CustomContextVars) {
          var contextVars = new CustomContextVars();
          expect(contextVars instanceof CustomContextVars).toBe(true);
        });
      });

      /**
       * Tests that a context variable is properly implemented by pentaho.CustomContextVars.
       *
       * @param {string} varName - The name of the context variable's.
       */
      function testVariable(varName) {
        describe(varName, function() {

          it("should default to the default variable's value, when spec." + varName + " is not specified", function() {

            return require.using([
              "pentaho/contextVars",
              "pentaho/CustomContextVars"
            ], configDefaultContext, function(defaultContextVars, CustomContextVars) {

              var contextVars = new CustomContextVars();
              expect(contextVars[varName]).toBe(defaultContextVars[varName]);
            });
          });

          it("should default to the default variable's value, when spec." + varName + " is empty", function() {

            return require.using([
              "pentaho/contextVars",
              "pentaho/CustomContextVars"
            ], configDefaultContext, function(defaultContextVars, CustomContextVars) {
              var spec = {};
              spec[varName] = "";

              var contextVars = new CustomContextVars(spec);

              expect(contextVars[varName]).toBe(defaultContextVars[varName]);
            });
          });

          it("should respect a non-empty spec." + varName + " value", function() {

            return require.using(["pentaho/CustomContextVars"], configDefaultContext, function(CustomContextVars) {
              var spec = {};
              spec[varName] = "FOOOO";

              var contextVars = new CustomContextVars(spec);
              expect(contextVars[varName]).toBe(spec[varName]);
            });
          });
        });
      }

      testVariable("application");
      testVariable("user");
      testVariable("theme");
      testVariable("locale");
    });
  }); // pentaho.CustomContextVars
});
