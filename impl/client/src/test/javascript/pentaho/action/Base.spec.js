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
  "pentaho/action/Base"
], function(ActionBase) {

  "use strict";

  describe("pentaho.action.Base", function() {

    var SubAction;

    beforeAll(function() {

      // A derived non-abstract class, adding nothing new.
      SubAction = ActionBase.extend({});
    });

    describe("new (spec)", function() {

      it("should be possible to not specify spec", function() {

        var action = new SubAction();

        expect(action instanceof SubAction).toBe(true);
      });

    });

    describe(".isSync", function() {

      it("should default to true", function() {
        expect(SubAction.isSync).toBe(true);
      });

    });

  });
});
