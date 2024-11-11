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
  "pentaho/visual/action/Base",
  "pentaho/visual/action/Update"
], function(BaseAction, UpdateAction) {

  "use strict";

  describe("pentaho.visual.action.Update", function() {

    it("should be defined", function() {

      expect(typeof UpdateAction).toBe("function");
    });

    it("should extend visual.action.Base", function() {

      expect(UpdateAction.prototype instanceof BaseAction).toBe(true);
    });

    it("should be asynchronous", function() {

      expect(UpdateAction.isSync).toBe(false);
    });
  });
});
