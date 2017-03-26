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
  "pentaho/type/facets/Refinement",
  "pentaho/type/SpecificationScope",
  "tests/pentaho/type/serializationUtil"
], function(Context, RefinementFacet, SpecificationScope, serializationUtil) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false, jasmine:false*/

  xdescribe("pentaho.type.Refinement.Type", function() {

    var context = new Context(),
        PentahoString = context.get("pentaho/type/string"),
        Refinement = context.get("pentaho/type/refinement");

    describe("#_fillSpecInContext(spec, keyArgs)", function() {

      describe("#of", function() {
        it("should serialize the #of of a root refinement type", function() {
          var derivedType = Refinement.extend({type: {of: "string"}}).type;

          var scope = new SpecificationScope();
          var spec = {};

          var result = derivedType._fillSpecInContext(spec, {});

          scope.dispose();

          expect(result).toBe(true);
          expect(spec.of).toBe("string");
        });

        it("should serialize the #of of a type when it is different from base", function() {
          var Derived1 = Refinement.extend({type: {of: "string"}});
          var Derived2 = Derived1.extend({type: {of: PentahoString.extend({type: {id: "codpostal"}}).type}});
          var scope = new SpecificationScope();

          var spec = {};

          var result = Derived2.type._fillSpecInContext(spec, {});

          scope.dispose();

          expect(result).toBe(true);
          expect(spec.of).toBe("codpostal");
        });

        it("should not serialize the #of of a type when it is inherited", function() {
          var Derived1 = Refinement.extend({type: {of: "string"}});
          var Derived2 = Derived1.extend();
          var scope = new SpecificationScope();

          var spec = {};

          var result = Derived2.type._fillSpecInContext(spec, {});

          scope.dispose();

          expect(result).toBe(false);
          expect("of" in spec).toBe(false);
        });
      });

      describe("#facets", function() {

        it("should include all facet ids of a root type", function() {
          var Facet1 = RefinementFacet.extend({}, {id: "my/foo"});
          var Facet2 = RefinementFacet.extend({}, {id: "my/bar"});

          var derivedType = Refinement.extend({type: {
            of: "string",
            facets: [Facet1, Facet2]
          }}).type;

          var scope = new SpecificationScope();
          var spec = {};

          var result = derivedType._fillSpecInContext(spec, {});

          scope.dispose();

          expect(result).toBe(true);
          expect(spec.facets).toEqual(["my/foo", "my/bar"]);
        });

        it("should not include inherited facet ids", function() {
          var Facet1 = RefinementFacet.extend({}, {id: "my/foo"});
          var Facet2 = RefinementFacet.extend({}, {id: "my/bar"});

          var Derived1 = Refinement.extend({type: {
            of: "string",
            facets: [Facet1, Facet2]
          }});
          var Derived2 = Derived1.extend();

          var scope = new SpecificationScope();
          var spec = {};

          var result = Derived2.type._fillSpecInContext(spec, {});

          scope.dispose();

          expect(result).toBe(false);
          expect("facets" in spec).toBe(false);
        });

        it("should include local facet ids", function() {
          var Facet1 = RefinementFacet.extend({}, {id: "my/foo"});
          var Facet2 = RefinementFacet.extend({}, {id: "my/bar"});

          var Derived1 = Refinement.extend({type: {
            of: "string",
            facets: [Facet1]
          }});

          var Derived2 = Derived1.extend({type: {
            facets: [Facet2]
          }});

          var scope = new SpecificationScope();
          var spec = {};

          var result = Derived2.type._fillSpecInContext(spec, {});

          scope.dispose();

          expect(result).toBe(true);
          expect(spec.facets).toEqual(["my/bar"]);
        });
      });

      describe("facets' local attributes", function() {

        it("should call the static .fillSpecInContext of every facet", function() {
          var Facet1 = RefinementFacet.extend({}, {id: "my/foo"});
          var Facet2 = RefinementFacet.extend({}, {id: "my/bar"});

          spyOn(Facet1, "fillSpecInContext");
          spyOn(Facet2, "fillSpecInContext");

          var Derived1 = Refinement.extend({type: {
            of: "string",
            facets: [Facet1]
          }});

          var Derived2 = Derived1.extend({type: {
            facets: [Facet2]
          }});

          var scope = new SpecificationScope();
          var spec = {};

          Derived2.type._fillSpecInContext(spec, {});

          scope.dispose();

          expect(Facet1.fillSpecInContext.calls.count()).toBe(1);
          expect(Facet2.fillSpecInContext.calls.count()).toBe(1);
        });

        it("should call the static facet's .fillSpecInContext with the spec object", function() {
          var Facet = RefinementFacet.extend({}, {id: "my/foo"});
          spyOn(Facet, "fillSpecInContext");

          var Derived = Refinement.extend({type: {
            of: "string",
            facets: [Facet]
          }});

          var scope = new SpecificationScope();
          var spec = {};

          Derived.type._fillSpecInContext(spec, {});

          scope.dispose();

          var args = Facet.fillSpecInContext.calls.first().args;
          expect(args[0]).toBe(spec);
        });

        it("should call the static facet's .fillSpecInContext with the keyArgs object", function() {
          var Facet = RefinementFacet.extend({}, {id: "my/foo"});
          spyOn(Facet, "fillSpecInContext");

          var Derived = Refinement.extend({type: {
            of: "string",
            facets: [Facet]
          }});

          var scope = new SpecificationScope();
          var spec = {};
          var keyArgs = {};
          Derived.type._fillSpecInContext(spec, keyArgs);

          scope.dispose();

          var args = Facet.fillSpecInContext.calls.first().args;
          expect(args[1]).toBe(keyArgs);
        });

        it("should call the static facet's .fillSpecInContext _on_ the refinement type", function() {
          var Facet = RefinementFacet.extend({}, {id: "my/foo"});
          spyOn(Facet, "fillSpecInContext");

          var Derived = Refinement.extend({type: {
            of: "string",
            facets: [Facet]
          }});

          var scope = new SpecificationScope();

          Derived.type._fillSpecInContext({}, {});

          scope.dispose();

          var ctx = Facet.fillSpecInContext.calls.first().object;
          expect(ctx).toBe(Derived.type);
        });
      });

      describe("#validateInstance", function() {

        var Derived = Refinement.extend({type: {of: "string"}});

        serializationUtil.itFillSpecMethodAttribute(Derived, "validateInstance");
      });
    });
  });
});
