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
  "pentaho/data/filter/_Element",
  "pentaho/data/Table"
], function(Filter, Element, Table) {
  "use strict";

  describe("pentaho.data.Filter", function() {

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

     describe("#create ", function() {
      it("takes in a spec", function() {
        var spec = {
          "$and": [
            {"sales": {"$eq": 12000}},
            {"$not": {"product": {"$in": ["A", "B"]}} }
          ]
        };

        var filter = Filter.create(spec);
        expect(filter.type).toBe("$or");
        expect(filter.operands.length).toBe(1);
        expect(filter.operands[0].type).toBe("$and");
        expect(filter.operands[0].operands.length).toBe(2);
        expect(filter.operands[0].operands[0].type).toBe("$eq");
        expect(filter.operands[0].operands[0].value).toBe(12000);
        expect(filter.operands[0].operands[1].type).toBe("$not");
        expect(filter.operands[0].operands[1].operand.type).toBe("$in");
        expect(filter.operands[0].operands[1].operand.value).toEqual(["A", "B"]);
      });


      it("simplifies the filter tree when taking in a spec", function() {
        var spec = {
          "$and": [
            {"sales": {"$eq": 12000}},
            {"$not": {"product": {"$in": ["A", "B"]}} }
          ]
        };

        var filter0 = Filter.create(spec);
        var filter = filter0.invert();
        expect(filter.type).toBe("$and");
        expect(filter.operands.length).toBe(1);
        expect(filter.operands[0].type).toBe("$or");
        expect(filter.operands[0].operands.length).toBe(2);
        expect(filter.operands[0].operands[0].type).toBe("$not");
        expect(filter.operands[0].operands[0].operand.type).toBe("$eq");
        expect(filter.operands[0].operands[1].type).toBe("$in");
      });

    }); // #create

  });
});