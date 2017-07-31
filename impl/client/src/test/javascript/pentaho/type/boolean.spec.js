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
  "tests/pentaho/util/errorMatch"
], function(Context, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Boolean", function() {

    describe("new ()", function() {
      var PentahoBoolean;

      beforeEach(function(done) {
        Context.createAsync()
            .then(function(context) {
              PentahoBoolean = context.get("pentaho/type/boolean");
            })
            .then(done, done.fail);
      });

      it("should be a function", function() {
        expect(typeof PentahoBoolean).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof new PentahoBoolean(1)).toBe("object");
      });

      it("should accept 1 as true", function() {
        expect(new PentahoBoolean(1).value).toBe(true);
      });

      it("should accept '1' as true", function() {
        expect(new PentahoBoolean("1").value).toBe(true);
      });

      it("should accept 0 as false", function() {
        expect(new PentahoBoolean(0).value).toBe(false);
      });

      it("should accept '0' as true", function() {
        expect(new PentahoBoolean("0").value).toBe(true);
      });

      it("should accept true as true", function() {
        expect(new PentahoBoolean(true).value).toBe(true);
      });

      it("should accept false as false", function() {
        expect(new PentahoBoolean(false).value).toBe(false);
      });

      it("should accept 'false' as true", function() {
        expect(new PentahoBoolean("false").value).toBe(true);
      });

      it("should accept new Date() as true", function() {
        expect(new PentahoBoolean(new Date()).value).toBe(true);
      });

      it("should accept empty string as false", function() {
        expect(new PentahoBoolean("").value).toBe(false);
      });

      it("should accept some random string as true", function() {
        expect(new PentahoBoolean("someRandom string").value).toBe(true);
      });

      it("should not accept null", function() {
        expect(function() {
          var foo = new PentahoBoolean(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept undefined", function() {
        expect(function() {
          var foo = new PentahoBoolean(undefined);
        }).toThrow(errorMatch.argRequired("value"));
      });
    });
  }); // pentaho.type.Boolean
});
