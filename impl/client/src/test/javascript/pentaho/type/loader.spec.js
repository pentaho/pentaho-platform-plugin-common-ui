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

  describe("pentaho.type.loader", function() {

    it("should be an instance of Loader", function() {

      return require.using(["pentaho/type/loader", "pentaho/type/impl/Loader"], function(loader, Loader) {

        expect(loader instanceof Loader).toBe(true);
      });
    });

    it("should have standard types loaded by default", function() {

      return require.using(["pentaho/type/loader"], function(loader) {

        loader.resolveType("pentaho/type/Instance");
        loader.resolveType("pentaho/type/Value");
        loader.resolveType("pentaho/type/Element");
        loader.resolveType("pentaho/type/List");
        loader.resolveType("pentaho/type/Simple");
        loader.resolveType("pentaho/type/String");
        loader.resolveType("pentaho/type/Number");
        loader.resolveType("pentaho/type/Boolean");
        loader.resolveType("pentaho/type/Date");
        loader.resolveType("pentaho/type/Complex");
        loader.resolveType("pentaho/type/Object");
        loader.resolveType("pentaho/type/Function");
        loader.resolveType("pentaho/type/TypeDescriptor");
        loader.resolveType("pentaho/type/Property");
        loader.resolveType("pentaho/type/mixins/Enum");
        loader.resolveType("pentaho/type/mixins/DiscreteDomain");
      });
    });
  });
});
