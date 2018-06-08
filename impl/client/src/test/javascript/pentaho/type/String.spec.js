/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/String",
  "tests/pentaho/util/errorMatch"
], function(PentahoString, errorMatch) {

  "use strict";

  describe("pentaho.type.String", function() {

    describe("new String()", function() {

      it("should be a function", function() {
        expect(typeof PentahoString).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof new PentahoString("string")).toBe("object");
      });

      it("should accept 1 as '1'", function() {
        expect(new PentahoString(1).value).toBe("1");
      });

      it("should accept '1' as '1'", function() {
        expect(new PentahoString("1").value).toBe("1");
      });

      it("should accept true as 'true'", function() {
        expect(new PentahoString(true).value).toBe("true");
      });

      it("should accept 'true' as 'true'", function() {
        expect(new PentahoString("true").value).toBe("true");
      });

      it("should accept empty string as ''", function() {
        expect(new PentahoString("").value).toBe("");
      });

      it("should accept empty array as ''", function() {
        expect(new PentahoString([]).value).toBe("");
      });

      it("should not accept empty object literal", function() {
        expect(function() {
          // eslint-disable-next-line no-unused-expressions
          new PentahoString({}).value;
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should accept the toString of an object", function() {
        var obj = {toString: function() { return "FOO"; }};
        // Needs to be specified in a cell wrapper... or taken as a spec.
        var penString = new PentahoString({v: obj});
        expect(penString.value).toBe("FOO");
      });

      it("should not accept null", function() {
        expect(function() {
          new PentahoString(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept undefined", function() {
        expect(function() {
          // eslint-disable-next-line no-unused-expressions
          new PentahoString(undefined);
        }).toThrow(errorMatch.argRequired("value"));
      });
    });
  }); // pentaho.type.String
});
