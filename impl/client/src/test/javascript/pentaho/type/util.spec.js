/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

    describe("#fillSpecMethodInContext(spec, obj, name)", function() {

      it("should return false when the method is not overridden locally", function() {
        var Derived = Base.extend({
          foo: function() {}
        });
        var Derived2 = Derived.extend();

        var spec = {};
        var result = typeUtil.fillSpecMethodInContext(spec, Derived2.prototype,  "foo");

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
        var result = typeUtil.fillSpecMethodInContext(spec, Derived2.prototype, "foo");

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
        var result = typeUtil.fillSpecMethodInContext(spec, Derived2.prototype, "foo");

        expect(result).toBe(true);
        expect(spec.foo).toBe(f);
      });
    });
  });
});
