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

  describe("pentaho.config.service", function() {

    var localRequire;

    beforeEach(function() {
      localRequire = require.new();
    });

    afterEach(function() {
      localRequire.dispose();
    });

    it("should return a configuration service", function() {

      return localRequire.promise(["pentaho/config/service"])
        .then(function(deps) {
          var configService = deps[0];

          // Duck Typing.
          expect(configService instanceof Object).toBe(true);
          expect(typeof configService.selectAsync).toBe("function");
        });
    });
  });
});
