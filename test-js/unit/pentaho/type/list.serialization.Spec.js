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
  "pentaho/type/Context"
], function(Context) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, Date:false */

  var context = new Context();
  var List = context.get("pentaho/type/list");
  var NumberList = context.get(["number"]);

  describe("pentaho.type.List#toSpec()", function() {

    describe("when omitRootType is true", function() {

      it("should return an empty array for an empty list", function() {
        var list = new List();
        var spec = list.toSpec({omitRootType: true});

        expect(spec).toEqual([]);
      });

      it("should return an array of serialized elements for a list of elements", function() {
        var list = new NumberList([1, 2, 3]);
        var spec = list.toSpec({omitRootType: true});

        expect(spec).toEqual([1, 2, 3]);
      });

    });

    describe("when omitRootType is false", function() {

      it("should return a spec with an empty d property, for an empty list", function() {
        var list = new List();
        var spec = list.toSpec({omitRootType: false});

        expect(spec).toEqual({_: jasmine.any(String), d: []});
      });

      it("should return an array of serialized elements for a list of elements", function() {
        var list = new NumberList([1, 2, 3]);
        var spec = list.toSpec({omitRootType: false});

        expect(spec).toEqual({_: jasmine.any(Object), d: [1, 2, 3]});
      });

    });
  });

});
