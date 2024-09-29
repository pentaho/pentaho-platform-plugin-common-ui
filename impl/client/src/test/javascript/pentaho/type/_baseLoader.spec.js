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

  describe("pentaho.type._baseLoader", function() {

    it("should be an instance of Loader", function() {

      return require.using(["pentaho/type/_baseLoader", "pentaho/type/impl/Loader"], function(baseLoader, Loader) {

        expect(baseLoader instanceof Loader).toBe(true);
      });
    });

    it("should not have standard types loaded by default", function() {

      return require.using(["pentaho/type/_baseLoader"], function(baseLoader) {
        expect(function() {
          baseLoader.resolveType("pentaho/type/String");
        }).toThrowError(Error);
      });
    });
  });
});
