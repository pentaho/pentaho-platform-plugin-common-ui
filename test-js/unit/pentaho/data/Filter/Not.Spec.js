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
  "pentaho/data/Filter",
  "pentaho/data/Element",
  "pentaho/data/Table"
], function(Filter, Element, Table) {
  "use strict";

  describe("pentaho.data.Filter.Not", function() {

    var data;
    beforeEach(function() {
      data = new Table({
        model: [
          {name: "product", type: "string", label: "Product"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "inStock", type: "boolean", label: "In Stock"}
        ],
        rows: [
          {c: [{v: "A"}, {v: 12000}, {v: true}]},
          {c: [{v: "B"}, {v: 6000}, {v: true}]},
          {c: [{v: "C"}, {v: 12000}, {v: false}]},
          {c: [{v: "D"}, {v: 1000}, {v: false}]},
          {c: [{v: "E"}, {v: 2000}, {v: false}]},
          {c: [{v: "F"}, {v: 3000}, {v: false}]},
          {c: [{v: "G"}, {v: 4000}, {v: false}]}
        ]
      });
    });

    it("should be of type '$not' ", function() {
      var filter = new Filter.Not();
      expect(filter.type).toBe("$not");
    });

    describe("#toSpec", function() {
      it("should return a JSON.", function() {
        var sales12k = new Filter.IsEqual("sales", 12000);
        var filter = new Filter.Not(sales12k);

        expect(filter.toSpec()).toEqual({
          "$not": {"sales": {"$eq": 12000}}
        });
      });

      it("should return `null` if it has no operands.", function() {
        var combination = new Filter.Not();
        expect(combination.toSpec()).toBeNull();
      });
    });

  });
});