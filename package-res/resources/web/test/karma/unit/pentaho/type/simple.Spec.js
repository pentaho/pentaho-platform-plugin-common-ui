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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Element = context.get("pentaho/type/element"),
      Simple  = context.get("pentaho/type/simple");

  describe("pentaho.type.Simple -", function() {
    it("should be a function", function() {
      expect(typeof Simple).toBe("function");
    });

    it("should be a sub-class of `Element`", function() {
      expect(Simple.prototype instanceof Element).toBe(true);
    });

    describe(".Meta -", function() {
      var ElemMeta = Simple.Meta;

      it("should be a function", function() {
        expect(typeof ElemMeta).toBe("function");
      });

      it("should be a sub-class of `Element.Meta`", function() {
        expect(ElemMeta.prototype instanceof Element.Meta).toBe(true);
      });

      // TODO: cast
    });
  });
});
