/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/


define([
  "pentaho/theme/impl/Service",
  "pentaho/theme/service"
], function(Service, service) {

  "use strict";

  describe("pentaho/theme/service", function() {

    it("should be defined", function() {
      expect(service != null).toBe(true);
    });

    it("should be a impl/Service", function() {
      expect(service instanceof Service).toBe(true);
    });
  });
});
