/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/Context",
  "pentaho/type/SpecificationScope"
], function(Context, SpecificationScope) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, Date:false */

  var context = new Context();
  var List = context.get("pentaho/type/list");
  var PentahoNumber = context.get("pentaho/type/number");
  var NumberList = context.get(["number"]);

  describe("pentaho.type.List", function() {

    describe("#toSpec(keyArgs)", function() {

      describe("when includeType is false", function() {

        it("should return an empty array for an empty list", function() {
          var list = new List();
          var spec = list.toSpec({includeType: false});

          expect(spec).toEqual([]);
        });

        it("should return an array of serialized elements for a list of elements", function() {
          var list = new NumberList([1, 2, 3]);
          var spec = list.toSpec({includeType: false});

          expect(spec).toEqual([1, 2, 3]);
        });
      });

      describe("when includeType is true", function() {

        it("should return a spec with an empty d property, for an empty list", function() {
          var list = new List();
          var spec = list.toSpec({includeType: true});

          expect(spec).toEqual({_: jasmine.any(String), d: []});
        });

        it("should return an array of serialized elements for a list of elements", function() {
          var list = new NumberList([1, 2, 3]);
          var spec = list.toSpec({includeType: true});

          expect(spec).toEqual({_: jasmine.any(Object), d: [1, 2, 3]});
        });
      });

      it("should include inline type specification for an element which " +
         "is not of the list's element type", function() {
        var MyNumber = PentahoNumber.extend();

        var list = new NumberList([1, new MyNumber(2), 3]);
        var spec = list.toSpec();

        expect(spec).toEqual([1, {_: jasmine.any(Object), v: 2}, 3]);
      });

      it("should not include inline type specification for an element which " +
          "is of the list's representation element type", function() {
        var Refined = PentahoNumber.refine();
        var RefinedList = context.get([Refined.type]);


        var list = new RefinedList([1, 2, 3]);
        var spec = list.toSpec();

        expect(spec).toEqual([1, 2, 3]);
      });
    });

    describe("#toSpecInContext(keyArgs)", function() {

      // coverage
      it("should allow not specifying keyArgs", function() {
        var scope = new SpecificationScope();

        var list = new NumberList();

        list.toSpecInContext();

        scope.dispose();
      });
    });
  });
});
