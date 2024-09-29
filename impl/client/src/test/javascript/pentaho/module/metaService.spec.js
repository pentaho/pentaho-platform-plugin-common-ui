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
