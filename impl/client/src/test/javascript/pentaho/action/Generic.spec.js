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
  "pentaho/action/Generic"
], function(GenericAction) {

  "use strict";

  describe("pentaho.action.Generic", function() {

    var SubAction;

    beforeAll(function() {

      // A derived non-abstract class, adding nothing new.
      SubAction = GenericAction.extend({});
    });

    describe("new (spec)", function() {

      it("should be possible to not specify spec", function() {

        var action = new SubAction();

        expect(action instanceof SubAction).toBe(true);
      });

      it("should call the #_init(spec) method, for mixins to take part", function() {

        spyOn(SubAction.prototype, "_init");

        var spec = {};

        var action = new SubAction(spec);

        expect(SubAction.prototype._init).toHaveBeenCalledTimes(1);
        expect(SubAction.prototype._init).toHaveBeenCalledWith(spec);
        expect(SubAction.prototype._init.calls.first().object).toBe(action);
      });

    });

    describe("#clone()", function() {

      it("should return a distinct instance", function() {
        var action = new SubAction();
        var clone = action.clone();

        expect(clone).not.toBe(action);
        expect(clone instanceof SubAction).toBe(true);
      });

    });

    describe(".isSync", function() {

      it("should default to true", function() {
        expect(SubAction.isSync).toBe(true);
      });

    });

  });
});
