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

  describe("pentaho.module.service", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should return a module service", function() {

      return localRequire.promise(["pentaho/module/service"])
        .then(function(deps) {
          var moduleService = deps[0];

          // Duck Typing.
          expect(moduleService instanceof Object).toBe(true);
          expect(typeof moduleService.getInstanceOfAsync).toBe("function");
          expect(typeof moduleService.getInstancesOfAsync).toBe("function");
          expect(typeof moduleService.getSubtypeOfAsync).toBe("function");
          expect(typeof moduleService.getSubtypesOfAsync).toBe("function");
        });
    });
  });
});
