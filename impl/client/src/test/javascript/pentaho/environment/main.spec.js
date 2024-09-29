/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/shim/es6-promise"
], function() {

  "use strict";

  describe("pentaho.environment.main", function() {

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

    // Configures the pentaho/environment AMD module with a given configuration object.
    function mockConfigWith(specPropPath, value) {

      var spec = {};

      setPath(spec, specPropPath, value);

      return function(localRequire) {
        // reset config first
        localRequire.config({
          config: {
            "pentaho/environment": null
          }
        });

        localRequire.config({
          config: {
            "pentaho/environment": spec
          }
        });
      };
    }

    /**
     * Tests that an environment variable is properly implemented.
     *
     * @param {string} propPath - The name of the environment property.
     * @param {string} specPropPath - The name of the environment specification property.
     * @param {object} value - The value to set and read.
     * @param {object} valueRead - The value to read. Defaults to `value`.
     */
    function testEnvironmentProperty(propPath, specPropPath, value, valueRead) {

      if(valueRead === undefined) valueRead = value;

      describe(propPath, function() {

        it("should have a null value when " + specPropPath + " is undefined", function() {

          return require.using(["pentaho/environment"], mockConfigWith(), function(environmentVars) {
            expect(getPath(environmentVars, propPath, null)).toBe(null);
          });
        });

        it("should have a null value when " + specPropPath + " is empty", function() {

          return require.using(["pentaho/environment"], mockConfigWith(specPropPath, ""), function(environmentVars) {
            expect(getPath(environmentVars, propPath, null)).toBe(null);
          });
        });

        it("should respect a non-empty " + specPropPath + " value", function() {

          return require.using(["pentaho/environment"], mockConfigWith(specPropPath, value), function(environmentVars) {
            expect(getPath(environmentVars, propPath, null)).toBe(valueRead);
          });
        });
      });
    }

    testEnvironmentProperty("application", "application", "ABC");
    testEnvironmentProperty("server.root.href", "server.root", "http://host:8888/path");
    testEnvironmentProperty("server.packages.href", "server.packages", "http://host:8888/path/osgi");
    testEnvironmentProperty("server.services.href", "server.services", "http://host:8888/path/services");

    testEnvironmentProperty("user.id", "user.id", "ABC");
    testEnvironmentProperty("user.home", "user.home", "ABC");

    testEnvironmentProperty("theme", "theme", "ABC");
    testEnvironmentProperty("locale", "locale", "PT", "pt");

    testEnvironmentProperty("reservedChars", "reservedChars", "ABC");
  });
});
