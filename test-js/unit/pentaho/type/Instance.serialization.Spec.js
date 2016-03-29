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
  "pentaho/type/SpecificationContext"
], function(Instance, SpecificationContext) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.type.Complex", function() {

    describe("#toSpec(keyArgs)", function() {
      var value;

      beforeEach(function() {
        value = new Instance();
      });

      it("should call #toSpecInContext", function() {
        spyOn(value, "toSpecInContext");

        value.toSpec();

        expect(value.toSpecInContext.calls.count()).toBe(1);
      });

      it("should call #toSpecInContext with a keyArgs object", function() {
        spyOn(value, "toSpecInContext");

        value.toSpec();

        var keyArgs = value.toSpecInContext.calls.first().args[0];
        expect(keyArgs instanceof Object).toBe(true);
      });

      it("should call #toSpecInContext with an ambient specification context", function() {
        var context = null;

        spyOn(value, "toSpecInContext").and.callFake(function() {
          context = SpecificationContext.current;
        });

        SpecificationContext.current = null;

        value.toSpec();

        expect(context instanceof SpecificationContext).toBe(true);
      });
    }); // toSpec
  });
});
