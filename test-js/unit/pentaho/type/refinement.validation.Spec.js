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
  "pentaho/type/Context",
  "pentaho/type/facets/Refinement"
], function(Context, RefinementFacet) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true, spyOn:true*/

  describe("pentaho.type.Refinement.Type -", function() {

    var context = new Context(),
        Simple  = context.get("pentaho/type/simple"),
        Refinement = context.get("pentaho/type/refinement"),
        MySimple = Simple.extend();

    describe("#validate(value) -", function() {
      it("should call #is(value) and value.validate()", function() {
        var MyRefinement = Refinement.extend({
          type: {
            of: MySimple.type
          }
        });

        var value = new MySimple(123);

        spyOn(MyRefinement.type, "is").and.callThrough();
        spyOn(MyRefinement.type, "validateInstance").and.callThrough();
        spyOn(value, "validate").and.callThrough();

        MyRefinement.type.validate(value);

        expect(MyRefinement.type.is.calls.count()).toBe(1);
        expect(value.validate.calls.count()).toBe(1);
      });

      it("should return immediately if base validation fails", function() {
        var Facet = RefinementFacet.extend({}, {
          id: "my/foo",
          validate: function() {}
        });

        var MyRefinement = Refinement.extend({
          type: {
            of: MySimple.type,
            facets: [Facet]
          }
        });

        var value = new MySimple(123);

        spyOn(Refinement.type, "_validateFacets").and.callThrough();
        spyOn(value, "validate").and.returnValue([new Error()]);
        spyOn(Facet, "validate").and.callThrough();

        var result = MyRefinement.type.validate(value);

        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(value.validate).toHaveBeenCalled();
        expect(Refinement.type._validateFacets).not.toHaveBeenCalled();
        expect(Facet.validate).not.toHaveBeenCalled();
      });

      it("should call every facet's validate method if base validation succeeds", function() {
        var Facet1 = RefinementFacet.extend({}, {
          id: "my/foo",
          validate: function() {}
        });

        var Facet2 = RefinementFacet.extend({}, {
          id: "my/bar",
          validate: function() {}
        });

        var MyRefinement = Refinement.extend({
          type: {
            of: MySimple.type,
            facets: [Facet1, Facet2]
          }
        });

        var value = new MySimple(123);

        spyOn(Facet1, "validate").and.callThrough();
        spyOn(Facet2, "validate").and.callThrough();

        var result = MyRefinement.type.validate(value);

        expect(result).toBe(null);
        expect(Facet1.validate.calls.count()).toBe(1);
        expect(Facet2.validate.calls.count()).toBe(1);
      });

      it("should collect errors of every facet if base validation succeeds", function() {
        var e1 = new Error(),
            e2 = new Error(),
            e3 = new Error(),
            e4 = new Error(),
            e5 = new Error();

        var Facet1 = RefinementFacet.extend({}, {
          id: "my/foo",
          validate: function() { return [e1, e2]; }
        });

        var Facet2 = RefinementFacet.extend({}, {
          id: "my/bar",
          validate: function() { return e3; }
        });

        var Facet3 = RefinementFacet.extend({}, {
          id: "my/dud",
          validate: function() { return [e4, e5]; }
        });

        var MyRefinement = Refinement.extend({
          type: {
            of: MySimple.type,
            facets: [Facet1, Facet2, Facet3]
          }
        });

        var value = new MySimple(123);
        var result = MyRefinement.type.validate(value);

        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(5);
        expect(result[0]).toBe(e1);
        expect(result[1]).toBe(e2);
        expect(result[2]).toBe(e3);
        expect(result[3]).toBe(e4);
        expect(result[4]).toBe(e5);
      });
    });
  });
});
