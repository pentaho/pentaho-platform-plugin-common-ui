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
  "pentaho/util/error"
], function(RefinementFacet, error) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.facets.RefinementFacet -", function() {
    it("should be a function", function() {
      expect(typeof RefinementFacet).toBe("function");
    });

    describe("validate(value)", function() {
      it("should be defined", function() {
        expect(typeof RefinementFacet.validate).toBe("function");
      });

      it("should throw when called", function() {
        expect(function() {
          RefinementFacet.validate({});
        }).toThrowError(error.notImplemented().message);
      });
    });
  });
});
