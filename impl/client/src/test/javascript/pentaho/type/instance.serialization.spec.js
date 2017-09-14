/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/SpecificationContext"
], function(Context, SpecificationContext) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.type.Instance", function() {
    var context;
    var Instance;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Instance = context.get("instance");
          })
          .then(done, done.fail);
    });

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

    describe("#toJSON()", function() {

      it("should call #toSpec({isJson: true})", function() {
        var value = new Instance();
        spyOn(value, "toSpec");

        value.toJSON();

        expect(value.toSpec.calls.count()).toBe(1);

        var args = value.toSpec.calls.first().args;
        expect(args.length).toBe(1);
        expect(args[0].constructor).toBe(Object);
        expect(args[0].isJson).toBe(true);
      });

      it("should return the result of calling #toSpec", function() {
        var value = new Instance();
        var result = {};
        spyOn(value, "toSpec").and.returnValue(result);

        expect(value.toJSON()).toBe(result);
      });

      it("should really be called when JSON.stringify(.) is used", function() {
        var value = new Instance();
        var result = {};
        spyOn(value, "toJSON").and.returnValue(result);

        JSON.stringify(value);

        expect(value.toJSON).toHaveBeenCalled();
        expect(value.toJSON.calls.first().object).toBe(value);
      });
    }); // toJSON
  });
});
