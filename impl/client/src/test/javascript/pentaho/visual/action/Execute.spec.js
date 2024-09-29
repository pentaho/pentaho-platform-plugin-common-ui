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
  "pentaho/visual/action/Execute"
], function(BaseAction, ExecuteAction) {

  "use strict";

  describe("pentaho.visual.action.Execute", function() {

    it("should be defined", function() {

      expect(typeof ExecuteAction).toBe("function");
    });

    it("should extend visual.action.Base", function() {

      expect(ExecuteAction.prototype instanceof BaseAction).toBe(true);
    });

    it("should mix in visual.action.mixins.Positioned", function() {
      // Unfortunately, there's no better way to do test this, now.
      expect("position" in ExecuteAction.prototype).toBe(true);
    });

    it("should mix in visual.action.mixins.Data", function() {
      // Unfortunately, there's no better way to do test this, now.
      expect("dataFilter" in ExecuteAction.prototype).toBe(true);
    });

    it("should be synchronous", function() {

      expect(ExecuteAction.isSync).toBe(true);
    });
  });
});
