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

      localRequire.define("pentaho/environment/main", function() {
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

      localRequire.config({
        config: {
          "pentaho/modules": modulesMap
        }
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
