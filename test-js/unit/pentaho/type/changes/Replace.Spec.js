/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/type/complex",
  "pentaho/type/number",
  "pentaho/type/changes/Replace"
], function(Context, complexFactory, numberFactory, Replace) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context(),
    Complex = context.get(complexFactory),
    Derived = Complex.extend({
      type: {props: [{name: "x", type: "string"}]}
    });

  describe("pentaho.type.changes.Replace -", function() {
    it("should be defined", function () {
      expect(typeof Replace).toBeDefined();
    });

    describe("instance -", function() {
      describe("#type -", function() {
        it("should return a string with the value `replace`", function() {
          var change = new Replace("name", "value");
          expect(change.type).toBe("replace");
        });

      });

      describe("#_apply -", function() {
        it("should add a new element", function() {
          var derived = new Derived({x: "0"});
          var change = new Replace("x", "1");

          expect(derived.getv("x")).toBe("0");

          change._apply(derived);

          expect(derived.getv("x")).toBe("1");
        });
      });

    });
  });
});
