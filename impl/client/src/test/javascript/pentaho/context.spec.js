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
define([
  "tests/test-utils"
], function(testUtils) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;

  describe("pentaho.context", function() {

    // Gets the value of a property path.
    function getPath(o, path, dv, create) {
      if(!o) return dv;

      if(path != null) {
        var parts = Array.isArray(path) ? path : path.split(".");
        var L = parts.length;
        if(L) {
          var i = 0;
          while(i < L) {
            var part = parts[i++];
            var value = o[part];
            if(value == null) {
              if(!create) return dv;
              value = o[part] = (dv == null || isNaN(+dv)) ? {} : [];
            }
            o = value;
          }
        }
      }

      return o;
    }

    // Sets the value of a property path.
    function setPath(o, path, v) {
      if(o && path != null) {
        var parts = Array.isArray(path) ? path : path.split(".");
        if(parts.length) {
          var pLast = parts.pop();
          o = getPath(o, parts, pLast, true);
          if(o != null) o[pLast] = v;
        }
      }
      return o;
    }

    // Configures the pentaho/context AMD module with a given configuration object.
    function mockConfigWith(specPropPath, value) {

      var spec = {};

      setPath(spec, specPropPath, value);

      return function(localRequire) {
        // reset config first
        localRequire.config({
          config: {
            "pentaho/context": null
          }
        });

        localRequire.config({
          config: {
            "pentaho/context": spec
          }
        });
      };
    }

    /**
     * Tests that a context variable is properly implemented.
     *
     * @param {string} propPath - The name of the context property.
     * @param {string} specPropPath - The name of the context specification property.
     * @param {object} value - The value to set and read.
     * @param {object} valueRead - The value to read. Defaults to `value`.
     */
    function testContextProperty(propPath, specPropPath, value, valueRead) {

      if(valueRead === undefined) valueRead = value;

      describe(propPath, function() {

        it("should have a null value when " + specPropPath + " is undefined", function() {

          return require.using(["pentaho/context"], mockConfigWith(), function(contextVars) {
            expect(getPath(contextVars, propPath, null)).toBe(null);
          });
        });

        it("should have a null value when " + specPropPath + " is empty", function() {

          return require.using(["pentaho/context"], mockConfigWith(specPropPath, ""), function(contextVars) {
            expect(getPath(contextVars, propPath, null)).toBe(null);
          });
        });

        it("should respect a non-empty " + specPropPath + " value", function() {

          return require.using(["pentaho/context"], mockConfigWith(specPropPath, value), function(contextVars) {
            expect(getPath(contextVars, propPath, null)).toBe(valueRead);
          });
        });
      });
    }

    testContextProperty("application", "application", "ABC");
    testContextProperty("server.root.href", "server.root", "http://host:8888/path");
    testContextProperty("server.services.href", "server.services", "http://host:8888/path/services");

    testContextProperty("user.id", "user.id", "ABC");
    testContextProperty("user.home", "user.home", "ABC");

    testContextProperty("theme", "theme", "ABC");
    testContextProperty("locale", "locale", "ABC", "abc");

    testContextProperty("reservedChars", "reservedChars", "ABC");

  }); // pentaho.context
});
