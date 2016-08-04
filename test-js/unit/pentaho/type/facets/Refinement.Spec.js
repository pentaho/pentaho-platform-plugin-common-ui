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
  "pentaho/type/facets/Refinement",
  "tests/pentaho/util/errorMatch"
], function(RefinementFacet, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.facets.RefinementFacet", function() {
    it("should be a function", function() {
      expect(typeof RefinementFacet).toBe("function");
    });

    describe(".id", function() {

      it("should be defined", function() {
        expect(typeof RefinementFacet.id).toBe("string");
      });

      it("should be respected when specified", function() {
        var DerivedFacet = RefinementFacet.extend(null, {id: "foo"});
        expect(DerivedFacet.id).toBe("foo");
      });

      it("should throw if classSpec.id is not specified when extending", function() {
        expect(function() {
          RefinementFacet.extend();
        }).toThrow(errorMatch.argRequired("classSpec.id"));

        expect(function() {
          RefinementFacet.extend({}, {});
        }).toThrow(errorMatch.argRequired("classSpec.id"));

        expect(function() {
          RefinementFacet.extend({}, {id: ""});
        }).toThrow(errorMatch.argRequired("classSpec.id"));
      });
    });

    describe(".shortId", function() {

      it("should be equal to #id when it is not a standard, single-level facet id", function() {
        var Derived = RefinementFacet.extend(null, {id: "my/foo"});
        expect(Derived.shortId).toBe(Derived.id);
      });

      it("should be equal to the last sub-module of #id when it is of a standard, single-level facet id", function() {
        var Derived = RefinementFacet.extend(null, {id: "pentaho/type/facets/foo"});
        expect(Derived.shortId).toBe("foo");
        expect(Derived.id).not.toBe("foo");
      });

      it("should be equal to #id when it is of a standard, multiple-level facet id", function() {
        var Derived = RefinementFacet.extend(null, {id: "pentaho/type/facets/bar/foo"});
        expect(Derived.shortId).toBe(Derived.id);
      });
    });

    describe(".validate(value)", function() {
      it("should be defined", function() {
        expect(typeof RefinementFacet.validate).toBe("function");
      });

      it("should throw when called", function() {
        expect(function() {
          RefinementFacet.validate({});
        }).toThrow(errorMatch.notImplemented());
      });
    });

    describe(".fillSpecInContext(spec, keyArgs)", function() {
      it("should be defined", function() {
        expect(typeof RefinementFacet.fillSpecInContext).toBe("function");
      });

      it("should return false", function() {
        expect(RefinementFacet.fillSpecInContext({})).toBe(false);
      });
    });
  });
});
