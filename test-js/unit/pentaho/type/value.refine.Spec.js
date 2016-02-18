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
  "pentaho/type/Item",
  "pentaho/type/facets/Refinement",
  "tests/pentaho/util/errorMatch"
], function(Context, Item, RefinementFacet, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Element = context.get("pentaho/type/element"),
      Refinement = context.get("pentaho/type/refinement");

  describe("pentaho.type.Value - refine([name,] instSpec) -", function() {

    // Must use Element or List to test cause only these are representation types
    // and Value is not...

    it("should create a refinement type that extends Refinement", function() {
      var Facet = RefinementFacet.extend();
      var RefinementType = Element.refine({meta: {facets: [Facet]}});

      expect(RefinementType.prototype instanceof Refinement).toBe(true);
    });

    it("should create a refinement type that has this as `of`", function() {
      var Facet = RefinementFacet.extend();
      var RefinementType = Element.refine({meta: {facets: [Facet]}});

      expect(RefinementType.meta.of).toBe(Element.meta);
    });

    it("should create a refinement type that has the specified name", function() {
      var Facet = RefinementFacet.extend();
      var MyRefinement = Element.refine("FOOO", {
        meta: {
          facets: [Facet]
        }
      });

      // PhantomJS still fails configuring the name property...
      expect(MyRefinement.name || MyRefinement.displayName).toBe("FOOO");
    });

    it("should create a refinement type if instSpec is not specified", function() {
      var MyRefinement = Element.refine();
      expect(MyRefinement.prototype instanceof Refinement).toBe(true);

      MyRefinement = Element.refine("FOO");
      expect(MyRefinement.prototype instanceof Refinement).toBe(true);
    });
  });
});
