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
], function(Context) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Value   = context.get("pentaho/type/value"),
      Element = context.get("pentaho/type/element");

  describe("pentaho.type.Element -", function() {
    it("should be a function", function() {
      expect(typeof Element).toBe("function");
    });

    it("should be a sub-class of `Value`", function() {
      expect(Element.prototype instanceof Value).toBe(true);
    });

    describe("Type -", function() {
      var ElemType = Element.Type;

      it("should be a function", function() {
        expect(typeof ElemType).toBe("function");
      });

      it("should be a sub-class of `Value.Type`", function() {
        expect(ElemType.prototype instanceof Value.Type).toBe(true);
      });

      describe("#isList -", function() {
        it("should return the value `false`", function() {
          expect(Element.type.isList).toBe(false);
        });
      });

      describe("#isRefinement -", function() {
        it("should return the value `false`", function() {
          expect(Element.type.isRefinement).toBe(false);
        });
      });

      // TODO: format
      // TODO: compare
    });
  });
});
