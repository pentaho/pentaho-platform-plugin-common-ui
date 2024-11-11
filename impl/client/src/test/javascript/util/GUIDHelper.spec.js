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

define(["cdf/lib/Base", "common-ui/util/GUIDHelper"], function(Base, GUIDHelper) {

  describe("GUIDHelper", function() {

    var guidHelper = new GUIDHelper();

    it("should generate a valid GUID", function() {
      var guid = guidHelper.generateGUID();
      expect(guid).toBeDefined();
      expect(guid >= 0).toBeTruthy();
      expect(guid).toBeLessThan(100000);
    });

    it("should reset the list of assigned guids", function() {
      guidHelper.reset();
      expect(guidHelper._assignedGUIDs).toEqual({});
    });

  });

});