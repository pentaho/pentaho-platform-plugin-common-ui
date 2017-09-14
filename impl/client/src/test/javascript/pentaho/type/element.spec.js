/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Element -", function() {

    var context;
    var Value;
    var Element;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Value = context.get("pentaho/type/value");
            Element = context.get("pentaho/type/element");
          })
          .then(done, done.fail);
    });

    it("should be a function", function() {
      expect(typeof Element).toBe("function");
    });

    it("should be a sub-class of `Value`", function() {
      expect(Element.prototype instanceof Value).toBe(true);
    });

    describe("Type -", function() {

      var ElemType;

      beforeEach(function() {
        ElemType = Element.Type;
      });

      it("should be a function", function() {
        expect(typeof ElemType).toBe("function");
      });

      it("should be a sub-class of `Value.Type`", function() {
        expect(ElemType.prototype instanceof Value.Type).toBe(true);
      });

      describe("isElement", function() {

        it("should return the value `true`", function() {
          expect(Element.type.isElement).toBe(true);
        });
      });

      describe("compare(va, vb)", function() {

        it("should return 0 if both are nully", function() {

          expect(Element.type.compare(null, null)).toBe(0);
          expect(Element.type.compare(null, undefined)).toBe(0);
          expect(Element.type.compare(undefined, null)).toBe(0);
          expect(Element.type.compare(undefined, undefined)).toBe(0);
        });

        it("should return -1 if the first is nully and the second not", function() {

          expect(Element.type.compare(null, new Element())).toBe(-1);
          expect(Element.type.compare(undefined, new Element())).toBe(-1);
        });

        it("should return +1 if the second is nully and the first not", function() {

          expect(Element.type.compare(new Element(), null)).toBe(1);
          expect(Element.type.compare(new Element(), undefined)).toBe(1);
        });

        it("should return 0 if neither is null are _areEqual returns true", function() {

          spyOn(Element.type, "_areEqual").and.returnValue(true);

          var va = new Element();
          var vb = new Element();

          expect(Element.type.compare(va, vb)).toBe(0);

          expect(Element.type._areEqual).toHaveBeenCalledWith(va, vb);
        });

        it("should call _compare if neither is null are _areEqual returns false", function() {

          spyOn(Element.type, "_areEqual").and.returnValue(false);
          spyOn(Element.type, "_compare").and.callThrough();

          var va = new Element();
          var vb = new Element();

          Element.type.compare(va, vb);

          expect(Element.type._compare).toHaveBeenCalledWith(va, vb);
        });
      });

      describe("_compare(va, vb)", function() {

        it("should sort numbers numerically", function() {

          expect(Element.type._compare(1, 2)).toBe(-1);
          expect(Element.type._compare(1, 1)).toBe(0);
          expect(Element.type._compare(2, 1)).toBe(+1);
        });

        it("should sort strings lexicographically", function() {

          expect(Element.type._compare("10", "2")).toBe(-1);
          expect(Element.type._compare("5", "2")).toBe(+1);
          expect(Element.type._compare("2", "2")).toBe(0);
        });
      });

      // TODO: format
    });
  });
});
