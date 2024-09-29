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
  "pentaho/type/util",
  "pentaho/lang/Base"
], function(typeUtil, Base) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/


  describe("pentaho/type/util -", function() {

    describe("#normalizeErrors", function() {
      it("normalizing null is null", function() {
        expect(typeUtil.normalizeErrors(null)).toBe(null);
      });

      it("normalizing an Error instance returns an Error array with the instance", function() {
        var error = new Error();
        expect(typeUtil.normalizeErrors(error)).toContain(error);
      });

      it("normalizing an Error array returns the array", function() {
        var errors = [ new Error() ];
        expect(typeUtil.normalizeErrors(errors)).toBe(errors);
      });

    });

    describe("#combineErrors", function() {
      it("combining an Error array with nothing returns the array", function() {
        var errors = [new Error()];
        expect(typeUtil.combineErrors(errors)).toBe(errors);
      });

      it("combining an Error array with an error returns the combined Error array", function() {
        var errorA = new Error();
        var errorB = new Error();
        var errorsBase = [errorA];
        var combinedErrors = typeUtil.combineErrors(errorsBase, errorB);
        expect(combinedErrors).toContain(errorA);
        expect(combinedErrors).toContain(errorB);
        expect(combinedErrors.length).toBe(2);
      });

      it("combining a null Error array with an error returns the combined Error array", function() {
        var errorsBase = null;
        var error = new Error();
        var errorsAdd = [error];
        var combinedErrors = typeUtil.combineErrors(errorsBase, errorsAdd);
        expect(combinedErrors).toContain(error);
        expect(combinedErrors.length).toBe(1);
      });

      it("combining nothing (null) with nothing (null) returns nothing (null)", function() {
        var combinedErrors = typeUtil.combineErrors(null,null);
        expect(combinedErrors).toBe(null);
      });

      it("combining two Error arrays returns the combined Error array", function() {
        var errorA = new Error();
        var errorB = new Error();
        var errorsBase = [errorA];
        var errorsAdd = [errorB];
        var combinedErrors = typeUtil.combineErrors(errorsBase, errorsAdd);
        expect(combinedErrors).toContain(errorA);
        expect(combinedErrors).toContain(errorB);
        expect(combinedErrors.length).toBe(2);
      });
    });

    describe("#__fillSpecMethodInContext(spec, obj, name)", function() {

      it("should return false when the method is not overridden locally", function() {
        var Derived = Base.extend({
          foo: function() {}
        });
        var Derived2 = Derived.extend();

        var spec = {};
        var result = typeUtil.__fillSpecMethodInContext(spec, Derived2.prototype,  "foo");

        expect(result).toBe(false);
        expect("foo" in spec).toBe(false);
      });

      it("should return true and output the method when it is overridden locally", function() {
        var Derived = Base.extend({
          foo: function() {}
        });

        var f = function() {};
        var Derived2 = Derived.extend({
          foo: f
        });

        var spec = {};
        var result = typeUtil.__fillSpecMethodInContext(spec, Derived2.prototype, "foo");

        expect(result).toBe(true);
        expect(spec.foo).toBe(f);
      });

      it("should return true and output the method when it is overridden locally and calls base", function() {
        var Derived = Base.extend({
          foo: function() {}
        });

        var f = function() { return this.base(); };
        var Derived2 = Derived.extend({
          foo: f
        });

        var spec = {};
        var result = typeUtil.__fillSpecMethodInContext(spec, Derived2.prototype, "foo");

        expect(result).toBe(true);
        expect(spec.foo).toBe(f);
      });
    });
  });
});
