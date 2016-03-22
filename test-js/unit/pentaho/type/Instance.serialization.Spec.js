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
  "pentaho/type/Instance",
  "pentaho/type/SpecificationScope"
], function(Instance, SpecificationScope) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.type.Complex", function() {

    describe("#toSpec(keyArgs)", function() {
      var value;

      beforeEach(function() {
        value = new Instance();
      });

      it("should call #toSpecInScope", function() {
        spyOn(value, "toSpecInScope");

        value.toSpec();

        expect(value.toSpecInScope.calls.count()).toBe(1);
      });

      it("should call #toSpecInScope with a new scope instance each time", function() {
        spyOn(value, "toSpecInScope");

        value.toSpec();

        var scope1 = value.toSpecInScope.calls.mostRecent().args[0];
        expect(scope1 instanceof SpecificationScope).toBe(true);

        value.toSpec();

        var scope2 = value.toSpecInScope.calls.mostRecent().args[0];
        expect(scope2 instanceof SpecificationScope).toBe(true);

        expect(scope1).not.toBe(scope2);
      });

      describe("keyArgs.omitRootType", function() {

        describe("unspecified", function() {

          it("should call #toSpecInScope with requireType=true", function() {
            spyOn(value, "toSpecInScope");

            value.toSpec();

            expect(value.toSpecInScope.calls.first().args[1]).toBe(true);
          });
        });

        describe("= true", function() {
          it("should call #toSpecInScope with requireType=false", function() {
            spyOn(value, "toSpecInScope");

            value.toSpec({omitRootType: true});

            expect(value.toSpecInScope.calls.first().args[1]).toBe(false);
          });
        });

        describe("= false", function() {
          it("should call #toSpecInScope with requireType=true", function() {
            spyOn(value, "toSpecInScope");

            value.toSpec({omitRootType: false});

            expect(value.toSpecInScope.calls.first().args[1]).toBe(true);
          });
        });
      });


    }); // toSpec
  });

});
