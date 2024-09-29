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

  // NOTE: These tests only test the re-exporting of the **core-bound** pentaho._core.config.Service class;
  // that the re-exported class is apparently functional.
  // The tests which cover all of the functionality of the pentaho._core.config.Service class
  // are made in src/test/javascript/pentaho/_core/config/Service.spec.js.

  describe("pentaho.config.impl.Service", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should return a configuration Service class", function() {

      return localRequire.promise(["pentaho/config/impl/Service"])
        .then(function(deps) {
          var ConfigService = deps[0];

          // Duck Typing.
          expect(typeof ConfigService).toBe("function");
          expect(typeof ConfigService.prototype.selectAsync).toBe("function");
        });
    });

    it("should be able to create a configuration service instance given an environment", function() {

      return localRequire.promise(["pentaho/config/impl/Service"])
        .then(function(deps) {
          var ConfigurationService = deps[0];

          var configurationService = new ConfigurationService({application: "1"});
        });
    });

    it("should be able to add a rule and select it back", function() {

      return localRequire.promise(["pentaho/config/impl/Service"])
        .then(function(deps) {
          var ConfigurationService = deps[0];

          var rule1 = {
            select: {module: "A", user: "1", theme: "1", locale: "1", application: "1"},
            apply: {foo: "bar"}
          };

          var configurationService = new ConfigurationService({application: "1"});
          configurationService.add({rules: [rule1]});

          return configurationService.selectAsync("A");
        })
        .then(function(finalConfig) {
          expect(finalConfig).toEqual({foo: "bar"});
        });
    });
  });
});
