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
  "pentaho/type/Instance",
  "pentaho/type/SpecificationContext"
], function(Instance, SpecificationContext) {

  "use strict";

  describe("pentaho.type.Instance", function() {

    describe("#toSpec(keyArgs)", function() {

      var value;

      beforeEach(function() {
        value = new Instance();
      });

      it("should call #toSpecInContext", function() {
        spyOn(value, "toSpecInContext");

        value.toSpec();

        expect(value.toSpecInContext.calls.count()).toBe(1);
      });

      it("should call #toSpecInContext with a keyArgs object", function() {
        spyOn(value, "toSpecInContext");

        value.toSpec();

        var keyArgs = value.toSpecInContext.calls.first().args[0];
        expect(keyArgs instanceof Object).toBe(true);
      });

      it("should call #toSpecInContext with an ambient specification context", function() {
        var context = null;

        spyOn(value, "toSpecInContext").and.callFake(function() {
          context = SpecificationContext.current;
        });

        SpecificationContext.current = null;

        value.toSpec();

        expect(context instanceof SpecificationContext).toBe(true);
      });
    });

    describe("#toJSON()", function() {

      it("should call #toSpec({isJson: true})", function() {
        var value = new Instance();
        spyOn(value, "toSpec");

        value.toJSON();

        expect(value.toSpec.calls.count()).toBe(1);

        var args = value.toSpec.calls.first().args;
        expect(args.length).toBe(1);
        expect(args[0].constructor).toBe(Object);
        expect(args[0].isJson).toBe(true);
      });

      it("should return the result of calling #toSpec", function() {
        var value = new Instance();
        var result = {};
        spyOn(value, "toSpec").and.returnValue(result);

        expect(value.toJSON()).toBe(result);
      });

      it("should really be called when JSON.stringify(.) is used", function() {
        var value = new Instance();
        var result = {};
        spyOn(value, "toJSON").and.returnValue(result);

        JSON.stringify(value);

        expect(value.toJSON).toHaveBeenCalled();
        expect(value.toJSON.calls.first().object).toBe(value);
      });
    });
  });
});
